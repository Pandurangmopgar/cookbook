/**
 * Gemini Live API integration for voice conversations
 */

import { GoogleGenAI, Modality, Session } from '@google/genai';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;

export interface GeminiVoiceConfig {
  systemInstruction: string;
  voiceName?: string;
  onAudioResponse?: (audioBase64: string) => void;
  onTextResponse?: (text: string) => void;
  onError?: (error: Error) => void;
}

export class GeminiVoiceSession {
  private client: GoogleGenAI;
  private session: Session | null = null;
  private config: GeminiVoiceConfig;

  constructor(config: GeminiVoiceConfig) {
    this.client = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.session = await this.client.live.connect({
        model: 'gemini-2.5-flash-preview-native-audio-dialog',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
          },
          onmessage: (message) => {
            // Handle audio response
            const audio = (message as any).serverContent?.modelTurn?.parts?.[0]?.inlineData;
            if (audio?.data && this.config.onAudioResponse) {
              this.config.onAudioResponse(audio.data);
            }

            // Handle text response
            const text = (message as any).serverContent?.modelTurn?.parts?.[0]?.text;
            if (text && this.config.onTextResponse) {
              this.config.onTextResponse(text);
            }
          },
          onerror: (error) => {
            console.error('Gemini Live error:', error);
            this.config.onError?.(new Error(error.message));
          },
          onclose: () => {
            console.log('Gemini Live session closed');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voiceName || 'Aoede',
              },
            },
          },
          systemInstruction: {
            parts: [{ text: this.config.systemInstruction }],
          },
        },
      });
    } catch (error) {
      console.error('Failed to connect to Gemini Live:', error);
      throw error;
    }
  }

  /**
   * Send audio data to Gemini
   * @param audioBase64 Base64 encoded audio (mulaw 8kHz for Twilio)
   */
  sendAudio(audioBase64: string): void {
    if (!this.session) {
      console.warn('Session not connected');
      return;
    }

    try {
      this.session.sendRealtimeInput({
        media: {
          data: audioBase64,
          mimeType: 'audio/pcm;rate=8000',
        },
      });
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  }

  /**
   * Send text message to Gemini
   */
  async sendText(text: string): Promise<void> {
    if (!this.session) {
      console.warn('Session not connected');
      return;
    }

    try {
      await this.session.sendClientContent({
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true,
      });
    } catch (error) {
      console.error('Error sending text:', error);
    }
  }

  disconnect(): void {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
  }
}

/**
 * Build system instruction for customer support agent
 */
export function buildSupportAgentInstruction(
  customerContext: string,
  companyName: string = 'TechCorp'
): string {
  return `You are a friendly and helpful customer support agent for ${companyName}. 

Your role is to:
1. Greet the customer warmly
2. Listen to their issue carefully
3. Use their history to provide personalized support
4. Resolve issues efficiently or escalate when needed
5. Always be polite, patient, and professional

CUSTOMER CONTEXT:
${customerContext}

GUIDELINES:
- Keep responses concise and natural for voice conversation
- If you recognize returning customers, acknowledge their history
- Reference past issues when relevant: "I see you called about X before..."
- Ask clarifying questions when needed
- Summarize solutions clearly
- End calls professionally with next steps if any

IMPORTANT:
- Never share sensitive customer data
- If you can't help, offer to transfer to a human agent
- Stay calm even with frustrated customers`;
}
