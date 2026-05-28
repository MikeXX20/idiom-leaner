import type { Difficulty, Formality, Idiom, IeltsSafety, RiskLevel } from "./types";

const baseTime = Date.parse("2026-05-28T00:00:00.000Z");

interface DeckEntry {
  phrase: string;
  meaning: string;
  topic: string;
  formality?: Formality;
  riskLevel?: RiskLevel;
  difficulty?: Difficulty;
  ieltsSafety?: IeltsSafety;
  example: string;
  usageWarning: string;
}

function slugify(phrase: string) {
  return phrase
    .toLowerCase()
    .replace(/^(a|an|the)\s+/, "")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createId(phrase: string) {
  return `idiom-${slugify(phrase)}`;
}

function buildIdiom(entry: DeckEntry, index: number, total: number): Idiom {
  const timestamp = new Date(baseTime + (total - index) * 1000).toISOString();

  return {
    id: createId(entry.phrase),
    phrase: entry.phrase,
    meaning: entry.meaning,
    topics: [entry.topic],
    formality: entry.formality ?? "neutral",
    riskLevel: entry.riskLevel ?? "low",
    difficulty: entry.difficulty ?? "medium",
    ieltsSafety: entry.ieltsSafety ?? "safe",
    example: entry.example,
    usageWarning: entry.usageWarning,
    source: "starter",
    confidence: "new",
    reviewCount: 0,
    mistakeCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

const deckEntries: DeckEntry[] = [
  {
    topic: "Work and Careers",
    phrase: "hit the ground running",
    meaning: "to start a new job or task quickly and effectively",
    example: "When I joined the company, I tried to hit the ground running by learning the main tools in the first week.",
    usageWarning: "Use it for starting work or study strongly, not for relaxing activities.",
    difficulty: "medium"
  },
  {
    topic: "Work and Careers",
    phrase: "learn the ropes",
    meaning: "to learn how to do a new job or activity",
    example: "New employees need a little time to learn the ropes before they can work independently.",
    usageWarning: "Use it for practical skills or routines, not for deep academic knowledge.",
    difficulty: "easy"
  },
  {
    topic: "Work and Careers",
    phrase: "go the extra mile",
    meaning: "to make more effort than people expect",
    example: "A good teacher often goes the extra mile by giving students personal feedback after class.",
    usageWarning: "Use it for effort that is clearly beyond the basic requirement.",
    difficulty: "easy"
  },
  {
    topic: "Work and Careers",
    phrase: "pull your weight",
    meaning: "to do your fair share of the work in a group",
    example: "In a team project, everyone should pull their weight so the result is fair.",
    usageWarning: "This can sound critical, so use it when discussing teamwork problems carefully.",
    ieltsSafety: "careful"
  },
  {
    topic: "Work and Careers",
    phrase: "a steep learning curve",
    meaning: "a situation where someone has to learn many difficult things quickly",
    example: "My first internship had a steep learning curve, but it helped me become more confident.",
    usageWarning: "Use it for a challenging learning experience, not for every small difficulty.",
    difficulty: "medium"
  },
  {
    topic: "Work and Careers",
    phrase: "climb the career ladder",
    meaning: "to move to better or more senior jobs over time",
    example: "Many young people move to big cities because they hope to climb the career ladder faster.",
    usageWarning: "Use it for career progress, not for general personal improvement.",
    difficulty: "medium"
  },
  {
    topic: "Work and Careers",
    phrase: "keep your options open",
    meaning: "to avoid making a final decision so more choices remain possible",
    example: "Students should keep their options open by developing both technical and communication skills.",
    usageWarning: "Use it when discussing choices, plans, jobs, or study paths.",
    difficulty: "easy"
  },
  {
    topic: "Work and Careers",
    phrase: "a dead-end job",
    meaning: "a job with little chance of promotion or development",
    example: "Some people leave a dead-end job because they want more training and responsibility.",
    usageWarning: "This sounds negative, so use it only when the criticism is clearly intended.",
    ieltsSafety: "careful",
    riskLevel: "medium"
  },
  {
    topic: "Work and Careers",
    phrase: "burn the candle at both ends",
    meaning: "to work too hard from early morning until late at night",
    example: "If students burn the candle at both ends before exams, their health may suffer.",
    usageWarning: "Use this only for serious overwork; avoid it in formal answers unless the context is clear.",
    ieltsSafety: "risky",
    riskLevel: "high",
    difficulty: "advanced"
  },
  {
    topic: "Work and Careers",
    phrase: "in the driver's seat",
    meaning: "in control of a situation or decision",
    example: "Online courses put learners in the driver's seat because they can choose their own pace.",
    usageWarning: "Use it for control or decision-making, not simply for being present.",
    difficulty: "advanced"
  },
  {
    topic: "Education",
    phrase: "pass with flying colors",
    meaning: "to pass an exam or test very successfully",
    example: "With regular practice, she passed the language exam with flying colors.",
    usageWarning: "Use it for clear success in tests or evaluations, not for ordinary completion.",
    difficulty: "easy"
  },
  {
    topic: "Education",
    phrase: "learn by heart",
    meaning: "to memorize something exactly",
    example: "Children often learn poems by heart, but they also need to understand the meaning.",
    usageWarning: "Useful for memorization, but IELTS answers should not sound memorized.",
    ieltsSafety: "careful",
    difficulty: "easy"
  },
  {
    topic: "Education",
    phrase: "get the hang of something",
    meaning: "to become able to do something after practicing it",
    example: "It took me a few weeks to get the hang of academic writing.",
    usageWarning: "This is slightly conversational, so keep the surrounding sentence natural.",
    formality: "casual",
    ieltsSafety: "careful"
  },
  {
    topic: "Education",
    phrase: "a thirst for knowledge",
    meaning: "a strong desire to learn new things",
    example: "A good school can encourage a thirst for knowledge instead of only preparing students for exams.",
    usageWarning: "Use it for genuine curiosity; overuse can sound too dramatic.",
    difficulty: "advanced"
  },
  {
    topic: "Education",
    phrase: "put theory into practice",
    meaning: "to use ideas or knowledge in a real situation",
    example: "Internships help students put theory into practice before they graduate.",
    usageWarning: "Best for education, training, and work contexts where skills are applied.",
    difficulty: "medium"
  },
  {
    topic: "Education",
    phrase: "hit the books",
    meaning: "to study seriously",
    example: "Before important exams, many students stay at home and hit the books.",
    usageWarning: "This is informal; use it only in a relaxed IELTS answer, not in a formal essay style.",
    formality: "casual",
    ieltsSafety: "risky",
    riskLevel: "high"
  },
  {
    topic: "Education",
    phrase: "fall behind",
    meaning: "to make less progress than expected",
    example: "Students who miss several classes may fall behind and lose confidence.",
    usageWarning: "Use it for progress in study, work, or schedules.",
    difficulty: "easy"
  },
  {
    topic: "Education",
    phrase: "catch up",
    meaning: "to reach the same level as others after being behind",
    example: "Online resources can help students catch up after an illness.",
    usageWarning: "Use it with study, work, or missed information, not as a general synonym for improve.",
    difficulty: "easy"
  },
  {
    topic: "Education",
    phrase: "a wake-up call",
    meaning: "an event that makes someone realize they need to change",
    example: "Failing a mock test was a wake-up call that made me study more consistently.",
    usageWarning: "Use it for a strong realization, not for any small reminder.",
    ieltsSafety: "careful"
  },
  {
    topic: "Education",
    phrase: "open doors",
    meaning: "to create new opportunities",
    example: "Learning a second language can open doors to better jobs and wider cultural understanding.",
    usageWarning: "Use it for opportunities created by skills, education, or experience.",
    difficulty: "easy"
  },
  {
    topic: "Technology",
    phrase: "at the touch of a button",
    meaning: "very easily by using technology",
    example: "People can now book tickets at the touch of a button, which saves a lot of time.",
    usageWarning: "Use it for digital convenience, not for tasks that still require much effort.",
    difficulty: "easy"
  },
  {
    topic: "Technology",
    phrase: "be glued to a screen",
    meaning: "to spend too much time looking at a phone, computer, or TV",
    example: "Many teenagers are glued to a screen after school, so outdoor activities are important.",
    usageWarning: "This sounds critical, so use it when discussing screen overuse.",
    ieltsSafety: "careful"
  },
  {
    topic: "Technology",
    phrase: "streamline the process",
    meaning: "to make a process simpler and more efficient",
    example: "Digital forms can streamline the process of applying for public services.",
    usageWarning: "Use it for systems, services, and work processes, not for people.",
    difficulty: "advanced",
    formality: "formal"
  },
  {
    topic: "Technology",
    phrase: "bridge the gap",
    meaning: "to reduce a difference between two groups, skills, or situations",
    example: "Online learning can bridge the gap between students in cities and rural areas.",
    usageWarning: "Name the two sides of the gap so the phrase does not feel vague.",
    difficulty: "medium"
  },
  {
    topic: "Technology",
    phrase: "keep up with the times",
    meaning: "to stay modern and adapt to new changes",
    example: "Small businesses need to keep up with the times by offering online payment options.",
    usageWarning: "Use it for adapting to social or technological change.",
    difficulty: "medium"
  },
  {
    topic: "Technology",
    phrase: "a double-edged sword",
    meaning: "something that has both advantages and disadvantages",
    example: "Social media is a double-edged sword because it connects people but can also waste time.",
    usageWarning: "Use it only when you clearly explain both sides.",
    ieltsSafety: "careful",
    difficulty: "advanced"
  },
  {
    topic: "Technology",
    phrase: "in the loop",
    meaning: "included and informed about what is happening",
    example: "Messaging apps help team members stay in the loop during a project.",
    usageWarning: "Use it for communication and updates, especially in groups.",
    difficulty: "medium"
  },
  {
    topic: "Technology",
    phrase: "information overload",
    meaning: "the stress or confusion caused by too much information",
    example: "Constant notifications can create information overload and reduce concentration.",
    usageWarning: "Use it for excessive information, not for normal learning.",
    difficulty: "medium"
  },
  {
    topic: "Technology",
    phrase: "trial and error",
    meaning: "learning by trying different methods until one works",
    example: "Many people learn new software through trial and error rather than formal lessons.",
    usageWarning: "Use it for a learning process with repeated attempts.",
    difficulty: "easy"
  },
  {
    topic: "Technology",
    phrase: "at your fingertips",
    meaning: "easy to access immediately",
    example: "With smartphones, maps and translation tools are always at your fingertips.",
    usageWarning: "Use it for information or tools that are easily available.",
    difficulty: "easy"
  },
  {
    topic: "Health",
    phrase: "in good shape",
    meaning: "healthy and physically fit",
    example: "Regular exercise helps older people stay in good shape and remain independent.",
    usageWarning: "Use it for physical condition, not for mental health unless you explain it clearly.",
    difficulty: "easy"
  },
  {
    topic: "Health",
    phrase: "back on your feet",
    meaning: "healthy or stable again after illness or difficulty",
    example: "After a few days of rest, I was back on my feet and ready to work.",
    usageWarning: "Use it for recovery from illness, stress, or financial problems.",
    difficulty: "medium"
  },
  {
    topic: "Health",
    phrase: "a balanced diet",
    meaning: "a way of eating that includes a healthy variety of foods",
    example: "Schools should teach children how to maintain a balanced diet from an early age.",
    usageWarning: "This is a fixed expression rather than a colorful idiom, but it is very safe for IELTS.",
    difficulty: "easy"
  },
  {
    topic: "Health",
    phrase: "take a toll on",
    meaning: "to have a negative effect on someone or something",
    example: "Long working hours can take a toll on both physical health and family life.",
    usageWarning: "Use it for negative effects that build up over time.",
    difficulty: "medium"
  },
  {
    topic: "Health",
    phrase: "under the weather",
    meaning: "feeling slightly ill",
    example: "When people feel under the weather, they should rest instead of going to work.",
    usageWarning: "This is informal and only means mildly ill, so avoid it for serious disease.",
    formality: "casual",
    ieltsSafety: "careful"
  },
  {
    topic: "Health",
    phrase: "peace of mind",
    meaning: "a feeling of calm because there is less worry",
    example: "Health insurance can give families peace of mind when medical costs are high.",
    usageWarning: "Use it for reduced worry or security, not just happiness.",
    difficulty: "easy"
  },
  {
    topic: "Health",
    phrase: "recharge your batteries",
    meaning: "to rest and regain energy",
    example: "Short holidays help workers recharge their batteries and return with more focus.",
    usageWarning: "Use it for rest after tiredness; it is slightly informal but common.",
    formality: "casual",
    ieltsSafety: "careful"
  },
  {
    topic: "Health",
    phrase: "break a bad habit",
    meaning: "to stop doing something unhealthy or unhelpful",
    example: "Public campaigns can encourage people to break a bad habit such as smoking.",
    usageWarning: "Use it for repeated behavior, not one-time mistakes.",
    difficulty: "easy"
  },
  {
    topic: "Health",
    phrase: "a healthy outlet",
    meaning: "a positive way to release stress or energy",
    example: "Sports can be a healthy outlet for stress, especially for young people.",
    usageWarning: "Use it for activities that help people handle emotions safely.",
    difficulty: "medium"
  },
  {
    topic: "Health",
    phrase: "on the mend",
    meaning: "recovering after illness or injury",
    example: "After the operation, my grandfather was on the mend and could walk slowly again.",
    usageWarning: "Use it only for recovery, not for general improvement in society or technology.",
    ieltsSafety: "careful",
    difficulty: "advanced"
  },
  {
    topic: "Environment",
    phrase: "go green",
    meaning: "to make choices that are better for the environment",
    example: "Many companies are trying to go green by reducing waste and using renewable energy.",
    usageWarning: "Use it for environmental action, not simply for liking nature.",
    difficulty: "easy"
  },
  {
    topic: "Environment",
    phrase: "reduce your carbon footprint",
    meaning: "to lower the amount of carbon emissions caused by your activities",
    example: "Using public transport is one practical way to reduce your carbon footprint.",
    usageWarning: "Use it when discussing emissions, energy use, transport, or consumption.",
    difficulty: "medium"
  },
  {
    topic: "Environment",
    phrase: "the tip of the iceberg",
    meaning: "a small visible part of a much larger problem",
    example: "Plastic on beaches is only the tip of the iceberg because much more waste is under the sea.",
    usageWarning: "Use it only when there is a larger hidden problem behind the visible issue.",
    difficulty: "advanced",
    ieltsSafety: "careful"
  },
  {
    topic: "Environment",
    phrase: "a drop in the ocean",
    meaning: "an amount so small that it has little effect",
    example: "One recycling campaign is a drop in the ocean unless it is supported by wider policy.",
    usageWarning: "Use this only for a very small contribution; avoid it if the action has real impact.",
    ieltsSafety: "risky",
    riskLevel: "high",
    difficulty: "advanced"
  },
  {
    topic: "Environment",
    phrase: "raise awareness",
    meaning: "to help people understand an issue",
    example: "Documentaries can raise awareness about climate change among younger audiences.",
    usageWarning: "Use it for education or public understanding, not for direct problem-solving.",
    difficulty: "easy"
  },
  {
    topic: "Environment",
    phrase: "throwaway culture",
    meaning: "a habit of buying and discarding products quickly",
    example: "Throwaway culture creates huge amounts of waste and encourages careless consumption.",
    usageWarning: "Use it when criticizing overconsumption or disposable products.",
    difficulty: "advanced",
    ieltsSafety: "careful"
  },
  {
    topic: "Environment",
    phrase: "make a difference",
    meaning: "to have a positive effect",
    example: "Small daily choices can make a difference if many people adopt them.",
    usageWarning: "Use it for real positive impact, and explain what changes.",
    difficulty: "easy"
  },
  {
    topic: "Environment",
    phrase: "at risk",
    meaning: "in danger of being harmed or lost",
    example: "Many coastal communities are at risk because of rising sea levels.",
    usageWarning: "Use it for people, places, species, or systems facing danger.",
    difficulty: "easy"
  },
  {
    topic: "Environment",
    phrase: "take action",
    meaning: "to do something practical to solve a problem",
    example: "Governments need to take action before air pollution becomes even worse.",
    usageWarning: "Use it when there is a clear problem and a practical response.",
    difficulty: "easy"
  },
  {
    topic: "Environment",
    phrase: "in the long run",
    meaning: "over a long period of time",
    example: "Investing in clean energy can save money in the long run.",
    usageWarning: "Use it to contrast short-term costs with long-term results.",
    difficulty: "easy"
  },
  {
    topic: "Travel",
    phrase: "off the beaten track",
    meaning: "away from places that most tourists visit",
    example: "Some travelers prefer villages off the beaten track because they feel more authentic.",
    usageWarning: "Use it for unusual travel places, not for common tourist attractions.",
    difficulty: "advanced",
    ieltsSafety: "careful"
  },
  {
    topic: "Travel",
    phrase: "travel light",
    meaning: "to travel with very little luggage",
    example: "I prefer to travel light because it makes moving between cities much easier.",
    usageWarning: "Use it literally for luggage, not for emotional or abstract topics.",
    difficulty: "easy"
  },
  {
    topic: "Travel",
    phrase: "a change of scenery",
    meaning: "a different place that feels refreshing",
    example: "A short trip to the mountains gave me a change of scenery after months of study.",
    usageWarning: "Use it when a new place improves mood or energy.",
    difficulty: "medium"
  },
  {
    topic: "Travel",
    phrase: "get itchy feet",
    meaning: "to feel a strong desire to travel or move somewhere new",
    example: "After staying in one city for several years, some people get itchy feet and want to explore.",
    usageWarning: "This is informal; use it only in personal travel answers.",
    formality: "casual",
    ieltsSafety: "risky",
    riskLevel: "high",
    difficulty: "advanced"
  },
  {
    topic: "Travel",
    phrase: "soak up the culture",
    meaning: "to experience and enjoy the culture of a place deeply",
    example: "When I travel, I like to visit local markets and soak up the culture.",
    usageWarning: "Use it for cultural experience, not just sightseeing or shopping.",
    difficulty: "medium"
  },
  {
    topic: "Travel",
    phrase: "a home away from home",
    meaning: "a place where someone feels comfortable although it is not their home",
    example: "The small hostel became a home away from home because the staff were so welcoming.",
    usageWarning: "Use it for comfort and belonging in another place.",
    difficulty: "medium"
  },
  {
    topic: "Travel",
    phrase: "a once-in-a-lifetime experience",
    meaning: "a very special experience that is unlikely to happen again",
    example: "Seeing the northern lights would be a once-in-a-lifetime experience for many travelers.",
    usageWarning: "Use it for truly special events; overusing it can sound exaggerated.",
    ieltsSafety: "careful",
    difficulty: "medium"
  },
  {
    topic: "Travel",
    phrase: "packed like sardines",
    meaning: "crowded very tightly together",
    example: "During the holiday rush, passengers were packed like sardines on the train.",
    usageWarning: "This is informal and image-heavy; use it only for crowded transport or places.",
    formality: "casual",
    ieltsSafety: "risky",
    riskLevel: "high",
    difficulty: "advanced"
  },
  {
    topic: "Travel",
    phrase: "take the scenic route",
    meaning: "to choose a longer but more attractive route",
    example: "We took the scenic route along the coast because the views were worth the extra time.",
    usageWarning: "Use it for routes, journeys, or travel choices with pleasant views.",
    difficulty: "medium"
  },
  {
    topic: "Travel",
    phrase: "lose track of time",
    meaning: "to forget about time because you are very interested or relaxed",
    example: "I lost track of time while walking through the old streets of the city.",
    usageWarning: "Use it for enjoyable or absorbing experiences, not for being irresponsible.",
    difficulty: "easy"
  },
  {
    topic: "Relationships",
    phrase: "break the ice",
    meaning: "to make people feel more comfortable at the start of a conversation",
    example: "Group activities can break the ice and make new students feel less nervous.",
    usageWarning: "Safe in informal examples, but avoid using it repeatedly in one answer.",
    formality: "casual",
    ieltsSafety: "careful",
    riskLevel: "medium"
  },
  {
    topic: "Relationships",
    phrase: "get along with",
    meaning: "to have a friendly relationship with someone",
    example: "I get along with my classmates because we respect each other's opinions.",
    usageWarning: "Use it for relationships between people, not for objects or places.",
    difficulty: "easy"
  },
  {
    topic: "Relationships",
    phrase: "see eye to eye",
    meaning: "to agree with someone",
    example: "Parents and teenagers may not always see eye to eye about screen time.",
    usageWarning: "Use it mainly in negative or contrast sentences about agreement.",
    difficulty: "medium"
  },
  {
    topic: "Relationships",
    phrase: "on the same wavelength",
    meaning: "sharing a similar way of thinking or understanding",
    example: "Video calls help remote teams stay on the same wavelength when projects move quickly.",
    usageWarning: "Best for people or teams, not objects or abstract systems.",
    difficulty: "advanced"
  },
  {
    topic: "Relationships",
    phrase: "a shoulder to lean on",
    meaning: "someone who gives emotional support",
    example: "Close friends can be a shoulder to lean on during stressful periods.",
    usageWarning: "Use it for emotional support; it can sound sentimental if overused.",
    ieltsSafety: "careful",
    difficulty: "medium"
  },
  {
    topic: "Relationships",
    phrase: "keep in touch",
    meaning: "to continue communicating with someone",
    example: "Social media makes it easier to keep in touch with friends who live abroad.",
    usageWarning: "Use it for ongoing communication after distance or time apart.",
    difficulty: "easy"
  },
  {
    topic: "Relationships",
    phrase: "clear the air",
    meaning: "to discuss a problem honestly so tension is reduced",
    example: "When colleagues misunderstand each other, a calm conversation can clear the air.",
    usageWarning: "Use it after conflict, tension, or misunderstanding.",
    difficulty: "advanced",
    ieltsSafety: "careful"
  },
  {
    topic: "Relationships",
    phrase: "build bridges",
    meaning: "to improve relationships between people or groups",
    example: "Community events can build bridges between older residents and young families.",
    usageWarning: "Use it for improving connection between separate people or groups.",
    difficulty: "medium"
  },
  {
    topic: "Relationships",
    phrase: "take someone for granted",
    meaning: "to fail to appreciate someone because they are always there",
    example: "People sometimes take their parents for granted until they live away from home.",
    usageWarning: "Use it for people and support, not for services or objects unless explained.",
    difficulty: "medium"
  },
  {
    topic: "Relationships",
    phrase: "through thick and thin",
    meaning: "during both good and difficult times",
    example: "A real friend supports you through thick and thin, not only when life is easy.",
    usageWarning: "Use it for strong long-term loyalty; it can sound dramatic in casual examples.",
    ieltsSafety: "careful",
    difficulty: "advanced"
  },
  {
    topic: "Society",
    phrase: "quality of life",
    meaning: "the general level of comfort, health, and happiness people have",
    example: "Good public transport can improve quality of life in crowded cities.",
    usageWarning: "Use it for broad living conditions, not just income.",
    difficulty: "easy"
  },
  {
    topic: "Society",
    phrase: "a level playing field",
    meaning: "a fair situation where everyone has the same chance",
    example: "Free education can create a level playing field for children from different backgrounds.",
    usageWarning: "Use it for fairness and opportunity, especially in education or work.",
    difficulty: "advanced"
  },
  {
    topic: "Society",
    phrase: "the bigger picture",
    meaning: "the wider situation beyond one small detail",
    example: "When discussing crime, we should look at the bigger picture, including poverty and education.",
    usageWarning: "Use it when moving from one example to a wider social issue.",
    difficulty: "medium"
  },
  {
    topic: "Society",
    phrase: "make ends meet",
    meaning: "to have enough money for basic living costs",
    example: "In expensive cities, many families struggle to make ends meet.",
    usageWarning: "Use it for financial pressure, not general busyness.",
    difficulty: "medium"
  },
  {
    topic: "Society",
    phrase: "social mobility",
    meaning: "the ability to move to a better social or economic position",
    example: "Scholarships can improve social mobility by helping talented students enter university.",
    usageWarning: "This is an academic expression, so explain it with a clear example.",
    formality: "formal",
    difficulty: "advanced"
  },
  {
    topic: "Society",
    phrase: "the generation gap",
    meaning: "differences in opinions or habits between younger and older people",
    example: "The generation gap is clear when families discuss technology and online privacy.",
    usageWarning: "Use it for age-based differences, not for all disagreements.",
    difficulty: "medium"
  },
  {
    topic: "Society",
    phrase: "public awareness",
    meaning: "how much ordinary people know about an issue",
    example: "Public awareness of mental health has improved in many countries.",
    usageWarning: "Use it for social understanding, not direct government action.",
    difficulty: "easy"
  },
  {
    topic: "Society",
    phrase: "a safety net",
    meaning: "support that protects people during difficulty",
    example: "Unemployment benefits can act as a safety net for people who lose their jobs.",
    usageWarning: "Use it for social, financial, or family support systems.",
    difficulty: "medium"
  },
  {
    topic: "Society",
    phrase: "have a voice",
    meaning: "to have the chance to express opinions and be heard",
    example: "Young people should have a voice in decisions about education policy.",
    usageWarning: "Use it for participation and representation, not physical speaking ability.",
    difficulty: "medium"
  },
  {
    topic: "Society",
    phrase: "the common good",
    meaning: "the benefit of society as a whole",
    example: "People sometimes need to accept small personal limits for the common good.",
    usageWarning: "This sounds formal, so use it in social or policy discussions.",
    formality: "formal",
    difficulty: "advanced"
  }
];

export const starterIdioms: Idiom[] = deckEntries.map((entry, index) =>
  buildIdiom(entry, index, deckEntries.length)
);
