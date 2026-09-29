import { initLlama } from 'llama.rn';
import { ModelManagerService } from './ModelManagerService';

let llamaContext = null;

export const RapidEngineService = {
  initContext: async () => {
    if (llamaContext) return true;
    
    const exists = await ModelManagerService.checkModelExists();
    if (!exists) {
      throw new Error('Model is not downloaded.');
    }

    const uriPath = ModelManagerService.getModelPath();
    const rawPath = uriPath.replace('file://', '');
    
    // VERIFY EXACT FILE SIZE BEFORE INITIALIZING
    const FileSystem = require('expo-file-system/legacy');
    const info = await FileSystem.getInfoAsync(uriPath);
    // The exact size of Qwen1.5-0.5B-Chat Q4_K_M is 388MB.
    if (!info.exists || info.size < 380 * 1024 * 1024) {
      throw new Error(`Model corrupted. Size is only ${Math.round((info.size || 0)/1024/1024)}MB. Please tap Reset Engine and re-download.`);
    }

    // Hardware accelerated inference via llama.cpp
    llamaContext = await initLlama({
      model: rawPath,
      contextSize: 2048,  
      n_ctx: 2048,        
      n_gpu_layers: 0,   
      use_mlock: false,  
      use_mmap: false    
    });
    
    return true;
  },

  stop: async () => {
    if (llamaContext) {
      try {
        await llamaContext.stopCompletion();
      } catch (e) {
        console.warn('llama context stopCompletion error', e);
      }
    }
  },

  streamCompletion: async (messages, onToken) => {
    try {
      await RapidEngineService.initContext();
      
      const CUSTOMER_SUPPORT_PROMPT = "You are an elite customer support agent. Your goal is to resolve user queries efficiently, politely, and accurately. Do not answer questions outside of customer support, billing, troubleshooting, and product guidance. If you do not know the answer, tell the user you are transferring them to a human agent.";
      
      let prompt = `<|im_start|>system\n${CUSTOMER_SUPPORT_PROMPT}<|im_end|>\n`;
      
      // Formatting context for ChatML format (assuming Qwen/Llama-3 architecture)
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
      throw error; // Rethrow to router
    }
  }
};
