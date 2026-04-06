import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed the 14 official EU allergens (Regulation EU 1169/2011)
 * with Spanish names and descriptions.
 */
async function main() {
  const allergens = [
    {
      code: 'GLUTEN',
      name: 'Gluten',
      description:
        'Cereales que contengan gluten: trigo, centeno, cebada, avena, espelta, kamut o sus variedades híbridas.',
      isMajor: true,
    },
    {
      code: 'CRUSTACEANS',
      name: 'Crustáceos',
      description: 'Crustáceos y productos a base de crustáceos.',
      isMajor: true,
    },
    {
      code: 'EGGS',
      name: 'Huevos',
      description: 'Huevos y productos a base de huevo.',
      isMajor: true,
    },
    {
      code: 'FISH',
      name: 'Pescado',
      description: 'Pescado y productos a base de pescado.',
      isMajor: true,
    },
    {
      code: 'PEANUTS',
      name: 'Cacahuetes',
      description: 'Cacahuetes y productos a base de cacahuetes.',
      isMajor: true,
    },
    {
      code: 'SOY',
      name: 'Soja',
      description: 'Soja y productos a base de soja.',
      isMajor: true,
    },
    {
      code: 'DAIRY',
      name: 'Leche',
      description: 'Leche y sus derivados (incluida la lactosa).',
      isMajor: true,
    },
    {
      code: 'NUTS',
      name: 'Frutos de cáscara',
      description:
        'Frutos de cáscara: almendras, avellanas, nueces, anacardos, pacanas, nueces de Brasil, pistachos, nueces de macadamia.',
      isMajor: true,
    },
    {
      code: 'CELERY',
      name: 'Apio',
      description: 'Apio y productos derivados.',
      isMajor: true,
    },
    {
      code: 'MUSTARD',
      name: 'Mostaza',
      description: 'Mostaza y productos derivados.',
      isMajor: true,
    },
    {
      code: 'SESAME',
      name: 'Granos de sésamo',
      description: 'Granos de sésamo y productos a base de granos de sésamo.',
      isMajor: true,
    },
    {
      code: 'SULPHITES',
      name: 'Dióxido de azufre y sulfitos',
      description:
        'Dióxido de azufre y sulfitos en concentraciones superiores a 10 mg/kg o 10 mg/litro.',
      isMajor: true,
    },
    {
      code: 'LUPIN',
      name: 'Altramuces',
      description: 'Altramuces y productos a base de altramuces.',
      isMajor: true,
    },
    {
      code: 'MOLLUSCS',
      name: 'Moluscos',
      description: 'Moluscos y productos a base de moluscos.',
      isMajor: true,
    },
  ];

  console.log('Seeding 14 EU allergens...');

  for (const allergen of allergens) {
    await prisma.allergen.upsert({
      where: { code: allergen.code },
      update: {
        name: allergen.name,
        description: allergen.description,
        isMajor: allergen.isMajor,
      },
      create: allergen,
    });
  }

  console.log('Seeding complete: 14 EU allergens inserted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
