import type { Idiom, SpeakingPrompt } from "./types";

const now = "2026-05-26T00:00:00.000Z";

export const starterPrompts: SpeakingPrompt[] = [
  {
    id: "prompt-work-part2",
    ieltsPart: "Part 2",
    topic: "Work and Careers",
    prompt:
      "Describe a skill you learned that was useful for your work or studies. You should say what the skill was, how you learned it, why it was useful, and how you felt about learning it."
  },
  {
    id: "prompt-technology-part3",
    ieltsPart: "Part 3",
    topic: "Technology",
    prompt:
      "Do you think technology has changed the way people communicate at work? Why or why not?"
  },
  {
    id: "prompt-education-part2",
    ieltsPart: "Part 2",
    topic: "Education",
    prompt:
      "Describe a teacher who influenced you. You should say who the teacher was, what they taught, what made them special, and how they influenced you."
  }
];

export const starterIdioms: Idiom[] = [
  {
    id: "idiom-steep-learning-curve",
    phrase: "a steep learning curve",
    meaning: "a situation where someone has to learn many difficult things quickly",
    topics: ["Work and Careers", "Education"],
    formality: "neutral",
    riskLevel: "low",
    example:
      "My first internship had a steep learning curve, but it helped me become more confident.",
    usageWarning: "Use it for a challenging learning experience, not for every small difficulty.",
    source: "starter",
    confidence: "new",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "idiom-on-the-same-wavelength",
    phrase: "on the same wavelength",
    meaning: "sharing a similar way of thinking or understanding",
    topics: ["Work and Careers", "Relationships", "Technology"],
    formality: "neutral",
    riskLevel: "low",
    example:
      "Video calls help remote teams stay on the same wavelength when projects move quickly.",
    usageWarning: "Best for people or teams, not objects or abstract systems.",
    source: "starter",
    confidence: "new",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "idiom-break-the-ice",
    phrase: "break the ice",
    meaning: "make people feel more comfortable at the start of a conversation",
    topics: ["Relationships", "Work and Careers", "Education"],
    formality: "casual",
    riskLevel: "medium",
    example:
      "Group activities can break the ice and make new students feel less nervous.",
    usageWarning: "Safe in informal examples, but avoid using it repeatedly in one answer.",
    source: "starter",
    confidence: "new",
    createdAt: now,
    updatedAt: now
  }
];
