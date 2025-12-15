"""
Streamlit + Gemini + MemoryStack Chat
=====================================
A simple chatbot with persistent memory using Streamlit UI.

Features:
- Beautiful Streamlit chat interface
- Gemini 1.5 Flash for responses
- MemoryStack for persistent memory across sessions
- Semantic search for relevant context

Run: streamlit run main.py
"""

import os
import streamlit as st
from dotenv import load_dotenv
from memorystack import MemoryStackClient
import google.generativeai as genai

load_dotenv()

# Page config
st.set_page_config(
    page_title="MemoryStack + Gemini Chat",
    page_icon="🧠",
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

# Session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "user_id" not in st.session_state:
    st.session_state.user_id = "demo_user"

# Sidebar
with st.sidebar:
    st.title("🧠 MemoryStack Chat")
    st.markdown("---")
    
    # User ID input
    user_id = st.text_input("User ID", value=st.session_state.user_id)
    if user_id != st.session_state.user_id:
        st.session_state.user_id = user_id
        st.session_state.messages = []
        st.rerun()
    
    st.markdown("---")
    
    # Memory stats
    st.subheader("📊 Memory Stats")
    if st.button("Refresh Stats"):
        try:
            stats = memory.get_stats()
            st.metric("Total Memories", stats.totals.get("memories", 0))
        except Exception as e:
            st.error(f"Error: {e}")
    
    # Search memories
    st.markdown("---")
    st.subheader("🔍 Search Memories")
    search_query = st.text_input("Search query")
    if search_query:
        results = memory.search(search_query, user_id=st.session_state.user_id, limit=5)
        if results["results"]:
            for r in results["results"]:
                with st.expander(r["content"][:50] + "..."):
                    st.write(r["content"])
        else:
            st.info("No memories found")
    
    st.markdown("---")
    if st.button("Clear Chat"):
        st.session_state.messages = []
        st.rerun()

# Main chat area
st.title("💬 Chat with Memory")
st.caption("Your conversations are remembered across sessions!")

# Display chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

# Chat input
if prompt := st.chat_input("Type your message..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.write(prompt)
    
    # Get relevant memories
    with st.spinner("Searching memories..."):
        memories = memory.search(prompt, user_id=st.session_state.user_id, limit=5)
        context = ""
        if memories["results"]:
            context = "\n".join([f"- {r['content']}" for r in memories["results"]])
    
    # Generate response
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            system_prompt = f"""You are a helpful assistant with memory.

Relevant memories about this user:
{context if context else "No relevant memories yet."}

Respond naturally and reference relevant memories when appropriate.
Keep responses concise (2-3 sentences)."""

            response = model.generate_content(f"{system_prompt}\n\nUser: {prompt}")
            assistant_message = response.text
            st.write(assistant_message)
    
    # Save to memory
    st.session_state.messages.append({"role": "assistant", "content": assistant_message})
    
    # Store conversation in MemoryStack
    memory.add(
        content=[
            {"role": "user", "content": prompt},
            {"role": "assistant", "content": assistant_message}
        ],
        user_id=st.session_state.user_id,
        metadata={"source": "streamlit_chat"}
    )

# Footer
st.markdown("---")
st.caption("Powered by [MemoryStack](https://memorystack.app) + Gemini")
