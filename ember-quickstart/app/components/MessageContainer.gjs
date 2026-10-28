import Component from '@glimmer/component';
import MessageBubble from './MessageBubble.gjs';
import TypingIndicator from './TypingIndicator.gjs';

export default class MessageContainer extends Component {
  <template>
    <div class="chat-mensagens" aria-live="polite">
      {{#each @mensagens as |mensagem|}}
        <MessageBubble @mensagem={{mensagem}} />
      {{/each}}

      {{#if @carregando}}
        <TypingIndicator />
      {{/if}}
    </div>
  </template>
}