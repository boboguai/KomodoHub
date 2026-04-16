import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const TEACHER_ADMIN_EMAIL = "teacher-admin@niuyang.local";
const TEACHER_ADMIN_PASSWORD = "TeacherAdmin2026!";

const prisma = new PrismaClient();

/**
 * Local static files under public/images/ (served as /images/...).
 * Originals from Wikimedia Commons — run `npm run images:sync` to download, or replace PNG/JPG files manually.
 */
const MEDIA = {
  species: {
    "komodo-dragon": "/images/species/komodo-dragon.png",
    "javan-rhinoceros": "/images/species/javan-rhinoceros.png",
    "amur-leopard": "/images/species/amur-leopard.png",
    vaquita: "/images/species/vaquita.png",
    kakapo: "/images/species/kakapo.png",
    "mountain-gorilla": "/images/species/mountain-gorilla.png",
    "giant-panda": "/images/species/giant-panda.png",
  },
  bookEndangered: "/images/books/endangered.png",
  bookAction: "/images/books/action.png",
  bookHabitat: "/images/books/habitat.png",
  bookGlobal: "/images/books/global.png",
  rewardBottle: "/images/rewards/bottle.png",
  rewardBackpack: "/images/rewards/backpack.png",
  rewardPen: "/images/rewards/pen.png",
} as const;

async function main() {
  const passwordHash = await bcrypt.hash("KomodoHub2026!", 12);
  const teacherAdminHash = await bcrypt.hash(TEACHER_ADMIN_PASSWORD, 12);

  const school = await prisma.school.upsert({
    where: { slug: "ujung-raya" },
    update: {},
    create: {
      name: "Ujung Raya Primary School",
      slug: "ujung-raya",
      joinCode: "UJUNG-2026",
      region: "Ujung Kulon, Java",
    },
  });

  const users: Array<{
    email: string;
    studentId?: string;
    role: string;
    displayName: string;
    schoolId?: string;
  }> = [
    { email: "admin@yayasan.id", role: "FOUNDATION_ADMIN", displayName: "Asnawi (Foundation)" },
    { email: "principal@ujung.id", role: "SCHOOL_ADMIN", displayName: "Khairunnisa (Principal)", schoolId: school.id },
    { email: "bintang@ujung.id", role: "TEACHER", displayName: "Bintang Akbar", schoolId: school.id },
    { email: "student@ujung.id", studentId: "202229013000", role: "STUDENT", displayName: "Student Demo", schoolId: school.id },
    { email: "community@saveanimals.id", role: "COMMUNITY_MEMBER", displayName: "Besoeki (Community)" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { points: 120, studentId: u.studentId ?? null },
      create: {
        email: u.email,
        studentId: u.studentId ?? null,
        passwordHash,
        role: u.role,
        displayName: u.displayName,
        gender: u.role === "STUDENT" ? "PREFER_NOT_SAY" : null,
        schoolId: u.schoolId ?? null,
        publicProfile: u.role === "COMMUNITY_MEMBER",
        points: 120,
      },
    });
  }

  await prisma.user.upsert({
    where: { email: TEACHER_ADMIN_EMAIL },
    update: {
      passwordHash: teacherAdminHash,
      role: "SCHOOL_ADMIN",
      displayName: "Teacher Admin",
      schoolId: school.id,
      publicProfile: false,
      points: 120,
      studentId: null,
    },
    create: {
      email: TEACHER_ADMIN_EMAIL,
      studentId: null,
      passwordHash: teacherAdminHash,
      role: "SCHOOL_ADMIN",
      displayName: "Teacher Admin",
      schoolId: school.id,
      publicProfile: false,
      points: 120,
    },
  });

  const teacher = await prisma.user.findUniqueOrThrow({ where: { email: "bintang@ujung.id" } });

  const program = await prisma.program.upsert({
    where: { id: "seed-program-1" },
    update: {},
    create: {
      id: "seed-program-1",
      title: "Global Endangered Species Watch",
      description: "School programme aligned with NiuYang Conservation worldwide knowledge base.",
      schoolId: school.id,
    },
  });

  await prisma.activity.upsert({
    where: { id: "seed-activity-1" },
    update: {},
    create: {
      id: "seed-activity-1",
      programId: program.id,
      teacherId: teacher.id,
      title: "Field sighting report",
      instructions:
        "Record date, location (approximate), weather, and evidence. Do not share personal contact details.",
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });

  const species = [
    {
      slug: "komodo-dragon",
      commonName: "Komodo Dragon",
      scientificName: "Varanus komodoensis",
      summary: "The largest living lizard, native to Indonesia’s Lesser Sunda islands.",
      description:
        "Komodo dragons are apex predators with powerful bodies, sharp claws, and remarkable scent tracking. Habitat protection on Komodo and nearby islands is crucial for their long-term survival.",
      habitat: "Tropical dry forests, savanna, coastal lowlands",
      conservationStatus: "Endangered",
      regionLabel: "Indonesia (Komodo, Rinca, Flores)",
      populationEstimate: "≈ 3,000+ (wild, estimates vary)",
      temperament: "Solitary, territorial, powerful ambush hunter",
      imageUrl: MEDIA.species["komodo-dragon"],
    },
    {
      slug: "javan-rhinoceros",
      commonName: "Javan Rhinoceros",
      scientificName: "Rhinoceros sondaicus",
      summary: "One of the rarest large mammals; last stronghold in Java.",
      description:
        "Strictly protected; anti-poaching and habitat monitoring are critical. Schools contribute awareness and ethical reporting.",
      habitat: "Tropical rainforest, lowland wet grasslands",
      conservationStatus: "Critically Endangered",
      regionLabel: "Indonesia (Java)",
      populationEstimate: "≈ 70 individuals (wild, estimates vary)",
      temperament: "Solitary, shy, most active at dawn/dusk",
      imageUrl: MEDIA.species["javan-rhinoceros"],
    },
    {
      slug: "amur-leopard",
      commonName: "Amur Leopard",
      scientificName: "Panthera pardus orientalis",
      summary: "Rare big cat of temperate forests; critically low wild numbers historically.",
      description:
        "Conservation breeding and habitat restoration have improved prospects; sharing accurate information reduces demand for illegal wildlife products.",
      habitat: "Temperate broadleaf and mixed forests",
      conservationStatus: "Critically Endangered",
      regionLabel: "Russia / China border region",
      populationEstimate: "≈ 100–120 (wild, estimates vary)",
      temperament: "Elusive, territorial, strong climber",
      imageUrl: MEDIA.species["amur-leopard"],
    },
    {
      slug: "vaquita",
      commonName: "Vaquita",
      scientificName: "Phocoena sinus",
      summary: "World’s smallest cetacean; extremely limited range in the Upper Gulf of California.",
      description:
        "Bycatch in illegal gillnets is the primary threat. Advocacy and sustainable fisheries policy are central to recovery.",
      habitat: "Shallow murky coastal waters",
      conservationStatus: "Critically Endangered",
      regionLabel: "Mexico (Gulf of California)",
      populationEstimate: "Very low (often cited as fewer than 20)",
      temperament: "Shy, avoids boats when possible",
      imageUrl: MEDIA.species.vaquita,
    },
    {
      slug: "kakapo",
      commonName: "Kākāpō",
      scientificName: "Strigops habroptilus",
      summary: "Flightless nocturnal parrot endemic to New Zealand; intensive management.",
      description:
        "Predator-free islands and supplementary feeding support recovery; students learn island conservation and invasive species control.",
      habitat: "Forested islands (managed populations)",
      conservationStatus: "Critically Endangered",
      regionLabel: "New Zealand",
      populationEstimate: "≈ 200+ (managed, increasing slowly)",
      temperament: "Friendly, solitary, strong scent trails",
      imageUrl: MEDIA.species.kakapo,
    },
    {
      slug: "mountain-gorilla",
      commonName: "Mountain Gorilla",
      scientificName: "Gorilla beringei beringei",
      summary: "Iconic great ape; ecotourism and ranger protection underpin conservation.",
      description:
        "Community benefit-sharing and health monitoring reduce threats; responsible tourism messaging matters.",
      habitat: "Montane and bamboo forests",
      conservationStatus: "Endangered",
      regionLabel: "Rwanda / Uganda / DR Congo",
      populationEstimate: "≈ 1,000+ (wild, estimates vary)",
      temperament: "Social groups, generally calm if rules are respected",
      imageUrl: MEDIA.species["mountain-gorilla"],
    },
    {
      slug: "giant-panda",
      commonName: "Giant Panda",
      scientificName: "Ailuropoda melanoleuca",
      summary: "Flagship species for forest conservation; bamboo specialist with a narrow niche.",
      description:
        "Habitat connectivity and bamboo restoration are key; education programmes highlight sustainable land use.",
      habitat: "Mountain bamboo forests",
      conservationStatus: "Vulnerable",
      regionLabel: "China (Sichuan/Shaanxi/Gansu)",
      populationEstimate: "≈ 1,800+ (wild, estimates vary)",
      temperament: "Mostly solitary; calm but strong",
      imageUrl: MEDIA.species["giant-panda"],
    },
    {
      slug: "sumatran-tiger",
      commonName: "Sumatran Tiger",
      scientificName: "Panthera tigris sumatrae",
      summary: "The smallest surviving tiger subspecies, found only on Sumatra.",
      description:
        "Sumatran tigers face intense pressure from habitat loss and illegal hunting. Forest protection and anti-poaching work are crucial to prevent extinction.",
      habitat: "Tropical rainforests, peat swamps, and montane forests",
      conservationStatus: "Critically Endangered",
      regionLabel: "Indonesia (Sumatra)",
      populationEstimate: "Often estimated at fewer than 400 in the wild",
      temperament: "Solitary, stealthy, and territorial",
      imageUrl: "/images/species/sumatran-tiger.png",
    },
  ];

  for (const s of species) {
    await prisma.species.upsert({
      where: { slug: s.slug },
      update: { ...s },
      create: s,
    });
  }

  await prisma.redemption.deleteMany();
  await prisma.userTaskCompletion.deleteMany();
  await prisma.dailyCheckIn.deleteMany();
  await prisma.libraryReadingDay.deleteMany();
  await prisma.shareEventDay.deleteMany();
  await prisma.speciesVisitDay.deleteMany();
  await prisma.dailyTaskDefinition.deleteMany();
  await prisma.dailyTaskDefinition.createMany({
    data: [
      {
        slug: "read_library_30",
        title: "Read conservation materials (30 min)",
        description:
          "Stay on the Conservation library page with this tab visible until the timer reaches 30 minutes; time is recorded automatically.",
        pointsReward: 15,
        sortOrder: 0,
      },
      {
        slug: "share_species",
        title: "Share a species detail link",
        description:
          "On any species page, tap Share and copy the link to clipboard — the app records one successful share per day.",
        pointsReward: 10,
        sortOrder: 1,
      },
      {
        slug: "browse_three_species",
        title: "Explore three species profiles",
        description: "Open three different species detail pages today; each visit is counted automatically when you are signed in.",
        pointsReward: 8,
        sortOrder: 2,
      },
    ],
  });

  await prisma.rewardProduct.deleteMany();
  await prisma.rewardProduct.createMany({
    data: [
      {
        slug: "bottle",
        name: "Stainless bottle (custom species print)",
        description: "500ml bottle; you choose which endangered species artwork is printed.",
        pointsCost: 180,
        category: "DRINKWARE",
        animalTheme: "User-selected species artwork",
        imageUrl: MEDIA.rewardBottle,
        sortOrder: 0,
      },
      {
        slug: "backpack",
        name: "School backpack (custom species patch)",
        description: "Durable daypack with a removable patch featuring your chosen species illustration.",
        pointsCost: 420,
        category: "BAGS",
        animalTheme: "User-selected species artwork",
        imageUrl: MEDIA.rewardBackpack,
        sortOrder: 1,
      },
      {
        slug: "pen-set",
        name: "Pen set + notebook bundle",
        description: "Three gel pens and a kraft notebook with species-themed cover options.",
        pointsCost: 95,
        category: "STATIONERY",
        animalTheme: "User-selected species artwork",
        imageUrl: MEDIA.rewardPen,
        sortOrder: 2,
      },
    ],
  });

  await prisma.libraryBook.deleteMany();
  await prisma.libraryBook.createMany({
    data: [
      {
        title: "What is an endangered species?",
        author: "NY Conservation Education Team",
        summary: "Introduces Red List categories, threats, and why small populations matter.",
        topics: "Basics; Red List; threats",
        schoolId: school.id,
        coverUrl: MEDIA.bookEndangered,
      },
      {
        title: "Protecting species at home and at school",
        author: "NY Conservation Education Team",
        summary: "Practical actions: reduce waste, ethical choices, reporting, and safe wildlife watching.",
        topics: "Action; schools; behaviour",
        schoolId: school.id,
        coverUrl: MEDIA.bookAction,
      },
      {
        title: "Habitat loss and connectivity",
        author: "NY Conservation Education Team",
        summary: "Why fragmentation matters and how corridors help populations survive.",
        topics: "Habitat; landscapes; policy",
        schoolId: school.id,
        coverUrl: MEDIA.bookHabitat,
      },
      {
        title: "Global case studies: from vaquitas to gorillas",
        author: "NY Conservation Education Team",
        summary: "Short stories across continents highlighting community stewardship.",
        topics: "Case studies; communities; worldwide",
        schoolId: null,
        coverUrl: MEDIA.bookGlobal,
      },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
