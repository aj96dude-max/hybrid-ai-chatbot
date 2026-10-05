const DEMO_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const RAPID_SYSTEM_PROMPT = "You are an ultra-fast, concise customer support agent. Provide immediate, accurate answers in 2 to 3 sentences maximum. Do not provide long explanations.";

let abortController = null;

export const RapidEngineService = {
  stop: async () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  },

  streamCompletion: async (messages, onToken) => {
    try {
      const formattedMessages = [
        { role: 'system', content: RAPID_SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      ];

      abortController = new AbortController();

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEMO_API_KEY}`
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: formattedMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 512
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        if (!abortController || abortController.signal.aborted) {
          break;
        }
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let parts = buffer.split('\n\n');
        
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (part.trim() === '') continue;
          if (part.trim() === 'data: [DONE]') return;
          
          if (part.startsWith('data: ')) {
            try {
              const jsonStr = part.replace('data: ', '').trim();
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onToken(content);
              }
            } catch (err) {
              console.warn('Failed to parse SSE chunk:', part);
            }
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted manually.');
        return;
      }
      console.error('RapidEngine Error:', error);
      throw error;
    }
  }
};
