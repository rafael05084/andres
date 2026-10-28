// Rafael

import Component from '@glimmer/component';

export default class MessageBubble extends Component {
  <template>
    <div class="mensagem {{@mensagem.tipo}}">
      <div>{{@mensagem.texto}}</div>

      {{#if @mensagem.imagem}}
        <img
          src={{@mensagem.imagem}}
          alt="Imagem do Pokémon"
          class="pokemon-img"
        />
      {{/if}}
    </div>
  </template>
}