const grid = document.querySelector(".grid");
const timer = document.querySelector(".timer");

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
const qtCartas = 10;

const createElemment = (tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  return element;
};

let firstCard = null;
let secondCard = null;
let revealedCards = [];
let playerName = "";

const checkName = () => {
  const urlParams = new URLSearchParams(window.location.search);
  playerName = urlParams.get("nome");

  if (!playerName) {
    window.location.href = "/";
  }
};

const checkEndGame = async () => {
  const disabledCards = document.querySelectorAll(".disable-card");

  if (disabledCards.length === qtCartas * 2) {
    clearInterval(this.loop);
    const time = Number(timer.innerHTML);
    alert(`Parabéns, seu tempo foi: ${time}!`);

    await fetch("/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: playerName, time }),
    });
    getScoreboard();
  }
};

const checkCards = () => {
  const cardsEls = grid.getElementsByClassName("card");
  const cards = [cardsEls[firstCard], cardsEls[secondCard]];

  const firstCartaFront = cartas[firstCard];
  const secondCartaFront = cartas[secondCard];

  if (firstCartaFront === secondCartaFront) {
    cards.forEach((card) => {
      card.firstChild.classList.add("disable-card");
    });

    setTimeout(() => {
      firstCard = null;
      secondCard = null;
    }, 100);

    checkEndGame();
  } else {
    setTimeout(() => {
      cards.forEach((card) => {
        card.classList.remove("reveal-card");
      });

      firstCard = null;
      secondCard = null;
    }, 500);
  }
};

const revealCard = (index) => {
  const card = grid.getElementsByClassName("card")?.[index];

  if (card.firstChild.className.includes("disable-card")) {
    return;
  }

  if (firstCard === null) {
    card.classList.add("reveal-card");
    firstCard = index;
  } else if (firstCard !== index && secondCard === null) {
    card.classList.add("reveal-card");
    secondCard = index;

    checkCards();
  }
};

const createCard = (cartaFront, index) => {
  const card = createElemment("div", "card");
  const front = createElemment("div", "face front");
  const back = createElemment("div", "face back");

  front.style.backgroundImage = `url(../images/programacao/${cartaFront}.png)`;
  card.appendChild(front);
  card.appendChild(back);

  card.addEventListener("click", () => revealCard(index));

  return card;
};

let cartas;

const loadGame = () => {
  cartas = cartasFront
    .sort(() => Math.random() - 0.5)
    .filter((_, index) => index < qtCartas);

  cartas = [...cartas, ...cartas];

  cartas.sort(() => Math.random() - 0.5);

  cartas.forEach((cartaFront, index) => {
    const card = createCard(cartaFront, index);
    grid.appendChild(card);
  });
};
const startTimer = () => {
  this.loop = setInterval(() => {
    const currentTime = Number(timer.innerHTML);
    timer.innerHTML = currentTime + 1;
  }, 1000);
};

const getScoreboard = async () => {
  try {
    const response = await fetch("/players");
    if (!response.ok) {
      throw new Error("Erro ao buscar os jogadores");
    }
    const players = await response.json();
    const rankingList = document.getElementById("ranking");

    rankingList.innerHTML = "";

    const firstLi = document.createElement("li");
    const nome = document.createElement("span");
    const tempo = document.createElement("span");
    nome.textContent = `Nome`;
    tempo.textContent = `Tempo`;
    firstLi.classList.add("liTitle");
    firstLi.appendChild(nome);
    firstLi.appendChild(tempo);
    rankingList.appendChild(firstLi);

    players.forEach((player, index) => {
      const listItem = document.createElement("li");
      const nameSpan = document.createElement("span");
      const timeSpan = document.createElement("span");
      nameSpan.textContent = `${index + 1}. ${player.name}`;
      timeSpan.textContent = `${player.time}`;
      listItem.appendChild(nameSpan);
      listItem.appendChild(timeSpan);
      rankingList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Erro ao buscar os jogadores:", error);
  }
};

checkName();
startTimer();
loadGame();
getScoreboard();
