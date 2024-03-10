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
const qtCartas = 5;

const createElemment = (tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  return element;
};

let firstCard = "";
let secondCard = "";
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
  }
};

const checkCards = () => {
  const firstCartaFront = firstCard.getAttribute("data-cartaFront");
  const secondCartaFront = secondCard.getAttribute("data-cartaFront");

  if (firstCartaFront === secondCartaFront) {
    firstCard.firstChild.classList.add("disable-card");
    secondCard.firstChild.classList.add("disable-card");

    firstCard = "";
    secondCard = "";

    checkEndGame();
  } else {
    setTimeout(() => {
      firstCard.classList.remove("reveal-card");
      secondCard.classList.remove("reveal-card");

      firstCard = "";
      secondCard = "";
    }, 500);
  }
};

const revealCard = ({ target }) => {
  if (target.parentNode.className.includes("reveal-card")) {
    return;
  }
  if (firstCard === "") {
    target.parentNode.classList.add("reveal-card");
    firstCard = target.parentNode;
  } else if (secondCard === "") {
    target.parentNode.classList.add("reveal-card");
    secondCard = target.parentNode;

    checkCards();
  }
};

const createCard = (cartaFront) => {
  const card = createElemment("div", "card");
  const front = createElemment("div", "face front");
  const back = createElemment("div", "face back");

  front.style.backgroundImage = `url(../images/programacao/${cartaFront}.png)`;
  card.appendChild(front);
  card.appendChild(back);

  card.addEventListener("click", revealCard);
  card.setAttribute("data-cartaFront", cartaFront);

  return card;
};

const loadGame = () => {
  const cartas = cartasFront
    .sort(() => Math.random() - 0.5)
    .filter((_, index) => index < qtCartas);

  const duplicatedCartasFront = [...cartas, ...cartas];

  const shuffledArray = duplicatedCartasFront.sort(() => Math.random() - 0.5);

  duplicatedCartasFront.forEach((cartaFront) => {
    const card = createCard(cartaFront);
    grid.appendChild(card);
  });
};
const startTimer = () => {
  this.loop = setInterval(() => {
    const currentTime = Number(timer.innerHTML);
    timer.innerHTML = currentTime + 1;
  }, 1000);
};

checkName();
startTimer();
loadGame();
