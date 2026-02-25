export type Character = {
  id: string;
  name: string;
  source: string;
  image: string;
  description: string;
};

export const characters: Character[] = [
  {
    id: "luna",
    name: "Luna",
    source: "Starbound Legends",
    image: "/characters/luna.png",
    description:
      "A calm stargazer who guides lost travelers with constellations that only she can see.",
  },
  {
    id: "ember",
    name: "Ember",
    source: "Ash & Aura",
    image: "/characters/ember.png",
    description:
      "A playful spark spirit with a warm heart—when she laughs, lanterns flicker across the city.",
  },
  {
    id: "kairo",
    name: "Kairo",
    source: "Neon Drift",
    image: "/characters/kairo.png",
    description:
      "A streetwise racer who bends light with custom tech, leaving shimmering trails in the night.",
  },
  {
    id: "mori",
    name: "Mori",
    source: "Whisperwood",
    image: "/characters/mori.png",
    description:
      "A quiet forest guardian whose steps are silent, but whose presence makes the world feel safe.",
  },
  {
    id: "nova",
    name: "Nova",
    source: "Cosmic Crew",
    image: "/characters/nova.png",
    description:
      "A fearless pilot with an optimistic grin—always the first to jump, always the last to doubt.",
  },
  {
    id: "atlas",
    name: "Atlas",
    source: "Titan Protocol",
    image: "/characters/atlas.png",
    description:
      "A gentle giant built for protection, learning what it means to choose kindness over orders.",
  },
];

export function getCharacterById(id: string): Character | undefined {
  return characters.find((c) => c.id === id);
}

export function findCharacterIndexByName(name: string): number {
  const q = name.trim().toLowerCase();
  if (!q) return -1;
  return characters.findIndex((c) => c.name.toLowerCase() === q);
}
