/**
 * Custom server with WebSocket support for Twilio Media Streams
 * 
 * Run with: npx tsx server.ts
 */

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';

// MemoryStack API
const MEMORYSTACK_API_KEY = process.env.MEMORYSTACK_API_KEY!;
const MEMORYSTACK_BASE_URL = 'https://www.memorystack.app/api/v1';

async function storeMemory(content: string, customerId: string, metadata?: Record<string, unknown>) {
  const response = await fetch(`${MEMORYSTACK_BASE_URL}/memories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MEMORYSTACK_API_KEY}`,
    },
    body: JSON.stringify({
      content,
      user_id: customerId,
      memory_type: 'observation',
      metadata: { source: 'voice_support', ...metadata },
    }),
  });
  return response.json();
}

async function searchMemories(query: string, customerId: string) {
  try {
    const response = await fetch(`${MEMORYSTACK_BASE_URL}/memories/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MEMORYSTACK_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        user_id: customerId,
        limit: 10,
      }),
    });
    const data = await response.json();
    return data.memories || [];
  } catch {
    return [];
  }
}

async function buildCustomerContext(customerId: string): Promise<string> {
  try {
    const memories = await searchMemories('customer support call history', customerId);
    if (memories.length === 0) {
      return 'This is a new customer with no previous interaction history.';
    }
    const context = memories
      .map((m: any, i: number) => `${i + 1}. ${m.content}`)
      .join('\n');
    return `Customer interaction history:\n${context}`;
  } catch (error) {
    console.error('Error building customer context:', error);
    return 'Unable to retrieve customer history.';
  }
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Gemini client
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // WebSocket server for Twilio Media Streams
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url!, true);

    if (pathname === '/api/twilio/media-stream') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', async (ws: WebSocket) => {
    console.log('🔌 New Twilio Media Stream connection');

    let streamSid: string | null = null;
    let customerId: string = 'unknown';
    let geminiSession: any = null;
    let isSessionReady = false;
    let pendingAudio: string[] = [];

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.event) {
          case 'connected':
            console.log('📞 Media stream connected');
            break;

          case 'start':
            streamSid = message.start.streamSid;
            customerId = message.start.customParameters?.customerId || 'unknown';
            
            console.log(`📞 Stream started for customer: ${customerId}`);
            console.log(`📞 Stream SID: ${streamSid}`);

            // Get customer context from MemoryStack
            const customerContext = await buildCustomerContext(customerId);
            console.log('📝 Customer context loaded');

            // Initialize Gemini Live session with text-only for now
            // (Twilio mulaw audio format is not directly compatible with Gemini)
            try {
              geminiSession = await genAI.live.connect({
                model: 'gemini-2.0-flash-live-001',
                callbacks: {
                  onopen: () => {
                    console.log('🤖 Gemini session opened');
                    isSessionReady = true;
                    
                    // Send initial greeting request
                    setTimeout(async () => {
                      if (geminiSession && isSessionReady) {
                        try {
                          await geminiSession.sendClientContent({
                            turns: [{
                              role: 'user',
                              parts: [{ text: 'A customer just connected to the support line. Please greet them warmly and ask how you can help them today.' }],
                            }],
                            turnComplete: true,
                          });
                          console.log('📤 Sent greeting request to Gemini');
                        } catch (err) {
                          console.error('Error sending greeting:', err);
                        }
                      }
                    }, 500);
                  },
                  onmessage: (msg: any) => {
                    try {
                      // Handle audio response from Gemini
                      const serverContent = msg.serverContent;
                      if (serverContent?.modelTurn?.parts) {
                        for (const part of serverContent.modelTurn.parts) {
                          // Handle audio
                          if (part.inlineData?.data && streamSid && ws.readyState === WebSocket.OPEN) {
                            console.log('🔊 Received audio from Gemini, sending to Twilio');
                            const mediaMessage = {
                              event: 'media',
                              streamSid,
                              media: {
                                payload: part.inlineData.data,
                              },
                            };
                            ws.send(JSON.stringify(mediaMessage));
                          }
                          
                          // Handle text transcript
                          if (part.text) {
                            console.log(`🤖 Agent: ${part.text}`);
                          }
                        }
                      }
                      
                      // Check if turn is complete
                      if (serverContent?.turnComplete) {
                        console.log('✅ Gemini turn complete');
                      }
                    } catch (err) {
                      console.error('Error processing Gemini message:', err);
                    }
                  },
                  onerror: (err: any) => {
                    console.error('❌ Gemini error:', err);
                    isSessionReady = false;
                  },
                  onclose: () => {
                    console.log('🔌 Gemini session closed');
                    isSessionReady = false;
                  },
                },
                config: {
                  responseModalities: [Modality.AUDIO, Modality.TEXT],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Aoede' },
                    },
                  },
                  systemInstruction: {
                    parts: [{
                      text: buildSupportInstruction(customerContext),
                    }],
                  },
                },
              });

            } catch (error) {
              console.error('❌ Failed to initialize Gemini:', error);
            }
            break;

          case 'media':
            // Twilio sends mulaw 8kHz audio
            // For now, we'll use text-based interaction
            // Real implementation would need audio format conversion
            if (geminiSession && isSessionReady && message.media?.payload) {
              // Buffer audio - in production you'd convert mulaw to PCM
              pendingAudio.push(message.media.payload);
              
              // Send audio to Gemini (it may not process mulaw correctly)
              try {
                await geminiSession.sendRealtimeInput({
                  media: {
                    data: message.media.payload,
                    mimeType: 'audio/basic', // mulaw format
                  },
                });
              } catch (err) {
                // Silently ignore audio send errors
              }
            }
            break;

          case 'mark':
            console.log(`📍 Mark received: ${message.mark?.name}`);
            break;

          case 'stop':
            console.log('📞 Media stream stopped');
            
            // Store call summary in memory
            if (customerId !== 'unknown') {
              try {
                await storeMemory(
                  `Customer called support on ${new Date().toLocaleString()}. Call duration: active session.`,
                  customerId,
                  { stream_sid: streamSid, call_type: 'support' }
                );
                console.log('💾 Call memory stored');
              } catch (error) {
                console.error('Failed to store call memory:', error);
              }
            }

            if (geminiSession) {
              try {
                geminiSession.close();
              } catch {}
              geminiSession = null;
              isSessionReady = false;
            }
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('🔌 WebSocket closed');
      if (geminiSession) {
        try {
          geminiSession.close();
        } catch {}
        geminiSession = null;
        isSessionReady = false;
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket ready on ws://${hostname}:${port}/api/twilio/media-stream`);
  });
});

function buildSupportInstruction(customerContext: string): string {
  return `You are a friendly and helpful customer support agent for TechCorp.

Your role is to:
1. Greet the customer warmly when they connect
2. Listen to their issue carefully  
3. Use their history to provide personalized support
4. Resolve issues efficiently or escalate when needed
5. Always be polite, patient, and professional

CUSTOMER CONTEXT:
${customerContext}

GUIDELINES:
- Keep responses concise and natural for voice conversation (2-3 sentences max)
- If you recognize returning customers, acknowledge their history
- Reference past issues when relevant
- Ask clarifying questions when needed
- Summarize solutions clearly
- End calls professionally with next steps if any

VOICE STYLE:
- Speak naturally and conversationally
- Use a warm, friendly tone
- Pause appropriately between sentences
- Don't use technical jargon unless necessary

IMPORTANT:
- Never share sensitive customer data
- If you can't help, offer to transfer to a human agent
- Stay calm even with frustrated customers`;
}
