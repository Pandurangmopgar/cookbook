"""
Streamlit + LangChain + MemoryStack
===================================
LangChain agent with persistent memory and Streamlit UI.

Features:
- LangChain ConversationChain with custom memory
- MemoryStack for persistent storage
- Gemini as the LLM backend
- Beautiful Streamlit interface

Run: streamlit run main.py
"""

import os
import streamlit as st
from dotenv import load_dotenv
from memorystack import MemoryStackClient
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate

load_dotenv()

# Page config
st.set_page_config(
    page_title="LangChain + MemoryStack",
    page_icon="🦜",
    layout="wide"
)

# Custom MemoryStack-backed memory class
class MemoryStackLangChainMemory(ConversationBufferWindowMemory):
    """LangChain memory backed by MemoryStack for persistence."""
    
    def __init__(self, memory_client: MemoryStackClient, user_id: str, **kwargs):
        super().__init__(**kwargs)
        self.memory_client = memory_client
        self.user_id = user_id
        self._load_from_memorystack()
    
    def _load_from_memorystack(self):
        """Load recent memories from MemoryStack."""
        try:
            results = self.memory_client.search(
                query="conversation history",
                user_id=self.user_id,
                limit=10
            )
            # Load into buffer (most recent first)
            for r in reversed(results.get("results", [])):
                content = r.get("content", "")
                if "User:" in content and "Assistant:" in content:
                    parts = content.split("Assistant:")
                    if len(parts) == 2:
                        user_part = parts[0].replace("User:", "").strip()
                        ai_part = parts[1].strip()
                        self.chat_memory.add_user_message(user_part)
                        self.chat_memory.add_ai_message(ai_part)
        except Exception as e:
            st.warning(f"Could not load history: {e}")
    
    def save_context(self, inputs, outputs):
        """Save context to both buffer and MemoryStack."""
        super().save_context(inputs, outputs)
        
        # Persist to MemoryStack
        user_input = inputs.get("input", "")
        ai_output = outputs.get("response", "")
        
        self.memory_client.add(
            content=f"User: {user_input}\nAssistant: {ai_output}",
            user_id=self.user_id,
            metadata={"source": "langchain", "type": "conversation"}
        )


# Initialize clients
@st.cache_resource
def init_memory_client():
    return MemoryStackClient(api_key=os.getenv("MEMORYSTACK_API_KEY"))

memory_client = init_memory_client()

# Session state
if "user_id" not in st.session_state:
    st.session_state.user_id = "langchain_user"
if "messages" not in st.session_state:
    st.session_state.messages = []

# Create LangChain components
def get_chain(user_id: str):
    """Create LangChain conversation chain with MemoryStack memory."""
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.7
    )
    
    memory = MemoryStackLangChainMemory(
        memory_client=memory_client,
        user_id=user_id,
        k=5,  # Keep last 5 exchanges in buffer
        return_messages=False
    )
    
    template = """You are a helpful AI assistant with persistent memory.
You remember previous conversations and can reference them naturally.

Current conversation:
{history}

Human: {input}
AI Assistant:"""

    prompt = PromptTemplate(
        input_variables=["history", "input"],
        template=template
    )
    
    return ConversationChain(
        llm=llm,
        memory=memory,
        prompt=prompt,
        verbose=False
    )

# Sidebar
with st.sidebar:
    st.title("🦜 LangChain + Memory")
    st.markdown("---")
    
    # User ID
    user_id = st.text_input("User ID", value=st.session_state.user_id)
    if user_id != st.session_state.user_id:
        st.session_state.user_id = user_id
        st.session_state.messages = []
        st.rerun()
    
    st.markdown("---")
    
    # Search memories
    st.subheader("🔍 Search Memories")
    search_query = st.text_input("Search")
    if search_query:
        results = memory_client.search(
            search_query, 
            user_id=st.session_state.user_id, 
            limit=5
        )
        for r in results.get("results", []):
            with st.expander(r["content"][:40] + "..."):
                st.write(r["content"])
    
    st.markdown("---")
    
    # Info
    st.info("""
    **How it works:**
    1. LangChain manages conversation flow
    2. MemoryStack persists memories
    3. Context is loaded on startup
    4. New exchanges are saved automatically
    """)
    
    if st.button("Clear Chat"):
        st.session_state.messages = []
        st.rerun()

# Main area
st.title("💬 LangChain Chat with Persistent Memory")
st.caption("Powered by LangChain + MemoryStack + Gemini")

# Display messages
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

# Chat input
if prompt := st.chat_input("Type your message..."):
    # Display user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.write(prompt)
    
    # Get response from LangChain
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            chain = get_chain(st.session_state.user_id)
            response = chain.predict(input=prompt)
            st.write(response)
    
    st.session_state.messages.append({"role": "assistant", "content": response})

# Footer
st.markdown("---")
col1, col2, col3 = st.columns(3)
with col1:
    st.caption("🦜 LangChain")
with col2:
    st.caption("🧠 MemoryStack")
with col3:
    st.caption("✨ Gemini")
