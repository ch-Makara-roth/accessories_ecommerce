
// src/app/api/auth/otp/request/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { addMinutes } from 'date-fns'; // For OTP expiry

// Placeholder for actual email sending function
// In a real app, you would implement this using a library like nodemailer
// and an email service provider (e.g., SendGrid, AWS SES).
// async function sendOtpEmail(email: string, otp: string) {
//   console.log(`--- SIMULATING EMAIL SEND ---`);
//   console.log(`To: ${email}`);
//   console.log(`OTP: ${otp}`);
//   console.log(`-----------------------------`);
//   // Example with nodemailer (requires setup and credentials):
//   // let transporter = nodemailer.createTransport({ service: 'YourService', auth: { user: '...', pass: '...' } });
//   // await transporter.sendMail({ from: 'no-reply@yourapp.com', to: email, subject: 'Your OTP Code', text: `Your OTP is: ${otp}` });
//   return Promise.resolve();
// }

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

    // Log OTP for testing AND simulate sending email
    console.log(`RESEND OTP for ${email}: ${otpCode}`);
    // await sendOtpEmail(email, otpCode); // << --- UNCOMMENT AND IMPLEMENT THIS for real email sending

    await prisma.otp.deleteMany({ where: { email }});
    await prisma.otp.create({
      data: {
        email,
        otp: hashedOtp,
        expiresAt,
        userId: user.id, // Link OTP to the user
      },
    });

    return NextResponse.json({ message: 'New OTP generated and sent to your email (and logged to console for testing).' }, { status: 200 });

  } catch (error) {
    console.error('OTP Request Error:', error);
    let errorMessage = 'An unexpected error occurred while requesting OTP.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to request OTP', details: errorMessage }, { status: 500 });
  }
}
