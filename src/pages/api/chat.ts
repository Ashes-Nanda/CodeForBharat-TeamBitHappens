import { GoogleGenerativeAI, Part } from '@google/generative-ai';

// Ensure API key is properly typed
const API_KEY = "YOUR_API_KEY";
if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const THERAPIST_PROMPT = `You are Asha, a caring and empathetic AI therapist. Respond naturally as if having a real conversation, without labeling or showing your therapeutic techniques.

Style guide:
- Keep responses short and warm (2-3 sentences)
- Use natural, conversational language
- Speak as if talking to a friend
- Show genuine care and understanding
- Be gentle and supportive

DO NOT:
- Label your responses with techniques (like "Validation:", "Reflection:", etc.)
- Use clinical or technical language
- Write long paragraphs
- Give medical advice

Example natural responses:
"Hi there! I'm sorry you're going through this. Would you like to tell me more about what's happening?"
"That must be really hard to deal with. What do you think would help you feel better right now?"
"I understand how you're feeling. Let's talk about what's on your mind today."`;

interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt?: string;
}

interface ChatResponse {
  message?: string;
  error?: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' } as ChatResponse), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, systemPrompt } = (await req.json()) as ChatRequest;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array is required and cannot be empty');
    }

    // Format the conversation history
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.parts }] as Part[],
    }));

    // If this is a new conversation, add the initial therapeutic context
    if (formattedMessages.length === 1) {
      formattedMessages.unshift(
        {
          role: 'user',
          parts: [{ text: 'Hi, I need someone to talk to.' }] as Part[],
        },
        {
          role: 'model',
          parts: [{ text: "Hi! I'm Asha, and I'm here to support you. How are you feeling today?" }] as Part[],
        }
      );
    }

    // Start a chat with history
    const chat = model.startChat({
      history: formattedMessages,
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    // Add the therapist prompt to guide responses
    await chat.sendMessage(THERAPIST_PROMPT);

    // Send the current message
    const currentMessage = systemPrompt || messages[messages.length - 1].parts;
    const result = await chat.sendMessage(currentMessage);
    const response = await result.response;
    const message = response.text();

    return new Response(JSON.stringify({ message } as ChatResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: `Error processing your request: ${errorMessage}`
    } as ChatResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 