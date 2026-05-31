const VERSION = '0.9.6';
const STAR_KEY = 'harpersStemStars';
const GOAL_KEY = 'harpersStemGoalStars';
const SUBJECT_KEY = 'harpersStemSubjectStars';
const defaultStars = 248;
const defaultGoalStars = 8;
const defaultSubjectStars = { Math: 78, Reading: 45, Science: 38, Coding: 52, Speech: 35 };

let stars = Number(localStorage.getItem(STAR_KEY) || defaultStars);
let goalStars = Number(localStorage.getItem(GOAL_KEY) || defaultGoalStars);
let subjectStars = loadSubjectStars();
let activeGame = null;
let activeQuestionIndex = 0;
let answered = false;

const starCount = document.getElementById('starCount');
const goalCount = document.getElementById('goalCount');
const subjectEls = {
  Math: document.getElementById('mathStars'),
  Reading: document.getElementById('readingStars'),
  Science: document.getElementById('scienceStars'),
  Coding: document.getElementById('codingStars'),
  Speech: document.getElementById('speechStars')
};
const modal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalIcon = document.getElementById('modalIcon');
const modalPrompt = document.getElementById('modalPrompt');
const choices = document.getElementById('choices');
const result = document.getElementById('result');

const questionBanks = {
  Math: {
    icon: '🔢',
    module: true,
    intro: 'Solve the princess math puzzle to earn stars.',
    questions: [
      { prompt: 'Princess Harper has 2 stars and earns 3 more. How many stars?', answers: ['4', '5', '6', '7'], correct: '5' },
      { prompt: 'There are 6 flowers. Harper picks 2. How many are left?', answers: ['2', '3', '4', '8'], correct: '4' },
      { prompt: 'Which number comes after 9?', answers: ['7', '8', '10', '12'], correct: '10' }
    ]
  },
  Reading: {
    icon: '📖',
    module: true,
    intro: 'Read the word and pick the easiest split.',
    questions: [
      { prompt: 'Tap the word split like a 2nd grade reader: princess', answers: ['prin-cess', 'pr-i-ncess', 'princess', 'pri-nce-ss'], correct: 'prin-cess' },
      { prompt: 'Tap the best split for: reaching', answers: ['re-ch-ing', 'rea-ching', 'reach-ing', 'r-e-a-ch'], correct: 're-ch-ing' },
      { prompt: 'Tap the word that means a place to read.', answers: ['book', 'fork', 'moon', 'sock'], correct: 'book' }
    ]
  },
  Science: {
    icon: '🧪',
    module: true,
    intro: 'Explore and learn with visual science questions.',
    questions: [
      { prompt: 'Which one needs sunlight to grow?', answers: ['Plant', 'Rock', 'Chair', 'Pencil'], correct: 'Plant' },
      { prompt: 'Which animal can fly?', answers: ['Bird', 'Fish', 'Dog', 'Horse'], correct: 'Bird' },
      { prompt: 'What do we drink that is clear and wet?', answers: ['Water', 'Sand', 'Paper', 'Air'], correct: 'Water' }
    ]
  },
  Coding: {
    icon: '💻',
    module: true,
    intro: 'Help the princess move safely toward the castle.',
    questions: [
      { prompt: 'Which block moves the princess toward the castle?', answers: ['Move Forward', 'Spin Forever', 'Stop', 'Hide'], correct: 'Move Forward' },
      { prompt: 'The lake is ahead. Which block keeps her safe?', answers: ['Turn Right', 'Jump In', 'Stop Learning', 'Close Map'], correct: 'Turn Right' },
      { prompt: 'What does a repeat block do?', answers: ['Does it again', 'Eats lunch', 'Turns off', 'Erases stars'], correct: 'Does it again' }
    ]
  },
  Speech: {
    icon: '🎤',
    module: true,
    intro: 'Practice saying words, then tap the matching sound.',
    questions: [
      { prompt: 'Say it out loud, then tap the matching sound: science', answers: ['sigh-ens', 'sky-ence', 'sink', 'seen'], correct: 'sigh-ens' },
      { prompt: 'Say it out loud, then tap the matching sound: castle', answers: ['cas-tle', 'ca-st-le', 'cat', 'candle'], correct: 'cas-tle' },
      { prompt: 'Say it out loud, then tap the matching sound: flower', answers: ['flow-er', 'fl-own', 'floor', 'fewer'], correct: 'flow-er' }
    ]
  },
  'Coding Adventure': {
    icon: '🏰',
    module: true,
    intro: 'Princess Codey reaches the castle by avoiding obstacles.',
    subject: 'Coding',
    questions: [
      { prompt: 'Pick the safe first move.', answers: ['Forward', 'Into Lake', 'Into Tree', 'Back Home'], correct: 'Forward' },
      { prompt: 'A rock blocks the path. What should Codey do?', answers: ['Turn Left', 'Crash', 'Quit', 'Sleep'], correct: 'Turn Left' }
    ]
  },
  Achievements: {
    icon: '🏆',
    module: true,
    intro: 'Earn a practice star for checking your achievements.',
    subject: null,
    questions: [
      { prompt: 'Celebrate your progress. Ready to earn a star?', answers: ['Earn Star', 'Later'], correct: 'Earn Star' }
    ]
  }
};

const comingSoonPages = {
  Menu: { icon: '☰', text: `Game menu is coming soon. Version ${VERSION} is ready for princess learning.` },
  Home: { icon: '🏠', text: 'You are already home. Pick a subject card to play.' },
  Map: { icon: '🗺️', text: 'The adventure map is coming soon.' },
  Princess: { icon: '👸', text: 'Princess dress-up and rewards are coming soon.' },
  Pets: { icon: '🐱', text: 'Princess pets are coming soon.' },
  Treasures: { icon: '🧰', text: 'The treasure chest is coming soon.' },
  Calendar: { icon: '🗓️', text: 'The learning calendar is coming soon.' },
  Parents: { icon: '🛡️', text: 'Parent settings are coming soon.' }
};

function loadSubjectStars() {
  try {
    return { ...defaultSubjectStars, ...JSON.parse(localStorage.getItem(SUBJECT_KEY) || '{}') };
  } catch {
    return { ...defaultSubjectStars };
  }
}

function save() {
  localStorage.setItem(STAR_KEY, String(stars));
  localStorage.setItem(GOAL_KEY, String(goalStars));
  localStorage.setItem(SUBJECT_KEY, JSON.stringify(subjectStars));
}

function renderStars() {
  starCount.textContent = stars;
  goalCount.textContent = `${goalStars} / 20`;
  for (const [name, el] of Object.entries(subjectEls)) {
    if (el) el.textContent = `${subjectStars[name]} / 100`;
  }
}

function earnStars(amount = 1, subject = null) {
  stars += amount;
  goalStars = Math.min(20, goalStars + amount);
  if (subject && subjectStars[subject] !== undefined) {
    subjectStars[subject] = Math.min(100, subjectStars[subject] + amount);
  }
  save();
  renderStars();
}

function openGame(name) {
  const game = questionBanks[name];
  if (!game) return openComingSoon(name);
  activeGame = name;
  activeQuestionIndex = 0;
  showQuestion();
  modal.showModal();
}

function showQuestion() {
  answered = false;
  const game = questionBanks[activeGame];
  const q = game.questions[activeQuestionIndex % game.questions.length];
  modalIcon.textContent = game.icon;
  modalTitle.textContent = activeGame;
  modalPrompt.textContent = q.prompt;
  result.textContent = game.intro;
  choices.innerHTML = '';
  q.answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = answer;
    btn.addEventListener('click', () => checkAnswer(answer, q.correct, game.subject ?? activeGame));
    choices.appendChild(btn);
  });
}

function checkAnswer(answer, correct, subject) {
  if (answer !== correct) {
    result.textContent = 'Good try. Pick another answer!';
    return;
  }
  if (answered) return;
  answered = true;
  earnStars(1, subject);
  result.textContent = 'Great job, princess! +1 star ⭐';
  choices.innerHTML = '';
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Next Question';
  next.addEventListener('click', () => {
    activeQuestionIndex += 1;
    showQuestion();
  });
  const done = document.createElement('button');
  done.type = 'button';
  done.textContent = 'Back to Castle';
  done.addEventListener('click', () => modal.close());
  choices.append(next, done);
}

function openComingSoon(name) {
  const page = comingSoonPages[name] || { icon: '✨', text: `${name} is coming soon.` };
  activeGame = null;
  modalIcon.textContent = page.icon;
  modalTitle.textContent = name;
  modalPrompt.textContent = page.text;
  result.textContent = 'More princess adventures will be added here.';
  choices.innerHTML = '';
  const back = document.createElement('button');
  back.type = 'button';
  back.textContent = 'Back to Castle';
  back.addEventListener('click', () => modal.close());
  choices.appendChild(back);
  modal.showModal();
}

document.querySelectorAll('[data-subject]').forEach(el => {
  el.addEventListener('click', () => openGame(el.dataset.subject));
});

document.querySelectorAll('[data-nav]').forEach(el => {
  el.addEventListener('click', () => {
    const raw = el.dataset.nav;
    if (raw === 'menu') return openComingSoon('Menu');
    if (raw === 'Achievements') return openGame('Achievements');
    openComingSoon(raw);
  });
});

window.addEventListener('load', () => {
  renderStars();
  setTimeout(() => document.getElementById('splash').classList.add('hidden'), 3000);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
});
