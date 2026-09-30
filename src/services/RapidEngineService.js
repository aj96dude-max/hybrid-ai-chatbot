const DEMO_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const SYSTEM_PROMPTS = {
  healthcare: "Strict HIPAA compliance. Refuse medical advice. Focus on EOB, Medicare, and copays.",
  insurance: "Focus on de-escalation, claims filing, collision vs comprehensive, and roadside dispatch.",
  limo: "Focus on logistics, passenger limits, luggage capacity, and hourly minimums.",
  food: "Focus on rapid appeasement, refunds, missing items, and driver tracking."
};

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
      const store = require('../store/useChatStore').useChatStore;
      const activeDomain = store.getState().activeDomain;
      
      const systemPrompt = SYSTEM_PROMPTS[activeDomain] || SYSTEM_PROMPTS.healthcare;
      
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
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
          model: 'openai/gpt-oss-20b',
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
