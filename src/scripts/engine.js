/**
 * Yu-Gi-Oh! | Jo-Ken-Po Edition
 * Motor do jogo em JavaScript puro.
 *
 * Conceitos aplicados:
 * - Estado centralizado e imutável por referência (um único objeto `state`).
 * - Funções pequenas, puras sempre que possível.
 * - Separação entre dados (CARDS), lógica (duelo) e DOM (render).
 */

// ----------------------------------------------------------------------------
// Dados do jogo
// ----------------------------------------------------------------------------

const PATHS = {
  icons: "./src/assets/icons",
};

/**
 * Cada carta conhece quem ela vence (WinOf) e perde (LoseOf) pelos ids.
 * Jo-Ken-Po: Dragão > Mago > Exodia > Dragão.
 */
const CARDS = [
  {
    id: 0,
    name: "Blue Eyes White Dragon",
    type: "Dragão",
    img: `${PATHS.icons}/dragon.png`,
    winOf: [1], // vence o Mago
    loseOf: [2], // perde para Exodia
  },
  {
    id: 1,
    name: "Dark Magician",
    type: "Mago",
    img: `${PATHS.icons}/magician.png`,
    winOf: [2], // vence Exodia
    loseOf: [0], // perde para o Dragão
  },
  {
    id: 2,
    name: "Exodia",
    type: "Lendária",
    img: `${PATHS.icons}/exodia.png`,
    winOf: [0], // vence o Dragão
    loseOf: [1], // perde para o Mago
  },
];

const CARD_BACK = `${PATHS.icons}/card-back.png`;
const HAND_SIZE = 5;

const RESULT = Object.freeze({
  WIN: "win",
  LOSE: "lose",
  DRAW: "draw",
});

// ----------------------------------------------------------------------------
// Estado
// ----------------------------------------------------------------------------

const state = {
  score: { wins: 0, losses: 0 },
  playerCardId: null,
  cpuCardId: null,
  locked: false, // impede jogadas durante uma rodada em andamento
};

// ----------------------------------------------------------------------------
// Referências do DOM
// ----------------------------------------------------------------------------

const dom = {
  bgm: document.getElementById("bgm"),
  scorePoints: document.getElementById("score-points"),
  playerCards: document.getElementById("player-cards"),
  cpuCards: document.getElementById("cpu-cards"),
  playerFieldCard: document.getElementById("player-field-card"),
  cpuFieldCard: document.getElementById("cpu-field-card"),
  stateMessage: document.getElementById("state-message"),
  nextDuelButton: document.getElementById("next-duel"),
  cardImage: document.getElementById("card-image"),
  cardName: document.getElementById("card-name"),
  cardType: document.getElementById("card-type"),
};

// ----------------------------------------------------------------------------
// Helpers puros
// ----------------------------------------------------------------------------

const getCardById = (id) => CARDS.find((card) => card.id === id);

const randomCardId = () => CARDS[Math.floor(Math.random() * CARDS.length)].id;

/** Monta uma "mão" de ids aleatórios. */
const drawHand = (size) =>
  Array.from({ length: size }, () => randomCardId());

/**
 * Decide o resultado do ponto de vista do jogador.
 * @returns {"win" | "lose" | "draw"}
 */
function duel(playerId, cpuId) {
  if (playerId === cpuId) return RESULT.DRAW;
  const playerCard = getCardById(playerId);
  return playerCard.winOf.includes(cpuId) ? RESULT.WIN : RESULT.LOSE;
}

// ----------------------------------------------------------------------------
// Render / DOM
// ----------------------------------------------------------------------------

function updateScore() {
  dom.scorePoints.textContent = `Vitórias: ${state.score.wins} | Derrotas: ${state.score.losses}`;
}

function showCardDetails(cardId) {
  const card = getCardById(cardId);
  dom.cardImage.src = card.img;
  dom.cardImage.alt = `Carta ${card.name}`;
  dom.cardImage.classList.remove("is-hidden");
  dom.cardName.textContent = card.name;
  dom.cardType.textContent = `Tipo: ${card.type}`;
}

function clearCardDetails() {
  dom.cardImage.src = "";
  dom.cardImage.alt = "";
  dom.cardImage.classList.add("is-hidden");
  dom.cardName.textContent = "Selecione";
  dom.cardType.textContent = "uma carta";
}

/** Cria o elemento visual de uma carta da mão do jogador. */
function createPlayerCardElement(cardId, index) {
  const card = getCardById(cardId);
  const img = document.createElement("img");

  img.src = card.img;
  img.alt = `Carta jogável: ${card.name}`;
  img.classList.add("card", "card--hand");
  img.dataset.cardId = String(cardId);
  img.setAttribute("role", "button");
  img.setAttribute("tabindex", "0");
  img.setAttribute("aria-label", `Jogar ${card.name}`);

  const play = () => onPlayerPlay(cardId);

  img.addEventListener("click", play);
  img.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      play();
    }
  });
  img.addEventListener("mouseover", () => showCardDetails(cardId));

  // leve atraso em cascata para a entrada das cartas
  img.style.animationDelay = `${index * 60}ms`;
  return img;
}

/** Cria uma carta virada (card-back) para o lado da CPU. */
function createCpuCardElement(index) {
  const img = document.createElement("img");
  img.src = CARD_BACK;
  img.alt = "Carta do oponente";
  img.classList.add("card", "card--back");
  img.style.animationDelay = `${index * 60}ms`;
  return img;
}

function renderHands() {
  dom.playerCards.innerHTML = "";
  dom.cpuCards.innerHTML = "";

  drawHand(HAND_SIZE).forEach((cardId, index) => {
    dom.playerCards.appendChild(createPlayerCardElement(cardId, index));
  });

  for (let index = 0; index < HAND_SIZE; index += 1) {
    dom.cpuCards.appendChild(createCpuCardElement(index));
  }
}

function renderPlayedCards(playerId, cpuId) {
  const playerCard = getCardById(playerId);
  const cpuCard = getCardById(cpuId);

  dom.playerFieldCard.innerHTML = `<img class="card card--played" src="${playerCard.img}" alt="Sua carta: ${playerCard.name}" />`;
  dom.cpuFieldCard.innerHTML = `<img class="card card--played" src="${cpuCard.img}" alt="Carta do oponente: ${cpuCard.name}" />`;
}

function renderResult(result) {
  const messages = {
    [RESULT.WIN]: { text: "VOCÊ VENCEU!", className: "state-message--win" },
    [RESULT.LOSE]: { text: "VOCÊ PERDEU!", className: "state-message--lose" },
    [RESULT.DRAW]: { text: "EMPATE!", className: "state-message--draw" },
  };

  const { text, className } = messages[result];
  dom.stateMessage.textContent = text;
  dom.stateMessage.className = `state-message ${className}`;
}

// ----------------------------------------------------------------------------
// Áudio
// ----------------------------------------------------------------------------

function playResultSound(result) {
  if (result === RESULT.DRAW) return;
  const file = result === RESULT.WIN ? "win.wav" : "lose.wav";
  const audio = new Audio(`./src/assets/audios/${file}`);
  audio.volume = 0.6;
  audio.play().catch(() => {
    /* navegador pode bloquear autoplay; ignoramos silenciosamente */
  });
}

function startBackgroundMusic() {
  if (!dom.bgm) return;
  dom.bgm.volume = 0.25;
  dom.bgm.play().catch(() => {
    /* autoplay bloqueado: a música inicia no primeiro clique (ver bootstrap) */
  });
}

// ----------------------------------------------------------------------------
// Fluxo do jogo
// ----------------------------------------------------------------------------

function onPlayerPlay(cardId) {
  if (state.locked) return; // já há uma rodada em andamento
  state.locked = true;

  state.playerCardId = cardId;
  state.cpuCardId = randomCardId();

  // esconde as mãos enquanto as cartas vão para o campo
  dom.playerCards.innerHTML = "";
  dom.cpuCards.innerHTML = "";

  renderPlayedCards(state.playerCardId, state.cpuCardId);

  const result = duel(state.playerCardId, state.cpuCardId);

  if (result === RESULT.WIN) state.score.wins += 1;
  if (result === RESULT.LOSE) state.score.losses += 1;

  updateScore();
  renderResult(result);
  playResultSound(result);

  dom.nextDuelButton.classList.remove("is-hidden");
}

function resetDuel() {
  state.playerCardId = null;
  state.cpuCardId = null;
  state.locked = false;

  dom.playerFieldCard.innerHTML = "";
  dom.cpuFieldCard.innerHTML = "";
  dom.stateMessage.textContent = "";
  dom.stateMessage.className = "state-message";
  dom.nextDuelButton.classList.add("is-hidden");

  clearCardDetails();
  renderHands();
}

// ----------------------------------------------------------------------------
// Bootstrap
// ----------------------------------------------------------------------------

function init() {
  updateScore();
  clearCardDetails();
  renderHands();

  dom.nextDuelButton.addEventListener("click", resetDuel);

  // Alguns navegadores só permitem áudio após a 1ª interação do usuário.
  const unlockAudio = () => {
    startBackgroundMusic();
    document.removeEventListener("click", unlockAudio);
  };
  document.addEventListener("click", unlockAudio);
  startBackgroundMusic();
}

init();
