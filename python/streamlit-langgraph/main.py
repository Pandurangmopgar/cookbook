"""
Streamlit + LangGraph + MemoryStack
===================================
Multi-agent workflow with LangGraph and persistent memory.

Features:
- LangGraph state machine for agent orchestration
- Multiple specialized agents (Research, Analysis, Summary)
- MemoryStack for cross-agent memory sharing
- Visual workflow status in Streamlit

Run: streamlit run main.py
"""

import os
import streamlit as st
from dotenv import load_dotenv
from typing import TypedDict, Annotated, Sequence
from memorystack import MemoryStackClient
import google.generativeai as genai
from langgraph.graph import StateGraph, END

load_dotenv()

# Page config
st.set_page_config(
    page_title="LangGraph + MemoryStack",
    page_icon="🔄",
    layout="wide"
)

# Initialize clients
@st.cache_resource
def init_clients():
    memory = MemoryStackClient(api_key=os.getenv("MEMORYSTACK_API_KEY"))
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")
    return memory, model

memory, model = init_clients()


# Define state schema
class AgentState(TypedDict):
    topic: str
    research: str
    analysis: str
    summary: str
    current_agent: str
    messages: Sequence[str]


# Agent functions
def research_agent(state: AgentState) -> AgentState:
    """Research agent gathers information."""
    topic = state["topic"]
    
    # Check memory for existing research
    existing = memory.search(f"research {topic}", limit=3)
    context = ""
    if existing["results"]:
        context = f"\nExisting research:\n" + "\n".join(
            [r["content"][:200] for r in existing["results"]]
        )
    
    prompt = f"""You are a research agent. Research this topic: {topic}
{context}

Provide 3-4 key facts or findings. Be concise and factual."""

    response = model.generate_content(prompt)
    research = response.text
    
    # Store in memory
    memory.add(
        content=f"Research on {topic}:\n{research}",
        metadata={"agent": "research", "topic": topic}
    )
    
    return {
        **state,
        "research": research,
        "current_agent": "analysis",
        "messages": state["messages"] + [f"✅ Research complete"]
    }


def analysis_agent(state: AgentState) -> AgentState:
    """Analysis agent processes research."""
    topic = state["topic"]
    research = state["research"]
    
    prompt = f"""You are an analysis agent. Analyze this research:

Topic: {topic}
Research: {research}

Identify 2-3 key insights or patterns. Be analytical."""

    response = model.generate_content(prompt)
    analysis = response.text
    
    # Store in memory
    memory.add(
        content=f"Analysis of {topic}:\n{analysis}",
        metadata={"agent": "analysis", "topic": topic}
    )
    
    return {
        **state,
        "analysis": analysis,
        "current_agent": "summary",
        "messages": state["messages"] + [f"✅ Analysis complete"]
    }


def summary_agent(state: AgentState) -> AgentState:
    """Summary agent creates final output."""
    topic = state["topic"]
    research = state["research"]
    analysis = state["analysis"]
    
    prompt = f"""You are a summary agent. Create an executive summary:

Topic: {topic}
Research: {research}
Analysis: {analysis}

Write a 2-3 paragraph executive summary. Be professional and clear."""

    response = model.generate_content(prompt)
    summary = response.text
    
    # Store in memory
    memory.add(
        content=f"Executive Summary - {topic}:\n{summary}",
        metadata={"agent": "summary", "topic": topic, "type": "final"}
    )
    
    return {
        **state,
        "summary": summary,
        "current_agent": "done",
        "messages": state["messages"] + [f"✅ Summary complete"]
    }


# Build the graph
def build_workflow():
    """Build LangGraph workflow."""
    workflow = StateGraph(AgentState)
    
    # Add nodes (using different names than state keys to avoid conflict)
    workflow.add_node("research_node", research_agent)
    workflow.add_node("analysis_node", analysis_agent)
    workflow.add_node("summary_node", summary_agent)
    
    # Add edges
    workflow.set_entry_point("research_node")
    workflow.add_edge("research_node", "analysis_node")
    workflow.add_edge("analysis_node", "summary_node")
    workflow.add_edge("summary_node", END)
    
    return workflow.compile()


# Session state
if "workflow_result" not in st.session_state:
    st.session_state.workflow_result = None
if "running" not in st.session_state:
    st.session_state.running = False

# Sidebar
with st.sidebar:
    st.title("🔄 LangGraph Workflow")
    st.markdown("---")
    
    st.subheader("Workflow Agents")
    st.markdown("""
    1. 🔍 **Research Agent** - Gathers facts
    2. 📊 **Analysis Agent** - Finds patterns  
    3. ✍️ **Summary Agent** - Creates report
    """)
    
    st.markdown("---")
    
    # Search past workflows
    st.subheader("📚 Past Workflows")
    search = st.text_input("Search memories")
    if search:
        results = memory.search(search, limit=5)
        for r in results.get("results", []):
            agent = r.get("metadata", {}).get("agent", "unknown")
            with st.expander(f"[{agent}] {r['content'][:30]}..."):
                st.write(r["content"])

# Main area
st.title("🔄 LangGraph Multi-Agent Workflow")
st.caption("Research → Analysis → Summary pipeline with shared memory")

# Input
col1, col2 = st.columns([3, 1])
with col1:
    topic = st.text_input(
        "Enter a topic to research",
        placeholder="e.g., AI trends in healthcare 2024"
    )
with col2:
    st.write("")  # Spacing
    st.write("")
    run_button = st.button("🚀 Run Workflow", disabled=st.session_state.running)

# Run workflow
if run_button and topic:
    st.session_state.running = True
    st.session_state.workflow_result = None
    
    # Progress display
    progress_container = st.container()
    
    with progress_container:
        st.subheader("⏳ Workflow Progress")
        
        # Build and run workflow
        app = build_workflow()
        
        initial_state = {
            "topic": topic,
            "research": "",
            "analysis": "",
            "summary": "",
            "current_agent": "research",
            "messages": []
        }
        
        # Run with progress updates
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        status_text.text("🔍 Research Agent working...")
        progress_bar.progress(10)
        
        # Execute workflow
        result = app.invoke(initial_state)
        
        progress_bar.progress(100)
        status_text.text("✅ Workflow complete!")
        
        st.session_state.workflow_result = result
        st.session_state.running = False

# Display results
if st.session_state.workflow_result:
    result = st.session_state.workflow_result
    
    st.markdown("---")
    st.subheader("📋 Results")
    
    # Tabs for each stage
    tab1, tab2, tab3 = st.tabs(["🔍 Research", "📊 Analysis", "✍️ Summary"])
    
    with tab1:
        st.markdown(result["research"])
    
    with tab2:
        st.markdown(result["analysis"])
    
    with tab3:
        st.markdown(result["summary"])
    
    # Success message
    st.success("All results saved to MemoryStack! Future workflows can reference this research.")

# Footer
st.markdown("---")
st.caption("Powered by LangGraph + MemoryStack + Gemini")
