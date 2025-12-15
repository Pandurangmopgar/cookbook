# Streamlit + CrewAI + MemoryStack 👥

CrewAI multi-agent team with persistent memory and beautiful Streamlit UI.

## Features

- 👥 CrewAI agents with specialized roles
- 🔧 Custom MemoryStack tool for agents
- 🧠 Persistent memory across crew runs
- 📊 Real-time execution progress
- 🔍 Memory search in sidebar

## Quick Start

```bash
cd cookbook/python/streamlit-crewai
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
streamlit run main.py
```

## The Crew

| Agent | Role | Responsibility |
|-------|------|----------------|
| 🔍 Researcher | Senior Researcher | Gathers facts and findings |
| 📊 Analyst | Data Analyst | Identifies patterns and insights |
| ✍️ Writer | Content Writer | Creates executive summary |

## Architecture

```
┌─────────────────────────────────────────┐
│              CrewAI Crew                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Researcher│→│ Analyst  │→│  Writer  │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │            │            │       │
│       └────────────┼────────────┘       │
│                    │                    │
│            ┌───────▼───────┐            │
│            │ MemoryStack   │            │
│            │    Tool       │            │
│            └───────────────┘            │
└─────────────────────────────────────────┘
```

## Custom Memory Tool

```python
class MemoryStackTool(BaseTool):
    name: str = "memory_tool"
    description: str = """Store or search information.
    action='store', content='info to save'
    action='search', content='search query'"""
    
    def _run(self, action: str, content: str) -> str:
        if action == "store":
            memory_client.add(content=content)
            return "✅ Stored"
        elif action == "search":
            results = memory_client.search(content)
            return format_results(results)
```

## Why MemoryStack + CrewAI?

1. **Persistent Context**: Agents remember past research
2. **Cross-Run Learning**: New crews build on previous work
3. **Shared Knowledge**: All agents access the same memory
4. **Audit Trail**: Track what agents learned over time

## License

MIT
