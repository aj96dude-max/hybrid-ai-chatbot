import { useChatStore } from '../store/useChatStore';
import { ProEngineService } from './ProEngineService';
import { RapidEngineService } from './RapidEngineService';
import { ModelManagerService } from './ModelManagerService';

export const HybridRouterService = {
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

    store.setIsTyping(true);
    
    const currentMessages = useChatStore.getState().messages;

    const onToken = (token) => {
      useChatStore.getState().updateBotMessage(botMessageId, token);
    };

    try {
      if (mode === 'pro') {
        await ProEngineService.streamCompletion(currentMessages, onToken);
      } else {
        await RapidEngineService.streamCompletion(currentMessages, onToken);
      }
    } catch (error) {
      console.error('Router execution failed:', error);
      onToken('\n[Engine Failure]');
    } finally {
      store.setIsTyping(false);
    }
  }
};
