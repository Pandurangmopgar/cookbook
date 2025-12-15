# 🔬 Deep Researcher

An AI-powered research assistant that analyzes documents, images, and web content, building a persistent knowledge base that gets smarter over time.

![Deep Researcher Demo](https://via.placeholder.com/800x400?text=Deep+Researcher+Demo)

## ✨ Features

- **📄 Document Analysis** - Upload PDFs, papers, and documents for AI analysis
- **🖼️ Image Understanding** - Analyze charts, diagrams, infographics, and screenshots
- **🔗 Web Research** - Fetch and analyze web pages automatically
- **🧠 Persistent Memory** - All research is stored and searchable across sessions
- **💬 Ask Questions** - Query your research knowledge base naturally
- **📊 Auto-Synthesis** - Generate comprehensive research reports

## 🚀 Quick Start

```bash
# Clone and navigate
cd cookbook/python/deep-researcher

# Install dependencies
pip install -r requirements.txt

# Configure API keys
cp .env.example .env
# Edit .env with your keys

# Run the app
streamlit run main.py
```

Open http://localhost:8501

## 🔑 API Keys Required

1. **MemoryStack API Key** - Get from [memorystack.app/dashboard/api-keys](https://memorystack.app/dashboard/api-keys)
2. **Gemini API Key** - Get from [aistudio.google.com](https://aistudio.google.com/app/apikey)

## 📖 How It Works

### 1. Start a Research Session
Enter your research topic to begin. All sources will be organized under this topic.

### 2. Add Sources
- **Documents**: Upload PDFs, papers, reports
- **Images**: Upload charts, diagrams, screenshots
- **Web Pages**: Enter URLs to analyze
- **Notes**: Add your own observations

### 3. AI Analyzes Everything
Gemini 2.0's multimodal capabilities analyze each source:
- Extracts key facts and data
- Identifies insights relevant to your topic
- Suggests follow-up questions
- Rates source credibility

### 4. Search & Query
Ask questions about your research - the AI searches your knowledge base and synthesizes answers.

### 5. Generate Reports
Create comprehensive research reports that synthesize all your sources.

## 🧠 Memory Architecture

```
Research Session
├── Document Analysis (PDF, DOCX)
│   └── Extracted text, key facts, insights
├── Image Analysis (Charts, Diagrams)
│   └── Visual description, data extraction
├── Web Research (URLs)
│   └── Content summary, credibility score
├── Research Notes (Manual)
│   └── Your observations
└── Synthesis Reports
    └── Comprehensive analysis
```

All memories are:
- **Semantically searchable** - Find by meaning, not just keywords
- **Persistent** - Survives app restarts
- **Connected** - Related insights are linked

## 💡 Use Cases

### Academic Research
- Analyze multiple papers on a topic
- Extract and compare findings
- Generate literature reviews

### Market Research
- Analyze competitor websites
- Process industry reports
- Synthesize market trends

### Due Diligence
- Review company documents
- Analyze financial charts
- Compile findings reports

### Content Research
- Gather sources for articles
- Analyze visual references
- Build knowledge bases

## 🔧 Customization

### Add Custom Source Types

```python
def analyze_custom_source(content: bytes, source_type: str) -> Dict:
    """Add your own source type analysis."""
    # Process content
    analysis = model.generate_content([
        "Your custom prompt",
        {"mime_type": "your/mime-type", "data": base64.b64encode(content).decode()}
    ])
    
    # Store in memory
    memory.add(
        content=f"Custom Analysis: {analysis.text}",
        metadata={
            "type": "custom_analysis",
            "source_type": source_type
        }
    )
    return {"analysis": analysis.text}
```

### Custom Synthesis Prompts

Modify `generate_research_synthesis()` to change report format:

```python
prompt = """Create a research report with:
# Your Custom Sections
- Custom section 1
- Custom section 2
..."""
```

## 📊 Example Output

### Research Report: "AI in Healthcare Diagnostics"

```markdown
# Executive Summary
Based on analysis of 12 sources including 3 academic papers,
5 industry reports, and 4 news articles...

# Key Findings
1. AI diagnostic accuracy reaches 94% in radiology
2. FDA approved 521 AI medical devices in 2023
3. Cost reduction of 30-40% in diagnostic workflows
...

# Evidence & Sources
- Paper: "Deep Learning in Medical Imaging" (2023)
- Report: McKinsey Healthcare AI Analysis
- Chart: FDA AI Device Approvals (analyzed image)
...
```

## 🤝 Contributing

Contributions welcome! Ideas:
- Add more source types (audio, video)
- Improve synthesis algorithms
- Add citation management
- Export to different formats

## 📄 License

MIT License - see LICENSE file

---

Built with [MemoryStack](https://memorystack.app) + Gemini 2.0 + Streamlit
