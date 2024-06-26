const grid = document.querySelector(".grid");
const turn = document.querySelector(".turn");

const createElemment = (tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  return element;
};

let game = {};

const checkName = () => {
  playerName = sessionStorage.getItem("nome");

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
  const sortedPlayers = players
    .map((player) => {
      const joinIndex = game.playersJoinOrder.findIndex(
        (id) => player.id === id
      );
      const scoreIndex = game.playersScoreOrder.findIndex(
        (id) => player.id === id
      );

      return {
        ...player,
        joinIndex,
        scoreIndex,
      };
    })
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }

      if (a.scoreIndex !== -1 && b.scoreIndex !== -1) {
        return a.scoreIndex - b.scoreIndex;
      }

      return a.joinIndex - b.joinIndex;
    });

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
  if (game.started && !game.winner) {
    const currentPlayer = game.players.find(
      (player) => player.id === game.currentPlayerId
    );

    turn.innerHTML = `Vez de: ${currentPlayer.name}`;
  } else if (!game.started) {
    turn.innerHTML = `Aguardando início`;
  } else {
    turn.innerHTML = `${game.winner.name} venceu!`;
  }
};

const updateButtons = () => {
  if (game.started || game.creatorId !== socket.id) {
    startButton.classList.add("hidden");
  } else {
    startButton.classList.remove("hidden");
  }

  if (game.winner && game.creatorId === socket.id) {
    playAgainButton.classList.remove("hidden");
  } else {
    playAgainButton.classList.add("hidden");
  }
};

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
      `/memory-game/online?sala=${sala}`
    );
  }

  udpateScoreboard(game.players);

  updateTurn();

  updateButtons();
};

const url = new URL(window.location.href);
const params = url.searchParams;
let sala = params.get("sala");
checkName();

const socket = io({
  query: {
    name: playerName,
    roomCode: sala,
  },
});

socket.on("game", updateGame);
