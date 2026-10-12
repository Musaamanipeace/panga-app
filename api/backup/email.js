// Email sending function - supports multiple providers
async function sendEmail(to, subject, html, attachment, apiKey, provider = "resend") {
  const resendKey = (provider === "resend" ? apiKey : null) || process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Panga <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          attachments: [{
            filename: attachment.filename,
            content: Buffer.from(attachment.content).toString('base64'),
          }],
        }),
      });
      if (res.ok) return { ok: true };
      const err = await res.json();
      return { ok: false, error: err?.message || 'Resend dispatch failed' };
    } catch (e) {
      console.warn('Resend error:', e);
    }
  }

  const sendgridKey = (provider === "sendgrid" ? apiKey : null) || process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
            subject,
          }],
          from: { email: process.env.SENDGRID_FROM_EMAIL || 'noreply@panga.app' },
          content: [{ type: 'text/html', value: html }],
          attachments: [{
            content: Buffer.from(attachment.content).toString('base64'),
            filename: attachment.filename,
            type: 'application/json',
            disposition: 'attachment',
          }],
        }),
      });
      if (res.ok) return { ok: true };
      return { ok: false, error: 'SendGrid rejected the email dispatch.' };
    } catch (e) {
      console.warn('SendGrid error:', e);
    }
  }

  return {
    ok: false,
    error: 'No email API key found. Enter your free API key from Resend (resend.com) in Settings, or use Download Snapshot for an instant local backup.',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, snapshot, apiKey, provider } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!snapshot) {
      return res.status(400).json({ error: 'Snapshot data is required' });
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `panga-backup-${timestamp}.json`;
    const jsonContent = JSON.stringify(snapshot, null, 2);

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: system-ui, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">📦 Panga Backup</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Your Panga data backup is attached as <strong>${filename}</strong>.</p>
            <p>Exported on: ${new Date().toLocaleString()}</p>
            <p style="color: #6b7280; font-size: 14px;">
              This file contains your projects, tasks, resources, notes, milestones, reminders, and settings.
              Import it in Panga Settings → <strong>Upload Snapshot</strong> to restore.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              This is an automated message from Panga. If you didn't request this backup, you can safely ignore it.
            </p>
          </div>
        </body>
      </html>
    `;

    const result = await sendEmail(
      email,
      `Panga Backup - ${timestamp}`,
      html,
      {
        filename,
        content: jsonContent,
      },
      apiKey,
      provider
    );

    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({ ok: true, message: `Backup sent to ${email}` });
  } catch (error) {
    console.error('Email backup error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to send backup email' });
  }
}