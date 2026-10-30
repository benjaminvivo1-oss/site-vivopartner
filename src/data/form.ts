import { SITE } from './site';

/** Adresse d'envoi des formulaires : fonction Vercel par défaut, ou PUBLIC_CONTACT_ENDPOINT (voir README). */
const endpoint: string = import.meta.env.PUBLIC_CONTACT_ENDPOINT ?? '/api/contact';

/** Attributs communs des formulaires de demande d'audit (src/scripts/contact.ts). */
export const formAttrs = {
  'data-contact-form': '',
  'data-endpoint': endpoint,
  'data-email': SITE.email,
  'data-phone': SITE.phone.display,
  action: endpoint || `mailto:${SITE.email}`,
  method: 'post',
  ...(endpoint ? {} : { enctype: 'text/plain' }),
};
