import { Resend } from 'resend';
import { escapeHtml } from '@/lib/utils/strings';

export const sendEmail = async (
  name: string,
  email: string,
  message: string,
): Promise<Response> => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const toEmail = process.env.TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    return Response.json(
      { error: 'Contact email is not configured' },
      { status: 503 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');

    const { data, error } = await resend.emails.send({
      from: `William Rice <${fromEmail}>`,
      to: [toEmail],
      subject: `${name} <${email}> wants to connect with you`,
      text: `New contact form submission\n\nFrom: ${name} (${email})\n\nMessage:\n${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
