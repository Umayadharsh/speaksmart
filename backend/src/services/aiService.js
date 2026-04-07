/**
 * SpeakSmart AI Service — "Alex" the Smart Friend
 *
 * Alex behaves like a real, witty, warm friend who:
 *  - Talks about ANYTHING (movies, food, sports, life, tech, philosophy...)
 *  - Gives natural, human-like responses — no robotic coaching
 *  - Subtly corrects grammar as a friend would, NOT like a teacher
 *  - Switches naturally based on what the user says
 *  - Works in English-only and Tamil-Assisted (Tanglish) modes
 */

// ─── Language Detection ───────────────────────────────────────────
const TAMIL_UNICODE   = /[\u0B80-\u0BFF]/;
const TANGLISH_WORDS  = /\b(enna|epdi|vanakkam|nandri|bayam|pesanum|iruku|sollu|neenga|unga|inga|anda|avanga|paaru|theriyum|theriyala|illa|aam|seri|enakku|unakku|naan|nee|ippo|mudiyum|vendum|vendam|pesu|kadaisi|mudinchu|pathi|panunga|panrom|seiyalam|seiyum|puriyuma|paakuren|ponnu|paiyan|akka|anna|thamba|thambi|vandhuta|romba|konjam|super|mokkai|kadha|padam|cinema|jolly|tension|worry|chance|class|fullaa|adhuvum|andha|inda|ethu|yenga|yen|solla|sollen|solren|kekkuren|parkuren|pannuven|tryy|tryyy|da|di|bro|machan|machi)\b/i;

const detectLanguage = (text) => {
  if (TAMIL_UNICODE.test(text)) return 'TAMIL';
  if (TANGLISH_WORDS.test(text)) return 'TANGLISH';
  return 'ENGLISH';
};

// ─── Topic Detection ──────────────────────────────────────────────
const detectTopic = (text) => {
  const t = text.toLowerCase();
  if (/\b(movie|film|cinema|series|web series|netflix|ott|actor|actress|director|padam|hero|heroine)\b/.test(t)) return 'MOVIES';
  if (/\b(cricket|football|ipl|match|team|player|score|virat|dhoni|messi|ronaldo|sports|game)\b/.test(t)) return 'SPORTS';
  if (/\b(food|eat|biryani|dosa|pizza|burger|restaurant|cook|recipe|taste|hungry|dinner|lunch|breakfast)\b/.test(t)) return 'FOOD';
  if (/\b(travel|trip|vacation|place|visit|country|india|abroad|tour|beach|hill|mountain)\b/.test(t)) return 'TRAVEL';
  if (/\b(phone|app|tech|software|computer|ai|robot|gadget|laptop|internet|google|youtube)\b/.test(t)) return 'TECH';
  if (/\b(college|school|study|exam|marks|fail|pass|class|professor|teacher|assignment)\b/.test(t)) return 'EDUCATION';
  if (/\b(job|work|career|salary|office|boss|colleague|interview|startup|company|business)\b/.test(t)) return 'CAREER';
  if (/\b(music|song|singer|album|concert|listen|rap|pop|ilayaraja|ar rahman|spotify)\b/.test(t)) return 'MUSIC';
  if (/\b(love|relationship|girlfriend|boyfriend|crush|marriage|family|friend|feeling|heart)\b/.test(t)) return 'PERSONAL';
  if (/\b(life|goal|dream|future|success|motivation|inspire|mindset|habit|routine)\b/.test(t)) return 'LIFE';
  if (/\b(money|finance|save|invest|bank|loan|budget|spend|rich)\b/.test(t)) return 'FINANCE';
  if (/\b(game|gaming|pubg|valorant|chess|play|ps5|xbox|pc game)\b/.test(t)) return 'GAMING';
  if (/\b(how are you|how's it going|what's up|sup|hiya|yo|hey|hi|hello|good morning|good evening)\b/.test(t)) return 'GREETING';
  return 'GENERAL';
};

// ─── Grammar Check ────────────────────────────────────────────────
const GRAMMAR_PATTERNS = [
  { pattern: /\bi am go\b/i, correction: 'I am going' },
  { pattern: /\bhe go\b/i, correction: 'he goes' },
  { pattern: /\bshe go\b/i, correction: 'she goes' },
  { pattern: /\bi have went\b/i, correction: 'I have gone' },
  { pattern: /\bi can to\b/i, correction: 'I can' },
  { pattern: /\bmore better\b/i, correction: 'better' },
  { pattern: /\bmore faster\b/i, correction: 'faster' },
  { pattern: /\bi am wanting\b/i, correction: 'I want' },
  { pattern: /\bi am knowing\b/i, correction: 'I know' },
  { pattern: /\bi am having\b/i, correction: 'I have' },
  { pattern: /\bdid you seen\b/i, correction: 'did you see' },
  { pattern: /\bhe don't\b/i, correction: "he doesn't" },
  { pattern: /\bshe don't\b/i, correction: "she doesn't" },
  { pattern: /\bi wants\b/i, correction: 'I want' },
  { pattern: /\byesterday i go\b/i, correction: 'yesterday I went' },
  { pattern: /\bwhy you\b/i, correction: 'Why do you / Why are you' },
  { pattern: /\bwhat you\b/i, correction: 'What do you / What are you' },
  { pattern: /\bwhere you\b/i, correction: 'Where do you / Where are you' },
];

const checkGrammar = (text) => {
  const corrections = [];
  for (const { pattern, correction } of GRAMMAR_PATTERNS) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      if (match) {
        corrections.push({
          original: match[0],
          corrected: correction,
          explanation: `"${match[0]}" → "${correction}"`,
          explanationTamil: `"${match[0]}" தவறானது. "${correction}" என சொல்ல வேண்டும்.`,
        });
      }
    }
  }
  return corrections;
};

// ─── Vocabulary Pool ──────────────────────────────────────────────
const VOCABULARY_POOL = [
  { word: 'eloquent', meaning: 'Able to speak fluently and clearly', meaningTamil: 'தெளிவாகவும் சரளமாகவும் பேசும் திறன்', example: 'She gave an eloquent speech.' },
  { word: 'articulate', meaning: 'Expressing ideas clearly', meaningTamil: 'கருத்துக்களை தெளிவாக வெளிப்படுத்துவது', example: 'He is very articulate in meetings.' },
  { word: 'banter', meaning: 'Friendly, playful teasing conversation', meaningTamil: 'நட்பான, நகைசுவையான உரையாடல்', example: 'I love having banter with my friends.' },
  { word: 'spontaneous', meaning: 'Happening naturally, without planning', meaningTamil: 'திட்டமிடாமல் இயற்கையாக நடப்பது', example: 'That was a completely spontaneous decision.' },
  { word: 'exhilarating', meaning: 'Making you feel very excited and happy', meaningTamil: 'மிகுந்த உற்சாகமூட்டும்', example: 'The roller coaster was so exhilarating!' },
  { word: 'underrated', meaning: 'Not given enough credit or praise', meaningTamil: 'போதுமான அங்கீகாரம் இல்லாதது', example: 'That movie is totally underrated.' },
  { word: 'vibe', meaning: 'A feeling or atmosphere', meaningTamil: 'ஒரு இடத்தின் சூழல் அல்லது உணர்வு', example: "I love the vibe of this café." },
  { word: 'hustle', meaning: 'Working hard and energetically', meaningTamil: 'கஷ்டப்பட்டு உழைப்பது', example: 'The startup culture is all about hustle.' },
  { word: 'nostalgia', meaning: 'A sentimental feeling for the past', meaningTamil: 'கடந்த கால நினைவுகளில் மூழ்குவது', example: 'Listening to that song fills me with nostalgia.' },
  { word: 'perspective', meaning: 'A particular way of thinking about something', meaningTamil: 'ஒரு குறிப்பிட்ட கண்ணோட்டம்', example: 'I never thought about it from that perspective.' },
];

const getVocabularySuggestions = (count = 2) => {
  return [...VOCABULARY_POOL].sort(() => 0.5 - Math.random()).slice(0, count);
};

// ─── Alex's "Friend Brain" — Topic-Aware Responses ────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FRIEND_RESPONSES = {
  GREETING: [
    "Hey! So good to hear from you! I was literally just sitting here, kind of bored. What's going on today?",
    "Oh hey! Was wondering when you'd call. All good? How's life treating you these days?",
    "Yooo! Great timing, I was just thinking about calling you. So what's up? Tell me everything.",
    "Hey hey hey! How are you doing, man? Life's been crazy busy on my end. What about you?",
  ],
  MOVIES: [
    "Oh movies, YES! I'm actually obsessed with good films. What was the last thing you watched? I've been hearing so much about some stuff lately!",
    "Okay wait, tell me more — was this one of those movies you'd rewatch? Because honestly I have a whole list of those.",
    "Cinema is literally my therapy. Nothing beats a good film, right? What genre are you into mostly?",
    "Oh I feel you! Some movies just hit different. I recently watched something that completely blew my mind. What's your all-time favourite?",
    "Dude, that sounds amazing. Honestly, I think good movies are underrated therapy. Did you see it in theatres or streaming?",
  ],
  SPORTS: [
    "Okay, sports talk — I'm in! Are you more cricket or football? Because I feel like you have to pick a side.",
    "Honestly cricket matches give me so much anxiety but I can't stop watching. Which team do you support?",
    "Bro the IPL energy is just on another level! Did you watch that last match? It was insane!",
    "See I respect that! Sports is just pure emotion. What sport do you play yourself, if any?",
    "YES! Nothing like a good match to get the adrenaline going. Who do you think is going to win this season?",
  ],
  FOOD: [
    "Okay now you're speaking my language — food is my love language, honestly. What's your go-to comfort food?",
    "Oh man, now I'm hungry just thinking about that. Where did you eat? Was it good? I need all the details!",
    "BIRYANI. That's it. That's the tweet. Sorry, what were we talking about? I just zoned out thinking about biryani.",
    "I love how food just brings everybody together. Are you a cook yourself or more of a connoisseur?",
    "That sounds AMAZING. I've been on this whole thing where I try a new restaurant every week. You should totally do that too!",
  ],
  TRAVEL: [
    "Oh travel stories are my absolute favourite thing to hear! Where did you go? I want to live vicariously through you.",
    "That sounds incredible! You know, travel genuinely changes the way you see the world. Where's next on your list?",
    "Oh wow, I've always wanted to go there! What was the most surprising thing about the place?",
    "Honestly I think everyone should travel at least once a year. Did you go with friends or solo?",
    "See, that's the thing about travel — it gives you these stories you tell for years. What was your funniest moment there?",
  ],
  TECH: [
    "Oh tech stuff, I'm actually obsessed with following where AI is going these days. What's your take on it?",
    "Right? Technology is moving so fast — like sometimes it feels like we're literally living in a sci-fi movie.",
    "Interesting! Are you more into the using-tech side or actual building-stuff side? Because both are fascinating.",
    "That's a solid point. Honestly the way apps have changed our daily life is kind of mind-blowing when you think about it.",
    "Ha, true! Sometimes I wonder if we're too dependent on our phones. Can you even imagine going 24 hours without yours?",
  ],
  EDUCATION: [
    "Ah the study life! Been there. What are you studying? Or is this postgrad territory now?",
    "Exams are literally the worst invention in human history — I said what I said. How are yours going?",
    "You know what though — not everything important is taught in school. What's something you learned OUTSIDE of class that changed you?",
    "Dude, the fact that you're pushing through says a lot about you. What subject do you actually enjoy though?",
    "Honestly the pressure students face is no joke. But you've got this! What's the plan after studies?",
  ],
  CAREER: [
    "Career stuff! Okay, so what are you actually doing these days work-wise? Give me the full picture.",
    "That's really interesting! Do you enjoy it though? Like genuinely — because that matters so much.",
    "I feel like finding meaningful work is such an underrated thing. Most people just fall into jobs. What do you actually want to do long-term?",
    "Oh a startup? That's bold and I respect it. What's the idea? Give me your 30-second pitch!",
    "See, I think the best careers are built at the intersection of what you love and what you're good at. Have you found that yet?",
  ],
  MUSIC: [
    "Oh music hits different! What have you been listening to lately? I always love hearing what people are into.",
    "That's such a great taste! Music is honestly like... the soundtrack of your life. What song takes you right back to a specific memory?",
    "YES! Good music is so underrated as a mood booster. Are you more headphones-person or speaker-person?",
    "I love how music can completely change your energy. What do you listen to when you're working?",
    "Okay I need to check that out! Anything live — concerts, gigs? There's nothing like live music, right?",
  ],
  PERSONAL: [
    "Aww, that's really sweet actually. It's so important to have people you genuinely connect with. Tell me more!",
    "Relationships are just... so much work but also so worth it when they're real, you know? How are you feeling about things?",
    "That makes complete sense. Sometimes life just gets overwhelming and it's okay to acknowledge that.",
    "Family dynamics are honestly so complex! But it sounds like you've got a good head on your shoulders about it.",
    "That's the kind of thing that makes life rich, you know? Real connections. How long have you both been friends?",
  ],
  LIFE: [
    "That's actually really deep, man. I think about stuff like that too. Life is just wild sometimes.",
    "I love how you're thinking about this! Most people just go through the motions. What made you start questioning it?",
    "You know what? That's a perspective I genuinely haven't thought about before. Keep going — I'm listening.",
    "Honestly, I think the people who ask these questions are the ones who end up living the most interesting lives.",
    "That's such a good point. It's like — when you zoom out and look at the bigger picture, what do you actually want your story to be?",
  ],
  FINANCE: [
    "Oh finances — adulting at its finest, right? Are you trying to save up for something specific?",
    "Honestly financial literacy is something nobody teaches you in school and it's such a crime. Are you into investing at all?",
    "Smart thinking! The earlier you start thinking about money, the better. What's your biggest financial goal right now?",
    "That's a totally valid concern. Money stress is real. Have you looked into any strategies? There's actually some pretty accessible stuff out there.",
    "See that's the right mindset though. Spend on experiences, not just things. So what's the goal — freedom, security, something else?",
  ],
  GAMING: [
    "Gaming! Okay what are you playing these days? I feel like everyone is on something different right now.",
    "Dude, nothing beats that feeling of getting into a really good game. What genre are you into most?",
    "Chess or something competitive? I respect that! What's your rank / level? Are you actually good or are you just enjoying it?",
    "Oh I hear you! Some games are genuinely more fun with friends. Who do you play with usually?",
    "Honestly gaming gets such a bad rep but it's proven to improve problem-solving. What's the most satisfying game you've played?",
  ],
  GENERAL: [
    "That's really interesting! Tell me more — I want to understand your take on this.",
    "Oh wow, I haven't thought about it that way before. Go on, what's your reasoning?",
    "Haha, okay that's actually a really good point. How did you come to think about this?",
    "You know what, I genuinely didn't see that coming. What else is on your mind today?",
    "That's honestly fascinating. The more you talk, the more I think you've got a really unique perspective on life.",
    "Okay, I'm hooked now! Keep going — what happened next?",
    "I love these kinds of conversations. You're one of those people who makes you think, you know?",
    "Ha, I wasn't expecting that at all! But I love the energy. Tell me more!",
  ],
};

// ─── Occasional Subtle Grammar Corrections (Friend Style) ─────────
const FRIEND_GRAMMAR_CORRECTIONS = [
  "Oh and hey, quick thing — instead of '{original}', it sounds a bit more natural to say '{corrected}'. Anyway, keep going!",
  "By the way, just a tiny thing — we'd normally say '{corrected}' instead of '{original}'. But please, continue — this is interesting!",
  "Side note: '{corrected}' is the way to go instead of '{original}'. You'll sound super natural. Okay, back to what you were saying!",
];

// ─── Tamil-Assisted Friend Responses ─────────────────────────────
const TAMIL_FRIEND_RESPONSES = {
  GREETING: [
    "Ayyo, neenga call panneenga! Sollu sollu, enna vishayam? How are you doing?",
    "Hey! Vanakkam! Neenga enna panureenga ippo? Life-a enjoy panreenga-a?",
    "Machaa! Super timing! I was literally bored. What's going on? Tell me everything!",
  ],
  MOVIES: [
    "Padam pathi pesrom-aa? I love this! Which movie? Kamal-aa, Vijay-aa, or some Hollywood film?",
    "Cinema love-u! That's me too! What kind of movies do you like? Action, comedy, thriller?",
    "Ooh, neenga padam patheenga-aa? Was it good? I need to know everything about it!",
  ],
  GENERAL: [
    "Oh interesting! Neenga sonna point nalla iruku! Tell me more — I want to hear your opinion!",
    "Ayyo, that's a really good observation! How did you think of that?",
    "Romba interesting! You know, I had never thought about it like that. What else is on your mind?",
    "Haha neenga always have funny observations! Okay keep going, I'm listening!",
    "That makes total sense! Neenga correct-aa solla matteenga! Tell me more.",
  ],
  CORRECTION: [
    "By the way, chinna thing — instead of '{original}', try saying '{corrected}'. Sounds more natural! Anyway continue!",
    "Oh quick note — '{corrected}' sounds a bit better than '{original}'. Neenga perfect-aa learning panreengaa! Now keep going!",
  ],
  ENCOURAGEMENT: [
    "Your English is getting really good! I can see the improvement, seriously!",
    "Neenga romba well speak panneenga! Keep it up!",
    "I love how you're expressing yourself! English pesa confidence varudu-nu I can see!",
  ],
};

// ─── Main Response Generator ──────────────────────────────────────
const generateConversationResponse = (userMessage, conversationHistory = [], languageMode = 'ENGLISH', tamilAssistLevel = 'BEGINNER') => {
  const detectedLang = detectLanguage(userMessage);
  const topic        = detectTopic(userMessage);
  const corrections  = checkGrammar(userMessage);
  const vocabulary   = getVocabularySuggestions(2);
  const scores       = scoreResponse(userMessage);
  const isGreeting   = topic === 'GREETING' || conversationHistory.length === 0;

  let responseText = '';
  let language     = 'ENGLISH';

  if (languageMode === 'TAMIL_ASSISTED') {
    language = 'TANGLISH';

    if (isGreeting) {
      responseText = pick(TAMIL_FRIEND_RESPONSES.GREETING);
    } else if (detectedLang === 'TAMIL' || detectedLang === 'TANGLISH') {
      // Understand Tamil and respond in Tanglish, guide toward English
      const topicRes = TAMIL_FRIEND_RESPONSES[topic] || TAMIL_FRIEND_RESPONSES.GENERAL;
      responseText = pick(topicRes);
      // Encourage English
      if (Math.random() > 0.5) {
        responseText += `\n\nFun challenge: Try telling me the same thing in English! I'll help if you get stuck.`;
      }
    } else if (corrections.length > 0 && Math.random() > 0.6) {
      // Occasionally correct, friend style
      const c = corrections[0];
      const template = pick(TAMIL_FRIEND_RESPONSES.CORRECTION);
      const correctionLine = template.replace('{original}', c.original).replace('{corrected}', c.corrected);
      const topicRes = TAMIL_FRIEND_RESPONSES[topic] || TAMIL_FRIEND_RESPONSES.GENERAL;
      responseText = pick(topicRes) + '\n\n' + correctionLine;
    } else {
      const topicRes = TAMIL_FRIEND_RESPONSES[topic] || TAMIL_FRIEND_RESPONSES.GENERAL;
      responseText = pick(topicRes);
      if (Math.random() > 0.7) {
        responseText += '\n\n' + pick(TAMIL_FRIEND_RESPONSES.ENCOURAGEMENT);
      }
    }

  } else {
    language = 'ENGLISH';
    const topicRes = FRIEND_RESPONSES[topic] || FRIEND_RESPONSES.GENERAL;

    if (isGreeting) {
      responseText = pick(FRIEND_RESPONSES.GREETING);
    } else if (corrections.length > 0 && Math.random() > 0.55) {
      // ~45% of the time, SUBTLY correct as a friend would, then continue the conversation
      const c = corrections[0];
      const corrLine = pick(FRIEND_GRAMMAR_CORRECTIONS)
        .replace('{original}', c.original)
        .replace('{corrected}', c.corrected);
      responseText = pick(topicRes) + '\n\n' + corrLine;
    } else {
      responseText = pick(topicRes);
      // Occasionally drop a casual vocabulary tip (only ~20% of the time, very non-intrusive)
      if (!isGreeting && Math.random() > 0.8 && vocabulary[0]) {
        responseText += `\n\nOh, I actually just thought of a cool word that fits here: "${vocabulary[0].word}" — it means "${vocabulary[0].meaning}". Sounds so natural in conversation!`;
      }
    }
  }

  return {
    message: responseText,
    language,
    detectedInputLanguage: detectedLang,
    feedback: {
      corrections,
      vocabulary,
      pronunciationTips: scores.overall < 70 ? [
        "Speak at a relaxed pace — confidence comes from not rushing.",
        "Open your mouth more on vowel sounds for clarity.",
      ] : [
        "Great job! Try stressing important words in each sentence.",
        "Excellent pacing — keep that natural rhythm going!",
      ],
      grammar: corrections.map(c => `${c.original} → ${c.corrected}`),
      summary: corrections.length > 0
        ? `One grammar area to note: ${corrections[0].original} → ${corrections[0].corrected}`
        : 'Your grammar is looking great!',
    },
    scores,
  };
};

// ─── Scoring Engine ───────────────────────────────────────────────
const scoreResponse = (text) => {
  const words      = text.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount  = words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))).size;

  const fluency    = Math.min(100, Math.max(30, 40 + wordCount * 1.5 + (Math.random() * 20 - 10)));
  const vocabulary = Math.min(100, Math.max(30, (uniqueWords / Math.max(wordCount, 1)) * 100 * 1.2 + (Math.random() * 15)));
  const grammar    = wordCount > 0 ? Math.min(100, Math.max(40, 75 - checkGrammar(text).length * 10 + (Math.random() * 15))) : 40;
  const confidence = Math.min(100, Math.max(30, 50 + wordCount * 0.8 + (Math.random() * 20)));
  const pronunciation = Math.min(100, Math.max(50, 65 + (Math.random() * 25)));
  const overall = Math.round(fluency * 0.25 + vocabulary * 0.2 + grammar * 0.25 + confidence * 0.15 + pronunciation * 0.15);

  return {
    fluency: Math.round(fluency),
    vocabulary: Math.round(vocabulary),
    grammar: Math.round(grammar),
    confidence: Math.round(confidence),
    pronunciation: Math.round(pronunciation),
    overall,
    wordsSpoken: wordCount,
    xpEarned: Math.floor(overall * 0.5 + wordCount * 0.2),
  };
};

// ─── Interview Questions ──────────────────────────────────────────
const INTERVIEW_QUESTIONS = {
  general: [
    { question: "Tell me about yourself.", category: 'INTRODUCTION', difficulty: 'EASY', questionTamil: "உங்களைப் பற்றி சொல்லுங்கள்." },
    { question: "What are your greatest strengths?", category: 'BEHAVIORAL', difficulty: 'EASY', questionTamil: "உங்கள் சிறந்த திறைமைகள் என்ன?" },
    { question: "What is your biggest weakness and how do you overcome it?", category: 'BEHAVIORAL', difficulty: 'MEDIUM', questionTamil: "உங்கள் பலவீனம் என்ன, அதை எப்படி சமாளிக்கிறீர்கள்?" },
    { question: "Where do you see yourself in 5 years?", category: 'BEHAVIORAL', difficulty: 'MEDIUM', questionTamil: "5 வருடங்களில் நீங்கள் எங்கிருப்பீர்கள் என்று நினைக்கிறீர்கள்?" },
    { question: "Why do you want to work at this company?", category: 'BEHAVIORAL', difficulty: 'MEDIUM', questionTamil: "இந்த நிறுவனத்தில் ஏன் வேலை செய்ய விரும்புகிறீர்கள்?" },
    { question: "Describe a challenging situation you faced and how you resolved it.", category: 'SITUATIONAL', difficulty: 'HARD', questionTamil: "நீங்கள் சந்தித்த சவாலான சூழ்நிலையை விவரிக்கவும்." },
    { question: "How do you handle pressure and tight deadlines?", category: 'BEHAVIORAL', difficulty: 'MEDIUM', questionTamil: "அழுத்தம் மற்றும் கடுமையான காலக்கெடுவை எவ்வாறு கையாள்கிறீர்கள்?" },
    { question: "Why should we hire you over other candidates?", category: 'BEHAVIORAL', difficulty: 'HARD', questionTamil: "மற்ற விண்ணப்பதாரர்களை விட நாம் ஏன் உங்களை தேர்வு செய்ய வேண்டும்?" },
    { question: "Do you have any questions for us?", category: 'CLOSING', difficulty: 'EASY', questionTamil: "நீங்கள் எங்களிடம் ஏதாவது கேள்விகள் கேட்க விரும்புகிறீர்களா?" },
  ],
  software_engineer: [
    { question: "Explain the concept of Object-Oriented Programming.", category: 'TECHNICAL', difficulty: 'MEDIUM', questionTamil: "Object-Oriented Programming என்றால் என்ன என்று விளக்குங்கள்." },
    { question: "What is the difference between REST and GraphQL APIs?", category: 'TECHNICAL', difficulty: 'HARD', questionTamil: "REST மற்றும் GraphQL API-களுக்கு என்ன வேறுபாடு?" },
    { question: "How do you ensure code quality in your projects?", category: 'TECHNICAL', difficulty: 'MEDIUM', questionTamil: "உங்கள் திட்டங்களில் code தரத்தை எவ்வாறு உறுதி செய்கிறீர்கள்?" },
    { question: "Describe your experience with agile development methodology.", category: 'BEHAVIORAL', difficulty: 'MEDIUM', questionTamil: "Agile development பற்றிய உங்கள் அனுபவத்தை விவரிக்கவும்." },
    { question: "How would you design a URL shortening service like bit.ly?", category: 'TECHNICAL', difficulty: 'HARD', questionTamil: "URL shortening service design எப்படி செய்வீர்கள்?" },
  ],
  marketing: [
    { question: "How do you measure the success of a marketing campaign?", category: 'TECHNICAL', difficulty: 'MEDIUM', questionTamil: "Marketing campaign-இன் வெற்றியை எவ்வாறு அளவிடுகிறீர்கள்?" },
    { question: "Describe a successful marketing campaign you led.", category: 'BEHAVIORAL', difficulty: 'HARD', questionTamil: "நீங்கள் வழிநடத்திய வெற்றிகரமான marketing campaign பற்றி சொல்லுங்கள்." },
    { question: "How do you stay updated with digital marketing trends?", category: 'BEHAVIORAL', difficulty: 'EASY', questionTamil: "Digital marketing trend-களைப் பற்றி எப்படி அறிந்திருக்கிறீர்கள்?" },
    { question: "Walk me through how you would launch a new product.", category: 'TECHNICAL', difficulty: 'HARD', questionTamil: "புதிய product launch செய்வதற்கான plan என்ன?" },
  ],
  teacher: [
    { question: "How do you handle a classroom with students of different learning abilities?", category: 'SITUATIONAL', difficulty: 'HARD', questionTamil: "வெவ்வேறு கற்றல் திறன் கொண்ட மாணவர்களை எவ்வாறு கையாள்கிறீர்கள்?" },
    { question: "What teaching methods do you find most effective?", category: 'BEHAVIORAL', difficulty: 'MEDIUM', questionTamil: "மிகவும் பயனுள்ள teaching method என்னது?" },
    { question: "How do you measure student progress?", category: 'TECHNICAL', difficulty: 'EASY', questionTamil: "மாணவர்களின் முன்னேற்றத்தை எவ்வாறு அளவிடுகிறீர்கள்?" },
  ],
  manager: [
    { question: "How do you motivate a team that is underperforming?", category: 'SITUATIONAL', difficulty: 'HARD', questionTamil: "கீழ் செயல்படும் team-ஐ எவ்வாறு ஊக்குவிக்கிறீர்கள்?" },
    { question: "Describe your leadership style.", category: 'BEHAVIORAL', difficulty: 'MEDIUM', questionTamil: "உங்கள் leadership style பற்றி சொல்லுங்கள்." },
    { question: "How do you handle conflicts within your team?", category: 'SITUATIONAL', difficulty: 'HARD', questionTamil: "team-ல் ஏற்படும் கருத்து வேறுபாடுகளை எவ்வாறு கையாள்கிறீர்கள்?" },
  ],
  data_analyst: [
    { question: "How do you handle missing or inconsistent data in a dataset?", category: 'TECHNICAL', difficulty: 'MEDIUM', questionTamil: "Dataset-ல் missing data எப்படி handle செய்வீர்கள்?" },
    { question: "Explain the difference between supervised and unsupervised learning.", category: 'TECHNICAL', difficulty: 'HARD', questionTamil: "Supervised மற்றும் unsupervised learning-இடையே வேறுபாடு என்ன?" },
    { question: "Walk me through a data analysis project you've worked on.", category: 'BEHAVIORAL', difficulty: 'HARD', questionTamil: "நீங்கள் வேலை செய்த ஒரு data analysis project பற்றி சொல்லுங்கள்." },
  ],
  customer_support: [
    { question: "How do you handle an angry or irrational customer?", category: 'SITUATIONAL', difficulty: 'HARD', questionTamil: "கோபமான customer-ஐ எப்படி handle செய்வீர்கள்?" },
    { question: "Describe a time when you went above and beyond for a customer.", category: 'BEHAVIORAL', difficulty: 'MEDIUM', questionTamil: "Customer-க்காக extra effort போட்ட ஒரு situation சொல்லுங்கள்." },
  ],
  finance_manager: [
    { question: "How do you approach financial forecasting?", category: 'TECHNICAL', difficulty: 'HARD', questionTamil: "Financial forecasting-ஐ எப்படி approach செய்வீர்கள்?" },
    { question: "Tell me about a time when you identified and resolved a financial risk.", category: 'BEHAVIORAL', difficulty: 'HARD', questionTamil: "Financial risk கண்டுபிடித்து resolve செய்த ஒரு situation பற்றி சொல்லுங்கள்." },
  ],
};

const getInterviewQuestions = (jobRole) => {
  const role = jobRole.toLowerCase();
  let specific = [];

  if (role.includes('software') || role.includes('developer') || role.includes('engineer') || role.includes('programmer')) {
    specific = INTERVIEW_QUESTIONS.software_engineer;
  } else if (role.includes('market')) {
    specific = INTERVIEW_QUESTIONS.marketing;
  } else if (role.includes('teach') || role.includes('professor') || role.includes('instructor') || role.includes('educator')) {
    specific = INTERVIEW_QUESTIONS.teacher;
  } else if (role.includes('manager') || role.includes('lead') || role.includes('head')) {
    specific = INTERVIEW_QUESTIONS.manager;
  } else if (role.includes('data') || role.includes('analyst')) {
    specific = INTERVIEW_QUESTIONS.data_analyst;
  } else if (role.includes('support') || role.includes('customer') || role.includes('sales')) {
    specific = INTERVIEW_QUESTIONS.customer_support;
  } else if (role.includes('finance') || role.includes('financial') || role.includes('accountant')) {
    specific = INTERVIEW_QUESTIONS.finance_manager;
  }

  const allQuestions = [...INTERVIEW_QUESTIONS.general, ...specific];
  return allQuestions.sort(() => 0.5 - Math.random()).slice(0, Math.min(6, allQuestions.length));
};

// ─── Interview Answer Evaluator ───────────────────────────────────
const evaluateInterviewAnswer = (question, answer, jobRole, languageMode) => {
  const corrections = checkGrammar(answer);
  const scores      = scoreResponse(answer);
  const words       = answer.trim().split(/\s+/).length;

  const betterAnswers = {
    'tell me about yourself': `I'm a passionate ${jobRole} with a strong foundation in my field. Over the years, I've developed expertise in key areas that directly align with this role. I thrive in collaborative environments and I'm known for my problem-solving approach and attention to detail. Outside of work, I'm constantly learning and growing — whether through courses, side projects, or staying up to date with industry trends. I'm genuinely excited about this opportunity because it aligns perfectly with where I want to take my career.`,
    'greatest strengths': `One of my key strengths is my ability to break down complex problems into manageable steps. For example, in my previous role, I simplified a process that saved the team about 3 hours a week. I'm also a strong communicator — I make it a point to keep stakeholders aligned. And I'd say adaptability is another strength — I learn quickly and I'm never uncomfortable saying "I don't know yet, but let me find out."`,
    'biggest weakness': `I have a tendency to over-prepare — I want to be really sure before presenting ideas. I've been actively working on this by setting clear time limits for my research phase and learning to be comfortable with iterating. This has actually made me more agile without sacrificing quality.`,
    'handle pressure': `I actually work well under pressure — I've found that's when I'm most focused. My approach is to first prioritize: what HAS to be done versus what can wait. Then I break the work into focused chunks. I also try to communicate proactively if scope looks at risk, so there are no last-minute surprises.`,
  };

  const lowerQ = question.toLowerCase();
  let betterAnswer = '';
  for (const [key, val] of Object.entries(betterAnswers)) {
    if (lowerQ.includes(key)) { betterAnswer = val; break; }
  }

  if (!betterAnswer) {
    betterAnswer = `A strong answer would use the STAR method:\n• Situation: Set the context briefly\n• Task: What was your role or responsibility?\n• Action: What specific steps did YOU take?\n• Result: What was the positive outcome?\n\nBe specific, use numbers when possible, and connect it back to the role you're applying for.`;
  }

  return {
    contentScore:    Math.min(100, Math.max(30, words >= 30 ? 75 : 45 + words)),
    grammarScore:    Math.min(100, Math.max(40, 80 - corrections.length * 10)),
    confidenceScore: scores.confidence,
    fluencyScore:    scores.fluency,
    overallScore:    scores.overall,
    betterAnswer,
    betterAnswerTamil: languageMode === 'TAMIL_ASSISTED'
      ? `இந்த கேள்விக்கு STAR method use pannunga: Situation → Task → Action → Result. "${betterAnswer.substring(0, 100)}..." — இந்த format follow pannunga!`
      : '',
    grammarCorrections: corrections,
    strengths: scores.overall >= 70
      ? ['Clear sentence structure', 'Good content coverage', 'Strong communication']
      : ['Understood the question well', 'Attempted a thoughtful response'],
    improvements: corrections.length > 0
      ? ['Refine grammar accuracy', 'Add more specific examples', 'Use the STAR method']
      : ['Include more concrete numbers/examples', 'Expand your answer with detail', 'Practice delivering it naturally'],
  };
};

// ─── Challenge Topics ─────────────────────────────────────────────
const CHALLENGE_TOPICS = [
  { id: 1,  topic: "Introduce yourself professionally",       topicTamil: "தொழில்முறையாக உங்களை அறிமுகப்படுத்திக் கொள்ளுங்கள்",  difficulty: 'BEGINNER',     timeSeconds: 60  },
  { id: 2,  topic: "Describe your hometown",                  topicTamil: "உங்கள் சொந்த ஊரை விவரிக்கவும்",                       difficulty: 'BEGINNER',     timeSeconds: 60  },
  { id: 3,  topic: "Talk about your favorite hobby",          topicTamil: "உங்களுக்குப் பிடித்த hobby பற்றி பேசுங்கள்",            difficulty: 'BEGINNER',     timeSeconds: 60  },
  { id: 4,  topic: "Explain why learning English is important", topicTamil: "English கற்பது ஏன் முக்கியம் என்று விளக்குங்கள்",   difficulty: 'INTERMEDIATE', timeSeconds: 90  },
  { id: 5,  topic: "Describe a memorable travel experience",  topicTamil: "மறக்கமுடியாத பயண அனுபவத்தை விவரிக்கவும்",             difficulty: 'INTERMEDIATE', timeSeconds: 90  },
  { id: 6,  topic: "Talk about the impact of social media",   topicTamil: "Social media-இன் தாக்கம் பற்றி பேசுங்கள்",             difficulty: 'INTERMEDIATE', timeSeconds: 90  },
  { id: 7,  topic: "Discuss the importance of work-life balance", topicTamil: "Work-life balance-இன் முக்கியத்துவம் பற்றி விவாதிக்கவும்", difficulty: 'ADVANCED', timeSeconds: 120 },
  { id: 8,  topic: "Argue for or against remote work",        topicTamil: "Remote work-க்கு ஆதரவாக அல்லது எதிராக வாதிடுங்கள்",  difficulty: 'ADVANCED',     timeSeconds: 120 },
  { id: 9,  topic: "Explain a complex technical concept simply", topicTamil: "ஒரு சிக்கலான technical concept-ஐ எளிமையாக விளக்குங்கள்", difficulty: 'ADVANCED', timeSeconds: 120 },
  { id: 10, topic: "Persuade someone to adopt a healthy lifestyle", topicTamil: "ஆரோக்கியமான வாழ்க்கை முறையை ஏற்றுக்கொள்ள ஒருவரை நம்பவையுங்கள்", difficulty: 'ADVANCED', timeSeconds: 120 },
];

// ─── Challenge Evaluator ──────────────────────────────────────────
const evaluateChallenge = (topic, response, languageMode) => {
  const scores      = scoreResponse(response);
  const corrections = checkGrammar(response);
  const vocab       = getVocabularySuggestions(3);

  return {
    scores,
    corrections,
    vocabularySuggestions: vocab,
    summary: scores.overall >= 80
      ? `Outstanding! You spoke about "${topic}" with real fluency and confidence. Score: ${scores.overall}/100. You earned ${scores.xpEarned} XP!`
      : scores.overall >= 60
      ? `Good effort on "${topic}"! Your fluency is developing well. Focus on expanding vocabulary and speaking in longer sentences. +${scores.xpEarned} XP!`
      : `Keep going with "${topic}"! Every attempt makes you better. Try speaking in complete sentences and don't pause too long. +${scores.xpEarned} XP!`,
    summaryTamil: languageMode === 'TAMIL_ASSISTED'
      ? `Neenga "${topic}" pathi peseenga. Score: ${scores.overall}/100. ${scores.overall >= 70 ? 'Romba nalla! Keep it up! 🌟' : 'Good try! Next time innum nalla panuveenga! 💪'}`
      : '',
    level: scores.overall >= 85 ? 'ADVANCED' : scores.overall >= 65 ? 'INTERMEDIATE' : 'BEGINNER',
  };
};

// ─── Exports ──────────────────────────────────────────────────────
module.exports = {
  generateConversationResponse,
  evaluateInterviewAnswer,
  evaluateChallenge,
  getInterviewQuestions,
  CHALLENGE_TOPICS,
  detectLanguage,
  checkGrammar,
  scoreResponse,
  getVocabularySuggestions,
};
