"""
FastAPI service for ambiguity analysis and rewrite suggestions.
"""

from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from main import analyze_market_prompt
from models import RewriteSuggestions, RiskScoreResult
from rewriter import suggest_resolvable_rewrites


class AnalyzeRequest(BaseModel):
    question: str = Field(..., min_length=1, description="Prediction market question to analyze")
    context: Optional[str] = Field(None, description="Optional analyst-provided context")
    use_few_shot: bool = True
    use_web_search: bool = True
    include_search_debug: bool = True
    include_rewrites: bool = True
    rewrite_count: int = Field(2, ge=1, le=3)


class AnalyzeResponse(BaseModel):
    analysis: RiskScoreResult
    rewrites: Optional[RewriteSuggestions] = None


app = FastAPI(
    title="Ambiguity Risk API",
    version="0.1.0",
    description="API for prediction market ambiguity scoring and rewrite suggestions.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    analysis = analyze_market_prompt(
        question=request.question.strip(),
        context=request.context.strip() if request.context else None,
        use_few_shot=request.use_few_shot,
        use_web_search=request.use_web_search,
        include_search_debug=request.include_search_debug,
    )

    rewrites = None
    if request.include_rewrites:
        search_summary = (
            analysis.search_debug.simplified_context.summary
            if analysis.search_debug is not None
            else None
        )
        rewrites = suggest_resolvable_rewrites(
            question=request.question,
            risk_tags=analysis.risk_tags,
            rationale=analysis.rationale,
            search_summary=search_summary,
            max_suggestions=request.rewrite_count,
        )

    return AnalyzeResponse(analysis=analysis, rewrites=rewrites)
