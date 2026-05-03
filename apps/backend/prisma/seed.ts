import { PrismaClient, RewardType } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ── IDs fijos para que el .env.local apunte a ellos ──────────────────────────
const COMPANY_ID = 'a1b2c3d4-0000-0000-0000-000000000001'
const BRANCH_ID  = 'a1b2c3d4-0000-0000-0000-000000000002'
const ADMIN_ID   = 'a1b2c3d4-0000-0000-0000-000000000003'

// Base URL del backend para imágenes servidas desde public/uploads/seed/.
// Override con SEED_IMAGE_BASE_URL en producción.
const IMAGE_BASE_URL = process.env.SEED_IMAGE_BASE_URL ?? 'http://localhost:3001'
const dishImage = (id: string) => `${IMAGE_BASE_URL}/uploads/seed/${id}.jpg`

async function seedAllergens() {
  const allergens = [
    { code: 'GLUTEN',      name: 'Gluten',                     description: 'Cereales que contengan gluten.',                         isMajor: true },
    { code: 'CRUSTACEANS', name: 'Crustáceos',                  description: 'Crustáceos y productos a base de crustáceos.',           isMajor: true },
    { code: 'EGGS',        name: 'Huevos',                      description: 'Huevos y productos a base de huevo.',                    isMajor: true },
    { code: 'FISH',        name: 'Pescado',                     description: 'Pescado y productos a base de pescado.',                 isMajor: true },
    { code: 'PEANUTS',     name: 'Cacahuetes',                  description: 'Cacahuetes y productos a base de cacahuetes.',           isMajor: true },
    { code: 'SOY',         name: 'Soja',                        description: 'Soja y productos a base de soja.',                      isMajor: true },
    { code: 'DAIRY',       name: 'Leche',                       description: 'Leche y sus derivados (incluida la lactosa).',           isMajor: true },
    { code: 'NUTS',        name: 'Frutos de cáscara',           description: 'Almendras, avellanas, nueces, anacardos, pistachos...', isMajor: true },
    { code: 'CELERY',      name: 'Apio',                        description: 'Apio y productos derivados.',                           isMajor: true },
    { code: 'MUSTARD',     name: 'Mostaza',                     description: 'Mostaza y productos derivados.',                        isMajor: true },
    { code: 'SESAME',      name: 'Granos de sésamo',            description: 'Granos de sésamo y productos derivados.',               isMajor: true },
    { code: 'SULPHITES',   name: 'Dióxido de azufre y sulfitos', description: 'Sulfitos en concentraciones > 10 mg/kg.',              isMajor: true },
    { code: 'LUPIN',       name: 'Altramuces',                  description: 'Altramuces y productos a base de altramuces.',          isMajor: true },
    { code: 'MOLLUSCS',    name: 'Moluscos',                    description: 'Moluscos y productos a base de moluscos.',              isMajor: true },
  ]

  console.log('🌱 Seeding allergens...')
  for (const a of allergens) {
    await prisma.allergen.upsert({ where: { code: a.code }, update: a, create: a })
  }
}

async function seedDemoRestaurant() {
  console.log('🍕 Seeding demo restaurant (Pizzeria Napoli)...')

  // ── Empresa ──────────────────────────────────────────────────────────────
  await prisma.company.upsert({
    where: { id: COMPANY_ID },
    update: {},
    create: {
      id: COMPANY_ID,
      name: 'Pizzería Nápoli',
      slug: 'napoli',
      description: 'Auténtica pizza napolitana desde 1987',
      appName: 'Nápoli Pizza',
      welcomeMessage: '¡Bienvenido! Pide tu pizza favorita online.',
      colorPrimary: '#c0392b',
      colorSecondary: '#f5f5f5',
      colorAccent: '#e67e22',
      colorBackground: '#ffffff',
      colorSurface: '#fafafa',
      colorText: '#1a1a1a',
      colorTextMuted: '#777777',
      isActive: true,
    },
  })

  // ── Sede ──────────────────────────────────────────────────────────────────
  await prisma.branch.upsert({
    where: { id: BRANCH_ID },
    update: { slug: 'centro' },
    create: {
      id: BRANCH_ID,
      companyId: COMPANY_ID,
      slug: 'centro',
      name: 'Sede Centro',
      address: 'Calle Mayor 12, Madrid',
      phone: '+34 910 000 000',
      email: 'centro@napoli.es',
      serviceModes: ['PICKUP', 'DELIVERY'],
      isActive: true,
    },
  })

  // Horarios L–D 12:00–23:00
  const days = [0, 1, 2, 3, 4, 5, 6]
  for (const day of days) {
    await prisma.operatingHour.upsert({
      where: { id: `hour-${BRANCH_ID}-${day}` },
      update: {},
      create: {
        id: `hour-${BRANCH_ID}-${day}`,
        branchId: BRANCH_ID,
        dayOfWeek: day,
        openTime: '12:00',
        closeTime: '23:00',
        isClosed: false,
      },
    })
  }

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { id: ADMIN_ID },
    update: { passwordHash: adminPasswordHash },
    create: {
      id: ADMIN_ID,
      email: 'admin@napoli.es',
      displayName: 'Admin Nápoli',
      role: 'RESTAURANT_ADMIN',
      companyId: COMPANY_ID,
      passwordHash: adminPasswordHash,
    },
  })

  // ── Categorías ────────────────────────────────────────────────────────────
  const cats = [
    { id: 'cat-1', name: 'Pizzas',      sortOrder: 1 },
    { id: 'cat-2', name: 'Pasta',       sortOrder: 2 },
    { id: 'cat-3', name: 'Entrantes',   sortOrder: 3 },
    { id: 'cat-4', name: 'Bebidas',     sortOrder: 4 },
    { id: 'cat-5', name: 'Postres',     sortOrder: 5 },
  ]

  for (const cat of cats) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { ...cat, companyId: COMPANY_ID, isActive: true },
    })
  }

  // ── Platos ────────────────────────────────────────────────────────────────
  const dishes = [
    // Pizzas
    {
      id: 'dish-1', categoryId: 'cat-1', name: 'Margherita',
      description: 'Tomate, mozzarella fior di latte, albahaca fresca',
      basePrice: 10.5, allergenCodes: ['GLUTEN', 'DAIRY'],
    },
    {
      id: 'dish-2', categoryId: 'cat-1', name: 'Pepperoni',
      description: 'Tomate, mozzarella, pepperoni picante',
      basePrice: 12.5, allergenCodes: ['GLUTEN', 'DAIRY'],
    },
    {
      id: 'dish-3', categoryId: 'cat-1', name: 'Quattro Formaggi',
      description: 'Mozzarella, gorgonzola, parmesano, ricotta',
      basePrice: 13.5, allergenCodes: ['GLUTEN', 'DAIRY'],
    },
    {
      id: 'dish-4', categoryId: 'cat-1', name: 'Vegana del Huerto',
      description: 'Tomate, pimientos, cebolla caramelizada, champiñones, rúcula',
      basePrice: 11.5, allergenCodes: ['GLUTEN'],
    },
    // Pasta
    {
      id: 'dish-5', categoryId: 'cat-2', name: 'Carbonara',
      description: 'Espagueti, huevo, guanciale, pecorino, pimienta negra',
      basePrice: 10.0, allergenCodes: ['GLUTEN', 'EGGS', 'DAIRY'],
    },
    {
      id: 'dish-6', categoryId: 'cat-2', name: 'Bolognesa',
      description: 'Tagliatelle, ragú de ternera, parmesano',
      basePrice: 10.5, allergenCodes: ['GLUTEN', 'DAIRY'],
    },
    // Entrantes
    {
      id: 'dish-7', categoryId: 'cat-3', name: 'Bruschetta',
      description: 'Pan tostado con tomate, ajo y albahaca',
      basePrice: 5.5, allergenCodes: ['GLUTEN'],
    },
    {
      id: 'dish-8', categoryId: 'cat-3', name: 'Burrata',
      description: 'Burrata fresca, tomates cherry, pesto genovés',
      basePrice: 8.0, allergenCodes: ['DAIRY', 'NUTS'],
    },
    // Bebidas
    {
      id: 'dish-9',  categoryId: 'cat-4', name: 'Agua mineral',  description: '50cl', basePrice: 2.0, allergenCodes: [] },
    {
      id: 'dish-10', categoryId: 'cat-4', name: 'Coca-Cola',     description: '33cl', basePrice: 2.5, allergenCodes: [] },
    {
      id: 'dish-11', categoryId: 'cat-4', name: 'Cerveza Moretti', description: 'Importación italiana 33cl', basePrice: 3.0, allergenCodes: ['GLUTEN'] },
    // Postres
    {
      id: 'dish-12', categoryId: 'cat-5', name: 'Tiramisú',
      description: 'Receta tradicional con mascarpone y café',
      basePrice: 5.0, allergenCodes: ['EGGS', 'DAIRY', 'GLUTEN'],
    },
    {
      id: 'dish-13', categoryId: 'cat-5', name: 'Panna cotta',
      description: 'Con coulis de frutos rojos',
      basePrice: 4.5, allergenCodes: ['DAIRY'],
    },
  ]

  for (const dish of dishes) {
    const { allergenCodes, ...dishData } = dish
    const imageUrl = dishImage(dish.id)
    await prisma.dish.upsert({
      where: { id: dish.id },
      update: { imageUrl },
      create: {
        ...dishData,
        imageUrl,
        companyId: COMPANY_ID,
        status: 'ACTIVE',
        sortOrder: 0,
        allergenCodes: {
          create: allergenCodes.map((code) => ({ allergenCode: code })),
        },
      },
    })
  }

  // Variantes de tamaño para las pizzas
  for (const pizzaId of ['dish-1', 'dish-2', 'dish-3', 'dish-4']) {
    const groupId = `vg-${pizzaId}`
    const existing = await prisma.variantGroup.findUnique({ where: { id: groupId } })
    if (!existing) {
      await prisma.variantGroup.create({
        data: {
          id: groupId,
          dishId: pizzaId,
          name: 'Tamaño',
          required: true,
          options: {
            create: [
              { id: `vo-${pizzaId}-s`, name: 'Pequeña (26cm)',  priceAdjustment: -2.0, sortOrder: 0 },
              { id: `vo-${pizzaId}-m`, name: 'Mediana (30cm)',  priceAdjustment:  0.0, sortOrder: 1 },
              { id: `vo-${pizzaId}-l`, name: 'Grande (36cm)',   priceAdjustment:  3.0, sortOrder: 2 },
            ],
          },
        },
      })
    }
  }

  // Modificadores de extras para pizzas
  for (const pizzaId of ['dish-1', 'dish-2', 'dish-3', 'dish-4']) {
    const groupId = `mg-${pizzaId}`
    const existing = await prisma.modifierGroup.findUnique({ where: { id: groupId } })
    if (!existing) {
      await prisma.modifierGroup.create({
        data: {
          id: groupId,
          dishId: pizzaId,
          name: 'Ingredientes extra',
          required: false,
          selectionType: 'MULTIPLE',
          minSelections: 0,
          maxSelections: 5,
          options: {
            create: [
              { id: `mo-${pizzaId}-1`, name: 'Extra mozzarella',  extraPrice: 1.5, sortOrder: 0 },
              { id: `mo-${pizzaId}-2`, name: 'Champiñones',       extraPrice: 1.0, sortOrder: 1 },
              { id: `mo-${pizzaId}-3`, name: 'Aceitunas negras',  extraPrice: 0.8, sortOrder: 2 },
              { id: `mo-${pizzaId}-4`, name: 'Anchoas',           extraPrice: 1.2, sortOrder: 3 },
              { id: `mo-${pizzaId}-5`, name: 'Sin gluten (+2€)',  extraPrice: 2.0, sortOrder: 4 },
            ],
          },
        },
      })
    }
  }

  // ── Programa de fidelización ──────────────────────────────────────────────
  await prisma.loyaltyConfig.upsert({
    where: { companyId: COMPANY_ID },
    update: {},
    create: {
      companyId: COMPANY_ID,
      pointsPerEuro: 1.0,
      pointValueCents: 1.0,
      minRedeemPoints: 100,
      isEnabled: true,
    },
  })

  const rewards: { id: string; name: string; description: string; type: RewardType; pointsCost: number; value: string }[] = [
    {
      id: 'reward-1', name: '5% de descuento',
      description: 'Descuento del 5% en tu pedido',
      type: RewardType.DISCOUNT_PERCENT, pointsCost: 100, value: '5',
    },
    {
      id: 'reward-2', name: '2€ de descuento',
      description: 'Descuento directo de 2€',
      type: RewardType.DISCOUNT_FIXED, pointsCost: 200, value: '2',
    },
    {
      id: 'reward-3', name: '10% de descuento',
      description: 'Descuento del 10% en tu pedido',
      type: RewardType.DISCOUNT_PERCENT, pointsCost: 300, value: '10',
    },
  ]

  for (const r of rewards) {
    await prisma.reward.upsert({
      where: { id: r.id },
      update: {},
      create: { ...r, companyId: COMPANY_ID, isActive: true, stock: null, validFrom: null, validUntil: null },
    })
  }

  console.log('')
  console.log('Seed completo (Pizzeria Napoli).')
  console.log('  Slug empresa: napoli')
  console.log('  Slug sede:    centro')
  console.log('  Admin:        admin@napoli.es / admin123')
  console.log('')
}

async function main() {
  await seedAllergens()
  await seedDemoRestaurant()
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
