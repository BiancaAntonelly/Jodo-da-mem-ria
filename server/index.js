require("dotenv/config");
const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const config = require("./config/config");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Game } = require("./game");

const app = express();
const port = process.env.APP_PORT;

const sequelize = new Sequelize(config.development);

const Player = sequelize.define(
  "player",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "players",
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "front")));

app.post("/players", async (req, res) => {
  const { name, time } = req.body;
  try {
    const player = await Player.create({ name, time });
    res.send(player);
  } catch (error) {
    console.error("Erro ao salvar o nome do usuário:", error);
    res.status(500).send("Erro ao salvar o nome do usuário");
  }
});

app.get("/players", async (req, res) => {
  try {
    const players = await Player.findAll({
      order: [["time", "asc"]],
      limit: 10,
    });
    res.send(players);
  } catch (error) {
    console.error("Erro ao buscar os usuários:", error);
    res.status(500).send("Erro ao buscar os usuários");
  }
});

app.get("/room", (req, res) => {
  const room = games.get(req.query.code);

  res.send(room);
});

app.get("/", async (req, res) => {
  await res.sendFile(path.join(__dirname, "..", "front", "index.html"));
});

app.get("/memory-game", async (req, res) => {
  await res.sendFile(
    path.join(__dirname, "..", "front", "pages", "memoryGame.html")
  );
});

app.get("/memory-game/online", async (req, res) => {
  await res.sendFile(
    path.resolve(__dirname, "..", "front", "pages", "online.html")
  );

  await res.sendFile(
    path.join(__dirname, "..", "front", "pages", "online.html")
  );
});

const server = createServer(app);
const io = new Server(server, {});

server.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});

const games = new Map();

io.on("connection", (socket) => {
  const { name, roomCode } = socket.handshake.query;

  let game = games.get(roomCode);

  if (!game) {
    game = new Game(socket.id, name);

    games.set(game.roomCode, game);

    socket.join(game.roomCode);
  } else {
    game.join(socket.id, name);

    socket.join(game.roomCode);
  }

  io.to(game.roomCode).emit("game", game);

  socket.on("start", () => {
    game.start(socket.id);

    io.to(game.roomCode).emit("game", game);
  });

  socket.on("restart", () => {
    game.restart(socket.id, () => io.to(game.roomCode).emit("game", game));

    io.to(game.roomCode).emit("game", game);
  });

  socket.on("flip", (index) => {
    game.flip(socket.id, index, () => io.to(game.roomCode).emit("game", game));

    io.to(game.roomCode).emit("game", game);
  });

  socket.on("disconnect", () => {
    game.leave(socket.id);

    if (game.players.length === 0) {
      games.delete(game.roomCode);
    } else {
      io.to(game.roomCode).emit("game", game);
    }
  });
});
