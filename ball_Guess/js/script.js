// Juego "Adivina dónde está la bola" - script.js
// Variables y referencias DOM
const balanceKey = 'ballGame.balance';
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const betInput = document.getElementById('betAmount');
const multiplierSelect = document.getElementById('multiplier');
const balanceDisplay = document.getElementById('balanceDisplay');
const lastResult = document.getElementById('lastResult');
const instructions = document.getElementById('instructions');
const cups = Array.from(document.querySelectorAll('.cup'));

// Estado
let balance = restoreBalance();
let roundActive = false;
let bet = 0;
let multiplier = 1.5;
let hiddenIndex = null;
let selectedIndex = null;

// Inicialización visual
updateBalanceUI();
cups.forEach(cup => cup.addEventListener('click', onCupClick));
startBtn.addEventListener('click', startRound);
resetBtn.addEventListener('click', resetBalance);
betInput.addEventListener('input', sanitizeBet);
multiplierSelect.addEventListener('change', ()=> multiplier = parseFloat(multiplierSelect.value));

// --- Funciones ---
function restoreBalance(){
  const v = localStorage.getItem(balanceKey);
  if (v !== null && !isNaN(Number(v))) return Number(v);
  localStorage.setItem(balanceKey, 1000);
  return 1000;  
}
function saveBalance(){
  localStorage.setItem(balanceKey, String(balance));
}

function updateBalanceUI(){
  balanceDisplay.textContent = `$ ${balance.toFixed(0)}`;
}

function sanitizeBet(){
  const val = Number(betInput.value);
  if (isNaN(val) || val < 1) betInput.value = 1;
  if (val > balance) betInput.value = Math.max(1, Math.floor(balance));
}

function startRound(){
  if (roundActive) return;
  bet = Math.floor(Number(betInput.value) || 0);
  if (bet <= 0) { alert('Ingresa un monto válido.'); return; }
  if (bet > balance){ alert('Saldo insuficiente.'); return; }
  multiplier = parseFloat(multiplierSelect.value);

  // bloquear controles
  roundActive = true;
  instructions.textContent = 'Barajando... espera y luego elige una copa.';
  selectedIndex = null;
  clearReveal();
  // elegir posición oculta al azar
  hiddenIndex = Math.floor(Math.random() * 3);

  // animación de "shuffle" simple: mover cups a la izquierda/derecha
  animateShuffle().then(()=> {
    instructions.textContent = '¡Elige una copa!';
  });
}

function animateShuffle(){
  // animación simple con promesas; no es un shuffle físico, solo efecto
  return new Promise(resolve=>{
    const seq = [
      [0,1],[1,2],[0,1],[1,2],[0,1] // intercambios visuales
    ];
    let i = 0;
    const interval = setInterval(()=>{
      if (i >= seq.length){ clearInterval(interval); resolve(); return; }
      const [a,b] = seq[i];
      // animación: swap transform positions
      swapVisual(a,b);
      i++;
    }, 300);
  });
}

function swapVisual(a,b){
  const elA = cups[a], elB = cups[b];
  elA.style.transition = 'transform 250ms ease';
  elB.style.transition = 'transform 250ms ease';
  elA.style.transform = 'translateY(-10px)';
  elB.style.transform = 'translateY(10px)';
  setTimeout(()=>{
    elA.style.transform = '';
    elB.style.transform = '';
  }, 250);
}

function onCupClick(e){
  if (!roundActive) {
    alert('Inicia la ronda primero.');
    return;
  }
  const idx = Number(e.currentTarget.dataset.index);
  if (selectedIndex !== null) return; // ya eligió
  selectedIndex = idx;
  revealAll();
  evaluateRound();
}

function clearReveal(){
  cups.forEach(c => {
    c.classList.remove('revealed');
    // eliminar ball si existe
    const b = c.querySelector('.ball');
    if (b) b.remove();
  });
}

function revealAll(){
  // Añadir ball a la copa correcta y marcar revealed en todas (para efecto visual)
  cups.forEach((c, i) => {
    c.classList.add('revealed');
    if (!c.querySelector('.ball')){
      const ball = document.createElement('div');
      ball.className = 'ball';
      // solo colocar la pelota en la copa real; las demás muestran vacío (se puede forzar oculto)
      if (i === hiddenIndex) c.appendChild(ball);
      else {
        // opcional: para dar efecto de que no hay ball, agregamos pero con opacity baja
        // dejamos sin bola para más realismo: no append
      }
    }
  });
}

function evaluateRound(){
  // breve espera antes de mostrar resultado
  setTimeout(()=>{
    const win = selectedIndex === hiddenIndex;
    if (win){
      const winnings = Math.floor(bet * multiplier);
      balance += winnings;
      lastResult.textContent = `GANASTE $ ${winnings}`;
    } else {
      balance -= bet;
      lastResult.textContent = `PERDISTE $ ${bet}`;
    }
    saveBalance();
    updateBalanceUI();
    instructions.textContent = 'Ronda finalizada. Pulsa "Iniciar ronda" para volver a jugar.';
    roundActive = false;
  }, 800);
}

function resetBalance(){
  if (!confirm('Reiniciar saldo a $1000?')) return;
  balance = 1000;
  saveBalance();
  updateBalanceUI();
  lastResult.textContent = 'Saldo reiniciado';
}

// inicializar UI de acuerdo al estado guardado
updateBalanceUI();
 