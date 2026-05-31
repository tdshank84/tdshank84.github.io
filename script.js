const APP_VERSION = '0.9';
const STORE_KEY = 'harpersStemPrincessStars.v2';
const TODAY_KEY = 'harpersStemPrincessToday.v2';

const questions = {
  Math: [
    { q: 'What is 4 + 3?', a: '7', choices: ['5','6','7','8'] },
    { q: 'Which number is bigger?', a: '9', choices: ['3','6','9','2'] },
    { q: 'Count the stars: ⭐ ⭐ ⭐ ⭐ ⭐', a: '5', choices: ['3','4','5','6'] }
  ],
  Reading: [
    { q: 'Pick the word: SCI-EN-CE', a: 'science', choices: ['school','science','star','sing'] },
    { q: 'Pick the word: PRIN-CESS', a: 'princess', choices: ['purple','castle','princess','pencil'] },
    { q: 'What sound starts “sun”?', a: 's', choices: ['m','s','t','b'] }
  ],
  Science: [
    { q: 'What do plants need to grow?', a: 'sunlight', choices: ['sunlight','shoes','crayons','moon rocks'] },
    { q: 'Which is a liquid?', a: 'water', choices: ['rock','water','chair','book'] },
    { q: 'What animal says meow?', a: 'cat', choices: ['dog','cat','fish','bird'] }
  ],
  Coding: [
    { q: 'Princess needs to move one space right. Which command?', a: '➡️', choices: ['⬅️','➡️','⬆️','⭐'] },
    { q: 'What does a loop do?', a: 'repeats', choices: ['stops','repeats','sleeps','paints'] },
    { q: 'Avoid the lake. Which way goes up?', a: '⬆️', choices: ['⬇️','⬅️','⬆️','➡️'] }
  ],
  Speech: [
    { q: 'Say this clearly: CAS-TLE', a: 'castle', choices: ['castle','candle','cookie','circle'] },
    { q: 'Which word rhymes with cat?', a: 'hat', choices: ['sun','hat','dog','fish'] },
    { q: 'Break the word: REACHING', a: 're-ch-ing', choices: ['re-ch-ing','reach-ing-er','ra-chin','ring'] }
  ]
};

const defaults = { Math: 0, Reading: 0, Science: 0, Coding: 0, Speech: 0 };
let stars = loadStars();
let todayStars = loadToday();
let activeSubject = 'Math';
let activeEmoji = '⭐';
let activeQuestion = null;

const totalStarsEl = document.getElementById('totalStars');
const levelText = document.getElementById('levelText');
const rankText = document.getElementById('rankText');
const levelBar = document.getElementById('levelBar');
const levelPercent = document.getElementById('levelPercent');
const goalBar = document.getElementById('goalBar');
const goalText = document.getElementById('goalText');
const gameDialog = document.getElementById('gameDialog');
const gameSubject = document.getElementById('gameSubject');
const gameSubtitle = document.getElementById('gameSubtitle');
const gameEmoji = document.getElementById('gameEmoji');
const questionText = document.getElementById('questionText');
const answerGrid = document.getElementById('answerGrid');
const feedback = document.getElementById('feedback');

function loadStars() {
  try { return { ...defaults, ...(JSON.parse(localStorage.getItem(STORE_KEY)) || {}) }; }
  catch { return { ...defaults }; }
}
function saveStars() { localStorage.setItem(STORE_KEY, JSON.stringify(stars)); }
function loadToday() {
  const date = new Date().toISOString().slice(0,10);
  try {
    const data = JSON.parse(localStorage.getItem(TODAY_KEY));
    if (data && data.date === date) return data.count || 0;
  } catch {}
  localStorage.setItem(TODAY_KEY, JSON.stringify({ date, count: 0 }));
  return 0;
}
function saveToday() {
  const date = new Date().toISOString().slice(0,10);
  localStorage.setItem(TODAY_KEY, JSON.stringify({ date, count: todayStars }));
}
function totalStars() { return Object.values(stars).reduce((a,b)=>a+b,0); }
function updateDashboard() {
  const total = totalStars();
  totalStarsEl.textContent = total;
  document.querySelectorAll('[data-stars]').forEach(el => el.textContent = stars[el.dataset.stars] || 0);
  const level = Math.max(1, Math.floor(total / 50) + 1);
  const levelProgress = total % 50;
  const pct = Math.min(100, Math.round((levelProgress / 50) * 100));
  levelText.textContent = `Level ${level}`;
  rankText.textContent = level < 3 ? 'Princess Explorer' : level < 6 ? 'Castle Scholar' : 'STEM Princess';
  levelBar.style.width = `${pct}%`;
  levelPercent.textContent = `${pct}%`;
  const goalPct = Math.min(100, Math.round((todayStars / 20) * 100));
  goalBar.style.width = `${goalPct}%`;
  goalText.textContent = `${Math.min(todayStars,20)} / 20`;
  document.getElementById('streakText').textContent = total > 0 ? '5 Days!' : '1 Day!';
}
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.82; u.pitch = 1.18;
  window.speechSynthesis.speak(u);
}
function pickQuestion(subject) {
  const bank = questions[subject] || questions.Math;
  return bank[Math.floor(Math.random() * bank.length)];
}
function openGame(subject, emoji) {
  activeSubject = subject; activeEmoji = emoji; activeQuestion = pickQuestion(subject);
  gameSubject.textContent = subject;
  gameEmoji.textContent = emoji;
  gameSubtitle.textContent = 'Answer to earn 5 stars';
  questionText.textContent = activeQuestion.q;
  answerGrid.innerHTML = '';
  feedback.textContent = 'Pick an answer.';
  activeQuestion.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = choice;
    btn.addEventListener('click', () => answer(choice));
    answerGrid.appendChild(btn);
  });
  gameDialog.showModal();
  speak(`${subject}. ${activeQuestion.q}`);
}
function answer(choice) {
  if (!activeQuestion) return;
  if (choice === activeQuestion.a) {
    stars[activeSubject] = Math.min(100, (stars[activeSubject] || 0) + 5);
    todayStars += 5;
    saveStars(); saveToday(); updateDashboard();
    feedback.textContent = 'Correct! You earned 5 stars! ⭐';
    speak('Correct! You earned five stars!');
    setTimeout(() => openGame(activeSubject, activeEmoji), 900);
  } else {
    feedback.textContent = 'Try again, princess!';
    speak('Try again.');
  }
}

document.querySelectorAll('.subject-card').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON' || e.currentTarget === card) openGame(card.dataset.subject, card.dataset.emoji);
  });
});
document.getElementById('quickPlay').addEventListener('click', () => openGame('Coding','💻'));
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all stars?')) return;
  stars = { ...defaults }; todayStars = 0; saveStars(); saveToday(); updateDashboard();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}
updateDashboard();


window.addEventListener('load', () => {
  const splash = document.getElementById('splashScreen');
  const versionLabel = document.getElementById('versionLabel');
  if (versionLabel) versionLabel.textContent = `v${APP_VERSION}`;
  setTimeout(() => {
    if (splash) splash.classList.add('hide');
  }, 3000);
});
