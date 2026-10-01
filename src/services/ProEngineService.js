const DEMO_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const PRO_SYSTEM_PROMPT = "You are an expert consultant and advanced AI assistant. Provide comprehensive, highly detailed explanations. Use markdown, bullet points, and deep reasoning to generate thorough content exactly like ChatGPT would. Explore nuances and provide next-level insights.";

export const ProEngineService = {
  streamCompletion: async (messages, onToken, abortSignal) => {
    try {
      const formattedMessages = [
        { role: 'system', content: PRO_SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        }))
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEMO_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: formattedMessages,
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
        console.log('Pro Engine aborted');
        return;
      }
      console.error('Pro Engine Error:', error);
      throw error; // Rethrow to let router handle the visual error
    }
  },
};
