// Blackjack game script with betting using chips and hidden dealer card functionality

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let dealerHand = [];
let playerHand = [];
let playerBalance = 1000;
let currentBet = 0;
let potentialWin = 0;
let canStand = false; // Variabile per controllare se si può "stand"
let isDoubleDown = false;  // Variabile per gestire il doppio
let gameInProgress = false; // Nuova variabile per gestire se il gioco è in corso o meno

const dealerCardsDiv = document.getElementById('dealer-cards');
const playerCardsDiv = document.getElementById('player-cards');
const dealerScoreDiv = document.getElementById('dealer-score');
const playerScoreDiv = document.getElementById('player-score');
const messageDiv = document.getElementById('message');
const balanceDiv = document.getElementById('balance');
const chipsDiv = document.getElementById('chips');
const currentBetDiv = document.getElementById('current-bet'); // Element to display current bet
const potentialWinDiv = document.getElementById('potential-win'); // Element to display potential win

// Chip values and images
const chips = [
    { value: 5, img: 'images/chip_5.png' },
    { value: 10, img: 'images/chip_10.png' },
    { value: 25, img: 'images/chip_25.png' },
    { value: 50, img: 'images/chip_50.png' },
    { value: 100, img: 'images/chip_100.png' }
];

// Create a deck of cards
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
}

// Shuffle the deck
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Draw a card from the deck
function drawCard() {
    return deck.pop();
}

// Calculate the score of a hand
function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (let card of hand) {
        if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else if (card.value === 'A') {
            aces += 1;
            score += 11;
        } else {
            score += parseInt(card.value);
        }
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }

    return score;
}

// Check if the hand is a Blackjack (Ace + 10-point card)
function isBlackjack(hand) {
    const score = calculateScore(hand);
    return hand.length === 2 && (score === 21); // 2 cards and score 21
}

function revealDealerCards() {
    const dealerCards = dealerCardsDiv.querySelectorAll('.card');

    // Ruota la prima carta coperta
    if (dealerCards.length > 0) {
        dealerCards[0].classList.add('flip');
        setTimeout(() => {
            dealerCards[0].src = `images/carte/${dealerHand[0].value}_of_${dealerHand[0].suit}.png`;
        }, 400); // Cambia l'immagine a metà della rotazione
    }

    // Aggiungi le altre carte con ritardo
    for (let i = 1; i < dealerHand.length; i++) {
        setTimeout(() => {
            const cardImg = document.createElement('img');
            cardImg.classList.add('card', 'slide-in');
            cardImg.src = `images/carte/${dealerHand[i].value}_of_${dealerHand[i].suit}.png`;
            dealerCardsDiv.appendChild(cardImg);

            // Aggiorna il punteggio del dealer dopo ogni carta
            if (i === dealerHand.length - 1) {
                setTimeout(() => {
                    dealerScoreDiv.textContent = `Score: ${calculateScore(dealerHand)}`;
                }, 1000);
            }
        }, i * 3000); // 1.5 secondi di intervallo tra le carte
    }
}

// Update the UI with the current hands and scores
function updateUI(showDealerCard = false) {
    // Salva le carte esistenti del player per mantenere le loro animazioni
    const existingPlayerCards = Array.from(playerCardsDiv.children);
    
    dealerCardsDiv.innerHTML = '';
    playerCardsDiv.innerHTML = '';

    // Dealer cards
    for (let i = 0; i < dealerHand.length; i++) {
        const cardImg = document.createElement('img');
        cardImg.classList.add('card');
        
        if (i === 0 && !showDealerCard) {
            cardImg.src = 'images/carte/card_back.png';
            cardImg.classList.add('hidden-card');
        } else {
            cardImg.src = `images/carte/${dealerHand[i].value}_of_${dealerHand[i].suit}.png`;
            if (i > 1) {
                cardImg.classList.add('slide-in');
            }
        }
        dealerCardsDiv.appendChild(cardImg);
    }

    // Dealer score logic
    if (showDealerCard) {
        dealerScoreDiv.textContent = `Score: ${calculateScore(dealerHand)}`;
        const hiddenCard = dealerCardsDiv.querySelector('.hidden-card');
        if (hiddenCard) {
            hiddenCard.classList.add('flip');
            setTimeout(() => {
                hiddenCard.src = `images/carte/${dealerHand[0].value}_of_${dealerHand[0].suit}.png`;
            }, 1500); // Metà del tempo della nuova animazione più lenta
        }
    } else {
        const visibleCardScore = calculateScore([dealerHand[1]]);
        dealerScoreDiv.textContent = `Score: ${visibleCardScore} + ?`;
    }

    // Player cards
    playerHand.forEach((card, i) => {
        let cardImg;
        if (i < existingPlayerCards.length) {
            // Riutilizza la carta esistente per mantenere l'animazione
            cardImg = existingPlayerCards[i];
            playerCardsDiv.appendChild(cardImg);
        } else {
            // Crea una nuova carta solo per le carte nuove
            cardImg = document.createElement('img');
            cardImg.classList.add('card');
            cardImg.src = `images/carte/${card.value}_of_${card.suit}.png`;
            if (i >= 2) { // Solo per le carte dopo le prime due
                cardImg.classList.add('slide-in');
            }
            playerCardsDiv.appendChild(cardImg);
        }
    });

    // Player score
    playerScoreDiv.textContent = `Score: ${calculateScore(playerHand)}`;
    balanceDiv.textContent = `Balance: $${playerBalance}`;
}


// Start a new game
function newGame() {
    if (gameInProgress) {
        messageDiv.textContent = 'Finish the current game first!';
        return;
    }

    if (currentBet === 0) {
        messageDiv.textContent = 'Please place a bet first!';
        return;
    }

    createDeck();
    shuffleDeck();

    dealerHand = [drawCard(), drawCard()];
    playerHand = [drawCard(), drawCard()];

    isDoubleDown = false;  // Resetta il doppio
    canStand = false; // Reset per l'azione Stand
    gameInProgress = true; // Segna che il gioco è in corso

    updateUI();
    updateBetUI();
    messageDiv.textContent = 'Game in progress! Choose to hit, stand, or double.';
}

// Add chips to betting area
function setupChips() {
    chipsDiv.innerHTML = '';
    for (let chip of chips) {
        const chipImg = document.createElement('img');
        chipImg.src = chip.img;
        chipImg.alt = `$${chip.value}`;
        chipImg.className = 'chip';
        chipImg.addEventListener('click', () => placeBet(chip.value));
        chipsDiv.appendChild(chipImg);
    }
}

// Place a bet
function placeBet(amount) {
    if (amount > playerBalance) {
        messageDiv.textContent = 'Not enough balance for this bet!';
        return;
    }

    currentBet += amount;
    playerBalance -= amount;
    potentialWin = currentBet * 2; // Example: win is double the bet

    updateBetUI();
    messageDiv.textContent = 'Bet placed! Now, you can start the game.';
}

// Update bet UI
function updateBetUI() {
    currentBetDiv.textContent = `$${currentBet}`;
    potentialWinDiv.textContent = `$${potentialWin}`;
    balanceDiv.textContent = `Balance: $${playerBalance}`;
}

// Modifica la funzione hit
function hit() {
    if (currentBet === 0 || isDoubleDown || !gameInProgress) {
        messageDiv.textContent = 'Cannot hit at this time';
        return;
    }

    const newCard = drawCard();
    playerHand.push(newCard);
    
    // Aggiungi solo la nuova carta mantenendo le vecchie
    const cardImg = document.createElement('img');
    cardImg.classList.add('card', 'slide-in');
    cardImg.src = `images/carte/${newCard.value}_of_${newCard.suit}.png`;
    playerCardsDiv.appendChild(cardImg);
    
    // Aggiorna solo il punteggio
    playerScoreDiv.textContent = `Score: ${calculateScore(playerHand)}`;

    const playerScore = calculateScore(playerHand);
    if (playerScore > 21) {
        setTimeout(() => {
            messageDiv.textContent = 'You bust! Dealer wins!';
            resetBet();
            gameInProgress = false;
            updateUI(true);
        }, 1000);
    }
}


// Handle the "Stand" action
function stand() {
    if (currentBet === 0) {
        messageDiv.textContent = 'Place a bet first!';
        return;
    }

    let dealerScore = calculateScore(dealerHand);

    while (dealerScore < 17) {
        dealerHand.push(drawCard());
        dealerScore = calculateScore(dealerHand);
    }

    updateUI(true);

    const playerScore = calculateScore(playerHand);

    // Check for Blackjack
    if (isBlackjack(playerHand)) {
        messageDiv.textContent = 'Blackjack! You win 1.5 times your bet!';
        playerBalance += currentBet + (currentBet / 2); // Blackjack pays 1.5 times the bet
    } else if (dealerScore > 21 || playerScore > dealerScore) {
        messageDiv.textContent = 'You win!';
        playerBalance += currentBet * 2;  // Add winnings to the player balance
    } else if (playerScore === dealerScore) {
        messageDiv.textContent = 'It\'s a tie!';
        playerBalance += currentBet; // Return the bet
    } else {
        messageDiv.textContent = 'Dealer wins!';
    }

    resetBet();
    gameInProgress = false; // Termina il gioco
    updateUI(true);
}

// Handle the "Double" action
function doubleDown() {
    if (currentBet === 0) {
        messageDiv.textContent = 'Place a bet first!';
        return;
    }

    if (isDoubleDown) {
        messageDiv.textContent = 'You can\'t double down again!';
        return;
    }

    if (playerBalance < currentBet) {
        messageDiv.textContent = 'Not enough balance to double down!';
        return;
    }

    // Deduct balance and double the bet
    playerBalance -= currentBet;
    currentBet *= 2;
    isDoubleDown = true;

    // Player gets one more card
    playerHand.push(drawCard());
    updateUI();

    const playerScore = calculateScore(playerHand);

    if (playerScore > 21) {
        messageDiv.textContent = 'You bust! Dealer wins!';
        resetBet();
        gameInProgress = false; // End the game
        updateUI(true);
        return;
    }

    // Automatically proceed to the dealer's turn
    dealerTurn();
}

// Dealer's turn logic
function dealerTurn() {
    let dealerScore = calculateScore(dealerHand);

    // Dealer draws cards until the score is at least 17
    while (dealerScore < 17) {
        dealerHand.push(drawCard());
        dealerScore = calculateScore(dealerHand);
    }

    updateUI(true);

    const playerScore = calculateScore(playerHand);

    // Determine the outcome
    if (dealerScore > 21 || playerScore > dealerScore) {
        messageDiv.textContent = 'You win!';
        playerBalance += currentBet * 2; // Add winnings
    } else if (playerScore === dealerScore) {
        messageDiv.textContent = 'It\'s a tie!';
        playerBalance += currentBet; // Return the bet
    } else {
        messageDiv.textContent = 'Dealer wins!';
    }

    resetBet();
    gameInProgress = false; // End the game
    updateUI(true);
}

setTimeout(() => {
    revealDealerCards();
}, 1000); // Attendi un secondo prima di rivelare le carte



// Reset bet after a round
function resetBet() {
    currentBet = 0;
    potentialWin = 0;
    isDoubleDown = false;  // Resetta il doppio
    canStand = false;  // Reset per l'azione Stand
    updateBetUI();
}

// Event listeners
document.getElementById('hit').addEventListener('click', hit);
document.getElementById('back').addEventListener('click', back);
document.getElementById('rebet').addEventListener('click', rebet);
document.getElementById('stand').addEventListener('click', stand);
document.getElementById('new-game').addEventListener('click', newGame);
document.getElementById('double').addEventListener('click', doubleDown);


// Initialize the game
setupChips();
newGame();
