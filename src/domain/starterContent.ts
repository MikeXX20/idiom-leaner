import type { SpeakingPrompt } from "./types";
export { starterIdioms } from "./idiomDeck";

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
