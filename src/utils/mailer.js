import nodemailer from 'nodemailer';
import prisma from '../config/prisma.js';

function resolveSecure(port, secure) {
  const p = parseInt(port);
  if (p === 465) return true;
  if (p === 587 || p === 25) return false;
  return Boolean(secure);
}

async function createTransport() {
  const s = await prisma.smtpSettings.findFirst();
  if (s?.host && s?.user && s?.password) {
    return nodemailer.createTransport({
      host: s.host, port: s.port, secure: resolveSecure(s.port, s.secure),
      auth: { user: s.user, pass: s.password }
    });
  }
  if (!process.env.MAIL_PASS) return null;
  return nodemailer.createTransport({
    host: 'mail.gmx.net', port: 587, secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
  });
}

async function fromAddress() {
  const s = await prisma.smtpSettings.findFirst();
  const name = s?.fromName || 'AngelMate';
  const addr = s?.fromAddress || process.env.MAIL_USER || '';
  return `"${name}" <${addr}>`;
}

export async function sendReportMail({ senderName, senderEmail, against, reason }) {
  const transport = await createTransport();
  if (!transport) {
    console.warn('[mailer] Kein SMTP konfiguriert – E-Mail nicht versendet.');
    return false;
  }
  const text = `Neue Meldung über AngelMate\n============================\nAntragsteller:  ${senderName} <${senderEmail}>\nBeschwerde gegen: ${against}\nEingegangen:    ${new Date().toLocaleString('de-DE')}\n\nBegründung:\n-----------\n${reason}`.trim();
  await transport.sendMail({
    from: await fromAddress(),
    to: process.env.MAIL_USER,
    replyTo: senderEmail,
    subject: `[AngelMate] Meldung: ${against}`,
    text
  });
  return true;
}

export async function testSmtpConnection({ host, port, user, password, fromName, fromAddress, secure, toEmail }) {
  if (!host || !user || !password)
    throw new Error('Bitte Host, Benutzername und Passwort angeben.');

  const resolvedPort = parseInt(port) || 587;
  const transport = nodemailer.createTransport({
    host, port: resolvedPort, secure: resolveSecure(resolvedPort, secure),
    auth: { user, pass: password }
  });

  await transport.verify();

  const from = `"${fromName || 'AngelMate'}" <${fromAddress || user}>`;
  await transport.sendMail({
    from, to: toEmail,
    subject: '[AngelMate] SMTP Test erfolgreich ✅',
    text: `Die SMTP-Konfiguration funktioniert.\n\nHost: ${host}:${port}\nBenutzer: ${user}\nSSL/TLS: ${secure ? 'Ja' : 'Nein'}`
  });
}

const RESET_TEMPLATES = {
  de: {
    subject: '[AngelMate] Passwort zurücksetzen',
    heading: 'AngelMate – Passwort zurücksetzen',
    greeting: (name) => `Hallo ${name},`,
    body: 'du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den Button, um ein neues Passwort zu vergeben:',
    button: 'Passwort zurücksetzen',
    expiry: 'Der Link ist 1 Stunde gültig. Falls du keine Anfrage gestellt hast, kannst du diese E-Mail ignorieren.',
    footer: 'AngelMate – Dein digitaler Angelbegleiter',
  },
  en: {
    subject: '[AngelMate] Reset your password',
    heading: 'AngelMate – Reset your password',
    greeting: (name) => `Hello ${name},`,
    body: 'You requested a password reset. Click the button below to set a new password:',
    button: 'Reset password',
    expiry: 'This link is valid for 1 hour. If you did not request this, you can safely ignore this email.',
    footer: 'AngelMate – Your digital fishing companion',
  },
  fr: {
    subject: '[AngelMate] Réinitialiser votre mot de passe',
    heading: 'AngelMate – Réinitialiser votre mot de passe',
    greeting: (name) => `Bonjour ${name},`,
    body: 'Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton pour définir un nouveau mot de passe :',
    button: 'Réinitialiser le mot de passe',
    expiry: 'Ce lien est valable 1 heure. Si vous n\'avez pas fait cette demande, ignorez cet e-mail.',
    footer: 'AngelMate – Votre compagnon de pêche numérique',
  },
};

export async function sendPasswordResetMail({ to, name, resetLink, lang = 'de' }) {
  const transport = await createTransport();
  if (!transport) {
    console.warn('[mailer] Kein SMTP konfiguriert – Reset-Mail nicht versendet.');
    return false;
  }
  const tpl = RESET_TEMPLATES[lang] ?? RESET_TEMPLATES.de;
  const html = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
  <h2 style="color:#166534">🎣 ${tpl.heading}</h2>
  <p>${tpl.greeting(name)}</p>
  <p>${tpl.body}</p>
  <p style="margin:2rem 0">
    <a href="${resetLink}" style="background:#166534;color:#fff;padding:0.75rem 1.5rem;border-radius:10px;text-decoration:none;font-weight:600">
      ${tpl.button}
    </a>
  </p>
  <p style="color:#666;font-size:0.85rem">${tpl.expiry}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:1.5rem 0"/>
  <p style="color:#999;font-size:0.8rem">${tpl.footer}</p>
</div>`.trim();

  await transport.sendMail({
    from: await fromAddress(),
    to,
    subject: tpl.subject,
    html
  });
  return true;
}
