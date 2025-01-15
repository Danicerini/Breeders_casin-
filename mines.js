const gridSize = 5; // Griglia 5x5
let mineCount = 5; // Impostato di default a 5, ma variabile in base alla scelta dell'utente
let grid = [];
let score = 0;
let gameOver = false;
let balance = 1000; // Saldo iniziale
let betAmount = 10; // Puntata iniziale

const gridContainer = document.getElementById("gridContainer");
const scoreElement = document.getElementById("score");
const balanceElement = document.getElementById("balance");
const newGameBtn = document.getElementById("newGameBtn");
const mineCountInput = document.getElementById("mineCount");
const betAmountInput = document.getElementById("betAmount");

function startNewGame() {
  mineCount = parseInt(mineCountInput.value);
  betAmount = parseInt(betAmountInput.value);
  
  if (mineCount < 1 || mineCount > gridSize * gridSize) {
    alert("Numero di mine non valido!");
    return;
  }
  
  if (betAmount > balance) {
    alert("Saldo insufficiente!");
    return;
  }

  gameOver = false;
  score = 0;
  scoreElement.textContent = score;
  grid = [];
  gridContainer.innerHTML = "";
  generateGrid();
  placeMines();
}

function generateGrid() {
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    gridContainer.appendChild(cell);
    grid.push(cell);
  }
}

function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const index = Math.floor(Math.random() * grid.length);
    if (!grid[index].classList.contains("mine")) {
      grid[index].classList.add("mine");
      minesPlaced++;
    }
  }
}

function handleCellClick(event) {
  if (gameOver) return;

  const cell = event.target;
  if (cell.classList.contains("revealed") || cell.classList.contains("mine")) return;

  cell.classList.add("revealed");

  if (cell.classList.contains("mine")) {
    gameOver = true;
    cell.style.backgroundColor = "red";
    revealMines();
    alert("Hai perso! La tua puntata è stata sottratta.");
    balance -= betAmount;
    balanceElement.textContent = balance;
  } else {
    score++;
    scoreElement.textContent = score;
    
    if (score === (gridSize * gridSize) - mineCount) {
      gameOver = true;
      alert("Hai vinto! La tua puntata è stata raddoppiata.");
      balance += betAmount * 2;
      balanceElement.textContent = balance;
    }
  }
}

function revealMines() {
  grid.forEach(cell => {
    if (cell.classList.contains("mine")) {
      cell.classList.add("revealed");
    }
  });
}

newGameBtn.addEventListener("click", startNewGame);

// Inizializza il gioco all'avvio
startNewGame();
