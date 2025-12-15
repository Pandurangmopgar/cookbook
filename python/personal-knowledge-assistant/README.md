# 🧠 Personal Knowledge Assistant

Your AI-powered "second brain" that learns from your documents, notes, and conversations.

![Personal Knowledge Assistant](https://img.shields.io/badge/MemoryStack-Powered-purple)

## What It Does

- **Upload Documents**: PDFs, text files, markdown notes
- **Ask Questions**: Natural language queries across all your knowledge
- **Learn Over Time**: Remembers your questions and builds connections
- **Generate Insights**: Discover patterns in your knowledge base
- **Source Attribution**: Know where each answer comes from

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your API keys

# Run
streamlit run main.py
```

Open http://localhost:8501

## Features

### 📄 Document Ingestion
Upload any text-based document. The assistant:
- Chunks documents for optimal retrieval
- Preserves source information
- Handles overlapping context

### 💬 Ask Anything
Ask questions in natural language:
- "What did I write about project management?"
- "Summarize my notes on AI trends"
- "What are the key points from the Q3 report?"

### 💡 Insight Generation
Discover patterns across your knowledge:
- Key themes and topics
- Recurring ideas
- Knowledge gaps
- Suggested next steps

### 🔍 Semantic Search
Find relevant information even with different wording:
- Searches by meaning, not just keywords
- Ranks by relevance
- Shows source attribution

## How Memory Works

```python
# Every document chunk is stored with metadata
memory.add(
    content="Your document content...",
    user_id="your_user_id",
    metadata={
        "source": "document",
        "filename": "notes.md",
        "chunk_index": 0
    }
)

# Questions and answers are also saved
memory.add(
    content="Q: What is X?\nA: X is...",
    user_id="your_user_id",
    metadata={
        "source": "qa_interaction",
        "sources_used": ["notes.md"]
    }
)
```

## Use Cases

- **Research Notes**: Organize and query research papers
- **Meeting Notes**: Search across all your meeting notes
- **Learning**: Build a personal knowledge base as you learn
- **Writing**: Quick access to reference material
- **Project Documentation**: Query project docs naturally

## API Keys

1. **MemoryStack**: [Get your key](https://memorystack.app/dashboard/api-keys)
2. **Gemini**: [Get your key](https://aistudio.google.com/app/apikey)

## Tips

- **Chunk Size**: Default 1000 chars works well for most documents
- **Overlap**: 200 char overlap ensures context isn't lost at boundaries
- **Quick Notes**: Use for fleeting thoughts and ideas
- **Regular Insights**: Run insight analysis weekly to discover patterns

---

Built with [MemoryStack](https://memorystack.app) + Streamlit + Gemini
