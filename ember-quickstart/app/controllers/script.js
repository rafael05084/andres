async function enviarMensagem() {

    const input = document.getElementById("entrada");
    const mensagem = input.value.trim();

    if (mensagem === "") {
        return;
    }

    adicionarMensagem(mensagem, "usuario");

    input.value = "";

    await processarMensagem(mensagem);
}

async function processarMensagem(mensagem) {

    // Corrigido para minúsculas
    const texto = mensagem.toLowerCase().trim();

    if (
        texto === "oi" ||
        texto === "olá" ||
        texto === "ola"
    ) {

        adicionarMensagem(
            "Olá! Qual Pokémon você quer conhecer?",
            "bot"
        );

        return;
    }

    if (
        texto === "obrigado" ||
        texto === "obrigada" ||
        texto === "valeu"
    ) {

        adicionarMensagem(
            "Por nada!",
            "bot"
        );

        return;
    }

    if (texto.includes(" vs ")) {

        const nomes = texto.split(" vs ");

        const pokemon1 = nomes[0].trim();
        const pokemon2 = nomes[1].trim();

        await compararPokemon(
            pokemon1,
            pokemon2
        );

        return;
    }

    if (
        texto.includes("quem ganha") &&
        texto.includes(" ou ")
    ) {

        let pergunta = texto.replace(
            "quem ganha",
            ""
        );

        pergunta = pergunta.replace(
            "?",
            ""
        );

        const nomes = pergunta.split(" ou ");

        const pokemon1 = nomes[0].trim();
        const pokemon2 = nomes[1].trim();

        await compararPokemon(
            pokemon1,
            pokemon2
        );

        return;
    }

    // NOVA REGRA ADICIONADA: Menu de ajuda
    if (
        texto === "ajuda" ||
        texto === "comandos" ||
        texto === "como funciona"
    ) {

        adicionarMensagem(
            "Comandos disponíveis:\n" +
            "• Digite o nome de um Pokémon (ex: pikachu)\n" +
            "• Compare dois Pokémon (ex: charizard vs blastoise)\n" +
            "• Pergunta (ex: quem ganha mewtwo ou mew?)",
            "bot"
        );

        return;
    }

    await buscarPokemon(texto);
}

async function buscarPokemon(nome) {

    try {

        const resposta = await fetch(
            "https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(nome)
        );

        if (!resposta.ok) {

            adicionarMensagem(
                "Não encontrei esse Pokémon.",
                "bot"
            );

            return;
        }

        const pokemon = await resposta.json();

        const nomePokemon = pokemon.name;

        // PokéAPI entrega altura em decímetros (10 dm = 1 m)
        const altura = pokemon.height / 10;

        const peso = pokemon.weight / 10;

        const tipos = pokemon.types
            .map(item => item.type.name)
            .join(" / ");

        const imagem =
            pokemon.sprites.other[
                "official-artwork"
            ].front_default;

        const mensagem = `
Encontrei!

Nome: ${nomePokemon}
Altura: ${altura} m
Peso: ${peso} kg
Tipo: ${tipos}
        `;

        adicionarPokemon(
            mensagem,
            imagem
        );

    }

    catch (erro) {

        adicionarMensagem(
            "Não consegui acessar a PokéAPI.",
            "bot"
        );

        console.log(erro);
    }
}

async function compararPokemon(nome1, nome2) {

    const pikachuDoAsh =
        nome1.includes("pikachu do ash") ||
        nome2.includes("pikachu do ash");

    const nomeAPI1 =
        nome1.replace(
            "pikachu do ash",
            "pikachu"
        );

    const nomeAPI2 =
        nome2.replace(
            "pikachu do ash",
            "pikachu"
        );

    try {

        const resposta1 = await fetch(
            "https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(nomeAPI1)
        );

        const resposta2 = await fetch(
            "https://pokeapi.co/api/v2/pokemon/" + encodeURIComponent(nomeAPI2)
        );

        if (!resposta1.ok || !resposta2.ok) {

            adicionarMensagem(
                "Não consegui encontrar um dos Pokémon.",
                "bot"
            );

            return;
        }

        const pokemon1 = await resposta1.json();
        const pokemon2 = await resposta2.json();

        if (pikachuDoAsh) {

            adicionarMensagem(
                "É O PIKACHU DO ASH!\n\n" +
                "Os atributos não importam mais.\n" +
                "O poder do protagonismo foi ativado!\n\n" +
                "PIKACHU É O VENCEDOR!",
                "bot"
            );

            return;
        }

        const forca1 = calcularForca(pokemon1);
        const forca2 = calcularForca(pokemon2);

        let vencedor;

        if (forca1 > forca2) {

            vencedor = pokemon1.name;

        } else if (forca2 > forca1) {

            vencedor = pokemon2.name;

        } else {

            vencedor = "Empate";
        }

        let resultado = `
COMPARAÇÃO

${pokemon1.name}
Força: ${forca1}

${pokemon2.name}
Força: ${forca2}

`;

        if (vencedor === "Empate") {

            resultado +=
                "Pela nossa regra, temos um empate!";

        } else {

            resultado +=
                `Pela nossa regra, ${vencedor} venceria!`;
        }

        adicionarMensagem(
            resultado,
            "bot"
        );

    }

    catch (erro) {

        adicionarMensagem(
            "Ocorreu um erro durante a comparação.",
            "bot"
        );

        console.log(erro);
    }
}

function calcularForca(pokemon) {

    const hp =
        pokemon.stats[0].base_stat;

    const ataque =
        pokemon.stats[1].base_stat;

    const defesa =
        pokemon.stats[2].base_stat;

    const velocidade =
        pokemon.stats[4].base_stat;

    return (
        hp +
        ataque +
        defesa +
        velocidade
    );
}

function adicionarMensagem(texto, tipo) {

    const novaMensagem =
        document.createElement("div");

    novaMensagem.classList.add(
        "mensagem",
        tipo
    );

    novaMensagem.innerText = texto;

    const mensagens =
        document.getElementById("mensagens");

    mensagens.appendChild(
        novaMensagem
    );

    mensagens.scrollTop =
        mensagens.scrollHeight;
}

function adicionarPokemon(texto, imagem) {

    const novaMensagem =
        document.createElement("div");

    novaMensagem.classList.add(
        "mensagem",
        "bot"
    );

    const descricao =
        document.createElement("div");

    descricao.innerText = texto;

    const img =
        document.createElement("img");

    img.src = imagem;

    img.classList.add(
        "pokemon-img"
    );

    novaMensagem.appendChild(descricao);
    novaMensagem.appendChild(img);

    const mensagens =
        document.getElementById("mensagens");

    mensagens.appendChild(novaMensagem);

    mensagens.scrollTop =
        mensagens.scrollHeight;
}

document
    .getElementById("entrada")
    .addEventListener(
        "keydown",
        function (event) {

            // Alterado de "Escape" para "Enter"
            if (event.key === "Enter") {

                enviarMensagem();

            }

        }
    );