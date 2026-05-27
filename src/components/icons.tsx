/** Ícones SVG próprios (sem emojis). Stroke = currentColor. */
import type { SVGProps } from 'react';

export type IconName =
  | 'home' | 'album' | 'swap' | 'trophy' | 'user' | 'chat' | 'search'
  | 'back' | 'forward' | 'plus' | 'minus' | 'check' | 'share' | 'close'
  | 'shield' | 'star' | 'lock' | 'calendar' | 'bulb' | 'sound' | 'mute'
  | 'spark' | 'stack' | 'qr' | 'send' | 'dots' | 'flag' | 'expand' | 'medal' | 'bolt';

const P: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>,
  album: <><rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M9 3v18M3 9h6" /></>,
  swap: <><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" /></>,
  trophy: <><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" /><path d="M12 13v4M9 21h6M10 17h4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" /></>,
  chat: <><path d="M4 5h16v11H9l-4 4v-4H4Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  back: <path d="m15 18-6-6 6-6" />,
  forward: <path d="m9 6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m20 6-11 11-5-5" />,
  share: <><circle cx="6" cy="12" r="2.5" /><circle cx="17" cy="6" r="2.5" /><circle cx="17" cy="18" r="2.5" /><path d="m8.2 10.8 6.6-3.6M8.2 13.2l6.6 3.6" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  shield: <><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  star: <path d="M12 3.5 14.6 9l6 .5-4.6 4 1.4 5.9L12 16.4 6.6 19.4 8 13.5 3.4 9.5l6-.5Z" />,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3Z" /></>,
  sound: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8 8 0 0 1 0 12" /></>,
  mute: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="m16 9 5 6M21 9l-5 6" /></>,
  spark: <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />,
  stack: <><path d="m12 3 8 4-8 4-8-4 8-4Z" /><path d="m4 11 8 4 8-4M4 15l8 4 8-4" /></>,
  qr: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2M20 14v6M16 18v2" /></>,
  send: <path d="M4 12 20 4l-6 16-3-7-7-1Z" />,
  dots: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 5h12l-2 3 2 3H5" /></>,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  medal: <><circle cx="12" cy="14" r="5" /><path d="m8.5 9.5-2-6.5h11l-2 6.5M12 12.2l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2L9.1 14.3l2-.3.9-1.8Z" /></>,
  bolt: <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />,
};

export function Icon({ name, size = 24, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...rest}
    >
      {P[name]}
    </svg>
  );
}
