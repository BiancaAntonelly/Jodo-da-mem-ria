const getScoreboard = async () => {
    try {
        const response = await fetch("/players");
        if (!response.ok) {
            throw new Error("Erro ao buscar os jogadores");
        }
        const players = await response.json();

        // Ordenar os jogadores pelo valor da chave 'time' do menor para o maior
        const sortedPlayers = players.sort((a, b) => a.time - b.time);

        // Selecionar a ul pelo ID
        const rankingList = document.getElementById("ranking");

        // Limpar qualquer conteúdo existente na ul
        rankingList.innerHTML = "";

        const firstLi = document.createElement('li');
        const nome = document.createElement('span');
        const tempo = document.createElement('span');
        nome.textContent = `Nome`;
        tempo.textContent = `Tempo`;
        firstLi.classList.add('liTitle');
        firstLi.appendChild(nome);
        firstLi.appendChild(tempo);
        rankingList.appendChild(firstLi);


        // Criar e adicionar os li para cada jogador
        sortedPlayers.forEach(player => {
            const listItem = document.createElement("li");
            const nameSpan = document.createElement('span')
            const timeSpan = document.createElement('span')
            nameSpan.textContent = `${player.name}`;
            timeSpan.textContent = `${player.time}`;
            listItem.appendChild(nameSpan);
            listItem.appendChild(timeSpan);
            rankingList.appendChild(listItem);
        });

        console.log("Lista de jogadores ordenada:", sortedPlayers);
    } catch (error) {
        console.error("Erro ao buscar os jogadores:", error);
    }
};

getScoreboard();
