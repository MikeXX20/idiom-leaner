import { describe, expect, it } from "vitest";
import { starterIdioms } from "./idiomDeck";

const requiredTopics = [
  "Work and Careers",
  "Education",
  "Technology",
  "Health",
  "Environment",
  "Travel",
  "Relationships",
  "Society"
];

describe("idiomDeck", () => {
  it("contains 80 IELTS idioms across the required topic packs", () => {
    expect(starterIdioms).toHaveLength(80);

    for (const topic of requiredTopics) {
      expect(starterIdioms.filter((idiom) => idiom.topics.includes(topic))).toHaveLength(10);
    }
  });

  it("gives every idiom complete study metadata", () => {
    const ids = new Set(starterIdioms.map((idiom) => idiom.id));

    expect(ids.size).toBe(starterIdioms.length);

    for (const idiom of starterIdioms) {
      expect(idiom.id).toMatch(/^idiom-/);
      expect(idiom.phrase.length).toBeGreaterThan(2);
      expect(idiom.meaning.length).toBeGreaterThan(12);
      expect(idiom.example.length).toBeGreaterThan(24);
      expect(idiom.usageWarning.length).toBeGreaterThan(20);
      expect(idiom.source).toBe("starter");
      expect(["easy", "medium", "advanced"]).toContain(idiom.difficulty);
      expect(["safe", "careful", "risky"]).toContain(idiom.ieltsSafety);
    }
  });

  it("marks risky idioms with explicit warnings", () => {
    const riskyIdioms = starterIdioms.filter((idiom) => idiom.ieltsSafety === "risky");

    expect(riskyIdioms.length).toBeGreaterThan(0);
    expect(riskyIdioms.every((idiom) => idiom.riskLevel === "high")).toBe(true);
    expect(
      riskyIdioms.every((idiom) =>
        /only|avoid|careful|specific|informal/i.test(idiom.usageWarning)
      )
    ).toBe(true);
  });
});
