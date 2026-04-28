import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TRANSLATIONS = [
  { key: 'profile.delete_account_title', de: 'Account löschen', en: 'Delete account', fr: 'Supprimer le compte' },
  { key: 'profile.delete_account_subtitle', de: 'Diese Aktion kann nicht rückgängig gemacht werden', en: 'This action cannot be undone', fr: 'Cette action ne peut pas être annulée' },
  { key: 'profile.delete_account_btn', de: 'Account löschen', en: 'Delete account', fr: 'Supprimer le compte' },
  { key: 'profile.delete_account_warning', de: 'Sicher, dass du deinen Account löschen möchtest?', en: 'Are you sure you want to delete your account?', fr: 'Êtes-vous sûr de vouloir supprimer votre compte ?' },
  { key: 'profile.delete_account_permanent', de: 'Dein gesamter Account und alle Daten werden dauerhaft gelöscht. Dies kann nicht rückgängig gemacht werden.', en: 'Your entire account and all data will be permanently deleted. This cannot be undone.', fr: 'Votre compte entier et toutes les données seront supprimés définitivement. Cela ne peut pas être annulé.' },
  { key: 'profile.delete_account_password_label', de: 'Passwort bestätigen', en: 'Confirm password', fr: 'Confirmer le mot de passe' },
  { key: 'profile.delete_account_password_placeholder', de: 'Gib dein Passwort ein', en: 'Enter your password', fr: 'Entrez votre mot de passe' },
  { key: 'profile.delete_account_password_required', de: 'Passwort ist erforderlich', en: 'Password is required', fr: 'Le mot de passe est requis' },
  { key: 'profile.delete_account_confirm', de: 'Ja, Account wirklich löschen', en: 'Yes, delete account', fr: 'Oui, supprimer le compte' },
];

async function main() {
  console.log('Seeding delete-account translations...');

  for (const item of TRANSLATIONS) {
    for (const locale of ['de', 'en', 'fr']) {
      await prisma.translation.upsert({
        where: { locale_key: { locale, key: item.key } },
        update: { value: item[locale] },
        create: { locale, key: item.key, value: item[locale] }
      });
    }
  }

  console.log('Delete-account translations seeded successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
