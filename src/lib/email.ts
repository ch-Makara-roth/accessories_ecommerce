
// src/lib/email.ts
import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('WARNING: SENDGRID_API_KEY is not set in .env.local. Real email sending will be disabled. OTPs will only be logged to the console.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid API Key loaded.');
}

if (!process.env.FROM_EMAIL) {
  console.warn('WARNING: FROM_EMAIL is not set in .env.local. Real email sending will fail if FROM_EMAIL is not a VERIFIED SENDER IDENTITY in your SendGrid account.');
} else {
  console.log(`FROM_EMAIL is set to: ${process.env.FROM_EMAIL}. Ensure this is a verified sender identity in SendGrid.`);
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL;

  if (!process.env.SENDGRID_API_KEY || !fromEmail) {
    console.error('CRITICAL: SendGrid API Key or From Email is not configured correctly in .env.local. The FROM_EMAIL must also be a VERIFIED SENDER IDENTITY in SendGrid. Cannot send OTP email.');
    // Log OTP to console as a fallback
    console.log(`--- OTP FOR ${to} (Email Service Not Fully Configured/FROM_EMAIL missing or unverified) ---`);
    console.log(`--- OTP: ${otp}`);
    console.log(`-------------------------------------------------------`);
    return; // Exit if essential configs are missing
  }

  const msg = {
    to: to,
    from: fromEmail, // Use the email address or domain you verified with SendGrid
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

  console.log(`Attempting to send OTP email to ${to} from ${fromEmail} using SendGrid...`);

  try {
    await sgMail.send(msg);
    console.log(`OTP email successfully sent to ${to} via SendGrid.`);
  } catch (error: any) {
    console.error('Error sending OTP email via SendGrid:');
    if (error.response) {
      console.error('SendGrid Error Response Status:', error.response.statusCode);
      console.error('SendGrid Error Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('SendGrid Error Response Body:', JSON.stringify(error.response.body, null, 2));
      if (JSON.stringify(error.response.body).includes("does not match a verified Sender Identity")) {
        console.error('IMPORTANT: The "FROM_EMAIL" in your .env.local file is not a verified sender in SendGrid. Please verify it in your SendGrid account under Sender Authentication.');
      }
    } else {
      console.error('SendGrid Error (no response object):', error.message, error);
    }
    // Fallback: Log OTP to console if email sending fails
    console.log(`--- OTP FOR ${to} (SendGrid send FAILED - see error above) ---`);
    console.log(`--- OTP: ${otp}`);
    console.log(`-----------------------------------------------------------`);
  }
}
