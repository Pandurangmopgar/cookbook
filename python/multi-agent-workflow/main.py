"""
Multi-Agent Workflow Example
============================
Demonstrates how multiple AI agents can share context through MemoryStack.

Use Case: Research → Analysis → Writing pipeline where each agent
builds on what the previous agent learned.

Run: python main.py
"""

import os
from dotenv import load_dotenv
from memorystack import MemoryStackClient
import google.generativeai as genai

load_dotenv()

# Initialize clients
memory = MemoryStackClient(api_key=os.getenv("MEMORYSTACK_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

# Shared session for all agents
SESSION_ID = "research-project-001"


def research_agent(topic: str) -> str:
    """Research agent gathers information on a topic."""
    print(f"\n🔍 Research Agent: Researching '{topic}'...")
    
    # Generate research findings
    response = model.generate_content(
        f"You are a research agent. Provide 3 key findings about: {topic}. "
        "Be concise and factual. Format as bullet points."
    )
    findings = response.text
    
    # Store findings in shared memory
    memory.add(
        content=f"Research findings on {topic}:\n{findings}",
        metadata={
            "agent": "research",
            "session_id": SESSION_ID,
            "topic": topic,
            "type": "research_findings"
        }
    )
    
    print(f"   ✅ Stored {len(findings.split('•'))} findings to memory")
    return findings


def analysis_agent(topic: str) -> str:
    """Analysis agent processes research and identifies patterns."""
    print(f"\n📊 Analysis Agent: Analyzing research on '{topic}'...")
    
    # Retrieve research from memory
    research = memory.search(
        query=f"research findings {topic}",
        limit=5
    )
    
    if not research["results"]:
        return "No research found to analyze."
    
    # Build context from retrieved memories
    context = "\n".join([r["content"] for r in research["results"]])
    print(f"   📥 Retrieved {len(research['results'])} research memories")
    
    # Generate analysis
    response = model.generate_content(
        f"You are an analysis agent. Based on this research:\n\n{context}\n\n"
        "Identify 2-3 key patterns or insights. Be analytical and concise."
    )
    analysis = response.text
    
    # Store analysis in shared memory
    memory.add(
        content=f"Analysis of {topic}:\n{analysis}",
        metadata={
            "agent": "analysis",
            "session_id": SESSION_ID,
            "topic": topic,
            "type": "analysis"
        }
    )
    
    print(f"   ✅ Stored analysis to memory")
    return analysis


def writing_agent(topic: str) -> str:
    """Writing agent creates final report using all context."""
    print(f"\n✍️ Writing Agent: Creating report on '{topic}'...")
    
    # Retrieve ALL context (research + analysis)
    context = memory.search(
        query=f"{topic} research analysis findings insights",
        limit=10
    )
    
    if not context["results"]:
        return "No context found for report."
    
    # Build full context
    full_context = "\n\n".join([r["content"] for r in context["results"]])
    print(f"   📥 Retrieved {len(context['results'])} memories for context")
    
    # Generate report
    response = model.generate_content(
        f"You are a writing agent. Create a brief executive summary based on:\n\n"
        f"{full_context}\n\n"
        "Write 2-3 paragraphs. Be professional and clear."
    )
    report = response.text
    
    # Store final report
    memory.add(
        content=f"Executive Summary - {topic}:\n{report}",
        metadata={
            "agent": "writing",
            "session_id": SESSION_ID,
            "topic": topic,
            "type": "final_report"
        }
    )
    
    print(f"   ✅ Stored final report to memory")
    return report


def run_workflow(topic: str):
    """Run the full multi-agent workflow."""
    print("=" * 60)
    print(f"🚀 Starting Multi-Agent Workflow: {topic}")
    print("=" * 60)
    
    # Step 1: Research
    research = research_agent(topic)
    print(f"\n   Research Output:\n{research[:200]}...")
    
    # Step 2: Analysis (uses research from memory)
    analysis = analysis_agent(topic)
    print(f"\n   Analysis Output:\n{analysis[:200]}...")
    
    # Step 3: Writing (uses research + analysis from memory)
    report = writing_agent(topic)
    
    print("\n" + "=" * 60)
    print("📄 FINAL REPORT")
    print("=" * 60)
    print(report)
    print("\n✅ Workflow complete! All agents shared context via MemoryStack.")


if __name__ == "__main__":
    # Example: Research AI trends
    run_workflow("AI adoption in enterprise software 2024")
