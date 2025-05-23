
// src/lib/email.ts
import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set. Email sending will be disabled.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

if (!process.env.FROM_EMAIL) {
  console.warn('FROM_EMAIL is not set for sending emails.');
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
    console.error('SendGrid API Key or From Email is not configured. Cannot send OTP email.');
    // Log OTP to console as a fallback during development if SendGrid is not configured
    console.log(`--- OTP FOR ${to} (SendGrid not configured) ---`);
    console.log(`OTP: ${otp}`);
    console.log(`-------------------------------------------------`);
    // Optionally, you could throw an error here or return a status
    // For now, to avoid breaking the flow if SendGrid isn't set up during early dev,
    // it will just log to console. In production, you'd want this to be a hard failure.
    return;
  }

  const msg = {
    to: to,
    from: process.env.FROM_EMAIL, // Use the email address or domain you verified with SendGrid
    subject: 'Your OTP Code for Audio Emporium',
    text: `Your One-Time Password (OTP) for Audio Emporium is: ${otp}. This code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Audio Emporium - Email Verification</h2>
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) to verify your email address is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; padding: 10px; background-color: #f0f0f0; text-align: center;">
          ${otp}
        </p>
        <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
        <p>Thanks,<br/>The Audio Emporium Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`OTP email successfully sent to ${to}`);
  } catch (error) {
    console.error('Error sending OTP email via SendGrid:', error);
    if ((error as any).response) {
      console.error('SendGrid Error Body:', (error as any).response.body);
    }
    // Fallback: Log OTP to console if email sending fails
    console.log(`--- OTP FOR ${to} (SendGrid send failed) ---`);
    console.log(`OTP: ${otp}`);
    console.log(`---------------------------------------------`);
    // Depending on your error handling strategy, you might want to re-throw the error
    // or handle it in a way that informs the user the email might not have been sent.
    // For this example, we'll let the flow continue, relying on the console log.
    //