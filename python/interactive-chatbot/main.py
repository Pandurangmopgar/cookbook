"""
Interactive Chatbot with MemoryStack
====================================
A feature-rich Streamlit chatbot demonstrating MemoryStack capabilities.

Features:
- Multi-user support with user isolation
- Memory visualization and management
- Conversation export/import
- Memory statistics dashboard

Run: streamlit run main.py
"""

import os
import json
import streamlit as st
from datetime import datetime
from dotenv import load_dotenv
from memorystack import MemoryStackClient
import google.generativeai as genai

load_dotenv()

# Page config
st.set_page_config(
    page_title="MemoryStack Chatbot",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .memory-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        margin: 0.5rem 0;
    }
    .stat-card {
        background: #f0f2f6;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
    }
</style>
""", unsafe_allow_html=True)

# Initialize clients
@st.cache_resource
def init_clients():
    memory = MemoryStackClient(api_key=os.getenv("MEMORYSTACK_API_KEY"))
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash")
    return memory, model

memory, model = init_clients()

# Session state initialization
defaults = {
    "messages": [],
    "user_id": "demo_user",
    "page": "chat",
    "memory_count": 0
}
for key, value in defaults.items():
    if key not in st.session_state:
        st.session_state[key] = value


def get_context(query: str, user_id: str) -> str:
    """Get relevant context from memory."""
    results = memory.search(query, user_id=user_id, limit=5)
    if not results["results"]:
        return ""
    return "\n".join([f"- {r['content']}" for r in results["results"]])


def generate_response(user_message: str, context: str) -> str:
    """Generate AI response with context."""
    prompt = f"""You are a helpful AI assistant with memory.

Relevant memories about this user:
{context if context else "No relevant memories yet."}

User message: {user_message}

Respond naturally. Reference relevant memories when appropriate.
Keep responses concise (2-3 sentences)."""

    response = model.generate_content(prompt)
    return response.text


def save_conversation(user_msg: str, ai_msg: str, user_id: str):
    """Save conversation to MemoryStack."""
    memory.add(
        content=[
            {"role": "user", "content": user_msg},
            {"role": "assistant", "content": ai_msg}
        ],
        user_id=user_id,
        metadata={
            "source": "streamlit_chatbot",
            "timestamp": datetime.now().isoformat()
        }
    )


# Sidebar navigation
with st.sidebar:
    st.title("🧠 MemoryStack")
    st.markdown("---")
    
    # Navigation
    page = st.radio(
        "Navigation",
        ["💬 Chat", "🔍 Search", "📊 Stats", "⚙️ Settings"],
        label_visibility="collapsed"
    )
    st.session_state.page = page
    
    st.markdown("---")
    
    # User selector
    st.subheader("👤 User")
    user_id = st.text_input("User ID", value=st.session_state.user_id)
    if user_id != st.session_state.user_id:
        st.session_state.user_id = user_id
        st.session_state.messages = []
        st.rerun()
    
    st.markdown("---")
    
    # Quick stats
    st.subheader("📈 Quick Stats")
    try:
        stats = memory.get_stats()
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Memories", stats.totals.get("memories", 0))
        with col2:
            st.metric("Searches", stats.usage.get("searches", 0))
    except:
        st.info("Stats unavailable")


# Main content based on page
if st.session_state.page == "💬 Chat":
    st.title("💬 Chat with Memory")
    st.caption(f"Chatting as: {st.session_state.user_id}")
    
    # Display messages
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])
    
    # Chat input
    if prompt := st.chat_input("Type your message..."):
        # Add user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.write(prompt)
        
        # Get context and generate response
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                context = get_context(prompt, st.session_state.user_id)
                response = generate_response(prompt, context)
                st.write(response)
        
        # Save and update state
        st.session_state.messages.append({"role": "assistant", "content": response})
        save_conversation(prompt, response, st.session_state.user_id)
    
    # Clear chat button
    if st.session_state.messages:
        if st.button("🗑️ Clear Chat"):
            st.session_state.messages = []
            st.rerun()


elif st.session_state.page == "🔍 Search":
    st.title("🔍 Search Memories")
    
    search_query = st.text_input("Search query", placeholder="What do you want to find?")
    
    col1, col2 = st.columns([2, 1])
    with col1:
        limit = st.slider("Results limit", 1, 20, 10)
    with col2:
        search_btn = st.button("🔍 Search", type="primary")
    
    if search_query and search_btn:
        with st.spinner("Searching..."):
            results = memory.search(
                search_query,
                user_id=st.session_state.user_id,
                limit=limit
            )
        
        if results["results"]:
            st.success(f"Found {len(results['results'])} memories")
            
            for i, r in enumerate(results["results"], 1):
                with st.expander(f"Memory {i}: {r['content'][:50]}..."):
                    st.write(r["content"])
                    st.caption(f"Type: {r.get('memory_type', 'unknown')}")
                    if r.get("metadata"):
                        st.json(r["metadata"])
        else:
            st.info("No memories found matching your query")


elif st.session_state.page == "📊 Stats":
    st.title("📊 Memory Statistics")
    
    try:
        stats = memory.get_stats()
        
        # Overview cards
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Memories", stats.totals.get("memories", 0))
        with col2:
            st.metric("API Calls", stats.usage.get("api_calls", 0))
        with col3:
            st.metric("Searches", stats.usage.get("searches", 0))
        with col4:
            st.metric("Plan", stats.plan_tier or "Free")
        
        st.markdown("---")
        
        # Detailed stats
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("📦 Storage")
            st.json(stats.storage)
        
        with col2:
            st.subheader("📈 Usage")
            st.json(stats.usage)
        
    except Exception as e:
        st.error(f"Could not load stats: {e}")


elif st.session_state.page == "⚙️ Settings":
    st.title("⚙️ Settings")
    
    st.subheader("👤 User Management")
    new_user = st.text_input("Switch to user", placeholder="Enter user ID")
    if st.button("Switch User") and new_user:
        st.session_state.user_id = new_user
        st.session_state.messages = []
        st.success(f"Switched to user: {new_user}")
        st.rerun()
    
    st.markdown("---")
    
    st.subheader("💾 Export/Import")
    
    # Export
    if st.button("📤 Export Chat History"):
        export_data = {
            "user_id": st.session_state.user_id,
            "messages": st.session_state.messages,
            "exported_at": datetime.now().isoformat()
        }
        st.download_button(
            "Download JSON",
            json.dumps(export_data, indent=2),
            f"chat_export_{st.session_state.user_id}.json",
            "application/json"
        )
    
    # Import
    uploaded = st.file_uploader("📥 Import Chat History", type="json")
    if uploaded:
        try:
            data = json.load(uploaded)
            st.session_state.messages = data.get("messages", [])
            st.success("Chat history imported!")
            st.rerun()
        except Exception as e:
            st.error(f"Import failed: {e}")
    
    st.markdown("---")
    
    st.subheader("🔧 API Configuration")
    st.code(f"""
MEMORYSTACK_API_KEY={os.getenv('MEMORYSTACK_API_KEY', 'not set')[:20]}...
GEMINI_API_KEY={os.getenv('GEMINI_API_KEY', 'not set')[:10]}...
    """)


# Footer
st.markdown("---")
st.caption("Built with [MemoryStack](https://memorystack.app) + Streamlit + Gemini")
