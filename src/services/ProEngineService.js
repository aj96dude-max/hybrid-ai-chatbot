export const ProEngineService = {
  streamCompletion: async (messages, onToken, abortSignal) => {
    // Convert internal message format to OpenAI compatible API format
    const apiMessages = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      const store = require('../store/useChatStore').useChatStore;
      const API_KEY = store.getState().proApiKey;
      const systemPrompt = store.getState().systemPrompt;
      
      if (systemPrompt) {
        apiMessages.unshift({ role: 'system', content: systemPrompt });
      }

      // SIMULATION FOR TESTING: If the user hasn't put in an API key yet, simulate a response
      if (!API_KEY || API_KEY === 'YOUR_CLOUD_API_KEY') {
        const fakeResponse = "Hello! I am the Pro Cloud Engine. You need to enter a real OpenAI API key to get real answers!";
        const chunks = fakeResponse.split(' ');
        
        for (const word of chunks) {
          if (abortSignal?.aborted) return;
          await new Promise(r => setTimeout(r, 100)); // simulate network delay
          onToken(word + ' ');
        }
        return;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: apiMessages,
          stream: true,
        }),
        signal: abortSignal
      });

      if (!response.ok) {
        throw new Error(`Pro API Error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        if (abortSignal?.aborted) break;
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.includes('[DONE]')) return;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace(/^data: /, ''));
              const token = data.choices[0]?.delta?.content;
              if (token) {
                onToken(token);
              }
            } catch (e) {
              console.warn('Failed to parse SSE chunk:', line);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Pro Engine aborted');
        return;
      }
      console.error('Pro Engine Error:', error);
      throw error; // Rethrow to let router handle the visual error
    }
  },
};
