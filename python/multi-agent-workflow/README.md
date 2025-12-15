# Multi-Agent Workflow

Demonstrates how multiple AI agents share context through MemoryStack.

## The Pattern

```
Research Agent → stores findings → Memory
                                    ↓
Analysis Agent ← retrieves research ← Memory → stores analysis
                                                    ↓
Writing Agent ← retrieves all context ← Memory → stores report
```

Each agent builds on what previous agents learned. No manual context passing required.

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python main.py
```

## How It Works

1. **Research Agent** gathers information and stores it
2. **Analysis Agent** retrieves research, identifies patterns, stores analysis
3. **Writing Agent** retrieves everything, creates final report

All agents use the same `session_id` in metadata to scope their work.

## Key Code

```python
# Store with agent context
memory.add(
    content=f"Research findings: {findings}",
    metadata={"agent": "research", "session_id": "project-001"}
)

# Retrieve relevant context
context = memory.search(query="research findings AI", limit=5)
```
