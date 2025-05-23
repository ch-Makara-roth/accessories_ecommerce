
// src/app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { addMinutes } from 'date-fns';
import { sendOtpEmail } from '@/lib/email'; // Import the new email utility

function generateOtp(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

export async function POST(req: NextRequest) {
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
      // If user exists but not verified, we could update them or delete and re-create.
      // For simplicity, and to ensure a fresh OTP process, let's delete and re-create.
      // This also handles cases where previous registration attempt might have failed midway.
      console.log(`Existing unverified user found for ${email}. Deleting to allow re-registration.`);
      await prisma.user.delete({ where: { email }});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = `${firstName} ${lastName}`;

    const newUser = await prisma.user.create({
      data: {
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
        userId: newUser.id, // Link OTP to the user
      },
    });

    // Send OTP email
    try {
      await sendOtpEmail(email, otpCode);
      console.log(`Registration OTP for ${email} sent via email. Fallback OTP logged: ${otpCode}`);
    } catch (emailError) {
      console.error(`Failed to send registration OTP email to ${email}, but OTP is generated: ${otpCode}`, emailError);
      // Continue the process even if email fails, user can check console log.
    }
    

    return NextResponse.json({
      message: 'Registration successful. An OTP has been sent to your email. Please verify to continue. (Check server console for OTP if email is not received).',
      emailForOtp: email
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to register user',