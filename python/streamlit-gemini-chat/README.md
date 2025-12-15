# Streamlit + Gemini + MemoryStack Chat 🧠

A beautiful chat interface with persistent memory using Streamlit, Google Gemini, and MemoryStack.

![Demo](https://via.placeholder.com/800x400?text=Streamlit+Chat+Demo)

## Features

- 💬 Clean Streamlit chat UI
- 🧠 Persistent memory across sessions
- 🔍 Semantic search for relevant context
- 👥 Multi-user support with user isolation
- ⚡ Fast responses with Gemini 1.5 Flash

## Quick Start

```bash
# Clone and navigate
cd cookbook/python/streamlit-gemini-chat

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run the app
streamlit run main.py
```

Open http://localhost:8501

## How It Works

1. **User sends message** → Streamlit captures input
2. **Search memories** → MemoryStack finds relevant context
3. **Generate response** → Gemini uses context for personalized reply
4. **Store conversation** → MemoryStack saves for future reference

## Configuration

| Variable | Description |
|----------|-------------|
| `MEMORYSTACK_API_KEY` | Your MemoryStack API key |
| `GEMINI_API_KEY` | Your Google Gemini API key |

## Try It

1. Start chatting about your preferences
2. Close the browser and reopen
3. Ask "What do you remember about me?"
4. Watch the AI recall your previous conversations!

## License

MIT
