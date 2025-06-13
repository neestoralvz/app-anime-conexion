import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const animeData = [
  {
    title: 'Attack on Titan',
    synopsis: 'La humanidad lucha por sobrevivir contra gigantes devoradores de humanos.',
    genre: 'Action,Drama,Fantasy',
    year: 2013,
  },
  {
    title: 'Death Note',
    synopsis: 'Un estudiante encuentra un cuaderno que puede matar a cualquier persona.',
    genre: 'Psychological,Supernatural,Thriller',
    year: 2006,
  },
  {
    title: 'One Piece',
    synopsis: 'Un joven pirata busca el tesoro más grande del mundo.',
    genre: 'Adventure,Comedy,Shounen',
    year: 1999,
  },
  {
    title: 'Demon Slayer',
    synopsis: 'Un joven se convierte en cazador de demonios para salvar a su hermana.',
    genre: 'Action,Supernatural,Historical',
    year: 2019,
  },
  {
    title: 'My Hero Academia',
    synopsis: 'En un mundo de superhéroes, un chico sin poderes sueña con ser héroe.',
    genre: 'Action,School,Superhero',
    year: 2016,
  },
  {
    title: 'Naruto',
    synopsis: 'Un ninja joven busca reconocimiento y sueña con convertirse en Hokage.',
    genre: 'Action,Adventure,Martial Arts',
    year: 2002,
  },
  {
    title: 'Spirited Away',
    synopsis: 'Una niña debe trabajar en un mundo mágico para salvar a sus padres.',
    genre: 'Adventure,Family,Fantasy',
    year: 2001,
  },
  {
    title: 'Your Name',
    synopsis: 'Dos adolescentes intercambian cuerpos misteriosamente.',
    genre: 'Romance,Drama,Supernatural',
    year: 2016,
  },
  {
    title: 'Princess Mononoke',
    synopsis: 'Un príncipe busca la cura para una maldición en un bosque mágico.',
    genre: 'Adventure,Drama,Fantasy',
    year: 1997,
  },
  {
    title: 'Jujutsu Kaisen',
    synopsis: 'Un estudiante lucha contra maldiciones sobrenaturales.',
    genre: 'Action,School,Supernatural',
    year: 2020,
  },
  {
    title: 'Hunter x Hunter',
    synopsis: 'Un niño busca a su padre mientras se convierte en cazador.',
    genre: 'Adventure,Fantasy,Shounen',
    year: 2011,
  },
  {
    title: 'Fullmetal Alchemist: Brotherhood',
    synopsis: 'Dos hermanos buscan la Piedra Filosofal para restaurar sus cuerpos.',
    genre: 'Adventure,Drama,Fantasy',
    year: 2009,
  },
  {
    title: 'Dragon Ball Z',
    synopsis: 'Guerreros poderosos protegen la Tierra de amenazas cósmicas.',
    genre: 'Action,Adventure,Martial Arts',
    year: 1989,
  },
  {
    title: 'One Punch Man',
    synopsis: 'Un superhéroe puede derrotar a cualquier enemigo con un solo golpe.',
    genre: 'Action,Comedy,Superhero',
    year: 2015,
  },
  {
    title: 'Mob Psycho 100',
    synopsis: 'Un estudiante con poderes psíquicos trata de vivir una vida normal.',
    genre: 'Comedy,School,Supernatural',
    year: 2016,
  },
  {
    title: 'Tokyo Ghoul',
    synopsis: 'Un estudiante se convierte en medio ghoul tras un encuentro fatídico.',
    genre: 'Action,Horror,Supernatural',
    year: 2014,
  },
  {
    title: 'Violet Evergarden',
    synopsis: 'Una ex-soldado aprende sobre las emociones humanas como escritora.',
    genre: 'Drama,Fantasy,Romance',
    year: 2018,
  },
  {
    title: 'Akira',
    synopsis: 'En un Tokyo post-apocalíptico, poderes psíquicos amenazan la ciudad.',
    genre: 'Action,Sci-Fi,Thriller',
    year: 1988,
  },
  {
    title: 'Castle in the Sky',
    synopsis: 'Una niña y un niño buscan un castillo flotante legendario.',
    genre: 'Adventure,Family,Fantasy',
    year: 1986,
  },
  {
    title: 'Cowboy Bebop',
    synopsis: 'Cazarrecompensas espaciales persiguen criminales por el sistema solar.',
    genre: 'Action,Drama,Sci-Fi',
    year: 1998,
  },
];

async function main() {
  console.log('🌱 Seeding database...');
  
  // Limpiar datos existentes
  await prisma.rating.deleteMany();
  await prisma.selection.deleteMany();
  await prisma.sessionUser.deleteMany();
  await prisma.session.deleteMany();
  await prisma.anime.deleteMany();
  
  // Crear animes
  for (const anime of animeData) {
    await prisma.anime.create({
      data: anime,
    });
  }
  
  console.log(`✅ Seeded ${animeData.length} animes`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });