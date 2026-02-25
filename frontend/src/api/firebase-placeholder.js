// Placeholder module for Firebase data access.
// Replace these implementations with the Firebase SDK calls when credentials are provided.

// Sample records derived from the object you provided. These are intentionally
// shaped to match the mobile schema used elsewhere in the app and returned
// as Promises so they can be swapped with real Firebase calls later.

const SAMPLE_USER = {
  id: 'kTC4b53D58RoOkvgYRcir5aN1jz2',
  email: 'rain.maerceci@gmail.com',
  createdAt: { _seconds: 1769678196, _nanoseconds: 796000000 },
  displayName: 'rainvp',
  avatarPath: 'assets/images/avatars/botttsNeutral-yellow.png',
  gamesWon: 3,
  energy: 100,
  coins: 148,
  lastLogin: { _seconds: 1771757929, _nanoseconds: 268000000 },
  totalScore: 315,
  gamesPlayed: 14
};

const SAMPLE_CHATBOT_FEEDBACK = {
  id: 'fb_kTC4',
  feedback: 'app is smooth and fun',
  rating: 5,
  username: 'rainvp',
  timestamp: { _seconds: 1771400364, _nanoseconds: 452000000 }
};

const SAMPLE_COIN_TRANSACTION = {
  id: 'txn_kTC4_1',
  reason: 'Perfect Trivia Game (5/5 correct)',
  amount: 100,
  balanceBefore: 324,
  balanceAfter: 424,
  type: 'earned',
  userId: 'kTC4b53D58RoOkvgYRcir5aN1jz2',
  timestamp: { _seconds: 1771555330, _nanoseconds: 362000000 }
};

const SAMPLE_FAQ_CATEGORY = {
  id: 'faq_about_stii',
  label: 'About STII',
  icon: 'info_outline_rounded',
  order: 1,
  items: [
    {
      question: 'What is DOST-STII?',
      answer: "The Science and Technology Information Institute (STII) is an agency under the Department of Science and Technology (DOST) of the Philippines. It serves as the country's primary S&T information clearing house, disseminating science and technology information to the public."
    },
    {
      question: "What is STII's mandate?",
      answer: "STII's mandate is to serve as the S&T information clearing house of the Philippines. It collects, processes, and disseminates S&T information, and promotes awareness of the country's S&T activities, achievements, and resources."
    },
    {
      question: 'Where is STII located?',
      answer: 'DOST-STII is located at the DOST Compound, General Santos Avenue, Bicutan, Taguig City, Metro Manila, Philippines.'
    }
  ]
};

const SAMPLE_POPUP_FACT = {
  id: 'pf_1',
  fact: "The ocean produces over 50% of Earth's oxygen, while more than 3 trillion trees exist on the planet, outnumbering stars in the galaxy.",
  info: 'Did you know?'
};

const SAMPLE_SESSION = {
  id: 'sess_7hcp',
  userId: '7hcpEEmA35RVlqqBcIxNPe7889E2',
  loginTime: { _seconds: 1769740096, _nanoseconds: 646000000 },
  logoutTime: { _seconds: 1771405811, _nanoseconds: 693000000 }
};

const SAMPLE_TRIVIA_QUESTION = {
  id: 'triv_1',
  question: 'Which programming language is known as the language of the web?',
  choices: ['Python','Java','JavaScript','C++'],
  correctIndex: 2,
  category: 'technology',
  difficulty: 'easy'
};

export const getPlayerStats = async (params = {}) => {
  // simple placeholder list including a sample player stat derived from SAMPLE_USER
  return Promise.resolve([
    { id: 'p_sample_1', userId: SAMPLE_USER.id, gameType: 'trivia', scoreEarned: SAMPLE_USER.totalScore || 0, timestamp: new Date().toISOString(), correctAnswers: 5, wrongAnswers: 0, moveCount: 0, highestTile: 0, result: 'win', isPerfectGame: true }
  ]);
};

export const getChatbotFeedback = async (params = {}) => {
  return Promise.resolve([SAMPLE_CHATBOT_FEEDBACK]);
};

export const getCoinTransactions = async (params = {}) => {
  return Promise.resolve([SAMPLE_COIN_TRANSACTION]);
};

export const getFaqCategories = async (params = {}) => {
  return Promise.resolve([SAMPLE_FAQ_CATEGORY]);
};

export const getPopupFacts = async (params = {}) => {
  return Promise.resolve([SAMPLE_POPUP_FACT]);
};

export const getSessions = async (params = {}) => {
  return Promise.resolve([SAMPLE_SESSION]);
};

export const getTriviaQuestions = async (params = {}) => {
  return Promise.resolve([SAMPLE_TRIVIA_QUESTION]);
};

export const getUsersPlaceholder = async (params = {}) => {
  return Promise.resolve([SAMPLE_USER]);
};
