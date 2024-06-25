const form = document.getElementById("login-form");

const handleSubmit = (event) => {
  event.preventDefault();

  localStorage.setItem("player", inputNome.value);
};

form.addEventListener("submit", handleSubmit);

const botaoLocal = document.getElementById("local-button");
const botaoOnline = document.getElementById("online-button");
const botaoJogar = document.getElementById("start-button");
const botaoEntrarSala = document.getElementById("join-button");
const botaoCriarSala = document.getElementById("create-button");
const inputNome = document.getElementById("nome");
const inputSala = document.getElementById("sala");
const errorCardNome = document.getElementById("error-card-nome");
const errorCardSala = document.getElementById("error-card-sala");
const salaForm = document.getElementById("sala-form-area");
const anotherText = document.getElementById("another-text");
const rankingBoard = document.getElementById("ranking-board");

let online = false;

const updateMode = (isOnline) => {
  online = isOnline;

  if (online) {
    botaoLocal.classList.remove("selected");
    botaoOnline.classList.add("selected");
    salaForm.classList.remove("hidden");
    botaoJogar.classList.add("hidden");
    botaoEntrarSala.classList.remove("hidden");
    anotherText.classList.remove("hidden");
    botaoCriarSala.classList.remove("hidden");
    rankingBoard.classList.add("hidden");

    inputSala.removeAttribute("disabled");
    form.setAttribute("action", "/memory-game/online");
  } else {
    botaoLocal.classList.add("selected");
    botaoOnline.classList.remove("selected");
    salaForm.classList.add("hidden");
    botaoJogar.classList.remove("hidden");
    botaoEntrarSala.classList.add("hidden");
    anotherText.classList.add("hidden");
    botaoCriarSala.classList.add("hidden");
    rankingBoard.classList.remove("hidden");

    inputSala.setAttribute("disabled", "");
    form.setAttribute("action", "/memory-game");
  }
};

botaoLocal.addEventListener("click", () => updateMode(false));
botaoOnline.addEventListener("click", () => updateMode(true));

botaoJogar.addEventListener("click", function (event) {
  event.preventDefault();

  const nome = inputNome.value.trim();

  if (nome === "") {
    errorCardNome.style.display = "block";
    setTimeout(function () {
      errorCardNome.style.display = "none";
    }, 3000);
    return;
  }

  form.submit();
});

botaoEntrarSala.addEventListener("click", async function (event) {
  event.preventDefault();

  const nome = inputNome.value.trim();

  if (nome === "") {
    errorCardNome.style.display = "block";
    setTimeout(function () {
      errorCardNome.style.display = "none";
    }, 3000);
    return;
  }

  const code = inputSala.value.trim();

  const sala = await fetch(`/room?code=${code}`)
    .then((res) => res.json())
    .catch(() => null);

  if (!sala) {
    errorCardSala.style.display = "block";
    setTimeout(function () {
      errorCardSala.style.display = "none";
    }, 3000);
    return;
  }

  form.submit();
});

botaoCriarSala.addEventListener("click", function (event) {
  event.preventDefault();

  if (inputNome.value.trim() === "") {
    errorCardNome.style.display = "block";
    setTimeout(function () {
      errorCardNome.style.display = "none";
    }, 3000);
    return;
  }

  inputSala.value = "";
  form.submit();
});

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

const url = new URL(window.location.href);
const searchParams = url.searchParams;
const sala = searchParams.get("sala");

if (sala) {
  updateMode(true);
  inputSala.value = sala;
}

getScoreboard();
