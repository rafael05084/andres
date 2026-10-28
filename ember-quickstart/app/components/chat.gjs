
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import Titulo from './titulo';

export default class ChatComponent extends Component {
  @tracked entrada = '';
  @tracked mensagens = [];
  @tracked carregando = false;

  atualizarEntrada = (event) => {
    this.entrada = event.target.value;
  };

  adicionarMensagem(texto, tipo = 'bot', imagem = null) {
    this.mensagens = [
      ...this.mensagens,
      {
        id: this.mensagens.length + 1,
        texto,
        tipo,
        imagem
      }
    ];
  }

  async obterPokemon(nome) {
    const resposta = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`
    );

    if (!resposta.ok) {
      throw new Error('Pokémon não encontrado');
    }

    return await resposta.json();
  }

  async buscarPokemon(nome) {
    try {
      const pokemon = await this.obterPokemon(nome);

      const tipos = pokemon.types
        .map(item => item.type.name)
        .join(' / ');

      const imagem =
        pokemon.sprites.other['official-artwork'].front_default;

      const mensagem = `Encontrei!

Nome: ${pokemon.name}
Altura: ${pokemon.height / 10} m
Peso: ${pokemon.weight / 10} kg
Tipo: ${tipos}`;

      this.adicionarMensagem(mensagem, 'bot', imagem);

    } catch (erro) {
      this.adicionarMensagem(
        erro.message === 'Pokémon não encontrado'
          ? 'Não encontrei esse Pokémon.'
          : 'Não consegui acessar a PokéAPI.'
      );

      console.error(erro);
    }
  }

  calcularForca(pokemon) {
    const hp = pokemon.stats[0].base_stat;
    const ataque = pokemon.stats[1].base_stat;
    const defesa = pokemon.stats[2].base_stat;
    const velocidade = pokemon.stats[5].base_stat;

    return hp + ataque + defesa + velocidade;
  }

  async compararPokemon(nome1, nome2) {
    const ash1 = nome1 === 'pikachu do ash';
    const ash2 = nome2 === 'pikachu do ash';

    const api1 = ash1 ? 'pikachu' : nome1;
    const api2 = ash2 ? 'pikachu' : nome2;

    try {
      const [pokemon1, pokemon2] = await Promise.all([
        this.obterPokemon(api1),
        this.obterPokemon(api2)
      ]);

      if (ash1 || ash2) {
        this.adicionarMensagem(
          `É O PIKACHU DO ASH! ⚡

Os atributos não importam mais.
O poder do protagonismo foi ativado!

PIKACHU É O VENCEDOR!`
        );
        return;
      }

      const forca1 = this.calcularForca(pokemon1);
      const forca2 = this.calcularForca(pokemon2);

      let vencedor;

      if (forca1 > forca2) {
        vencedor = pokemon1.name;
      } else if (forca2 > forca1) {
        vencedor = pokemon2.name;
      } else {
        vencedor = 'Empate';
      }

      let resultado = `COMPARAÇÃO ⚔️

${pokemon1.name}
Força: ${forca1}

${pokemon2.name}
Força: ${forca2}

`;

      if (vencedor === 'Empate') {
        resultado += 'Pela nossa regra, temos um empate!';
      } else {
        resultado += `Pela nossa regra, ${vencedor} venceria!`;
      }

      this.adicionarMensagem(resultado);

    } catch (erro) {
      this.adicionarMensagem(
        'Não consegui encontrar um dos Pokémon ou ocorreu um erro.'
      );

      console.error(erro);
    }
  }

  enviarMensagem = async (event) => {
    event.preventDefault();

    if (this.carregando) return;

    const texto = this.entrada.toLowerCase().trim();

    if (!texto) return;

    this.entrada = '';
    this.adicionarMensagem(texto, 'usuario');

    if (['oi', 'olá', 'ola'].includes(texto)) {
      this.adicionarMensagem(
        'Olá! Qual Pokémon você quer conhecer?'
      );
      return;
    }

    if (['obrigado', 'obrigada', 'valeu'].includes(texto)) {
      this.adicionarMensagem('Por nada!');
      return;
    }

    if (['ajuda', 'comandos', 'como funciona'].includes(texto)) {
      this.adicionarMensagem(
        `Comandos disponíveis:

• Digite o nome de um Pokémon: pikachu
• Compare: charizard vs blastoise
• Pergunte: quem ganha mewtwo ou mew?
• Experimente: pikachu do ash vs arceus`
      );
      return;
    }

    let nomes = null;

    if (texto.includes(' vs ')) {
      nomes = texto.split(' vs ');
    } else if (
      texto.startsWith('quem ganha ') &&
      texto.includes(' ou ')
    ) {
      nomes = texto
        .replace(/^quem ganha\s+/, '')
        .replace(/\?$/, '')
        .split(' ou ');
    }

    this.carregando = true;

    try {
      if (nomes) {
        if (
          nomes.length !== 2 ||
          nomes.some(nome => !nome.trim())
        ) {
          this.adicionarMensagem(
            'Formato inválido. Exemplo: pikachu vs charizard'
          );
        } else {
          await this.compararPokemon(
            nomes[0].trim(),
            nomes[1].trim()
          );
        }
      } else {
        await this.buscarPokemon(texto);
      }
    } finally {
      this.carregando = false;
    }
  };

  <template>
    <div class="chat-container">

      <Titulo />

      <div class="chat-mensagens" aria-live="polite">
        {{#each this.mensagens as |mensagem|}}
          <div class="mensagem {{mensagem.tipo}}">
            <div>{{mensagem.texto}}</div>

            {{#if mensagem.imagem}}
              <img
                src={{mensagem.imagem}}
                alt="Imagem do Pokémon"
                class="pokemon-img"
              />
            {{/if}}
          </div>
        {{/each}}

        {{#if this.carregando}}
          <div class="mensagem bot">
            Buscando Pokémon...
          </div>
        {{/if}}
      </div>

      <form {{on "submit" this.enviarMensagem}}>
        <input
          type="text"
          placeholder="Digite um Pokémon..."
          value={{this.entrada}}
          {{on "input" this.atualizarEntrada}}
        />

        <button type="submit" disabled={{this.carregando}}>
          {{if this.carregando "Aguarde..." "Enviar"}}
        </button>
      </form>
    </div>
  </template>
}
