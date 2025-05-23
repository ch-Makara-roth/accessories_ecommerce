
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
  if (!prisma.user || typeof prisma.user.create !== 'function' || !prisma.otp || typeof prisma.otp.create !== 'function') {
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

    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: 'User with this email already exists and is verified. Please login.' }, { status: 409 });
      }
      // If user exists but not verified, allow re-registration to trigger new OTP.
      // Consider deleting old OTPs for this user or the user record itself if you prefer a clean slate.
      // For simplicity, we'll overwrite OTP and allow re-triggering verification.
      console.log(`Registration attempt for existing unverified user: ${email}. Proceeding to generate new OTP.`);
      // Optionally delete existing user to allow full re-registration.
      // await prisma.user.delete({ where: { email }});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`;

    // Upsert user: create if not exists, or update if exists but not verified (though findUnique above handles this)
    // For this flow, we'll ensure the user exists or is created.
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        // Potentially update name or password if re-registering an unverified account
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

    // Send OTP email
    try {
      await sendOtpEmail(email, otpCode); // This function now handles SendGrid integration
      console.log(`Registration OTP for ${email} sent via email. Fallback OTP (also logged if email fails): ${otpCode}`);
    } catch (emailError) {
      // Log email sending error but continue, relying on console OTP for testing if needed
      console.error(`Failed to send registration OTP email to ${email}, but OTP is generated and logged: ${otpCode}`, emailError);
    }

    return NextResponse.json({
      message: 'Registration successful! An OTP has been sent to your email. Please verify to continue. (Check server console for OTP if email is not configured/received).',
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
    // Ensure a JSON response is sent for errors
    return NextResponse.json({ error: 'Failed to register user', details: errorMessage, debug: errorDetails }, { status: 500 });
  }
}
