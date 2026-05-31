const VERSION='0.9.5';
const STAR_KEY='harpersStemStars';
const GOAL_KEY='harpersStemGoalStars';
const defaultStars=248;
let stars=Number(localStorage.getItem(STAR_KEY)||defaultStars);
let goalStars=Number(localStorage.getItem(GOAL_KEY)||8);
const starCount=document.getElementById('starCount');
const goalCount=document.getElementById('goalCount');
const modal=document.getElementById('gameModal');
const modalTitle=document.getElementById('modalTitle');
const modalIcon=document.getElementById('modalIcon');
const modalPrompt=document.getElementById('modalPrompt');
const choices=document.getElementById('choices');
const result=document.getElementById('result');
const games={
  Math:{icon:'🔢',prompt:'Princess Harper has 2 stars and earns 3 more. How many stars?',answers:['4','5','6','7'],correct:'5'},
  Reading:{icon:'📖',prompt:'Tap the word split like a 2nd grade reader: princess',answers:['prin-cess','pr-i-ncess','princess','pri-nce-ss'],correct:'prin-cess'},
  Science:{icon:'🧪',prompt:'Which one needs sunlight to grow?',answers:['Plant','Rock','Chair','Pencil'],correct:'Plant'},
  Coding:{icon:'💻',prompt:'Which block moves the princess toward the castle?',answers:['Move Forward','Spin Forever','Stop','Hide'],correct:'Move Forward'},
  Speech:{icon:'🎤',prompt:'Say it out loud, then tap the matching sound: science',answers:['sigh-ens','sky-ence','sink','seen'],correct:'sigh-ens'},
  'Coding Adventure':{icon:'🏰',prompt:'Princess Codey reaches the castle by avoiding obstacles. Pick the safe first move.',answers:['Forward','Into Lake','Into Tree','Back Home'],correct:'Forward'},
  Achievements:{icon:'🏆',prompt:'Keep learning to grow your princess progress. Earn one practice star now?',answers:['Earn Star','Later'],correct:'Earn Star'}
};
function save(){localStorage.setItem(STAR_KEY,String(stars));localStorage.setItem(GOAL_KEY,String(goalStars))}
function renderStars(){starCount.textContent=stars;goalCount.textContent=`${goalStars} / 20`}
function earnStars(amount=1){stars+=amount;goalStars=Math.min(20,goalStars+amount);save();renderStars()}
function speak(text){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.85;speechSynthesis.speak(u)}catch(e){}}
function openGame(name){const game=games[name]||{icon:'⭐',prompt:`${name} is coming soon!`,answers:['Earn Star'],correct:'Earn Star'};modalIcon.textContent=game.icon;modalTitle.textContent=name;modalPrompt.textContent=game.prompt;result.textContent='';choices.innerHTML='';game.answers.forEach(answer=>{const btn=document.createElement('button');btn.type='button';btn.textContent=answer;btn.addEventListener('click',()=>{if(answer===game.correct){result.textContent='Great job, princess! +1 star ⭐';earnStars(1);if(name==='Science'){speak('The answer is Plant. A plant needs sunlight to grow.')}}else{result.textContent='Good try. Try again!'}});choices.appendChild(btn)});modal.showModal()}
document.querySelectorAll('[data-subject]').forEach(el=>el.addEventListener('click',()=>openGame(el.dataset.subject)));
document.querySelectorAll('[data-nav]').forEach(el=>el.addEventListener('click',()=>{const name=el.dataset.nav;if(name==='Achievements'){openGame('Achievements');return}if(name==='menu'){alert(`Harper's STEM Learning v${VERSION}\nStars are saved on this device.`);return}alert(`${name} area is ready for more princess adventures!`)}));
window.addEventListener('load',()=>{renderStars();setTimeout(()=>document.getElementById('splash').classList.add('hidden'),3000);if('serviceWorker' in navigator){navigator.serviceWorker.register('./service-worker.js').catch(()=>{})}});
