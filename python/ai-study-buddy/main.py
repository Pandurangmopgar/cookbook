"""
AI Study Buddy with Adaptive Learning
======================================
An intelligent study companion that learns your strengths and weaknesses,
generates personalized flashcards, and adapts to your learning style.

Features:
- 📚 Upload study materials (notes, textbooks, slides)
- 🎯 Adaptive flashcard generation
- 📊 Progress tracking with spaced repetition
- 🧠 Remembers what you struggle with
- 💡 Personalized explanations based on your level
- 🎮 Gamified learning with streaks and achievements

Run: streamlit run main.py
"""

import os
import json
import random
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import streamlit as st
from dotenv import load_dotenv
from memorystack import MemoryStackClient
import google.generativeai as genai

load_dotenv()

st.set_page_config(
    page_title="AI Study Buddy",
    page_icon="📚",
    layout="wide"
)

# Custom CSS
st.markdown("""
<style>
    .flashcard {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 16px;
        color: white;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 1.2rem;
        cursor: pointer;
        transition: transform 0.3s;
    }
    .flashcard:hover { transform: scale(1.02); }
    .streak-badge {
        background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        color: white;
        font-weight: bold;
    }
    .progress-ring {
        width: 80px;
        height: 80px;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def init_clients():
    memory = MemoryStackClient(api_key=os.getenv("MEMORYSTACK_API_KEY"))
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.0-flash-exp")
    return memory, model

memory, model = init_clients()


# Session state
defaults = {
    "user_id": "student_demo",
    "current_subject": None,
    "flashcards": [],
    "current_card_index": 0,
    "show_answer": False,
    "session_correct": 0,
    "session_total": 0,
    "streak": 0,
    "page": "study"
}
for key, value in defaults.items():
    if key not in st.session_state:
        st.session_state[key] = value


def get_learning_profile(user_id: str) -> Dict[str, Any]:
    """Get user's learning profile from memory."""
    results = memory.search(
        query="learning profile strengths weaknesses style",
        user_id=user_id,
        limit=5
    )
    
    profile = {
        "strengths": [],
        "weaknesses": [],
        "preferred_style": "visual",
        "total_cards_reviewed": 0,
        "accuracy_rate": 0.0
    }
    
    for r in results.get("results", []):
        if "learning_profile" in r.get("metadata", {}).get("type", ""):
            stored = r.get("metadata", {})
            profile.update({
                "strengths": stored.get("strengths", []),
                "weaknesses": stored.get("weaknesses", []),
                "preferred_style": stored.get("preferred_style", "visual")
            })
            break
    
    return profile


def update_learning_profile(user_id: str, topic: str, correct: bool, difficulty: str):
    """Update learning profile based on performance."""
    memory.add(
        content=f"Study session: {topic} - {'Correct' if correct else 'Incorrect'} - Difficulty: {difficulty}",
        user_id=user_id,
        metadata={
            "type": "study_session",
            "topic": topic,
            "correct": correct,
            "difficulty": difficulty,
            "timestamp": datetime.now().isoformat()
        }
    )
    
    # Track weak areas
    if not correct:
        memory.add(
            content=f"Struggled with: {topic}",
            user_id=user_id,
            metadata={
                "type": "weakness",
                "topic": topic,
                "timestamp": datetime.now().isoformat()
            }
        )


def generate_flashcards(content: str, subject: str, num_cards: int = 10) -> List[Dict]:
    """Generate adaptive flashcards from study material."""
    # Get user's weak areas
    profile = get_learning_profile(st.session_state.user_id)
    weak_areas = profile.get("weaknesses", [])
    
    prompt = f"""Create {num_cards} flashcards from this study material.

Subject: {subject}
Student's weak areas: {', '.join(weak_areas) if weak_areas else 'None identified yet'}

Study Material:
{content[:8000]}

Generate flashcards in this JSON format:
[
  {{
    "question": "Clear, specific question",
    "answer": "Concise but complete answer",
    "topic": "Specific topic within subject",
    "difficulty": "easy|medium|hard",
    "hint": "Optional hint if stuck",
    "explanation": "Why this is important"
  }}
]

Guidelines:
- Mix difficulty levels (30% easy, 50% medium, 20% hard)
- Focus more on weak areas if identified
- Make questions test understanding, not just memorization
- Include practical application questions
- Add helpful hints for harder questions

Return ONLY valid JSON array."""

    response = model.generate_content(prompt)
    
    try:
        # Extract JSON from response
        text = response.text
        start = text.find('[')
        end = text.rfind(']') + 1
        cards = json.loads(text[start:end])
        return cards
    except:
        return []


def get_next_card_spaced_repetition(user_id: str, cards: List[Dict]) -> Dict:
    """Select next card using spaced repetition algorithm."""
    # Search for cards user struggled with
    weak_results = memory.search(
        query="struggled incorrect wrong",
        user_id=user_id,
        limit=20
    )
    
    weak_topics = set()
    for r in weak_results.get("results", []):
        topic = r.get("metadata", {}).get("topic", "")
        if topic:
            weak_topics.add(topic.lower())
    
    # Prioritize cards from weak topics
    weak_cards = [c for c in cards if c.get("topic", "").lower() in weak_topics]
    other_cards = [c for c in cards if c.get("topic", "").lower() not in weak_topics]
    
    # 70% chance to show weak topic card if available
    if weak_cards and random.random() < 0.7:
        return random.choice(weak_cards)
    elif other_cards:
        return random.choice(other_cards)
    else:
        return random.choice(cards)


def explain_concept(concept: str, user_id: str) -> str:
    """Generate personalized explanation based on learning style."""
    profile = get_learning_profile(user_id)
    style = profile.get("preferred_style", "visual")
    
    # Get related context from memory
    context_results = memory.search(
        query=concept,
        user_id=user_id,
        limit=5
    )
    
    context = "\n".join([r["content"][:200] for r in context_results.get("results", [])])
    
    prompt = f"""Explain this concept to a student.

Concept: {concept}
Learning style preference: {style}
Previous context: {context if context else 'None'}

Provide an explanation that:
1. Starts with a simple analogy
2. Builds up complexity gradually
3. Uses {'visual descriptions and diagrams' if style == 'visual' else 'step-by-step logic' if style == 'logical' else 'real-world examples'}
4. Ends with a quick self-test question

Keep it engaging and memorable!"""

    response = model.generate_content(prompt)
    return response.text


def get_study_stats(user_id: str) -> Dict[str, Any]:
    """Get comprehensive study statistics."""
    results = memory.search(
        query="study session correct incorrect",
        user_id=user_id,
        limit=50
    )
    
    total = 0
    correct = 0
    topics = {}
    
    for r in results.get("results", []):
        meta = r.get("metadata", {})
        if meta.get("type") == "study_session":
            total += 1
            if meta.get("correct"):
                correct += 1
            
            topic = meta.get("topic", "Unknown")
            if topic not in topics:
                topics[topic] = {"correct": 0, "total": 0}
            topics[topic]["total"] += 1
            if meta.get("correct"):
                topics[topic]["correct"] += 1
    
    return {
        "total_reviewed": total,
        "correct": correct,
        "accuracy": (correct / total * 100) if total > 0 else 0,
        "topics": topics
    }


# Sidebar
with st.sidebar:
    st.title("📚 AI Study Buddy")
    st.markdown("---")
    
    page = st.radio(
        "Navigation",
        ["📖 Study", "📝 Create Cards", "📊 Progress", "🎯 Weak Areas"],
        label_visibility="collapsed"
    )
    st.session_state.page = page
    
    st.markdown("---")
    
    # User info
    st.subheader("👤 Student")
    user_id = st.text_input("Student ID", value=st.session_state.user_id)
    if user_id != st.session_state.user_id:
        st.session_state.user_id = user_id
        st.rerun()
    
    # Quick stats
    st.markdown("---")
    stats = get_study_stats(st.session_state.user_id)
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Cards", stats["total_reviewed"])
    with col2:
        st.metric("Accuracy", f"{stats['accuracy']:.0f}%")
    
    # Streak
    st.markdown(f"""
    <div class="streak-badge">
        🔥 {st.session_state.streak} day streak
    </div>
    """, unsafe_allow_html=True)


# Main content
if st.session_state.page == "📖 Study":
    st.title("📖 Study Session")
    
    if not st.session_state.flashcards:
        st.info("No flashcards loaded. Go to 'Create Cards' to generate some!")
        
        # Quick start with sample cards
        if st.button("🎲 Load Sample Cards"):
            st.session_state.flashcards = [
                {
                    "question": "What is the time complexity of binary search?",
                    "answer": "O(log n) - because we halve the search space with each comparison",
                    "topic": "Algorithms",
                    "difficulty": "medium",
                    "hint": "Think about how many times you can divide n by 2",
                    "explanation": "Binary search is fundamental for efficient searching in sorted data"
                },
                {
                    "question": "What is the difference between a stack and a queue?",
                    "answer": "Stack is LIFO (Last In First Out), Queue is FIFO (First In First Out)",
                    "topic": "Data Structures",
                    "difficulty": "easy",
                    "hint": "Think of a stack of plates vs a line at a store",
                    "explanation": "Understanding these helps with many algorithm problems"
                },
                {
                    "question": "Explain the concept of recursion",
                    "answer": "A function that calls itself with a smaller subproblem until reaching a base case",
                    "topic": "Programming Concepts",
                    "difficulty": "medium",
                    "hint": "Think of Russian nesting dolls",
                    "explanation": "Recursion is key for tree traversal, divide-and-conquer algorithms"
                }
            ]
            st.rerun()
    else:
        # Session stats
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("This Session", f"{st.session_state.session_correct}/{st.session_state.session_total}")
        with col2:
            accuracy = (st.session_state.session_correct / st.session_state.session_total * 100) if st.session_state.session_total > 0 else 0
            st.metric("Accuracy", f"{accuracy:.0f}%")
        with col3:
            st.metric("Cards Left", len(st.session_state.flashcards) - st.session_state.current_card_index)
        
        st.markdown("---")
        
        # Current flashcard
        if st.session_state.current_card_index < len(st.session_state.flashcards):
            card = st.session_state.flashcards[st.session_state.current_card_index]
            
            # Difficulty badge
            diff_colors = {"easy": "🟢", "medium": "🟡", "hard": "🔴"}
            st.markdown(f"**{diff_colors.get(card['difficulty'], '⚪')} {card['difficulty'].upper()}** | Topic: {card['topic']}")
            
            # Question
            st.markdown(f"""
            <div class="flashcard">
                <div>
                    <h3>❓ Question</h3>
                    <p>{card['question']}</p>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            # Hint button
            if st.button("💡 Show Hint"):
                st.info(f"**Hint:** {card.get('hint', 'No hint available')}")
            
            # Show/Hide answer
            if st.button("👁️ Show Answer" if not st.session_state.show_answer else "🙈 Hide Answer"):
                st.session_state.show_answer = not st.session_state.show_answer
                st.rerun()
            
            if st.session_state.show_answer:
                st.success(f"**Answer:** {card['answer']}")
                st.info(f"**Why it matters:** {card.get('explanation', '')}")
                
                # Self-assessment
                st.markdown("### How did you do?")
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    if st.button("😕 Got it Wrong", use_container_width=True):
                        update_learning_profile(
                            st.session_state.user_id,
                            card["topic"],
                            False,
                            card["difficulty"]
                        )
                        st.session_state.session_total += 1
                        st.session_state.current_card_index += 1
                        st.session_state.show_answer = False
                        st.rerun()
                
                with col2:
                    if st.button("🤔 Partially", use_container_width=True):
                        st.session_state.session_total += 1
                        st.session_state.current_card_index += 1
                        st.session_state.show_answer = False
                        st.rerun()
                
                with col3:
                    if st.button("✅ Got it!", use_container_width=True):
                        update_learning_profile(
                            st.session_state.user_id,
                            card["topic"],
                            True,
                            card["difficulty"]
                        )
                        st.session_state.session_correct += 1
                        st.session_state.session_total += 1
                        st.session_state.current_card_index += 1
                        st.session_state.show_answer = False
                        st.rerun()
                
                # Deep dive option
                if st.button("🔍 Explain this concept more"):
                    with st.spinner("Generating personalized explanation..."):
                        explanation = explain_concept(card["question"], st.session_state.user_id)
                        st.markdown("### 📚 Deep Dive")
                        st.markdown(explanation)
        else:
            st.success("🎉 Session Complete!")
            st.balloons()
            
            accuracy = (st.session_state.session_correct / st.session_state.session_total * 100) if st.session_state.session_total > 0 else 0
            st.markdown(f"""
            ### Session Summary
            - **Cards Reviewed:** {st.session_state.session_total}
            - **Correct:** {st.session_state.session_correct}
            - **Accuracy:** {accuracy:.0f}%
            """)
            
            if st.button("🔄 Start New Session"):
                st.session_state.current_card_index = 0
                st.session_state.session_correct = 0
                st.session_state.session_total = 0
                random.shuffle(st.session_state.flashcards)
                st.rerun()


elif st.session_state.page == "📝 Create Cards":
    st.title("📝 Create Flashcards")
    
    subject = st.text_input("Subject", placeholder="e.g., Data Structures, Biology, History")
    
    tab1, tab2 = st.tabs(["📄 From Text", "📁 From File"])
    
    with tab1:
        content = st.text_area(
            "Paste your study material",
            height=300,
            placeholder="Paste notes, textbook content, or any study material..."
        )
        num_cards = st.slider("Number of cards", 5, 20, 10)
        
        if st.button("🎯 Generate Flashcards", type="primary") and content and subject:
            with st.spinner("AI is creating personalized flashcards..."):
                cards = generate_flashcards(content, subject, num_cards)
                if cards:
                    st.session_state.flashcards = cards
                    st.session_state.current_subject = subject
                    st.session_state.current_card_index = 0
                    
                    # Store in memory
                    memory.add(
                        content=f"Created {len(cards)} flashcards for {subject}",
                        user_id=st.session_state.user_id,
                        metadata={
                            "type": "flashcard_creation",
                            "subject": subject,
                            "num_cards": len(cards),
                            "timestamp": datetime.now().isoformat()
                        }
                    )
                    
                    st.success(f"Created {len(cards)} flashcards!")
                    st.rerun()
                else:
                    st.error("Failed to generate cards. Try again.")
    
    with tab2:
        uploaded = st.file_uploader("Upload study material", type=["txt", "pdf", "md"])
        if uploaded:
            content = uploaded.read().decode("utf-8", errors="ignore")
            st.text_area("Preview", content[:1000] + "...", height=200, disabled=True)
            
            if st.button("🎯 Generate from File") and subject:
                with st.spinner("Processing file and creating cards..."):
                    cards = generate_flashcards(content, subject, 10)
                    if cards:
                        st.session_state.flashcards = cards
                        st.success(f"Created {len(cards)} flashcards!")


elif st.session_state.page == "📊 Progress":
    st.title("📊 Your Progress")
    
    stats = get_study_stats(st.session_state.user_id)
    
    # Overview
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Cards", stats["total_reviewed"])
    with col2:
        st.metric("Correct", stats["correct"])
    with col3:
        st.metric("Accuracy", f"{stats['accuracy']:.1f}%")
    with col4:
        st.metric("Topics", len(stats["topics"]))
    
    st.markdown("---")
    
    # Topic breakdown
    st.subheader("📚 Performance by Topic")
    
    if stats["topics"]:
        for topic, data in stats["topics"].items():
            acc = (data["correct"] / data["total"] * 100) if data["total"] > 0 else 0
            col1, col2 = st.columns([3, 1])
            with col1:
                st.progress(acc / 100)
            with col2:
                st.write(f"{topic}: {acc:.0f}%")
    else:
        st.info("Start studying to see your progress!")


elif st.session_state.page == "🎯 Weak Areas":
    st.title("🎯 Focus Areas")
    
    # Search for weak areas
    results = memory.search(
        query="struggled incorrect wrong weakness",
        user_id=st.session_state.user_id,
        limit=20
    )
    
    weak_topics = {}
    for r in results.get("results", []):
        topic = r.get("metadata", {}).get("topic", "Unknown")
        if topic not in weak_topics:
            weak_topics[topic] = 0
        weak_topics[topic] += 1
    
    if weak_topics:
        st.markdown("### Topics to Review")
        
        # Sort by frequency
        sorted_topics = sorted(weak_topics.items(), key=lambda x: x[1], reverse=True)
        
        for topic, count in sorted_topics[:10]:
            col1, col2 = st.columns([3, 1])
            with col1:
                st.write(f"📌 **{topic}**")
            with col2:
                if st.button(f"Practice", key=f"practice_{topic}"):
                    st.info(f"Generating practice cards for {topic}...")
        
        st.markdown("---")
        st.markdown("### 💡 Study Tips")
        st.markdown("""
        - Focus on your weakest topics first
        - Review difficult cards more frequently
        - Try explaining concepts out loud
        - Take breaks every 25 minutes (Pomodoro)
        """)
    else:
        st.success("🎉 No weak areas identified yet! Keep studying!")


# Footer
st.markdown("---")
st.caption("Built with [MemoryStack](https://memorystack.app) + Gemini + Streamlit")
