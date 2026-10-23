import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';

export default class PokemonChat extends Component {
  @tracked mensagens = [];
  @tracked textoEntrada = '';

  @action
  atualizarEntrada(event) {
    this.textoEntrada = event.target.value;
  }

  @action
  tratarKeyDown(event) {
    if (event.key === 'Enter') {
      this.enviarMensagem();
    }
  }

  @action
  async enviarMensagem() {
    const mensagem = this.textoEntrada.trim();

    if (mensagem === '') {
      return;
    }

    this.adicionarMensagem(mensagem, 'usuario');
    this.textoEntrada = '';

    await this.processarMensagem(mensagem);
  }

  adicionarMensagem(texto, tipo, imagem = null) {
    this.mensagens = [
      ...this.mensagens,
      { id: Date.now() + Math.random(), texto, tipo, imagem }
    ];
  }

  async processarMensagem(mensagem) {
    const texto = mensagem.toLowerCase().trim();

    if (texto === 'oi' || texto === 'olá' || texto === 'ola') {
      this.adicionarMensagem('Olá! Qual Pokémon você quer conhecer?', 'bot');
      return;
    }

    if (texto === 'obrigado' || texto === 'obrigada' || texto === 'valeu') {
      this.adicionarMensagem('Por nada!', 'bot');
      return;
    }

    if (texto === 'ajuda' || texto === 'comandos' || texto === 'como funciona') {
      this.adicionarMensagem(
        "Opções disponíveis:\n" +
        "1. Nome do Pokémon (ex: pikachu)\n" +
        "2. Comparação (ex: charizard vs blastoise)\n" +
        "3. Quem ganha (ex: quem ganha mewtwo ou mew?)",
        'bot'
      );
      return;
    }

    if (texto.includes(' vs ')) {
      const nomes = texto.split(' vs ');
      await this.compararPokemon(nomes[0].trim(), nomes[1].trim());
      return;
    }

    if (texto.includes('quem ganha') && texto.includes(' ou ')) {
      let pergunta = texto.replace('quem ganha', '').replace('?', '');
      const nomes = pergunta.split(' ou ');
      await this.compararPokemon(nomes[0].trim(), nomes[1].trim());
      return;
    }

    await this.buscarPokemon(texto);
  }

  async buscarPokemon(nome) {
    try {
      const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`);

      if (!resposta.ok) {
        this.adicionarMensagem('Não encontrei esse Pokémon.', 'bot');
        return;
      }

      const pokemon = await resposta.json();
      const altura = pokemon.height / 10;
      const peso = pokemon.weight / 10;
      const tipos = pokemon.types.map(item => item.type.name).join(' / ');
      const imagem = pokemon.sprites.other['official-artwork'].front_default;

      const texto = `Encontrei!\n\nNome: ${pokemon.name}\nAltura: ${altura} m\nPeso: ${peso} kg\nTipo: ${tipos}`;

      this.adicionarMensagem(texto, 'bot', imagem);
    } catch (erro) {
      this.adicionarMensagem('Não consegui acessar a PokéAPI.', 'bot');
      console.error(erro);
    }
  }

  async compararPokemon(nome1, nome2) {
    const pikachuDoAsh = nome1.includes('pikachu do ash') || nome2.includes('pikachu do ash');
    const nomeAPI1 = nome1.replace('pikachu do ash', 'pikachu');
    const nomeAPI2 = nome2.replace('pikachu do ash', 'pikachu');

    try {
      const [res1, res2] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nomeAPI1)}`),
        fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nomeAPI2)}`)
      ]);

      if (!res1.ok || !res2.ok) {
        this.adicionarMensagem('Não consegui encontrar um dos Pokémon.', 'bot');
        return;
      }

      const pokemon1 = await res1.json();
      const pokemon2 = await res2.json();

      if (pikachuDoAsh) {
        this.adicionarMensagem(
          "É O PIKACHU DO ASH!\n\nOs atributos não importam mais.\nO poder do protagonismo foi ativado!\n\nPIKACHU É O VENCEDOR!",
          'bot'
        );
        return;
      }

      const forca1 = this.calcularForca(pokemon1);
      const forca2 = this.calcularForca(pokemon2);

      let resultado = `COMPARAÇÃO\n\n${pokemon1.name}\nForça: ${forca1}\n\n${pokemon2.name}\nForça: ${forca2}\n\n`;

      if (forca1 > forca2) {
        resultado += `Pela nossa regra, ${pokemon1.name} venceria!`;
      } else if (forca2 > forca1) {
        resultado += `Pela nossa regra, ${pokemon2.name} venceria!`;
      } else {
        resultado += "Pela nossa regra, temos um empate!";
      }

      this.adicionarMensagem(resultado, 'bot');
    } catch (erro) {
      this.adicionarMensagem('Ocorreu um erro durante a comparação.', 'bot');
      console.error(erro);
    }
  }

  calcularForca(pokemon) {
    const hp = pokemon.stats[0].base_stat;
    const ataque = pokemon.stats[1].base_stat;
    const defesa = pokemon.stats[2].base_stat;
    const velocidade = pokemon.stats[4].base_stat;

    return hp + ataque + defesa + velocidade;
  }

  <template>
    <div class="chat-container">
      <div class="mensagens">
        {{#each this.mensagens as |msg|}}
          <div class="mensagem {{msg.tipo}}">
            <p>{{msg.texto}}</p>
            {{#if msg.imagem}}
              <img src={{msg.imagem}} alt="Pokémon" class="pokemon-img" />
            {{/if}}
          </div>
        {{/each}}
      </div>

      <div class="input-area">
        <input
          id="entrada"
          type="text"
          value={{this.textoEntrada}}
          placeholder="Digite o nome do Pokémon..."
          {{on "input" this.atualizarEntrada}}
          {{on "keydown" this.tratarKeyDown}}
        />
        <button type="button" {{on "click" this.enviarMensagem}}>Enviar</button>
      </div>
    </div>
  </template>
}