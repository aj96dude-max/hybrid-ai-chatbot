import { LlamaContext } from 'llama.rn';
import { ModelManagerService } from './ModelManagerService';

let llamaContext = null;

export const RapidEngineService = {
  initContext: async () => {
    if (llamaContext) return true;
    
    const exists = await ModelManagerService.checkModelExists();
    if (!exists) {
      throw new Error('Model is not downloaded.');
    }

    const path = ModelManagerService.getModelPath();
    
    // Hardware accelerated inference via llama.cpp
    llamaContext = await LlamaContext.create({
      model: path,
      contextSize: 2048,
    });
    
    return true;
  },

  streamCompletion: async (messages, onToken) => {
    try {
      await RapidEngineService.initContext();
      
      // Formatting context for ChatML format (assuming Qwen/Llama-3 architecture)
      let prompt = '';
      messages.forEach(m => {
        const role = m.role === 'user' ? 'user' : 'assistant';
        prompt += `<|im_start|>${role}\n${m.text}<|im_end|>\n`;
      });
      prompt += '<|im_start|>assistant\n';

      await llamaContext.completion({
        prompt,
        n_predict: 512,
        temperature: 0.7,
      }, (data) => {
        if (data.token) {
          onToken(data.token);
        }
      });
      
    } catch (error) {
      console.error('RapidEngine Error:', error);
      onToken('\n[Rapid Mode Error: ' + error.message + ']');
    }
  }
};
