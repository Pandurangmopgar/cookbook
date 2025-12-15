# AI SDR - Sales Development Representative 🤖💼

AI-powered Sales Development Representative that remembers every lead interaction using MemoryStack.

## What Makes This Special?

Unlike traditional sales tools, this AI SDR:
- **Remembers every interaction** across emails, calls, and LinkedIn
- **Personalizes outreach** based on past conversations
- **Learns lead preferences** and pain points over time
- **Scores leads intelligently** using interaction history
- **Generates contextual content** that references previous touchpoints

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI SDR Dashboard                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 Lead Management                                              │
│     • Add/edit leads with company info                          │
│     • Track status through pipeline                             │
│     • Tag and filter leads                                      │
│                                                                  │
│  ✉️ Email Generation                                             │
│     │                                                           │
│     ▼                                                           │
│  🧠 MemoryStack: Fetch lead history                             │
│     "What have we discussed with this lead before?"             │
│     │                                                           │
│     ▼                                                           │
│  🤖 Gemini: Generate personalized email                         │
│     (with context from past interactions)                       │
│     │                                                           │
│     ▼                                                           │
│  💾 MemoryStack: Store email sent                               │
│     "Sent cold email about product demo"                        │
│                                                                  │
│  📞 Call Scripts | 💼 LinkedIn | ⭐ Lead Scoring                 │
│     (Same memory-powered flow)                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Demo Scenario

1. **Add a Lead**: Sarah Chen, VP Engineering at TechCorp
2. **Generate Cold Email**: AI creates personalized outreach
3. **Log the Send**: Email stored in MemoryStack
4. **Week Later - Follow Up**: AI references the first email
   - "Following up on my email about improving your dev workflow..."
5. **Generate Call Script**: AI knows what was discussed
   - "Hi Sarah, I sent you an email last week about..."
6. **Score the Lead**: AI analyzes all interactions
   - "Score: 72/100 - Engaged, VP-level decision maker"

## Features

### 📧 Smart Email Generation
- Cold outreach, follow-ups, breakup emails, meeting requests
- Personalized based on lead's role, company, and past interactions
- References previous conversations naturally

### 📞 Call Script Generation
- Contextual openers that reference past contact
- Tailored value propositions
- Objection handlers based on industry
- Qualifying questions

### 💼 LinkedIn Messaging
- Connection requests
- InMail messages
- Follow-up messages

### ⭐ AI Lead Scoring
- Analyzes engagement level
- Considers decision-making authority
- Factors in company fit
- Provides actionable recommendations

## Quick Start

### Prerequisites

- Node.js 18+
- MemoryStack API key
- Google Gemini API key

### 1. Install Dependencies

```bash
cd cookbook/nextjs/ai-sdr
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

# Google Gemini API Key (get from aistudio.google.com)
GOOGLE_API_KEY=xxx

# Your company info (for email templates)
COMPANY_NAME=Acme Inc
SDR_NAME=Alex
```

### 3. Run the App

```bash
npm run dev
```

Open http://localhost:3000

## How Memory Works

```typescript
// When generating an email, we fetch lead context
const context = await getLeadContext(leadId, "interactions emails");
// Returns: "• Sent cold email about product demo (Dec 1)
//           • Lead replied asking for pricing (Dec 3)
//           • Scheduled call for next week (Dec 5)"

// This context is injected into Gemini's prompt
const email = await generateEmail(lead, context, "followup");
// AI generates: "Hi Sarah, great chatting last week about your 
//                engineering challenges. As promised, here's the 
//                pricing info you requested..."

// After sending, we store the interaction
await storeLeadInteraction(leadId, {
  type: 'email',
  summary: 'Sent follow-up with pricing details',
});
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads` | GET | List all leads with stats |
| `/api/leads` | POST | Create new lead |
| `/api/leads/[id]` | GET | Get lead details + interactions |
| `/api/leads/[id]` | PATCH | Update lead |
| `/api/leads/[id]/email` | POST | Generate email |
| `/api/leads/[id]/email` | PUT | Log email sent |
| `/api/leads/[id]/call` | POST | Generate call script |
| `/api/leads/[id]/call` | PUT | Log call outcome |
| `/api/leads/[id]/linkedin` | POST | Generate LinkedIn message |
| `/api/leads/[id]/score` | POST | Score lead with AI |
| `/api/search` | GET | Search across all leads |

## Customization

### Change Email Style

Edit `src/lib/gemini.ts`:

```typescript
const prompts: Record<string, string> = {
  cold: `Write a compelling cold outreach email...`,
  // Customize the prompt for your style
};
```

### Add Custom Lead Fields

Edit `src/lib/types.ts`:

```typescript
export interface Lead {
  // Add your custom fields
  budget?: string;
  timeline?: string;
  competitors?: string[];
}
```

### Integrate Real Email Sending

Add Resend or SendGrid:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In the email route
await resend.emails.send({
  from: process.env.SDR_EMAIL,
  to: lead.email,
  subject: email.subject,
  text: email.body,
});
```

## Production Deployment

### Vercel

```bash
vercel
```

Set environment variables in Vercel dashboard.

### Database

For production, replace the in-memory store with:
- Supabase
- PostgreSQL
- MongoDB

## Tech Stack

| Component | Service |
|-----------|---------|
| AI/LLM | Google Gemini |
| Memory | MemoryStack |
| Framework | Next.js 15 |
| Styling | Tailwind CSS |
| Email (optional) | Resend |

## Cost Estimates

| Service | Cost |
|---------|------|
| Gemini | Free tier: 60 requests/min |
| MemoryStack | Free tier: 1000 memories/month |
| Resend | Free tier: 100 emails/day |

## What's Next?

Ideas for extending this:
- [ ] Email sequence automation
- [ ] Calendar integration for meetings
- [ ] CRM sync (Salesforce, HubSpot)
- [ ] Chrome extension for LinkedIn
- [ ] Voice call integration (Twilio)
- [ ] Team collaboration features

## License

MIT

## Resources

- [MemoryStack Docs](https://memorystack.app/docs)
- [Gemini API](https://ai.google.dev/gemini-api)
- [Next.js Docs](https://nextjs.org/docs)
