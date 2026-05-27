import { useEffect, useState } from 'react';
import { getPlayerPhoto } from '../lib/playerPhotos';

/**
 * Foto do jogador via Wikipédia (licença livre). Enquanto carrega, ou se não
 * houver foto, mostra um fundo com a bandeira — nunca quebra o layout.
 */
export default function PlayerPhoto({
  name, flag, className = '', rounded = 'rounded-2xl',
}: { name: string; flag?: string; className?: string; rounded?: string }) {
  const [url, setUrl] = useState<string | null | 'loading'>('loading');

  useEffect(() => {
    let alive = true;
    setUrl('loading');
    getPlayerPhoto(name).then((u) => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [name]);

  if (url && url !== 'loading') {
    return (
      <img
        src={url}
        alt={name}
        loading="lazy"
        className={`h-full w-full object-cover ${rounded} ${className}`}
      />
    );
  }

  // fallback: bandeira sobre fundo suave (carregando ou sem foto)
  return (
    <div className={`grid h-full w-full place-items-center bg-brand-50 ${rounded} ${className}`}>
      <span className={`text-3xl ${url === 'loading' ? 'animate-pulse opacity-60' : 'opacity-80'}`}>
        {flag ?? '👤'}
      </span>
    </div>
  );
}
