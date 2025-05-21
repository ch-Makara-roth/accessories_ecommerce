// src/app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { addMinutes } from 'date-fns';

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
      // If user exists and email is verified, they should login.
      // If user exists but email not verified, allow re-registration to trigger new OTP.
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: 'User with this email already exists and is verified. Please login.' }, { status: 409 });
      }
      // If user exists but not verified, we'll overwrite them or update them, then send new OTP.
      // For simplicity, let's delete existing unverified user to avoid complexity with accounts/sessions.
      // A more robust solution might update them or handle merging if they try OAuth later.
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

    // Generate and store OTP
    const otpCode = generateOtp();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const expiresAt = addMinutes(new Date(), 10); // OTP expires in 10 minutes

    // Invalidate any old OTPs for this email
    await prisma.otp.deleteMany({ where: { email } });
    await prisma.otp.create({
      data: {
        email,
        otp: hashedOtp,
        expiresAt,
      },
    });

    // Log OTP for testing (replace with actual email sending in production)
    console.log(`REGISTRATION OTP for ${email}: ${otpCode} (User ID: ${newUser.id})`);

    return NextResponse.json({ 
      message: 'Registration successful. Please check your console for an OTP to verify your email.', // Adjusted message
      emailForOtp: email 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to register user', details: errorMessage }, { status: 500 });
  }
}
