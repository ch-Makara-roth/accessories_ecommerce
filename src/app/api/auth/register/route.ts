
// src/app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { addMinutes } from 'date-fns';
import { sendOtpEmail } from '@/lib/email';

function generateOtp(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export async function POST(req: NextRequest) {
  // Check Prisma client availability
  if (!prisma) {
    console.error('API /api/auth/register: CRITICAL - Prisma client is not initialized!');
    return NextResponse.json({ error: 'Internal Server Error: Database client is not initialized. Check server logs, DATABASE_URL in .env.local, and ensure server was restarted.' }, { status: 500 });
  }
  if (!prisma.user || typeof prisma.user.upsert !== 'function' || !prisma.otp || typeof prisma.otp.create !== 'function') {
    const errorMsg = 'Internal Server Error: Prisma models (User/Otp) or their methods are not accessible. Ensure `npx prisma generate` has been run and server restarted.';
    console.error(`API /api/auth/register: CRITICAL - ${errorMsg}. Prisma object: ${JSON.stringify(prisma, Object.getOwnPropertyNames(prisma))}`);
    return NextResponse.json({ error: errorMsg, message: errorMsg }, { status: 500 });
  }

  try {
    const { email, password, firstName, lastName } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json({ error: 'User with this email already exists and is verified. Please login.' }, { status: 409 });
    }
    if (existingUser && !existingUser.emailVerified) {
      console.log(`Registration attempt for existing unverified user: ${email}. Proceeding to generate new OTP and update user data.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`;

    // Upsert user: create if not exists, or update if exists but not verified
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        emailVerified: null, // Ensure it's null if re-registering
      },
      create: {
        email,
        password: hashedPassword,
        name,
        emailVerified: null, // Email not verified yet
      },
    });

    const otpCode = generateOtp();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const expiresAt = addMinutes(new Date(), 10);

    await prisma.otp.deleteMany({ where: { email } }); // Clear any old OTPs for this email
    await prisma.otp.create({
      data: {
        email,
        otp: hashedOtp,
        expiresAt,
        userId: user.id, // Link OTP to the user
      },
    });

    // Attempt to send OTP email
    console.log(`Generated OTP for ${email} during registration: ${otpCode}. Attempting to send email...`);
    try {
      await sendOtpEmail(email, otpCode); // Await the email sending
      console.log(`Registration OTP email process initiated for ${email}. Check console for SendGrid logs or fallback OTP.`);
    } catch (emailError) {
      // Log email sending error but continue, relying on console OTP for testing if needed
      console.error(`Failed to send registration OTP email to ${email}. OTP is still generated and logged: ${otpCode}. Error:`, emailError);
    }

    return NextResponse.json({
      message: 'Registration successful! An OTP should be sent to your email. (Check server console for OTP if email is not received).',
      emailForOtp: email
    }, { status: 201 });

  } catch (error) {
    console.error('Registration API Error:', error);
    let errorMessage = 'An unexpected error occurred during registration.';
    let errorDetails = String(error);
    if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || error.message;
    }
    return NextResponse.json({ error: 'Failed to register user', details: errorMessage, debug: errorDetails }, { status: 500 });
  }
}
