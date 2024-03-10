const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Configuração da conexão com o banco de dados
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'jogo_da_memoria',
    password: 'postgres',
    port: 5432,
});

pool.query(`
    CREATE TABLE IF NOT EXISTS users (
                                         id SERIAL PRIMARY KEY,
                                         name VARCHAR(100)
        )
`).then(() => {
    console.log('Tabela users criada com sucesso!');
}).catch(err => {
    console.error('Erro ao criar tabela users:', err);
});

// Middleware para analisar dados do formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

console.log('vai ate aqui');
app.post('/salvar-nome', async (req, res) => {
    const { nome } = req.body;
console.log('nome salvo:', nome);
    try {
        // Insere o nome do usuário no banco de dados
        await pool.query('INSERT INTO users (name) VALUES ($1)', [nome]);
        res.send('Nome do usuário salvo com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar o nome do usuário:', error);
        res.status(500).send('Erro ao salvar o nome do usuário');
    }
});

app.get('/', async (req, res) => {
    await res.sendFile('index.html');
});

app.get('/memory-game', async (req, res) => {
    await res.sendFile(path.join(__dirname, '..', 'pages/memoryGame.html'));
});

app.listen(port, () => {
    console.log(`Servidor está rodando em http://localhost:${port}`);
});
