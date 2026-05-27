/**
 * Proteções leves para o chat infantil (reforçadas no servidor pelo Supabase).
 * - Filtro de palavrões PT-BR (lista básica, ampliável).
 * - Bloqueio de compartilhamento de dados pessoais (telefone, endereço, redes).
 * Nada disso substitui moderação; é a primeira barreira no cliente.
 */

const BAD_WORDS = [
  'merda', 'bosta', 'porra', 'caralho', 'puta', 'puto', 'fdp', 'foda',
  'cu', 'cuzao', 'cuzão', 'viado', 'corno', 'idiota', 'burro', 'imbecil',
  'otario', 'otário', 'desgraça', 'desgraçado', 'arrombado', 'babaca',
  'piranha', 'vagabundo', 'vagabunda', 'retardado', 'lixo',
];

const PERSONAL_DATA_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /(\d[\s.-]?){8,}/, reason: 'parece um telefone' },
  { re: /\b(whats|whatsapp|zap|insta|instagram|tiktok|tik tok|telegram|snap)\b/i, reason: 'rede social' },
  { re: /@\w+/, reason: 'usuário de rede social' },
  { re: /\b(rua|avenida|av\.|travessa|bairro|cep|n[uú]mero da casa|endere[çc]o)\b/i, reason: 'endereço' },
  { re: /\b(senha|pin|cpf)\b/i, reason: 'dado secreto' },
];

export type SafetyResult =
  | { ok: true; text: string }
  | { ok: false; reason: string };

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function checkMessage(raw: string): SafetyResult {
  const text = raw.trim();
  if (!text) return { ok: false, reason: 'Escreva alguma coisa.' };
  if (text.length > 280) return { ok: false, reason: 'Mensagem muito longa.' };

  for (const { re, reason } of PERSONAL_DATA_PATTERNS) {
    if (re.test(text)) {
      return { ok: false, reason: `Não compartilhe ${reason} no chat. Combine a troca em um lugar seguro.` };
    }
  }

  const norm = normalize(text);
  const words = norm.split(/[^a-z0-9]+/);
  if (words.some((w) => BAD_WORDS.includes(w))) {
    return { ok: false, reason: 'Vamos manter o papo legal. Tente de outro jeito.' };
  }

  return { ok: true, text };
}
