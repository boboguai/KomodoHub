const SPECIES_IMAGES: Record<string, string> = {
  "komodo-dragon": "/images/species/komodo-dragon.png",
  "javan-rhinoceros": "/images/species/javan-rhinoceros.png",
  "amur-leopard": "/images/species/amur-leopard.png",
  vaquita: "/images/species/vaquita.png",
  kakapo: "/images/species/kakapo.png",
  "mountain-gorilla": "/images/species/mountain-gorilla.png",
  "giant-panda": "/images/species/giant-panda.png",
  "sumatran-tiger": "/images/species/sumatran-tiger.png",
};

const BOOK_IMAGES: Record<string, string> = {
  "what is an endangered species?": "/images/books/endangered.png",
  "protecting species at home and at school": "/images/books/action.png",
  "habitat loss and connectivity": "/images/books/habitat.png",
  "global case studies: from vaquitas to gorillas": "/images/books/global.png",
};

const REWARD_IMAGES: Record<string, string> = {
  bottle: "/images/rewards/bottle.png",
  backpack: "/images/rewards/backpack.png",
  "pen-set": "/images/rewards/pen.png",
};

export function localSpeciesImage(slug: string, fallback?: string | null): string {
  return SPECIES_IMAGES[slug] ?? fallback ?? "/images/species/komodo-dragon.png";
}

export function localBookImage(title: string, fallback?: string | null): string {
  return BOOK_IMAGES[title.toLowerCase()] ?? fallback ?? "/images/books/global.png";
}

export function localRewardImage(slug: string, fallback?: string | null): string {
  return REWARD_IMAGES[slug] ?? fallback ?? "/images/rewards/backpack.png";
}
