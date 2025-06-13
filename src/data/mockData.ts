import { SessionWithUsers, SessionUser, SessionStatus, GamePhase } from '@/types';

// Mock de animes populares
export const mockAnimes = [
  {
    id: '1',
    title: 'Attack on Titan',
    synopsis: 'La humanidad lucha por sobrevivir contra gigantes devoradores de humanos en un mundo post-apocalíptico.',
    genre: 'Action,Drama,Fantasy,Military',
    year: 2013,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Death Note',
    synopsis: 'Un estudiante brillante encuentra un cuaderno sobrenatural que puede matar a cualquier persona cuyo nombre sea escrito en él.',
    genre: 'Psychological,Supernatural,Thriller',
    year: 2006,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'One Piece',
    synopsis: 'Un joven pirata con poderes de goma busca el tesoro más grande del mundo para convertirse en el próximo Rey Pirata.',
    genre: 'Adventure,Comedy,Drama,Shounen',
    year: 1999,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Demon Slayer',
    synopsis: 'Un joven se convierte en cazador de demonios para vengar a su familia y salvar a su hermana convertida en demonio.',
    genre: 'Action,Supernatural,Historical',
    year: 2019,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'My Hero Academia',
    synopsis: 'En un mundo donde casi todos tienen superpoderes, un chico sin poderes sueña con convertirse en héroe.',
    genre: 'Action,School,Superhero',
    year: 2016,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/10/78745.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: 'Fullmetal Alchemist: Brotherhood',
    synopsis: 'Dos hermanos alquimistas buscan la Piedra Filosofal para recuperar sus cuerpos perdidos tras un experimento fallido.',
    genre: 'Action,Adventure,Drama,Fantasy',
    year: 2009,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    title: 'Naruto',
    synopsis: 'Un ninja joven y travieso busca reconocimiento de sus compañeros y sueña con convertirse en Hokage.',
    genre: 'Action,Adventure,Martial Arts',
    year: 2002,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    title: 'Dragon Ball Z',
    synopsis: 'Goku y sus amigos defienden la Tierra contra enemigos cada vez más poderosos en batallas épicas.',
    genre: 'Action,Adventure,Martial Arts',
    year: 1989,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1935/95961.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '9',
    title: 'Spirited Away',
    synopsis: 'Una niña debe trabajar en un mundo de espíritus para salvar a sus padres transformados en cerdos.',
    genre: 'Adventure,Family,Supernatural',
    year: 2001,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/6/79597.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '10',
    title: 'Cowboy Bebop',
    synopsis: 'Un grupo de cazarrecompensas viaja por el espacio en aventuras llenas de jazz, acción y melancolía.',
    genre: 'Action,Drama,Sci-Fi,Space',
    year: 1998,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/4/19644.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '11',
    title: 'Hunter x Hunter',
    synopsis: 'Un joven busca a su padre convirtiéndose en Hunter profesional y descubriendo un mundo de aventuras.',
    genre: 'Action,Adventure,Fantasy',
    year: 2011,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/11/33657.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '12',
    title: 'Jujutsu Kaisen',
    synopsis: 'Estudiantes de instituto luchan contra maldiciones usando artes marciales sobrenaturales.',
    genre: 'Action,School,Supernatural',
    year: 2020,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '13',
    title: 'Your Name',
    synopsis: 'Dos adolescentes intercambian cuerpos misteriosamente y deben encontrarse antes de que sea demasiado tarde.',
    genre: 'Romance,Drama,Supernatural',
    year: 2016,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '14',
    title: 'Mob Psycho 100',
    synopsis: 'Un estudiante con poderes psíquicos extraordinarios busca llevar una vida normal.',
    genre: 'Action,Comedy,Supernatural',
    year: 2016,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/8/80356.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '15',
    title: 'One Punch Man',
    synopsis: 'Un superhéroe que puede derrotar a cualquier enemigo con un solo golpe busca un oponente digno.',
    genre: 'Action,Comedy,Superhero',
    year: 2015,
    imageUrl: 'https://cdn.myanimelist.net/images/anime/12/76049.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock de usuarios
export const mockUsers: SessionUser[] = [
  {
    id: 'user1',
    sessionId: 'session1',
    userId: 'user1',
    nickname: 'AnimeLover123',
    isReady: true,
    joinedAt: new Date(),
  },
  {
    id: 'user2',
    sessionId: 'session1',
    userId: 'user2',
    nickname: 'OtakuMaster',
    isReady: true,
    joinedAt: new Date(),
  },
];

// Mock de sesión
export const mockSession: SessionWithUsers = {
  id: 'session1',
  code: 'ABC123',
  status: SessionStatus.ACTIVE,
  phase: GamePhase.SELECTION,
  maxUsers: 2,
  expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas desde ahora
  createdAt: new Date(),
  updatedAt: new Date(),
  users: mockUsers,
};

// Funciones helper para generar códigos y IDs aleatorios
export function generateMockCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateMockId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Función para buscar animes mock
export function searchMockAnimes(query: string, limit: number = 10) {
  if (!query.trim()) {
    return mockAnimes.slice(0, limit);
  }
  
  const lowercaseQuery = query.toLowerCase();
  const filtered = mockAnimes.filter(anime =>
    anime.title.toLowerCase().includes(lowercaseQuery) ||
    anime.genre.toLowerCase().includes(lowercaseQuery) ||
    anime.synopsis.toLowerCase().includes(lowercaseQuery)
  );
  
  return filtered.slice(0, limit);
}