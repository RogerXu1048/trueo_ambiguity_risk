# Market Prompt Ambiguity Risk Scoring System

A system for analyzing prediction market prompts and detecting ambiguity risks using GLM-4.7.

## Overview

This system analyzes market questions for potential ambiguity, vagueness, or clarity issues that could lead to disputes. It uses GLM-4.7 (via Zhipu AI) to perform semantic analysis and generate risk assessments.

## Features

- 🎯 **Risk Scoring**: Scores from 0-100 (higher = more ambiguous)
- 🏷️ **Risk Tags**: Identifies specific ambiguity categories
- 📝 **Detailed Rationale**: Provides explanations for the assessment
- 🔧 **File-Based Few-Shot Examples**: Default examples are loaded from `few_shot_examples/examples.json`
- ♻️ **Hot Reload Friendly**: Updating `examples.json` affects the next analysis call without code changes
- 🛡️ **Safe Fallback**: Falls back to built-in examples if the JSON file is missing or invalid
- 🔌 **Extensible**: Designed for web search integration and custom prompt iteration

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd trueo_ambiguity_risk

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your Zhipu AI API key
```

## Configuration

1. Get your API key from [Zhipu AI](https://open.bigmodel.cn/)
2. Copy `.env.example` to `.env`
3. Add your API key to `.env`:
   ```
   ZHIPU_API_KEY=your_api_key_here
   ```

### Few-shot Examples

By default, few-shot examples are loaded from `few_shot_examples/examples.json`.

- Edit that file to update the examples used in prompting
- Changes are picked up on the next call to `analyze_market_prompt(...)` or `python main.py ...`
- If the file is missing, malformed, or has an invalid structure, the system falls back to built-in examples in `prompts.py`

Example file format:

```json
[
  {
    "question": "Will Apple release a new product this year?",
    "result": {
      "risk_score": 70,
      "risk_tags": ["ambiguous_time", "undefined_term", "vague_condition"],
      "rationale": "Explain why this question is ambiguous."
    }
  }
]
```

## Usage

### Python API

```python
from main import analyze_market_prompt

# Analyze a market question
result = analyze_market_prompt("Will OpenAI release a new model in March this year?")

print(f"Risk Score: {result.risk_score}/100")
print(f"Risk Tags: {result.risk_tags}")
print(f"Rationale: {result.rationale}")
```

To disable few-shot examples:

```python
result = analyze_market_prompt(
    "Will OpenAI release a new model in March this year?",
    use_few_shot=False
)
```

### Command Line

```bash
python main.py "Will OpenAI release a new model in March this year?"
```

To bypass few-shot examples:

```bash
python main.py "Will OpenAI release a new model in March this year?" --no-few-shot
```

## Output Format

```json
{
  "risk_score": 65,
  "risk_tags": ["ambiguous_time", "undefined_term"],
  "rationale": "1) 'this year' does not specify which year; 2) 'new model' is not clearly defined"
}
```

## Risk Categories

| Tag | Description |
|-----|-------------|
| `ambiguous_time` | Time reference is unclear |
| `undefined_term` | Key terms lack clear definition |
| `unverified_source` | Lacks authoritative source |
| `vague_condition` | Resolution conditions are unclear |
| `ambiguous_quantity` | Quantities or degrees are unclear |
| `unidentified_subject` | Subject identity is unclear |
| `high_disputability` | Prone to disputes or subjective interpretation |

## Project Structure

```
trueo_ambiguity_risk/
├── PLAN.md              # Design documentation
├── README.md            # This file
├── requirements.txt     # Python dependencies
├── config.py            # Configuration settings
├── models.py            # Data models (Pydantic)
├── prompts.py           # Prompt templates and few-shot loading logic
├── agent.py             # LLM Agent (GLM-4.7)
├── scorer.py            # Risk Scorer
├── main.py              # Main entry point
├── few_shot_examples/   # Default few-shot examples loaded at runtime
└── tests/               # Test cases
    └── test_scorer.py
```

## Testing

Run tests:

```bash
python tests/test_scorer.py
```

Quick test (single API call):

```bash
python tests/test_scorer.py --quick
```

## Future Enhancements

- [ ] Web search integration for context enrichment
- [ ] Batch processing API
- [ ] External Retrieval Agent (MCP/Tools)

## Partner

Trueo - Prediction Market Platform

## License

MIT License
