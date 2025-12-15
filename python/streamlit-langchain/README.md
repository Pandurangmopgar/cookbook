# Streamlit + LangChain + MemoryStack 🦜

LangChain conversation agent with persistent memory using MemoryStack.

## Features

- 🦜 LangChain ConversationChain integration
- 🧠 Custom MemoryStack-backed memory class
- 💾 Automatic persistence across sessions
- 🔍 Memory search in sidebar
- ⚡ Gemini 1.5 Flash as LLM

## Quick Start

```bash
cd cookbook/python/streamlit-langchain
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
streamlit run main.py
```

## Architecture

```
User Input → LangChain Chain → Gemini LLM
                ↓
        MemoryStack Memory
         (load + save)
```

The custom `MemoryStackLangChainMemory` class:
1. Loads recent history from MemoryStack on init
2. Maintains a buffer for current session
3. Persists new exchanges to MemoryStack automatically

## Key Code

```python
class MemoryStackLangChainMemory(ConversationBufferWindowMemory):
    def __init__(self, memory_client, user_id, **kwargs):
        super().__init__(**kwargs)
        self.memory_client = memory_client
        self.user_id = user_id
        self._load_from_memorystack()
    
    def save_context(self, inputs, outputs):
        super().save_context(inputs, outputs)
        # Persist to MemoryStack
        self.memory_client.add(
            content=f"User: {inputs['input']}\nAssistant: {outputs['response']}",
            user_id=self.user_id
        )
```

## License

MIT
