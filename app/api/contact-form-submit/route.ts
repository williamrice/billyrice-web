import { sendEmail } from '@/lib/resend';
import { verifyRecaptcha } from '@/lib/googleCaptcha';
import { NextRequest, NextResponse } from 'next/server';
import { RecaptchaVerificationResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, message, recaptchaToken } = data;

    const recaptchaResponse: RecaptchaVerificationResponse =
      await verifyRecaptcha(recaptchaToken);
    if (!recaptchaResponse.success) {
      return NextResponse.json(
        { error: recaptchaResponse.message || 'reCAPTCHA verification failed' },
        { status: 400 },
      );
    }

    const result = await sendEmail(name, email, message);
    return result;
  } catch {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 },
    );
  }
}
