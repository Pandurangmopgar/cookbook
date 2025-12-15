"""
Personal Knowledge Assistant with MemoryStack
=============================================
Your AI-powered "second brain" that learns from your documents,
notes, and conversations. Ask questions across all your knowledge.

Features:
- Upload PDFs, text files, and notes
- Semantic search across all your knowledge
- Learns your preferences and interests
- Remembers past questions and builds on them
- Personal knowledge graph visualization

Run: streamlit run main.py
"""

import os
import hashlib
from datetime import datetime
from typing import Optional
import streamlit as st
from dotenv import load_dotenv
from memorystack import MemoryStackClient
import google.generativeai as genai

load_dotenv()

# Page config
st.set_page_config(
    page_title="Personal Knowledge Assistant",
    page_icon="🧠",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .knowledge-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 12px;
        color: white;
        margin: 0.5rem 0;
    }
    .source-tag {
        background: rgba(255,255,255,0.2);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-right: 0.5rem;
    }
    .insight-box {
        background: #f8f9fa;
        border-left: 4px solid #667eea;
        padding: 1rem;
        margin: 1rem 0;
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
    st.session_state.user_id = "knowledge_user"
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "uploaded_docs" not in st.session_state:
    st.session_state.uploaded_docs = []


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks for better retrieval."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap
    return chunks


def generate_doc_id(content: str, filename: str) -> str:
    """Generate unique ID for document."""
    return hashlib.md5(f"{filename}:{content[:100]}".encode()).hexdigest()[:12]


def ingest_document(content: str, filename: str, doc_type: str):
    """Ingest a document into the knowledge base."""
    doc_id = generate_doc_id(content, filename)
    chunks = chunk_text(content)
    
    for i, chunk in enumerate(chunks):
        memory.add(
            content=chunk,
            user_id=st.session_state.user_id,
            metadata={
                "source": "document",
                "filename": filename,
                "doc_type": doc_type,
                "doc_id": doc_id,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "ingested_at": datetime.now().isoformat()
            }
        )
    
    return doc_id, len(chunks)


def search_knowledge(query: str, limit: int = 10) -> list:
    """Search across all knowledge sources."""
    results = memory.search(
        query=query,
        user_id=st.session_state.user_id,
        limit=limit
    )
    return results.get("results", [])


def generate_answer(question: str, context: list) -> str:
    """Generate answer using retrieved context."""
    # Build context string with sources
    context_parts = []
    sources = set()
    
    for r in context:
        content = r.get("content", "")
        metadata = r.get("metadata", {})
        source = metadata.get("filename", metadata.get("source", "memory"))
        sources.add(source)
        context_parts.append(f"[From {source}]: {content}")
    
    context_str = "\n\n".join(context_parts)
    
    prompt = f"""You are a personal knowledge assistant. Answer the user's question 
based on their personal knowledge base.

Retrieved Knowledge:
{context_str if context_str else "No relevant knowledge found."}

User Question: {question}

Instructions:
- Answer based on the retrieved knowledge
- Cite sources when possible (e.g., "According to your notes on X...")
- If the knowledge base doesn't contain relevant info, say so
- Be concise but thorough
- If you notice patterns or connections, mention them"""

    response = model.generate_content(prompt)
    return response.text, list(sources)


def save_interaction(question: str, answer: str, sources: list):
    """Save Q&A interaction to memory for learning."""
    memory.add(
        content=f"Q: {question}\nA: {answer}",
        user_id=st.session_state.user_id,
        metadata={
            "source": "qa_interaction",
            "sources_used": sources,
            "timestamp": datetime.now().isoformat()
        }
    )


def extract_insights(content: str) -> str:
    """Extract key insights from content."""
    prompt = f"""Extract 3-5 key insights or facts from this content.
Format as bullet points. Be concise.

Content:
{content[:3000]}"""
    
    response = model.generate_content(prompt)
    return response.text


# Sidebar
with st.sidebar:
    st.title("🧠 Knowledge Base")
    st.markdown("---")
    
    # User ID
    user_id = st.text_input("User ID", value=st.session_state.user_id)
    if user_id != st.session_state.user_id:
        st.session_state.user_id = user_id
        st.session_state.chat_history = []
        st.rerun()
    
    st.markdown("---")
    
    # Document upload
    st.subheader("📄 Add Knowledge")
    
    uploaded_file = st.file_uploader(
        "Upload document",
        type=["txt", "md", "pdf"],
        help="Upload text files, markdown, or PDFs"
    )
    
    if uploaded_file:
        if st.button("📥 Ingest Document"):
            with st.spinner("Processing..."):
                # Read content
                if uploaded_file.type == "application/pdf":
                    st.warning("PDF support requires PyPDF2. Using text extraction.")
                    content = uploaded_file.read().decode("utf-8", errors="ignore")
                else:
                    content = uploaded_file.read().decode("utf-8")
                
                # Ingest
                doc_id, chunks = ingest_document(
                    content, 
                    uploaded_file.name,
                    uploaded_file.type
                )
                
                st.success(f"✅ Ingested {chunks} chunks")
                st.session_state.uploaded_docs.append({
                    "name": uploaded_file.name,
                    "chunks": chunks,
                    "id": doc_id
                })
    
    # Quick note
    st.markdown("---")
    st.subheader("📝 Quick Note")
    note = st.text_area("Add a note", placeholder="Type a quick note...")
    if st.button("💾 Save Note") and note:
        memory.add(
            content=note,
            user_id=st.session_state.user_id,
            metadata={
                "source": "quick_note",
                "timestamp": datetime.now().isoformat()
            }
        )
        st.success("Note saved!")
    
    st.markdown("---")
    
    # Stats
    st.subheader("📊 Stats")
    try:
        stats = memory.get_stats()
        st.metric("Total Memories", stats.totals.get("memories", 0))
    except:
        st.info("Stats unavailable")


# Main content
st.title("🧠 Personal Knowledge Assistant")
st.caption("Your AI-powered second brain that learns from everything you feed it")

# Tabs
tab1, tab2, tab3 = st.tabs(["💬 Ask", "🔍 Explore", "💡 Insights"])

with tab1:
    st.subheader("Ask Your Knowledge Base")
    
    # Display chat history
    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])
            if msg.get("sources"):
                st.caption(f"Sources: {', '.join(msg['sources'])}")
    
    # Chat input
    if question := st.chat_input("Ask anything about your knowledge..."):
        # Add user message
        st.session_state.chat_history.append({
            "role": "user",
            "content": question
        })
        
        with st.chat_message("user"):
            st.write(question)
        
        # Search and generate
        with st.chat_message("assistant"):
            with st.spinner("Searching knowledge base..."):
                # Search
                context = search_knowledge(question, limit=8)
                
                # Generate answer
                answer, sources = generate_answer(question, context)
                st.write(answer)
                
                if sources:
                    st.caption(f"📚 Sources: {', '.join(sources)}")
                
                # Save interaction
                save_interaction(question, answer, sources)
        
        st.session_state.chat_history.append({
            "role": "assistant",
            "content": answer,
            "sources": sources
        })

with tab2:
    st.subheader("🔍 Explore Your Knowledge")
    
    col1, col2 = st.columns([3, 1])
    with col1:
        search_query = st.text_input("Search", placeholder="Search your knowledge base...")
    with col2:
        limit = st.number_input("Results", min_value=1, max_value=50, value=10)
    
    if search_query:
        results = search_knowledge(search_query, limit=limit)
        
        if results:
            st.success(f"Found {len(results)} relevant memories")
            
            for i, r in enumerate(results, 1):
                metadata = r.get("metadata", {})
                source = metadata.get("filename", metadata.get("source", "memory"))
                
                with st.expander(f"{i}. [{source}] {r['content'][:80]}..."):
                    st.write(r["content"])
                    st.markdown("---")
                    st.caption(f"Source: {source}")
                    if metadata.get("timestamp"):
                        st.caption(f"Added: {metadata['timestamp'][:10]}")
        else:
            st.info("No results found. Try different keywords.")

with tab3:
    st.subheader("💡 Knowledge Insights")
    
    insight_query = st.text_input(
        "What topic do you want insights on?",
        placeholder="e.g., project management, AI trends, meeting notes"
    )
    
    if st.button("🔮 Generate Insights") and insight_query:
        with st.spinner("Analyzing your knowledge..."):
            # Get relevant content
            results = search_knowledge(insight_query, limit=15)
            
            if results:
                # Combine content
                combined = "\n\n".join([r["content"] for r in results])
                
                # Generate insights
                prompt = f"""Analyze this collection of knowledge about "{insight_query}" 
and provide:

1. **Key Themes**: What are the main themes or topics?
2. **Patterns**: Any patterns or recurring ideas?
3. **Gaps**: What might be missing from this knowledge?
4. **Connections**: Interesting connections between different pieces?
5. **Action Items**: Suggested next steps or areas to explore?

Knowledge:
{combined[:5000]}"""

                response = model.generate_content(prompt)
                
                st.markdown("### 📊 Analysis Results")
                st.markdown(response.text)
                
                # Save insight
                memory.add(
                    content=f"Insight analysis on '{insight_query}':\n{response.text}",
                    user_id=st.session_state.user_id,
                    metadata={
                        "source": "insight_analysis",
                        "topic": insight_query,
                        "timestamp": datetime.now().isoformat()
                    }
                )
                st.success("💾 Insight saved to your knowledge base!")
            else:
                st.warning(f"No knowledge found about '{insight_query}'. Add some documents first!")

# Footer
st.markdown("---")
st.caption("Built with [MemoryStack](https://memorystack.app) • Your knowledge, always accessible")
