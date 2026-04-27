import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WRAPPER = (content) => `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#ffffff">
  ${content}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 16px"/>
  <p style="margin:0;color:#9ca3af;font-size:12px">AngelMate – Dein digitaler Angelbegleiter · <a href="{{appUrl}}" style="color:#166534;text-decoration:none">angelmate.app</a></p>
</div>`;

const BTN = (href, label) =>
  `<p style="margin:0 0 24px"><a href="${href}" style="display:inline-block;background:#166534;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px">${label}</a></p>`;

const TEMPLATES = [
  {
    name: 'email_verification',
    de: {
      subject: '[AngelMate] Bitte bestätige deine E-Mail-Adresse',
      body: WRAPPER(`
  <h2 style="color:#166534;margin:0 0 20px;font-size:22px">🎣 AngelMate – E-Mail bestätigen</h2>
  <p style="margin:0 0 12px;font-size:16px;color:#111827">Hallo {{name}},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#374151">vielen Dank für deine Registrierung bei AngelMate! Klicke auf den Button, um deine E-Mail-Adresse zu bestätigen und dein Konto zu aktivieren:</p>
  ${BTN('{{verifyLink}}', 'E-Mail bestätigen')}
  <p style="margin:0;font-size:13px;color:#6b7280">Der Link ist <strong>24 Stunden</strong> gültig. Falls du kein Konto bei AngelMate erstellt hast, kannst du diese E-Mail ignorieren.</p>`)
    },
    en: {
      subject: '[AngelMate] Please verify your email address',
      body: WRAPPER(`
  <h2 style="color:#166534;margin:0 0 20px;font-size:22px">🎣 AngelMate – Verify your email</h2>
  <p style="margin:0 0 12px;font-size:16px;color:#111827">Hello {{name}},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#374151">Thank you for signing up with AngelMate! Click the button below to verify your email address and activate your account:</p>
  ${BTN('{{verifyLink}}', 'Verify email address')}
  <p style="margin:0;font-size:13px;color:#6b7280">This link is valid for <strong>24 hours</strong>. If you did not create an AngelMate account, you can safely ignore this email.</p>`)
    },
    fr: {
      subject: '[AngelMate] Veuillez confirmer votre adresse e-mail',
      body: WRAPPER(`
  <h2 style="color:#166534;margin:0 0 20px;font-size:22px">🎣 AngelMate – Confirmer l'adresse e-mail</h2>
  <p style="margin:0 0 12px;font-size:16px;color:#111827">Bonjour {{name}},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#374151">Merci de vous être inscrit sur AngelMate ! Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail et activer votre compte :</p>
  ${BTN('{{verifyLink}}', "Confirmer l'adresse e-mail")}
  <p style="margin:0;font-size:13px;color:#6b7280">Ce lien est valable <strong>24 heures</strong>. Si vous n'avez pas créé de compte AngelMate, vous pouvez ignorer cet e-mail.</p>`)
    }
  },
  {
    name: 'password_reset',
    de: {
      subject: '[AngelMate] Passwort zurücksetzen',
      body: WRAPPER(`
  <h2 style="color:#166534;margin:0 0 20px;font-size:22px">🎣 AngelMate – Passwort zurücksetzen</h2>
  <p style="margin:0 0 12px;font-size:16px;color:#111827">Hallo {{name}},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#374151">du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den Button, um ein neues Passwort zu vergeben:</p>
  ${BTN('{{resetLink}}', 'Passwort zurücksetzen')}
  <p style="margin:0;font-size:13px;color:#6b7280">Der Link ist <strong>1 Stunde</strong> gültig. Falls du keine Anfrage gestellt hast, kannst du diese E-Mail ignorieren.</p>`)
    },
    en: {
      subject: '[AngelMate] Reset your password',
      body: WRAPPER(`
  <h2 style="color:#166534;margin:0 0 20px;font-size:22px">🎣 AngelMate – Reset your password</h2>
  <p style="margin:0 0 12px;font-size:16px;color:#111827">Hello {{name}},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#374151">You requested a password reset. Click the button below to set a new password:</p>
  ${BTN('{{resetLink}}', 'Reset password')}
  <p style="margin:0;font-size:13px;color:#6b7280">This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>`)
    },
    fr: {
      subject: '[AngelMate] Réinitialiser votre mot de passe',
      body: WRAPPER(`
  <h2 style="color:#166534;margin:0 0 20px;font-size:22px">🎣 AngelMate – Réinitialiser le mot de passe</h2>
  <p style="margin:0 0 12px;font-size:16px;color:#111827">Bonjour {{name}},</p>
  <p style="margin:0 0 24px;font-size:15px;color:#374151">Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le bouton pour définir un nouveau mot de passe :</p>
  ${BTN('{{resetLink}}', 'Réinitialiser le mot de passe')}
  <p style="margin:0;font-size:13px;color:#6b7280">Ce lien est valable <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail.</p>`)
    }
  }
];

async function main() {
  let created = 0;
  for (const tpl of TEMPLATES) {
    for (const locale of ['de', 'en', 'fr']) {
      const { subject, body } = tpl[locale];
      await prisma.emailTemplate.upsert({
        where:  { name_locale: { name: tpl.name, locale } },
        update: {},
        create: { name: tpl.name, locale, subject, body }
      });
      created++;
    }
  }
  console.log(`✅ E-Mail-Templates: ${created} Einträge geprüft (bestehende unverändert).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
