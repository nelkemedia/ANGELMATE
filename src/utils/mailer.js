import nodemailer from 'nodemailer';

function createTransport() {
  if (!process.env.MAIL_PASS) return null;
  return nodemailer.createTransport({
    host: 'mail.gmx.net',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });
}

export async function sendReportMail({ senderName, senderEmail, against, reason }) {
  const transport = createTransport();
  if (!transport) {
    console.warn('[mailer] MAIL_PASS nicht gesetzt – E-Mail wird nicht versendet.');
    return false;
  }

  const text = `
Neue Meldung über AngelMate
============================
Antragsteller:  ${senderName} <${senderEmail}>
Beschwerde gegen: ${against}
Eingegangen:    ${new Date().toLocaleString('de-DE')}

Begründung:
-----------
${reason}
`.trim();

  await transport.sendMail({
    from: `"AngelMate Meldesystem" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER,
    replyTo: senderEmail,
    subject: `[AngelMate] Meldung: ${against}`,
    text
  });

  return true;
}
