// src/app/api/auth/otp/verify/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const storedOtpRecord = await prisma.otp.findFirst({
      where: {
        email,
        expiresAt: {
          gte: new Date(), // Check if OTP is not expired
        },
      },
      orderBy: {
        createdAt: 'desc', // Get the latest valid OTP if multiple somehow exist
      }
    });

    if (!storedOtpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
    }

    const isOtpValid = await bcrypt.compare(otp, storedOtpRecord.otp);

    if (!isOtpValid) {
      // Optionally, you might want to invalidate the OTP after a few failed attempts.
      // For simplicity, just returning error for now.
      return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
    }

    // OTP is valid, clean it up from Otp table
    await prisma.otp.delete({
      where: { id: storedOtpRecord.id },
    });

    // Find user and mark email as verified
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // This case should ideally not happen if OTP was sent for an existing user from registration
      // or for a user trying to verify after login attempt failed due to unverified email.
      return NextResponse.json({ error: 'User not found. Cannot verify email.' }, { status: 404 });
    }
    
    if (user.emailVerified) {
        return NextResponse.json({ message: 'Email already verified.' }, { status: 200 });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ message: 'OTP verified successfully. Your email is now verified. Please login.', user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    let errorMessage = 'An unexpected error occurred during OTP verification.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to verify OTP', details: errorMessage }, { status: 500 });
  }
}
