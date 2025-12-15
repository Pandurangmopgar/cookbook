# Streamlit + LangGraph + MemoryStack 🔄

Multi-agent workflow orchestration with LangGraph and persistent memory.

## Features

- 🔄 LangGraph state machine for agent orchestration
- 🤖 Three specialized agents (Research → Analysis → Summary)
- 🧠 Cross-agent memory sharing via MemoryStack
- 📊 Visual workflow progress in Streamlit
- 💾 Persistent results for future reference

## Quick Start

```bash
cd cookbook/python/streamlit-langgraph
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
streamlit run main.py
```

## Workflow Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Research   │ ──▶ │  Analysis   │ ──▶ │   Summary   │
│    Agent    │     │    Agent    │     │    Agent    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    ┌──────▼──────┐
                    │ MemoryStack │
                    │  (Shared)   │
                    └─────────────┘
```

## How It Works

1. **Research Agent**: Gathers facts, checks existing memories
2. **Analysis Agent**: Processes research, identifies patterns
3. **Summary Agent**: Creates executive summary
4. **All agents** share context through MemoryStack

## Key Code

```python
# Define state
class AgentState(TypedDict):
    topic: str
    research: str
    analysis: str
    summary: str

# Build graph
workflow = StateGraph(AgentState)
workflow.add_node("research", research_agent)
workflow.add_node("analysis", analysis_agent)
workflow.add_node("summary", summary_agent)

workflow.set_entry_point("research")
workflow.add_edge("research", "analysis")
workflow.add_edge("analysis", "summary")
workflow.add_edge("summary", END)

app = workflow.compile()
result = app.invoke({"topic": "AI trends"})
```

## Use Cases

- Research pipelines
- Content generation workflows
- Data processing chains
- Multi-step analysis tasks

## License

MIT
