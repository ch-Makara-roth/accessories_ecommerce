
// src/app/api/auth/otp/request/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { addMinutes } from 'date-fns'; // For OTP expiry
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
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User with this email not found.' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified.' }, { status: 200 });
    }

    const otpCode = generateOtp();
    const hashedOtp = await bcrypt.hash(otpCode, 10);
    const expiresAt = addMinutes(new Date(), 10); // OTP expires in 10 minutes

    // Send OTP email
    console.log(`Generated OTP for ${email} via resend request: ${otpCode}. Attempting to send email...`);
    try {
      await sendOtpEmail(email, otpCode); // Await the email sending
      console.log(`Resend OTP email process initiated for ${email}. Check console for SendGrid logs or fallback OTP.`);
    } catch (emailError) {
      console.error(`Failed to resend OTP email to ${email}. OTP is still generated and logged: ${otpCode}. Error:`, emailError);
    }

    await prisma.otp.deleteMany({ where: { email }});
    await prisma.otp.create({
      data: {
        email,
        otp: hashedOtp,
        expiresAt,
        userId: user.id, // Link OTP to the user
      },
    });

    return NextResponse.json({ message: 'New OTP generated. An email should be sent. (Check server console for OTP if email is not received).' }, { status: 200 });

  } catch (error) {
    console.error('OTP Request Error:', error);
    let errorMessage = 'An unexpected error occurred while requesting OTP.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to request OTP', details: errorMessage }, { status: 500 });
  }
}
