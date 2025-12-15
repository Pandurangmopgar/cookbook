# 📋 AI Meeting Summarizer

Never forget what was decided. Process meeting transcripts, extract action items, and query across all your meetings.

![Meeting Summarizer](https://img.shields.io/badge/MemoryStack-Powered-purple)

## What It Does

- **Process Transcripts**: Upload or paste meeting notes
- **Auto-Extract**: Action items, decisions, topics, participants
- **Search Meetings**: "What did we decide about the budget?"
- **Track Action Items**: See all pending tasks across meetings
- **Generate Insights**: Patterns and trends from your meetings

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

### 📝 Meeting Processing
Paste a transcript and get:
- 2-3 sentence summary
- Extracted action items with owners
- Key decisions made
- Topics discussed
- Follow-up items

### 💬 Ask Your Meetings
Natural language queries:
- "What did we decide about the Q4 roadmap?"
- "What are John's pending action items?"
- "Summarize all meetings about the product launch"

### ✅ Action Item Tracking
- See all action items across meetings
- Track by owner, date, or status
- Never lose track of commitments

### 📊 Meeting Insights
Discover patterns:
- Recurring topics
- Decision trends
- Meeting effectiveness
- Recommendations

## How Memory Works

```python
# Meetings are stored with rich metadata
memory.add(
    content="Meeting: Weekly Standup\nSummary: ...",
    user_id="your_user_id",
    metadata={
        "type": "meeting",
        "title": "Weekly Standup",
        "date": "2024-01-15",
        "topics": ["roadmap", "bugs"]
    }
)

# Decisions are stored separately for easy retrieval
memory.add(
    content="Decision: We will launch on March 1st",
    metadata={
        "type": "decision",
        "meeting_title": "Planning Meeting"
    }
)

# Action items are tracked individually
memory.add(
    content="Action Item: John to prepare demo",
    metadata={
        "type": "action_item",
        "owner": "John",
        "status": "pending"
    }
)
```

## Example Questions

- "What decisions did we make last week?"
- "What are all the action items from the product meeting?"
- "Who is responsible for the marketing tasks?"
- "What topics keep coming up in our meetings?"
- "Summarize everything about the budget discussions"

## Use Cases

- **Team Leads**: Track decisions and action items
- **Project Managers**: Query project meeting history
- **Executives**: Get insights across all meetings
- **Anyone**: Never forget what was discussed

## Tips

- **Be Specific**: Include meeting titles for better organization
- **Regular Processing**: Process meetings soon after they happen
- **Use Dates**: Helps with temporal queries
- **Review Weekly**: Check action items and insights regularly

---

Built with [MemoryStack](https://memorystack.app) + Streamlit + Gemini
