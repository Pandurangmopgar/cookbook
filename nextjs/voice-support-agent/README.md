# Voice Customer Support Agent 📞🧠

AI-powered voice customer support agent that remembers every customer interaction using MemoryStack.

## What Makes This Special?

Unlike traditional IVR systems, this agent:
- **Remembers customers** across calls using MemoryStack
- **Provides personalized support**: "I see you called about billing last week..."
- **Real phone calls** via Vapi (inbound + outbound)
- **Real-time AI voice** powered by Gemini via Vapi
- **Beautiful dashboard** to monitor calls and customer memories

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Voice Customer Support Agent                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📞 Customer calls your Vapi phone number                       │
│     │                                                           │
│     ▼                                                           │
│  🎙️ Vapi: STT + Voice AI + TTS                                  │
│     │                                                           │
│     ▼                                                           │
│  🧠 MemoryStack: Fetch customer history (via webhook)           │
│     "What issues has this customer had before?"                 │
│     │                                                           │
│     ▼                                                           │
│  🤖 Gemini: AI responses with customer context                  │
│     │                                                           │
│     ▼                                                           │
│  💾 MemoryStack: Store call summary (end-of-call webhook)       │
│     "Customer called about billing issue, resolved"             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Demo Scenario

1. **First Call**: Customer calls about a billing issue
   - Agent: "Hi! How can I help you today?"
   - Customer explains billing problem
   - Agent resolves issue
   - MemoryStack stores: "Customer had billing issue with invoice #123, resolved by applying credit"

2. **Second Call** (days later): Same customer calls
   - Agent: "Welcome back! I see you called about a billing issue last week. Is everything resolved, or is there something else I can help with?"
   - Customer feels recognized and valued! 🎉

## Quick Start

### Prerequisites

- Node.js 18+
- Vapi account (https://vapi.ai)
- MemoryStack API key
- ngrok (for local development)

### 1. Install Dependencies

```bash
cd cookbook/nextjs/voice-support-agent
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MemoryStack API Key (get from memorystack.app/dashboard/api-keys)
MEMORYSTACK_API_KEY=mem_live_xxx

# Vapi Configuration (get from dashboard.vapi.ai)
VAPI_API_KEY=your-vapi-api-key
VAPI_PHONE_NUMBER_ID=your-phone-number-id
# Optional: Pre-created assistant ID
VAPI_ASSISTANT_ID=
# Optional: Webhook secret for signature verification
VAPI_SERVER_SECRET=

# Your app's public URL (use ngrok for local dev)
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io
```

### 3. Set Up Vapi

1. **Create Account**: Sign up at [vapi.ai](https://vapi.ai)

2. **Get API Key**: Go to Dashboard → API Keys → Copy your key

3. **Buy a Phone Number**: 
   - Go to Phone Numbers → Buy Number
   - Copy the Phone Number ID

4. **Configure Webhook** (optional for inbound):
   - Go to your Assistant settings
   - Set Server URL to: `https://your-ngrok-url.ngrok.io/api/vapi/webhook`

### 4. Start ngrok Tunnel

Vapi needs a public URL to send webhooks:

```bash
ngrok http 3000
```

Copy the HTTPS URL and update `NEXT_PUBLIC_APP_URL` in `.env.local`.

### 5. Run the App

```bash
npm run dev
```

### 6. Open Dashboard

Visit `http://localhost:3000` to see the dashboard.

## Features

### Outbound Calls
- Enter a phone number in the dashboard
- Click "Call" to initiate
- AI agent handles the conversation
- Customer context loaded from MemoryStack

### Inbound Calls
- Customers call your Vapi number
- Webhook fetches customer context
- Agent greets them with personalized context
- Call summary stored after call ends

### Customer Memory Panel
- Click any call to see customer's memory
- View all past interactions
- Memories persist across calls

## How Memory Integration Works

### Before Each Response (assistant-request webhook)
```typescript
// Vapi calls our webhook before generating a response
// We inject customer context from MemoryStack
const context = await buildCustomerContext(customerId);

return {
  assistant: {
    model: {
      messages: [{
        role: 'system',
        content: `CUSTOMER CONTEXT:\n${context}`
      }]
    }
  }
};
```

### After Call Ends (end-of-call-report webhook)
```typescript
// Vapi sends the full transcript
// We extract key points and store in MemoryStack
await storeMemory(
  `Call summary: ${summary}`,
  customerId,
  { type: 'call_summary', call_id: callId }
);
```

## Customization

### Change the AI Voice

Edit `src/lib/vapi.ts`:

```typescript
voice: {
  provider: '11labs',
  voiceId: 'rachel', // Or: 'adam', 'antoni', 'josh', etc.
},
```

### Customize the Agent Personality

Edit the system prompt in `src/lib/vapi.ts`:

```typescript
const assistant = await createAssistant(
  'My Support Agent',
  `You are a friendly support agent for [YOUR COMPANY]...`,
  serverUrl
);
```

### Add Custom Functions

The webhook supports function calling. Add new functions in `src/app/api/vapi/webhook/route.ts`:

```typescript
case 'lookupOrder':
  const orderId = functionCall?.parameters?.orderId;
  // Look up order in your database
  return NextResponse.json({ result: orderDetails });
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/vapi/call` | POST | Start outbound call |
| `/api/vapi/call` | GET | List recent calls |
| `/api/vapi/call` | DELETE | End a call |
| `/api/vapi/webhook` | POST | Vapi webhook handler |
| `/api/calls` | GET | Get call stats for dashboard |
| `/api/customers/[id]/memories` | GET | Get customer memories |

## Production Deployment

### Vercel

This app works with standard Next.js deployment:

```bash
vercel deploy
```

Set environment variables in Vercel dashboard.

### Other Platforms

Works on any platform that supports Next.js:
- Railway
- Render
- AWS Amplify
- Google Cloud Run

## Troubleshooting

### "Failed to start call"
- Check Vapi API key is valid
- Ensure VAPI_PHONE_NUMBER_ID is set
- Check Vapi dashboard for error logs

### "No customer context"
- Verify MemoryStack API key
- Check webhook URL is accessible
- Ensure ngrok tunnel is running

### "Memories not saving"
- Check end-of-call webhook is being received
- Verify MemoryStack API key has write permissions

## Tech Stack

| Component | Service |
|-----------|---------|
| Voice AI Platform | Vapi |
| AI Model | Gemini (via Vapi) |
| Text-to-Speech | ElevenLabs (via Vapi) |
| Memory | MemoryStack |
| UI | Next.js + Tailwind |

## Cost Estimates

| Service | Cost |
|---------|------|
| Vapi | ~$0.05/min (includes STT + TTS + telephony) |
| MemoryStack | Free tier: 1000 memories/month |

## License

MIT

## Resources

- [MemoryStack Docs](https://memorystack.app/docs)
- [Vapi Docs](https://docs.vapi.ai)
- [Vapi Dashboard](https://dashboard.vapi.ai)
- [ngrok](https://ngrok.com/)
