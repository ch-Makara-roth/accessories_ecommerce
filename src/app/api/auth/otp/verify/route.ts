
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
        expiresAt: 'desc', // Get the latest valid OTP if multiple somehow exist
      }
    });

    if (!storedOtpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
    }

    const isOtpValid = await bcrypt.compare(otp, storedOtpRecord.otp);

    if (!isOtpValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP.' }, { status: 400 });
    }

    // OTP is valid, clean it up
    await prisma.otp.delete({
      where: { id: storedOtpRecord.id },
    });

    // Find or create user and mark email as verified
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // If user doesn't exist, create one.
      // For OTP registration, you might not have a password yet.
      // This flow assumes OTP is for email verification, possibly leading to password setup.
      user = await prisma.user.create({
        data: {
          email,
          emailVerified: new Date(), // Mark email as verified
          name: email.split('@')[0], // Default name from email prefix
        },
      });
    } else if (!user.emailVerified) {
      // If user exists but email not verified, update it
      user = await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });
    }
    
    const { password: _, ...userWithoutPassword } = user;


    // In a real app, you might sign them in here or redirect to set a password
    // For now, just confirm verification
    return NextResponse.json({ message: 'OTP verified successfully. Email is now verified.', user: userWithoutPassword }, { status: 200 });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    let errorMessage = 'An unexpected error occurred during OTP verification.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to verify OTP', details: errorMessage }, { status: 500 });
  }
}
