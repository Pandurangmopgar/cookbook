# 📚 AI Study Buddy

An intelligent study companion that learns your strengths and weaknesses, generates personalized flashcards, and adapts to your learning style using spaced repetition.

## ✨ Features

- **🎯 Adaptive Learning** - AI identifies your weak areas and focuses on them
- **📝 Auto Flashcards** - Generate flashcards from any study material
- **🔄 Spaced Repetition** - Smart card scheduling based on performance
- **📊 Progress Tracking** - See your improvement over time
- **💡 Personalized Explanations** - Get explanations tailored to your level
- **🔥 Streaks & Gamification** - Stay motivated with daily streaks

## 🚀 Quick Start

```bash
cd cookbook/python/ai-study-buddy
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
streamlit run main.py
```

## 🧠 How Memory Makes It Smart

The AI Study Buddy uses MemoryStack to:

1. **Track Performance** - Every answer is stored with topic and difficulty
2. **Identify Weaknesses** - Searches past sessions to find struggle areas
3. **Personalize Content** - Generates cards focused on your weak spots
4. **Adapt Explanations** - Remembers your learning style preferences

## 📖 Usage

### 1. Create Flashcards
Paste any study material and the AI generates smart flashcards with:
- Questions at varying difficulty levels
- Helpful hints for harder questions
- Explanations of why each concept matters

### 2. Study Session
- Cards are shown using spaced repetition
- Self-assess: Got it / Partially / Wrong
- Request deeper explanations anytime

### 3. Track Progress
- See accuracy by topic
- Identify areas needing more work
- Track your study streak

## 🎯 Perfect For

- Students preparing for exams
- Professionals learning new skills
- Language learners
- Anyone who wants to learn more effectively

---

Built with [MemoryStack](https://memorystack.app) + Gemini + Streamlit
