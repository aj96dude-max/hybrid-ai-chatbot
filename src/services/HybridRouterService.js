import { useChatStore } from '../store/useChatStore';
import { ProEngineService } from './ProEngineService';
import { RapidEngineService } from './RapidEngineService';
import { ModelManagerService } from './ModelManagerService';

let currentAbortController = null;

export const HybridRouterService = {
  abortGeneration() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
    const store = useChatStore.getState();
    if (store.mode === 'rapid') {
      RapidEngineService.stop();
    }
    store.setIsTyping(false);
  },

  async submitPrompt(prompt) {
    const store = useChatStore.getState();
    const mode = store.mode;
    
    // Check local model requirements before adding user message
    if (mode === 'rapid') {
      const exists = await ModelManagerService.checkModelExists();
      if (!exists) {
        // Trigger background download and notify user
        store.addMessage({
          id: Date.now().toString(),
          role: 'bot',
          text: '[System] Local model is missing. Initializing secure download...',
        });
        await ModelManagerService.downloadModel();
        return; // Halt inference until download is done. User must re-prompt.
      }
    }
    
    // 1. Add User Message
    store.addMessage({
      id: Date.now().toString(),
      role: 'user',
      text: prompt.trim(),
    });

    // 2. Add Empty Bot Message
    const botMessageId = (Date.now() + 1).toString();
    store.addMessage({
      id: botMessageId,
      role: 'bot',
      text: '',
    });

    const isFirstMessage = store.messages.length <= 2;
    if (isFirstMessage) {
      // Fire and forget auto title
      HybridRouterService.generateAutoTitle(prompt, store.activeSessionId);
    }

    store.setIsTyping(true);
    
    currentAbortController = new AbortController();
    const abortSignal = currentAbortController.signal;

    const currentMessages = useChatStore.getState().messages;

    const onToken = (token) => {
      useChatStore.getState().updateBotMessage(botMessageId, token);
    };

    try {
      if (mode === 'pro') {
        await ProEngineService.streamCompletion(currentMessages, onToken, abortSignal);
      } else {
        await RapidEngineService.streamCompletion(currentMessages, onToken);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation aborted gracefully');
      } else {
        console.error('Router execution failed:', error);
        useChatStore.getState().setBotMessageError(botMessageId, 'Error: ' + error.message);
      }
    } finally {
      if (useChatStore.getState().isTyping) {
        useChatStore.getState().setIsTyping(false);
      }
      currentAbortController = null;
    }
  },

  async retryPrompt() {
    const store = useChatStore.getState();
    const messages = store.messages;
    if (messages.length < 2) return;
    
    // The last message is the bot error, the one before is the user prompt.
    const lastMessage = messages[messages.length - 1];
    const userMessage = messages[messages.length - 2];
    
    if (lastMessage.role === 'bot' && userMessage.role === 'user') {
      // We need to pop both messages from state and resubmit
      store.popMessages(2);
      await HybridRouterService.submitPrompt(userMessage.text);
    }
  },

  async generateAutoTitle(prompt, sessionId) {
    const store = useChatStore.getState();
    if (store.mode === 'rapid') {
      // In rapid mode we just use a generic title or synchronous fallback for now to avoid interrupting the main thread or causing context clashes
      const words = prompt.split(' ').slice(0, 4).join(' ');
      store.renameSession(sessionId, words + (prompt.split(' ').length > 4 ? '...' : ''));
      return;
    }

    // Use Pro Engine for auto-titling if in Pro Mode
    try {
      let generatedTitle = '';
      const onToken = (token) => {
        generatedTitle += token;
      };
      
      const titlePrompt = [
        { role: 'user', text: `Summarize this prompt in 3-4 words max for a chat title. Do not use quotes. Prompt: "${prompt}"` }
      ];
      
      // Override system prompt temporarily by not passing it or we can just send it raw
      await ProEngineService.streamCompletion(titlePrompt, onToken, null);
      
      if (generatedTitle.trim()) {
        store.renameSession(sessionId, generatedTitle.replace(/["']/g, '').trim());
      }
    } catch (e) {
      console.warn('Auto-title failed', e);
      // Fallback
      const words = prompt.split(' ').slice(0, 4).join(' ');
      store.renameSession(sessionId, words + '...');
    }
  }
};
