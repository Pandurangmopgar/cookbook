"""
AI Meeting Summarizer with MemoryStack
======================================
Process meeting transcripts, extract action items, and query
across all your meetings. Never forget what was decided.

Features:
- Upload meeting transcripts or paste text
- Auto-extract action items and decisions
- Search across all meetings ("What did we decide about X?")
- Track action item completion
- Meeting insights and patterns

Run: streamlit run main.py
"""

import os
import json
from datetime import datetime
from typing import Optional
import streamlit as st
from dotenv import load_dotenv
from memorystack import MemoryStackClient
import google.generativeai as genai

load_dotenv()

# Page config
st.set_page_config(
    page_title="AI Meeting Summarizer",
    page_icon="📋",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .action-item {
        background: #fff3cd;
        border-left: 4px solid #ffc107;
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 0 8px 8px 0;
    }
    .decision-item {
        background: #d4edda;
        border-left: 4px solid #28a745;
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 0 8px 8px 0;
    }
    .meeting-card {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        padding: 1.5rem;
        border-radius: 12px;
        color: white;
        margin: 0.5rem 0;
    }
</style>
""", unsafe_allow_html=True)


# Initialize clients
@st.cache_resource
def init_clients():
    memory = MemoryStackClient(api_key=os.getenv("MEMORYSTACK_API_KEY"))
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.0-flash")
    return memory, model

memory, model = init_clients()

# Session state
if "user_id" not in st.session_state:
    st.session_state.user_id = "meeting_user"
if "current_meeting" not in st.session_state:
    st.session_state.current_meeting = None


def extract_meeting_info(transcript: str) -> dict:
    """Extract structured info from meeting transcript."""
    prompt = f"""Analyze this meeting transcript and extract:

1. **Summary**: 2-3 sentence overview
2. **Key Decisions**: List of decisions made (if any)
3. **Action Items**: List with format "- [Owner] Task description [Due date if mentioned]"
4. **Topics Discussed**: Main topics covered
5. **Participants**: Names mentioned (if any)
6. **Follow-ups Needed**: Items requiring follow-up

Transcript:
{transcript[:8000]}

Respond in JSON format:
{{
    "summary": "...",
    "decisions": ["decision 1", "decision 2"],
    "action_items": [
        {{"owner": "Person", "task": "Do X", "due": "Friday"}}
    ],
    "topics": ["topic 1", "topic 2"],
    "participants": ["name1", "name2"],
    "follow_ups": ["follow up 1"]
}}"""

    response = model.generate_content(prompt)
    
    # Parse JSON from response
    try:
        # Extract JSON from response
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        return json.loads(text)
    except:
        return {
            "summary": response.text,
            "decisions": [],
            "action_items": [],
            "topics": [],
            "participants": [],
            "follow_ups": []
        }


def save_meeting(title: str, date: str, transcript: str, extracted: dict):
    """Save meeting and its components to memory."""
    meeting_id = f"meeting_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Save full meeting
    memory.add(
        content=f"Meeting: {title}\nDate: {date}\n\nSummary: {extracted['summary']}\n\nTranscript:\n{transcript[:3000]}",
        user_id=st.session_state.user_id,
        metadata={
            "type": "meeting",
            "meeting_id": meeting_id,
            "title": title,
            "date": date,
            "topics": extracted.get("topics", []),
            "participants": extracted.get("participants", [])
        }
    )
    
    # Save decisions separately for easy retrieval
    for decision in extracted.get("decisions", []):
        memory.add(
            content=f"Decision from '{title}' ({date}): {decision}",
            user_id=st.session_state.user_id,
            metadata={
                "type": "decision",
                "meeting_id": meeting_id,
                "meeting_title": title,
                "date": date
            }
        )
    
    # Save action items
    for item in extracted.get("action_items", []):
        if isinstance(item, dict):
            content = f"Action Item from '{title}': {item.get('task', '')} - Owner: {item.get('owner', 'Unassigned')} - Due: {item.get('due', 'TBD')}"
        else:
            content = f"Action Item from '{title}': {item}"
        
        memory.add(
            content=content,
            user_id=st.session_state.user_id,
            metadata={
                "type": "action_item",
                "meeting_id": meeting_id,
                "meeting_title": title,
                "date": date,
                "status": "pending"
            }
        )
    
    return meeting_id


def search_meetings(query: str, filter_type: Optional[str] = None) -> list:
    """Search across all meetings."""
    results = memory.search(
        query=query,
        user_id=st.session_state.user_id,
        limit=15
    )
    
    memories = results.get("results", [])
    
    # Filter by type if specified
    if filter_type:
        memories = [m for m in memories if m.get("metadata", {}).get("type") == filter_type]
    
    return memories


def answer_meeting_question(question: str) -> str:
    """Answer questions about meetings."""
    # Search for relevant context
    results = search_meetings(question)
    
    context = "\n\n".join([
        f"[{r.get('metadata', {}).get('type', 'meeting')}] {r['content']}"
        for r in results
    ])
    
    prompt = f"""You are a meeting assistant. Answer the user's question based on 
their meeting history.

Meeting Context:
{context if context else "No relevant meetings found."}

Question: {question}

Instructions:
- Be specific and cite which meeting the info comes from
- If asking about action items, list them clearly
- If asking about decisions, quote the decision
- If info isn't in the meetings, say so"""

    response = model.generate_content(prompt)
    return response.text


# Sidebar
with st.sidebar:
    st.title("📋 Meeting Hub")
    st.markdown("---")
    
    # User ID
    user_id = st.text_input("User ID", value=st.session_state.user_id)
    if user_id != st.session_state.user_id:
        st.session_state.user_id = user_id
        st.rerun()
    
    st.markdown("---")
    
    # Quick search
    st.subheader("🔍 Quick Search")
    quick_search = st.text_input("Search meetings", placeholder="What did we decide about...")
    if quick_search:
        results = search_meetings(quick_search)
        for r in results[:5]:
            meta = r.get("metadata", {})
            st.caption(f"**{meta.get('type', 'meeting')}**: {r['content'][:100]}...")
    
    st.markdown("---")
    
    # Stats
    st.subheader("📊 Stats")
    try:
        # Count by type
        all_results = memory.search("meeting decision action", user_id=st.session_state.user_id, limit=100)
        meetings = [r for r in all_results.get("results", []) if r.get("metadata", {}).get("type") == "meeting"]
        actions = [r for r in all_results.get("results", []) if r.get("metadata", {}).get("type") == "action_item"]
        decisions = [r for r in all_results.get("results", []) if r.get("metadata", {}).get("type") == "decision"]
        
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Meetings", len(meetings))
            st.metric("Decisions", len(decisions))
        with col2:
            st.metric("Action Items", len(actions))
    except:
        st.info("Stats unavailable")


# Main content
st.title("📋 AI Meeting Summarizer")
st.caption("Never forget what was decided. Query all your meetings with AI.")

# Tabs
tab1, tab2, tab3, tab4 = st.tabs(["📝 New Meeting", "💬 Ask", "✅ Action Items", "📊 Insights"])

with tab1:
    st.subheader("Process New Meeting")
    
    col1, col2 = st.columns(2)
    with col1:
        meeting_title = st.text_input("Meeting Title", placeholder="Weekly Standup")
    with col2:
        meeting_date = st.date_input("Date", value=datetime.now())
    
    transcript = st.text_area(
        "Meeting Transcript",
        height=300,
        placeholder="Paste your meeting transcript or notes here..."
    )
    
    # Or upload file
    uploaded = st.file_uploader("Or upload transcript", type=["txt", "md"])
    if uploaded:
        transcript = uploaded.read().decode("utf-8")
        st.text_area("Uploaded content", value=transcript[:500] + "...", disabled=True)
    
    if st.button("🚀 Process Meeting", type="primary") and transcript and meeting_title:
        with st.spinner("Analyzing meeting..."):
            # Extract info
            extracted = extract_meeting_info(transcript)
            st.session_state.current_meeting = extracted
            
            # Save to memory
            meeting_id = save_meeting(
                meeting_title,
                meeting_date.isoformat(),
                transcript,
                extracted
            )
        
        st.success(f"✅ Meeting processed and saved!")
        
        # Display results
        st.markdown("### 📄 Summary")
        st.write(extracted.get("summary", "No summary generated"))
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### ✅ Action Items")
            for item in extracted.get("action_items", []):
                if isinstance(item, dict):
                    st.markdown(f"""
                    <div class="action-item">
                        <strong>{item.get('owner', 'Unassigned')}</strong>: {item.get('task', '')}
                        <br><small>Due: {item.get('due', 'TBD')}</small>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f'<div class="action-item">{item}</div>', unsafe_allow_html=True)
        
        with col2:
            st.markdown("### 🎯 Decisions")
            for decision in extracted.get("decisions", []):
                st.markdown(f'<div class="decision-item">{decision}</div>', unsafe_allow_html=True)
        
        st.markdown("### 📌 Topics Discussed")
        if extracted.get("topics"):
            st.write(", ".join(extracted["topics"]))

with tab2:
    st.subheader("💬 Ask About Your Meetings")
    
    # Example questions
    st.caption("Try asking:")
    example_cols = st.columns(3)
    examples = [
        "What did we decide about the budget?",
        "What are my pending action items?",
        "Summarize last week's meetings"
    ]
    
    for col, example in zip(example_cols, examples):
        if col.button(example, key=example):
            st.session_state.meeting_question = example
    
    question = st.text_input(
        "Your question",
        value=st.session_state.get("meeting_question", ""),
        placeholder="What did we decide about..."
    )
    
    if st.button("🔍 Search Meetings") and question:
        with st.spinner("Searching meetings..."):
            answer = answer_meeting_question(question)
        
        st.markdown("### Answer")
        st.write(answer)
        
        # Show related meetings
        st.markdown("### Related Meetings")
        results = search_meetings(question, filter_type="meeting")
        for r in results[:3]:
            meta = r.get("metadata", {})
            with st.expander(f"📅 {meta.get('title', 'Meeting')} - {meta.get('date', '')}"):
                st.write(r["content"][:500] + "...")

with tab3:
    st.subheader("✅ Action Items Tracker")
    
    # Get all action items
    action_results = search_meetings("action item task", filter_type="action_item")
    
    if action_results:
        st.write(f"Found {len(action_results)} action items")
        
        for item in action_results:
            meta = item.get("metadata", {})
            col1, col2, col3 = st.columns([3, 1, 1])
            
            with col1:
                st.write(item["content"])
            with col2:
                st.caption(meta.get("date", ""))
            with col3:
                status = meta.get("status", "pending")
                if status == "pending":
                    st.warning("Pending")
                else:
                    st.success("Done")
    else:
        st.info("No action items found. Process some meetings first!")

with tab4:
    st.subheader("📊 Meeting Insights")
    
    if st.button("🔮 Generate Insights"):
        with st.spinner("Analyzing your meetings..."):
            # Get recent meetings
            meetings = search_meetings("meeting summary decision action", filter_type=None)
            
            if meetings:
                context = "\n\n".join([m["content"][:500] for m in meetings[:20]])
                
                prompt = f"""Analyze these meeting summaries and provide insights:

{context}

Provide:
1. **Meeting Patterns**: How often, what topics recur?
2. **Decision Trends**: What kinds of decisions are being made?
3. **Action Item Status**: Are items getting completed?
4. **Recommendations**: How to make meetings more effective?
5. **Key Themes**: What topics dominate discussions?"""

                response = model.generate_content(prompt)
                st.markdown(response.text)
            else:
                st.info("Process some meetings first to see insights!")

# Footer
st.markdown("---")
st.caption("Built with [MemoryStack](https://memorystack.app) • Never forget what was decided")
