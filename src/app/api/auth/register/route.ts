
// src/app/api/auth/register/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { addMinutes } from 'date-fns';

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
      // If user exists but not verified, delete them to allow re-registration with new OTP process.
      // A more complex flow might update them, but this is simpler for now.
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

    await prisma.otp.deleteMany({ where: { email } });
    await prisma.otp.create({
      data: {
        email,
        otp: hashedOtp,
        expiresAt,
        userId: newUser.id, // Link OTP to the user
      },
    });

    // Log OTP for testing AND simulate sending email
    console.log(`REGISTRATION OTP for ${email}: ${otpCode} (User ID: ${newUser.id})`);
    // await sendOtpEmail(email, otpCode); // << --- UNCOMMENT AND IMPLEMENT THIS for real email sending

    return NextResponse.json({
      message: 'Registration successful. An OTP has been sent to your email (and logged to console for testing). Please verify to continue.',
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
