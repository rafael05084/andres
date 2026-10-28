import Component from '@glimmer/component';
import { on } from '@ember/modifier';

export default class ChatInput extends Component {
  <template>
    <form {{on "submit" @onSubmit}}>
      <input
        type="text"
        placeholder="Digite um Pokémon..."
        value={{@entrada}}
        {{on "input" @onInput}}
      />

      <button type="submit" disabled={{@carregando}}>
        {{if @carregando "Aguarde..." "Enviar"}}
      </button>
    </form>
  </template>
}