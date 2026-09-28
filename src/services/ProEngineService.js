export const ProEngineService = {
  streamCompletion: async (messages, onToken) => {
    // Convert internal message format to OpenAI compatible API format
    const apiMessages = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    try {
      // In production, this points to your backend or secure API gateway
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_CLOUD_API_KEY', // Placeholder
        },
        body: JSON.stringify({
          model: 'gpt-4o', // or gemini-3.1-pro via compatible endpoint
          messages: apiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Pro API Error: ${response.status}`);
      }

      // React Native 0.73+ native fetch streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.includes('[DONE]')) return;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace(/^data: /, ''));
              const token = data.choices[0]?.delta?.content;
              if (token) {
                onToken(token);
              }
            } catch (e) {
              // Ignore incomplete JSON chunks (handle buffering in prod)
            }
          }
        }
      }
    } catch (error) {
      console.error('Pro Engine Error:', error);
      onToken('\n[Connection error in Pro mode. Check network.]');
    }
  },
};
