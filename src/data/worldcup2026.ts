/**
 * Dados da Copa do Mundo FIFA 2026 (EUA / México / Canadá).
 * 48 seleções, 12 grupos (A–L), 11/jun a 19/jul/2026.
 *
 * ⚠️ VALIDAÇÃO: a composição dos grupos abaixo reflete o sorteio de 05/12/2025.
 * Antes de publicar, conferir a composição final na FIFA.com (algumas vagas
 * dependiam de repescagens resolvidas em mar/2026). Escalações oficiais saem
 * no início de jun/2026 — os "craques" abaixo são provisórios/ilustrativos.
 *
 * Não usamos imagens das figurinhas Panini nem fotos de jogadores (direitos):
 * usamos bandeiras (emoji), números, nomes e fatos públicos.
 */

export type GroupId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export interface Team {
  /** código curto único (usado em rotas e nos códigos das figurinhas) */
  code: string;
  name: string;
  flag: string;
  group: GroupId;
  /** confederação */
  confed: 'CONMEBOL' | 'UEFA' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';
  /** títulos de Copa do Mundo */
  titles: number;
  nickname?: string;
  curiosidades: string[];
  /** craques (provisório — escalação oficial sai em junho) */
  craques: string[];
}

export interface Group {
  id: GroupId;
  teams: string[]; // team codes, na ordem do sorteio
}

/** Países-sede e janela do torneio */
export const TOURNAMENT = {
  name: 'Copa do Mundo FIFA 2026',
  hosts: ['Estados Unidos 🇺🇸', 'México 🇲🇽', 'Canadá 🇨🇦'],
  teamsCount: 48,
  groupsCount: 12,
  matchesCount: 104,
  start: '2026-06-11',
  end: '2026-07-19',
  opener: { home: 'MEX', away: 'RSA', date: '2026-06-11', venue: 'Estádio Azteca, Cidade do México' },
  final: { date: '2026-07-19', venue: 'MetLife Stadium, Nova Jersey' },
} as const;

export const TEAMS: Team[] = [
  // ---- Grupo A ----
  { code: 'MEX', name: 'México', flag: '🇲🇽', group: 'A', confed: 'CONCACAF', titles: 0, nickname: 'El Tri',
    curiosidades: ['País-sede que abre a Copa de 2026.', 'Disputa a Copa do Mundo desde 1930.'], craques: ['Santiago Giménez', 'Edson Álvarez'] },
  { code: 'RSA', name: 'África do Sul', flag: '🇿🇦', group: 'A', confed: 'CAF', titles: 0, nickname: 'Bafana Bafana',
    curiosidades: ['Sediou a Copa do Mundo de 2010.'], craques: ['Lyle Foster'] },
  { code: 'KOR', name: 'Coreia do Sul', flag: '🇰🇷', group: 'A', confed: 'AFC', titles: 0,
    curiosidades: ['Foi 4º lugar na Copa de 2002, que ajudou a sediar.'], craques: ['Son Heung-min'] },
  { code: 'CZE', name: 'Tchéquia', flag: '🇨🇿', group: 'A', confed: 'UEFA', titles: 0,
    curiosidades: ['Como Tchecoslováquia, foi vice-campeã em 1934 e 1962.'], craques: ['Patrik Schick'] },

  // ---- Grupo B ----
  { code: 'CAN', name: 'Canadá', flag: '🇨🇦', group: 'B', confed: 'CONCACAF', titles: 0,
    curiosidades: ['Um dos três países-sede de 2026.'], craques: ['Alphonso Davies', 'Jonathan David'] },
  { code: 'BIH', name: 'Bósnia e Herzegovina', flag: '🇧🇦', group: 'B', confed: 'UEFA', titles: 0,
    curiosidades: ['Estreou em Copas na edição de 2014.'], craques: ['Edin Džeko'] },
  { code: 'QAT', name: 'Catar', flag: '🇶🇦', group: 'B', confed: 'AFC', titles: 0,
    curiosidades: ['Sediou a Copa do Mundo de 2022.'], craques: ['Akram Afif'] },
  { code: 'SUI', name: 'Suíça', flag: '🇨🇭', group: 'B', confed: 'UEFA', titles: 0,
    curiosidades: ['A sede da FIFA fica em Zurique, na Suíça.'], craques: ['Granit Xhaka'] },

  // ---- Grupo C ----
  { code: 'BRA', name: 'Brasil', flag: '🇧🇷', group: 'C', confed: 'CONMEBOL', titles: 5, nickname: 'Seleção Canarinho',
    curiosidades: ['Pentacampeão: 1958, 1962, 1970, 1994 e 2002.', 'É o único país que disputou todas as Copas do Mundo.'], craques: ['Vinícius Jr.', 'Rodrygo', 'Raphinha'] },
  { code: 'MAR', name: 'Marrocos', flag: '🇲🇦', group: 'C', confed: 'CAF', titles: 0, nickname: 'Leões do Atlas',
    curiosidades: ['Foi a 1ª seleção africana a chegar à semifinal (2022).'], craques: ['Achraf Hakimi', 'Brahim Díaz'] },
  { code: 'HAI', name: 'Haiti', flag: '🇭🇹', group: 'C', confed: 'CONCACAF', titles: 0,
    curiosidades: ['Volta à Copa após muitos anos de ausência.'], craques: ['Frantzdy Pierrot'] },
  { code: 'SCO', name: 'Escócia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C', confed: 'UEFA', titles: 0,
    curiosidades: ['Tem uma das torcidas mais animadas do mundo, a "Tartan Army".'], craques: ['Scott McTominay'] },

  // ---- Grupo D ----
  { code: 'USA', name: 'Estados Unidos', flag: '🇺🇸', group: 'D', confed: 'CONCACAF', titles: 0,
    curiosidades: ['Principal país-sede de 2026, com 11 cidades.', 'Foi 3º lugar na 1ª Copa, em 1930.'], craques: ['Christian Pulisic'] },
  { code: 'PAR', name: 'Paraguai', flag: '🇵🇾', group: 'D', confed: 'CONMEBOL', titles: 0,
    curiosidades: ['Chegou às quartas de final em 2010.'], craques: ['Miguel Almirón'] },
  { code: 'AUS', name: 'Austrália', flag: '🇦🇺', group: 'D', confed: 'AFC', titles: 0, nickname: 'Socceroos',
    curiosidades: ['Joga pela Ásia (AFC) desde 2006.'], craques: ['Mathew Ryan'] },
  { code: 'TUR', name: 'Turquia', flag: '🇹🇷', group: 'D', confed: 'UEFA', titles: 0,
    curiosidades: ['Foi 3º lugar na Copa de 2002.'], craques: ['Arda Güler', 'Hakan Çalhanoğlu'] },

  // ---- Grupo E ----
  { code: 'GER', name: 'Alemanha', flag: '🇩🇪', group: 'E', confed: 'UEFA', titles: 4, nickname: 'Die Mannschaft',
    curiosidades: ['Tetracampeã: 1954, 1974, 1990 e 2014.'], craques: ['Jamal Musiala', 'Florian Wirtz'] },
  { code: 'CUW', name: 'Curaçao', flag: '🇨🇼', group: 'E', confed: 'CONCACAF', titles: 0,
    curiosidades: ['Uma das menores nações a se classificar para uma Copa.'], craques: ['Leandro Bacuna'] },
  { code: 'CIV', name: 'Costa do Marfim', flag: '🇨🇮', group: 'E', confed: 'CAF', titles: 0, nickname: 'Os Elefantes',
    curiosidades: ['Foi campeã da Copa Africana de Nações em 2024.'], craques: ['Sébastien Haller'] },
  { code: 'ECU', name: 'Equador', flag: '🇪🇨', group: 'E', confed: 'CONMEBOL', titles: 0,
    curiosidades: ['Tem um dos elencos mais jovens das Américas.'], craques: ['Moisés Caicedo'] },

  // ---- Grupo F ----
  { code: 'NED', name: 'Holanda', flag: '🇳🇱', group: 'F', confed: 'UEFA', titles: 0, nickname: 'Laranja Mecânica',
    curiosidades: ['Foi vice-campeã três vezes (1974, 1978 e 2010).'], craques: ['Virgil van Dijk', 'Cody Gakpo'] },
  { code: 'JPN', name: 'Japão', flag: '🇯🇵', group: 'F', confed: 'AFC', titles: 0, nickname: 'Samurai Blue',
    curiosidades: ['Os torcedores ficam famosos por limpar o estádio após os jogos.'], craques: ['Takefusa Kubo'] },
  { code: 'SWE', name: 'Suécia', flag: '🇸🇪', group: 'F', confed: 'UEFA', titles: 0,
    curiosidades: ['Foi vice-campeã em 1958, em casa, contra o Brasil.'], craques: ['Alexander Isak'] },
  { code: 'TUN', name: 'Tunísia', flag: '🇹🇳', group: 'F', confed: 'CAF', titles: 0, nickname: 'Águias de Cartago',
    curiosidades: ['Em 1978, foi a 1ª seleção africana a vencer um jogo de Copa.'], craques: ['Hannibal Mejbri'] },

  // ---- Grupo G ----
  { code: 'BEL', name: 'Bélgica', flag: '🇧🇪', group: 'G', confed: 'UEFA', titles: 0, nickname: 'Diabos Vermelhos',
    curiosidades: ['Foi 3º lugar na Copa de 2018, sua melhor campanha.'], craques: ['Kevin De Bruyne', 'Jérémy Doku'] },
  { code: 'EGY', name: 'Egito', flag: '🇪🇬', group: 'G', confed: 'CAF', titles: 0, nickname: 'Faraós',
    curiosidades: ['Recordista de títulos da Copa Africana de Nações.'], craques: ['Mohamed Salah'] },
  { code: 'IRN', name: 'Irã', flag: '🇮🇷', group: 'G', confed: 'AFC', titles: 0, nickname: 'Príncipes da Pérsia',
    curiosidades: ['É uma das seleções mais constantes da Ásia.'], craques: ['Mehdi Taremi'] },
  { code: 'NZL', name: 'Nova Zelândia', flag: '🇳🇿', group: 'G', confed: 'OFC', titles: 0, nickname: 'All Whites',
    curiosidades: ['Único país-representante da Oceania (OFC) na Copa.'], craques: ['Chris Wood'] },

  // ---- Grupo H ----
  { code: 'ESP', name: 'Espanha', flag: '🇪🇸', group: 'H', confed: 'UEFA', titles: 1, nickname: 'La Roja',
    curiosidades: ['Campeã mundial em 2010, na África do Sul.'], craques: ['Lamine Yamal', 'Pedri'] },
  { code: 'CPV', name: 'Cabo Verde', flag: '🇨🇻', group: 'H', confed: 'CAF', titles: 0, nickname: 'Tubarões Azuis',
    curiosidades: ['Uma das menores nações a chegar à Copa do Mundo.'], craques: ['Ryan Mendes'] },
  { code: 'KSA', name: 'Arábia Saudita', flag: '🇸🇦', group: 'H', confed: 'AFC', titles: 0, nickname: 'Os Falcões',
    curiosidades: ['Venceu a Argentina na estreia da Copa de 2022.'], craques: ['Salem Al-Dawsari'] },
  { code: 'URU', name: 'Uruguai', flag: '🇺🇾', group: 'H', confed: 'CONMEBOL', titles: 2, nickname: 'La Celeste',
    curiosidades: ['Venceu a 1ª Copa da história, em 1930, em casa.', 'Bicampeão: 1930 e 1950 (o "Maracanazo").'], craques: ['Federico Valverde', 'Darwin Núñez'] },

  // ---- Grupo I ----
  { code: 'FRA', name: 'França', flag: '🇫🇷', group: 'I', confed: 'UEFA', titles: 2, nickname: 'Les Bleus',
    curiosidades: ['Bicampeã: 1998 e 2018.'], craques: ['Kylian Mbappé', 'Aurélien Tchouaméni'] },
  { code: 'SEN', name: 'Senegal', flag: '🇸🇳', group: 'I', confed: 'CAF', titles: 0, nickname: 'Leões de Teranga',
    curiosidades: ['Campeão africano em 2021.'], craques: ['Sadio Mané', 'Nicolas Jackson'] },
  { code: 'IRQ', name: 'Iraque', flag: '🇮🇶', group: 'I', confed: 'AFC', titles: 0, nickname: 'Leões da Mesopotâmia',
    curiosidades: ['Foi campeão da Copa da Ásia em 2007.'], craques: ['Aymen Hussein'] },
  { code: 'NOR', name: 'Noruega', flag: '🇳🇴', group: 'I', confed: 'UEFA', titles: 0,
    curiosidades: ['Volta à Copa do Mundo depois de muitos anos.'], craques: ['Erling Haaland', 'Martin Ødegaard'] },

  // ---- Grupo J ----
  { code: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'J', confed: 'CONMEBOL', titles: 3, nickname: 'La Albiceleste',
    curiosidades: ['Tricampeã: 1978, 1986 e 2022.', 'Atual campeã do mundo.'], craques: ['Lionel Messi', 'Julián Álvarez'] },
  { code: 'ALG', name: 'Argélia', flag: '🇩🇿', group: 'J', confed: 'CAF', titles: 0, nickname: 'Raposas do Deserto',
    curiosidades: ['Chegou às oitavas de final em 2014.'], craques: ['Riyad Mahrez'] },
  { code: 'AUT', name: 'Áustria', flag: '🇦🇹', group: 'J', confed: 'UEFA', titles: 0,
    curiosidades: ['Foi 3º lugar na Copa de 1954.'], craques: ['Marcel Sabitzer'] },
  { code: 'JOR', name: 'Jordânia', flag: '🇯🇴', group: 'J', confed: 'AFC', titles: 0,
    curiosidades: ['Disputa sua primeira Copa do Mundo em 2026.'], craques: ['Mousa Al-Taamari'] },

  // ---- Grupo K ----
  { code: 'POR', name: 'Portugal', flag: '🇵🇹', group: 'K', confed: 'UEFA', titles: 0, nickname: 'Os Navegadores',
    curiosidades: ['Campeão da Eurocopa em 2016.'], craques: ['Cristiano Ronaldo', 'Bruno Fernandes'] },
  { code: 'COD', name: 'Congo (RD)', flag: '🇨🇩', group: 'K', confed: 'CAF', titles: 0, nickname: 'Leopardos',
    curiosidades: ['Foi 3º lugar na Copa Africana de 1998.'], craques: ['Cédric Bakambu'] },
  { code: 'UZB', name: 'Uzbequistão', flag: '🇺🇿', group: 'K', confed: 'AFC', titles: 0,
    curiosidades: ['Disputa sua primeira Copa do Mundo em 2026.'], craques: ['Eldor Shomurodov'] },
  { code: 'COL', name: 'Colômbia', flag: '🇨🇴', group: 'K', confed: 'CONMEBOL', titles: 0, nickname: 'Los Cafeteros',
    curiosidades: ['Chegou às quartas de final em 2014.'], craques: ['Luis Díaz', 'James Rodríguez'] },

  // ---- Grupo L ----
  { code: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L', confed: 'UEFA', titles: 1, nickname: 'Os Três Leões',
    curiosidades: ['Campeã mundial em 1966, em casa.', 'Inventou o futebol moderno.'], craques: ['Jude Bellingham', 'Harry Kane'] },
  { code: 'CRO', name: 'Croácia', flag: '🇭🇷', group: 'L', confed: 'UEFA', titles: 0, nickname: 'Vatreni',
    curiosidades: ['Foi vice-campeã em 2018 e 3ª em 2022.'], craques: ['Luka Modrić'] },
  { code: 'GHA', name: 'Gana', flag: '🇬🇭', group: 'L', confed: 'CAF', titles: 0, nickname: 'Estrelas Negras',
    curiosidades: ['Quase chegou à semifinal em 2010.'], craques: ['Mohammed Kudus'] },
  { code: 'PAN', name: 'Panamá', flag: '🇵🇦', group: 'L', confed: 'CONCACAF', titles: 0,
    curiosidades: ['Disputou sua primeira Copa em 2018.'], craques: ['Adalberto Carrasquilla'] },
];

export const GROUPS: Group[] = (['A','B','C','D','E','F','G','H','I','J','K','L'] as GroupId[]).map(
  (id) => ({ id, teams: TEAMS.filter((t) => t.group === id).map((t) => t.code) }),
);

const teamByCode = new Map(TEAMS.map((t) => [t.code, t]));
export const getTeam = (code: string): Team | undefined => teamByCode.get(code);

/** Cor principal (kit) de cada seleção — usada nos códigos e nas figurinhas. */
export const TEAM_COLORS: Record<string, string> = {
  MEX: '#0a7b3e', RSA: '#15803d', KOR: '#1d4ed8', CZE: '#11457e',
  CAN: '#d52b1e', BIH: '#1b3a8c', QAT: '#7a1230', SUI: '#d52b1e',
  BRA: '#f5c518', MAR: '#b81d22', HAI: '#14209f', SCO: '#0a4fa0',
  USA: '#11295b', PAR: '#c81f24', AUS: '#0a7b3e', TUR: '#d81f26',
  GER: '#2a2a2a', CUW: '#0a39a8', CIV: '#ef7a1a', ECU: '#e6b800',
  NED: '#ec6a1a', JPN: '#16235e', SWE: '#1f6aa6', TUN: '#d51020',
  BEL: '#c01526', EGY: '#c01526', IRN: '#15803d', NZL: '#1f1f24',
  ESP: '#c40b1e', CPV: '#0a3aa0', KSA: '#0a6c39', URU: '#4f8fd6',
  FRA: '#1b2a55', SEN: '#0a8a44', IRQ: '#0a7a3f', NOR: '#b80c2f',
  ARG: '#4f93cf', ALG: '#0a6233', AUT: '#e02232', JOR: '#c41226',
  POR: '#b81226', COD: '#1f7fd6', UZB: '#0a8fb0', COL: '#e6b800',
  ENG: '#1a2a6c', CRO: '#b81226', GHA: '#0a6b3f', PAN: '#c81034',
};

export const getTeamColor = (code?: string): string =>
  (code && TEAM_COLORS[code]) || '#0b7a4b';

/** Escolhe texto escuro ou branco com bom contraste sobre uma cor. */
export function readableOn(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.55 ? '#0e1730' : '#ffffff';
}

export interface Fixture {
  group: GroupId;
  matchday: 1 | 2 | 3;
  home: string;
  away: string;
}

/** Confrontos da fase de grupos (round-robin correto por grupo). */
export const FIXTURES: Fixture[] = GROUPS.flatMap((g) => {
  const [a, b, c, d] = g.teams;
  return [
    { group: g.id, matchday: 1, home: a, away: b },
    { group: g.id, matchday: 1, home: c, away: d },
    { group: g.id, matchday: 2, home: a, away: c },
    { group: g.id, matchday: 2, home: b, away: d },
    { group: g.id, matchday: 3, home: a, away: d },
    { group: g.id, matchday: 3, home: b, away: c },
  ] as Fixture[];
});

/** Curiosidades gerais sobre a Copa (fatos estáveis). */
export const FUN_FACTS: string[] = [
  'A Copa de 2026 é a primeira com 48 seleções — antes eram 32.',
  'Três países vão sediar juntos: Estados Unidos, México e Canadá.',
  'Serão 104 jogos no total, mais do que qualquer Copa anterior.',
  'O México vai ser o primeiro país a sediar três Copas do Mundo.',
  'O álbum oficial tem 980 figurinhas, o maior da história.',
  'A final será no MetLife Stadium, perto de Nova York.',
  'O Brasil é o único país que jogou todas as Copas do Mundo.',
  'Cada seleção tem uma página no álbum com 20 figurinhas.',
];

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export const QUIZ: QuizQuestion[] = [
  { q: 'Quantas seleções disputam a Copa de 2026?', options: ['32', '48', '64', '24'], answer: 1 },
  { q: 'Quais países sediam a Copa de 2026?', options: ['Só os EUA', 'Brasil e Argentina', 'EUA, México e Canadá', 'Catar'], answer: 2 },
  { q: 'Em que grupo está o Brasil?', options: ['Grupo A', 'Grupo C', 'Grupo H', 'Grupo L'], answer: 1 },
  { q: 'Quantas Copas o Brasil já ganhou?', options: ['3', '4', '5', '6'], answer: 2 },
  { q: 'Quem joga o jogo de abertura?', options: ['Brasil x Argentina', 'México x África do Sul', 'EUA x Canadá', 'França x Espanha'], answer: 1 },
  { q: 'Quantas figurinhas tem o álbum oficial?', options: ['640', '850', '980', '1200'], answer: 2 },
  { q: 'Quem é a atual campeã do mundo?', options: ['França', 'Brasil', 'Argentina', 'Alemanha'], answer: 2 },
  { q: 'Quantas figurinhas tem a página de cada seleção?', options: ['11', '15', '20', '25'], answer: 2 },
];
