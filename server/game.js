const cards = [
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

const qtCards = 15;

class Game {
  constructor(creatorId, creatorName) {
    this.creatorId = creatorId;
    this.roomCode = "";
    this.players = [{ id: creatorId, name: creatorName, score: 0 }];
    this.playersJoinOrder = [creatorId];
    this.playersScoreOrder = [];
    this.started = false;
    this.restarting = false;
    this.sortCards();
    this.firstCard = null;
    this.secondCard = null;
    this.winner = null;
    this.currentPlayerId = creatorId;

    for (let i = 0; i < 6; i++) {
      this.roomCode += String.fromCharCode(
        "A".charCodeAt(0) +
          Math.floor(Math.random() * ("Z".charCodeAt() - "A".charCodeAt()))
      );
    }
  }

  sortCards() {
    this.cards = cards
      .sort(() => Math.random() - 0.5)
      .filter((_, index) => index < qtCards)
      .flatMap((card) => [card, card])
      .map((card) => ({ name: card, scored: false }))
      .sort(() => Math.random() - 0.5);
  }

  join(id, name) {
    if (this.players.some((player) => player.id === id)) {
      return;
    }

    this.playersJoinOrder.push(id);

    let insertPos = this.players.findIndex(
      (player) => player.id === this.currentPlayerId
    );

    this.players = [
      ...this.players.slice(0, insertPos),
      { id, name, score: 0 },
      ...this.players.slice(insertPos),
    ];
  }

  nextTurn() {
    const index = this.players.findIndex(
      (player) => player.id === this.currentPlayerId
    );

    this.currentPlayerId = this.players[(index + 1) % this.players.length].id;
  }

  leave(id) {
    const index = this.players.findIndex((player) => player.id === id);

    if (index === -1) {
      return;
    }

    if (
      this.currentPlayerId === id &&
      (this.firstCard === null || this.secondCard === null)
    ) {
      this.nextTurn();
      this.firstCard = null;
      this.secondCard = null;
    }

    this.players.splice(index, 1);

    this.playersJoinOrder = this.playersJoinOrder.filter(
      (playerId) => playerId !== id
    );

    if (this.creatorId === id) {
      this.creatorId = this.playersJoinOrder[0];
    }
  }

  start(playerId) {
    if (playerId !== this.creatorId) {
      return;
    }

    this.started = true;
  }

  restart(playerId, callback) {
    if (playerId !== this.creatorId) {
      return;
    }

    if (!this.cards.every((card) => card.scored)) {
      return;
    }

    this.players.forEach((player) => (player.score = 0));
    this.playersScoreOrder = [];
    this.currentPlayerId = this.playersJoinOrder.includes(this.winner.id)
      ? this.winner.id
      : this.creatorId;
    this.firstCard = null;
    this.secondCard = null;
    this.winner = null;
    this.cards.forEach((card) => (card.scored = false));
    this.restarting = true;

    setTimeout(() => {
      this.restarting = false;
      this.sortCards();
      callback();
    }, 500);
  }

  flip(playerId, cardIndex, unflipCallback) {
    if (!this.started || this.restarting) {
      return;
    }

    if (
      playerId !== this.currentPlayerId ||
      this.firstCard === cardIndex ||
      this.secondCard !== null
    ) {
      return;
    }

    if (this.firstCard === null) {
      this.firstCard = cardIndex;
    } else {
      this.secondCard = cardIndex;

      if (
        this.cards[this.firstCard].name === this.cards[this.secondCard].name
      ) {
        this.players = this.players.map((player) =>
          player.id === playerId
            ? { ...player, score: player.score + 1 }
            : player
        );
        this.cards[this.firstCard].scored = true;
        this.cards[this.secondCard].scored = true;

        if (!this.playersScoreOrder.includes(playerId)) {
          this.playersScoreOrder.push(playerId);
        }

        if (this.cards.every((card) => card.scored)) {
          const maxScore = Math.max.apply(
            null,
            this.players.map((player) => player.score)
          );
          const tiedPlayers = this.players
            .filter((player) => player.score === maxScore)
            .map((player) => player.id);
          const winnerId = this.playersScoreOrder.find((playerId) =>
            tiedPlayers.includes(playerId)
          );
          this.winner = this.players.find((player) => player.id === winnerId);
        }

        setTimeout(() => {
          this.firstCard = null;
          this.secondCard = null;

          unflipCallback();
        }, 100);
      } else {
        setTimeout(() => {
          if (this.firstCard === null || this.secondCard === null) {
            return;
          }

          this.nextTurn();

          this.firstCard = null;
          this.secondCard = null;

          unflipCallback();
        }, 500);
      }
    }
  }
}

module.exports = { Game };
