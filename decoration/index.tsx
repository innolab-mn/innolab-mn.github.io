import Halloween from './halloween';
import type { Locale } from '@/lib/i18n';
import './decoration.css';

// Server component: Next.js resolves this during static export, never in the browser.
// Keep the registry explicit; environment values must never become import paths.
const decorations = { halloween: Halloween };

export default function EventDecoration({ locale = 'mn' }: { locale?: Locale }) {
  const event = (process.env.EVENT_DECORATION || '').trim().toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(decorations, event)) return null;
  const Decoration = decorations[event as keyof typeof decorations];
  return <div className="event-decoration" data-event-decoration={event}><Decoration locale={locale} /></div>;
}
