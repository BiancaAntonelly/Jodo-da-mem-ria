const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const config = require("./config/config.json");

const app = express();
const port = 3000;

// Configuração da conexão com o banco de dados
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

// Middleware para analisar dados do formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "front")));

app.post("/players", async (req, res) => {
  const { name, time } = req.body;
  console.log("nome salvo:", name);
  try {
    // Insere o nome do usuário no banco de dados
    const player = await Player.create({ name, time });
    res.send(player);
  } catch (error) {
    console.error("Erro ao salvar o nome do usuário:", error);
    res.status(500).send("Erro ao salvar o nome do usuário");
  }
});

app.get("/", async (req, res) => {
  await res.sendFile(path.join(__dirname, "..", "front", "index.html"));
});

app.get("/memory-game", async (req, res) => {
  await res.sendFile(
    path.join(__dirname, "..", "front", "pages", "memoryGame.html")
  );
});

app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});
