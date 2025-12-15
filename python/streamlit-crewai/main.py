"""
Streamlit + CrewAI + MemoryStack
================================
CrewAI multi-agent team with persistent memory and Streamlit UI.

Features:
- CrewAI agents with specialized roles
- Custom MemoryStack tool for memory operations
- Real-time execution logs in Streamlit
- Persistent memory across crew runs

Run: streamlit run main.py
"""

import os
import sys
import time
import streamlit as st
from dotenv import load_dotenv
from typing import Optional
from memorystack import MemoryStackClient
from crewai import Agent, Task, Crew
from crewai.tools import BaseTool

load_dotenv()

# Page config
st.set_page_config(
    page_title="CrewAI + MemoryStack",
    page_icon="👥",
    layout="wide"
)

# Initialize MemoryStack
@st.cache_resource
def init_memory():
    return MemoryStackClient(api_key=os.getenv("MEMORYSTACK_API_KEY"))

memory_client = init_memory()


# Custom MemoryStack Tool for CrewAI
class MemoryStackTool(BaseTool):
    """Tool for CrewAI agents to store and retrieve memories."""
    
    name: str = "memory_tool"
    description: str = """Use this tool to store or search information.
    For storing: action='store', content='information to save'
    For searching: action='search', content='search query'"""
    
    def _run(self, action: str, content: str = "") -> str:
        """Execute memory operation."""
        try:
            if action == "store":
                memory_client.add(
                    content=content,
                    metadata={"source": "crewai", "agent": "crew_agent"}
                )
                return f"✅ Stored: {content[:100]}..."
            
            elif action == "search":
                results = memory_client.search(content, limit=5)
                if results["results"]:
                    memories = [r["content"][:150] for r in results["results"]]
                    return "Found memories:\n" + "\n".join(f"- {m}" for m in memories)
                return "No relevant memories found."
            
            else:
                return "Use action='store' or action='search'"
        
        except Exception as e:
            return f"Error: {str(e)}"


# Create CrewAI agents
def create_crew(topic: str, log_container):
    """Create a CrewAI crew for research tasks."""
    
    memory_tool = MemoryStackTool()
    
    # Researcher Agent
    researcher = Agent(
        role='Senior Researcher',
        goal=f'Research and gather key information about {topic}',
        backstory="""You are an expert researcher who finds accurate, 
        relevant information. You use the memory_tool to store findings 
        and check for existing research.""",
        tools=[memory_tool],
        llm="gemini/gemini-2.5-flash",
        verbose=True,
        allow_delegation=False
    )
    
    # Analyst Agent
    analyst = Agent(
        role='Data Analyst',
        goal='Analyze research findings and identify key insights',
        backstory="""You are a skilled analyst who processes information 
        and identifies patterns. You use memory_tool to retrieve research 
        and store your analysis.""",
        tools=[memory_tool],
        llm="gemini/gemini-2.5-flash",
        verbose=True,
        allow_delegation=False
    )
    
    # Writer Agent
    writer = Agent(
        role='Content Writer',
        goal='Create a clear, engaging summary of the research and analysis',
        backstory="""You are a professional writer who creates compelling 
        content. You use memory_tool to gather all context and store 
        the final report.""",
        tools=[memory_tool],
        llm="gemini/gemini-2.5-flash",
        verbose=True,
        allow_delegation=False
    )
    
    # Tasks
    research_task = Task(
        description=f"""Research the topic: {topic}
        
        1. First, search memory for existing research: memory_tool(action='search', content='{topic}')
        2. Gather 3-4 key facts about the topic
        3. Store each finding: memory_tool(action='store', content='your finding')
        
        Provide a summary of your research findings.""",
        agent=researcher,
        expected_output="Research findings with 3-4 key facts"
    )
    
    analysis_task = Task(
        description=f"""Analyze the research on: {topic}
        
        1. Search for research: memory_tool(action='search', content='{topic} research')
        2. Identify 2-3 key patterns or insights
        3. Store your analysis: memory_tool(action='store', content='your analysis')
        
        Provide your analytical insights.""",
        agent=analyst,
        expected_output="Analysis with 2-3 key insights"
    )
    
    writing_task = Task(
        description=f"""Write an executive summary about: {topic}
        
        1. Search for all context: memory_tool(action='search', content='{topic}')
        2. Write a 2-3 paragraph executive summary
        3. Store the final report: memory_tool(action='store', content='Executive Summary: ...')
        
        Provide the final executive summary.""",
        agent=writer,
        expected_output="Executive summary in 2-3 paragraphs"
    )
    
    # Create crew
    crew = Crew(
        agents=[researcher, analyst, writer],
        tasks=[research_task, analysis_task, writing_task],
        verbose=True
    )
    
    return crew


# Session state
if "crew_result" not in st.session_state:
    st.session_state.crew_result = None
if "running" not in st.session_state:
    st.session_state.running = False
if "logs" not in st.session_state:
    st.session_state.logs = []

# Sidebar
with st.sidebar:
    st.title("👥 CrewAI + Memory")
    st.markdown("---")
    
    st.subheader("The Crew")
    st.markdown("""
    🔍 **Researcher** - Gathers facts  
    📊 **Analyst** - Finds patterns  
    ✍️ **Writer** - Creates report
    """)
    
    st.markdown("---")
    
    # Memory search
    st.subheader("🧠 Memory Search")
    search = st.text_input("Search memories")
    if search:
        results = memory_client.search(search, limit=5)
        for r in results.get("results", []):
            with st.expander(r["content"][:40] + "..."):
                st.write(r["content"])
    
    st.markdown("---")
    st.info("""
    **How it works:**
    - Each agent has a memory tool
    - Agents store findings as they work
    - Agents can search past memories
    - All memories persist across runs
    """)

# Main area
st.title("👥 CrewAI Multi-Agent Team")
st.caption("Research crew with shared persistent memory")

# Input
col1, col2 = st.columns([3, 1])
with col1:
    topic = st.text_input(
        "Enter a topic for the crew to research",
        placeholder="e.g., Future of renewable energy"
    )
with col2:
    st.write("")
    st.write("")
    run_button = st.button("🚀 Start Crew", disabled=st.session_state.running)

# Run crew
if run_button and topic:
    st.session_state.running = True
    st.session_state.crew_result = None
    st.session_state.logs = []
    
    st.markdown("---")
    st.subheader("⏳ Crew Execution")
    
    # Progress
    progress = st.progress(0)
    status = st.empty()
    log_container = st.container()
    
    try:
        status.text("🔍 Researcher working...")
        progress.progress(10)
        
        # Create and run crew
        crew = create_crew(topic, log_container)
        
        status.text("👥 Crew executing tasks...")
        progress.progress(30)
        
        # Execute
        result = crew.kickoff()
        
        progress.progress(100)
        status.text("✅ Crew finished!")
        
        st.session_state.crew_result = str(result)
        
    except Exception as e:
        st.error(f"Error: {str(e)}")
        import traceback
        st.code(traceback.format_exc())
    
    finally:
        st.session_state.running = False

# Display results
if st.session_state.crew_result:
    st.markdown("---")
    st.subheader("📋 Final Report")
    st.markdown(st.session_state.crew_result)
    
    st.success("✅ Report saved to MemoryStack! The crew can reference this in future runs.")

# Footer
st.markdown("---")
st.caption("Powered by CrewAI + MemoryStack + Gemini")
