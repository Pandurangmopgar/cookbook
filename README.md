# MemoryStack Cookbook 🧠

Real-world examples of AI agents using MemoryStack for persistent memory.

## Examples by Use Case

### 🎤 Voice Agents
| Example | Language | Description |
|---------|----------|-------------|
| [Voice Support Agent](./nextjs/voice-support-agent/) | Next.js | **NEW!** Phone-based AI support with Twilio + Gemini Live |
| [AlgoTutor](./nextjs/Algotutor/algotutor-nextjs/) | Next.js | Voice coding tutor with real-time AI feedback |

### Multi-Agent Systems
| Example | Language | Description |
|---------|----------|-------------|
| [Multi-Agent Workflow](./python/multi-agent-workflow/) | Python | Research → Analysis → Writing pipeline with shared memory |

### Customer Support
| Example | Language | Description |
|---------|----------|-------------|
| [Voice Support Agent](./nextjs/voice-support-agent/) | Next.js | **Phone calls** with AI that remembers customers |
| [Customer Support Agent](./python/customer-support-agent/) | Python | Text-based support bot that remembers customer history |

### Coding Assistants
| Example | Language | Description |
|---------|----------|-------------|
| [Coding Assistant](./python/coding-assistant/) | Python | Code assistant that learns your patterns |
| [AI Coding Tutor](./nextjs/ai-coding-tutor/) | Next.js | LeetCode-style tutor with AI feedback |
| [AI Code Reviewer](./nextjs/ai-code-reviewer/) | Next.js | Smart code analysis with learning |

### Healthcare
| Example | Language | Description |
|---------|----------|-------------|
| [Healthcare Assistant](./python/healthcare-assistant/) | Python | Patient context and history (demo only) |

### Education
| Example | Language | Description |
|---------|----------|-------------|
| [Education Tutor](./python/education-tutor/) | Python | Adaptive tutor that learns student style |

### Sales & CRM
| Example | Language | Description |
|---------|----------|-------------|
| [AI SDR](./nextjs/ai-sdr/) | Next.js | **NEW!** AI Sales Rep with email/call/LinkedIn generation |
| [Sales CRM Agent](./python/sales-crm-agent/) | Python | Prospect memory and personalized outreach |

### General
| Example | Language | Description |
|---------|----------|-------------|
| [Interactive Chatbot](./python/interactive-chatbot/) | Python | Streamlit chat with memory |
| [Personal Finance Advisor](./nodejs/finance-advisor/) | Node.js | Financial advisor with preferences |

## Quick Start

### Python Examples (Recommended)

```bash
# Pick any example
cd cookbook/python/multi-agent-workflow  # or any other

# Install dependencies
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your API keys

# Run
python main.py
```

### Next.js Web Apps

```bash
cd cookbook/nextjs/ai-coding-tutor
npm install
cp .env.example .env.local
# Edit .env.local with your API keys
npm run dev
```

Open http://localhost:3000

## Prerequisites

1. Get your MemoryStack API key from [memorystack.app/dashboard/api-keys](https://www.memorystack.app/dashboard/api-keys)
2. Get a Google Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)

## What Makes These Different?

These aren't toy examples - they demonstrate:

- **Real LLM Integration**: Actual Gemini/OpenAI API calls
- **Persistent Memory**: Conversations survive restarts
- **Context Retrieval**: Semantic search for relevant memories
- **Multi-User Support**: B2B patterns with user isolation
- **Practical Applications**: Tools developers would actually use

## SDK API

All examples use the simplified MemoryStack SDK:

```python
from memorystack import MemoryStackClient

client = MemoryStackClient(api_key="mem_live_...")

# Store a memory
client.add("User prefers dark mode")

# Store with user isolation (B2B)
client.add("User prefers dark mode", user_id="user_123")

# Search memories
results = client.search("user preferences")

# Search for specific user
results = client.search("preferences", user_id="user_123")
```

That's it. Two methods: `add()` and `search()`.
