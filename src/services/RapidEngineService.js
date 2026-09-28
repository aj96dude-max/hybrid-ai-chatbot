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
    if (!info.exists || info.size < 390 * 1024 * 1024) {
      throw new Error(`Model corrupted. Size is only ${Math.round((info.size || 0)/1024/1024)}MB. Please tap Reset Engine and re-download.`);
    }

    // Hardware accelerated inference via llama.cpp
    llamaContext = await initLlama({
      model: rawPath,
      contextSize: 512,  // Ultra-safe context size
      n_gpu_layers: 0,   // Force CPU
      // DO NOT USE use_mlock ON ANDROID (it causes fatal crashes)
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
