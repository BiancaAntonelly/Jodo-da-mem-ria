const grid = document.querySelector(".grid");
const turn = document.querySelector(".turn");

const cartasFront = [
  "carta-front-css",
  "carta-front-html",
  "carta-front-java",
  "carta-front-javascript",
  "carta-front-node",
  "carta-front-php",
  "carta-front-r",
  "carta-front-scala",
  "carta-front-swift",
  "carta-front-thymeleaf",
  "carta-front-typescript",
  "carta-front-angular",
  "carta-front-c++",
  "carta-front-python",
  "carta-front-react",
  "carta-front-ruby",
];
const qtCartas = 5;

const createElemment = (tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  return element;
};

let game = {};

const checkName = () => {
  const urlParams = new URLSearchParams(window.location.search);
  playerName = urlParams.get("nome");

  if (!playerName) {
    if (sala) {
      window.location.href = "/?" + params.toString();
    } else {
      window.location.href = "/";
    }
  }
};

const createCard = (card, index) => {
  const cardEl = createElemment("div", "card");

  cardEl.addEventListener("click", () => socket.emit("flip", index));

  front = createElemment("div", "face front");
  back = createElemment("div", "face back");

  front.style.backgroundImage = `url(../images/programacao/${card.name}.png)`;
  cardEl.appendChild(front);
  cardEl.appendChild(back);

  grid.appendChild(cardEl);
};

const updateCard = (oldCard, newCard, index) => {
  const cardEl = grid.getElementsByClassName("card")?.[index];
  const front = cardEl?.getElementsByClassName("front")?.[0];

  if (oldCard.name !== newCard.name) {
    front.style.backgroundImage = `url(../images/programacao/${newCard.name}.png)`;
  }
};

const revealCard = (index) => {
  const cardEl = grid.getElementsByClassName("card")?.[index];

  cardEl.classList.add("reveal-card");
};

const unrevealCard = (index) => {
  const cardEl = grid.getElementsByClassName("card")?.[index];

  cardEl.classList.remove("reveal-card");
};

const scoreCard = (index) => {
  const cardEl = grid.getElementsByClassName("card")?.[index];
  const front = cardEl?.getElementsByClassName("front")?.[0];

  front.classList.add("disable-card");
};

const unscoreCard = (index) => {
  const cardEl = grid.getElementsByClassName("card")?.[index];
  const front = cardEl?.getElementsByClassName("front")?.[0];

  front.classList.remove("disable-card");
};

const udpateScoreboard = (players) => {
  const sortedPlayers = players.sort((a, b) => b.score - a.score);

  const rankingList = document.getElementById("ranking");
  const playersList = document.getElementById("players");

  rankingList.innerHTML = "";

  const firstLi = document.createElement("li");
  const nome = document.createElement("span");
  const score = document.createElement("span");
  nome.textContent = `Nome`;
  score.textContent = `Score`;
  firstLi.classList.add("liTitle");
  firstLi.appendChild(nome);
  firstLi.appendChild(score);
  rankingList.appendChild(firstLi);

  // Criar e adicionar os li para cada jogador
  sortedPlayers.forEach((player) => {
    const listItem = document.createElement("li");
    const nameSpan = document.createElement("span");
    const timeSpan = document.createElement("span");
    nameSpan.textContent = `${player.name}`;
    timeSpan.textContent = `${player.score}`;
    listItem.appendChild(nameSpan);
    listItem.appendChild(timeSpan);
    rankingList.appendChild(listItem);
  });
};

const updateTurn = () => {
  const finished = game.cards.every((card) => card.scored);

  if (game.started && !finished) {
    const currentPlayer = game.players.find(
      (player) => player.id === game.currentPlayerId
    );

    turn.innerHTML = `Vez de: ${currentPlayer.name}`;
  } else if (!game.started) {
    turn.innerHTML = `Aguardando início`;
  } else {
    const winner = game.players.sort((a, b) => b.score - a.score)[0];

    turn.innerHTML = `${winner.name} venceu!`;
  }
};

const updateButtons = () => {
  const finished = game.cards.every((card) => card.scored);

  if (game.started) {
    startButton.classList.add("hidden");
  } else {
    startButton.classList.remove("hidden");
  }

  if (finished) {
    playAgainButton.classList.remove("hidden");
  } else {
    playAgainButton.classList.add("hidden");
  }
};

const url = new URL(window.location.href);
const params = url.searchParams;
const nome = params.get("nome");
let sala = params.get("sala");

const updateCards = (oldGame, newGame) => {
  const maxLength = Math.max(oldGame.cards?.length || 0, newGame.cards.length);

  for (let i = 0; i < maxLength; i++) {
    const oldCard = oldGame.cards?.[i];
    const newCard = newGame.cards?.[i];

    if (!oldCard) {
      createCard(newCard, i);
    } else {
      updateCard(oldCard, newCard, i);
    }

    if (newCard.scored) {
      revealCard(i);
      scoreCard(i);
    } else {
      unscoreCard(i);

      if (i === newGame.firstCard || i === newGame.secondCard) {
        revealCard(i);
      } else {
        unrevealCard(i);
      }
    }
  }
};

const updateRoom = () => {
  const roomCode = document.getElementById("room-code");

  roomCode.innerHTML = game.roomCode;
};

const startButton = document.getElementById("start-button");
const playAgainButton = document.getElementById("play-again-button");

startButton.addEventListener("click", () => socket.emit("start"));
playAgainButton.addEventListener("click", () => socket.emit("restart"));

const updateGame = (newGame) => {
  updateCards(game, newGame);

  game = newGame;

  if (sala !== game.roomCode) {
    sala = game.roomCode;

    updateRoom();

    history.replaceState(
      "online",
      "Memory Game",
      `/memory-game/online?nome=${nome}&sala=${sala}`
    );
  }

  udpateScoreboard(game.players);

  updateTurn();

  updateButtons();
};

checkName();

const socket = io({
  query: {
    name: nome,
    roomCode: sala,
  },
});

socket.on("game", updateGame);
