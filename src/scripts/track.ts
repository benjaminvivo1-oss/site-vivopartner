/** Envoie un événement à Plausible s'il est chargé (sans cookies). Sans effet sinon. */
type Plausible = (event: string, options?: { props?: Record<string, string> }) => void;

export function track(event: 'audit_cta_click' | 'form_submit' | 'tel_click', props?: Record<string, string>) {
  const plausible = (window as unknown as { plausible?: Plausible }).plausible;
  if (typeof plausible === 'function') plausible(event, props ? { props } : undefined);
}
