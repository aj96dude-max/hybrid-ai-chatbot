import * as FileSystem from 'expo-file-system';
import { useChatStore } from '../store/useChatStore';

// URL for a lightweight quantised model. This is an example placeholder.
const MODEL_URL = 'https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat-GGUF/resolve/main/qwen1_5-0_5b-chat-q4_k_m.gguf';
const MODEL_FILE_NAME = 'rapid_model_q4_k_m.gguf';
const MODEL_PATH = `${FileSystem.documentDirectory}${MODEL_FILE_NAME}`;

export const ModelManagerService = {
  getModelPath: () => MODEL_PATH,
  
  checkModelExists: async () => {
    try {
      const info = await FileSystem.getInfoAsync(MODEL_PATH);
      if (info.exists) {
        useChatStore.getState().setModelStatus('ready');
        return true;
      }
    } catch (e) {
      console.error('File system check error', e);
    }
    useChatStore.getState().setModelStatus('missing');
    return false;
  },

  downloadModel: async () => {
    useChatStore.getState().setModelStatus('downloading');
    
    const callback = (downloadProgress) => {
      const progress = downloadProgress.totalBytesWritten;
      const total = downloadProgress.totalBytesExpectedToWrite;
      useChatStore.getState().setDownloadProgress(progress, total);
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      MODEL_URL,
      MODEL_PATH,
      {},
      callback
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (result && result.status === 200) {
        useChatStore.getState().setModelStatus('ready');
        return true;
      }
    } catch (e) {
      console.error('Download failed', e);
    }
    
    useChatStore.getState().setModelStatus('missing');
    return false;
  }
};
