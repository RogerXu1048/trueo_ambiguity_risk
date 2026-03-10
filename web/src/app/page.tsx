"use client";

import { FormEvent, useState, useTransition } from "react";
import { Cormorant_Garamond } from "next/font/google";
import {
  AlertCircle,
  Compass,
  FileSearch,
  FlaskConical,
  RotateCcw,
  ScrollText,
  Send,
  Settings2,
  Sparkles,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const editorial = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

type DisplayEvidence = {
  rank: number;
  title: string;
  url: string;
  source?: string | null;
  snippet: string;
  published_date?: string | null;
  relevance_score?: number | null;
  source_category: string;
  is_official: boolean;
  display_reason: string;
};

type SearchDebug = {
  provider: string;
  initial_query: string;
  follow_up_queries: string[];
  raw_answer?: string | null;
  raw_results: unknown[];
  display_evidence: DisplayEvidence[];
  simplified_context: {
    query: string;
    provider: string;
    summary?: string | null;
    evidence: unknown[];
  };
  formatted_context: string;
};

type RewriteSuggestionItem = {
  rewritten_question: string;
  why_clearer: string;
};

type RewriteSuggestions = {
  suggestions: RewriteSuggestionItem[];
  general_guidance?: string | null;
};

type AnalysisResult = {
  risk_score: number;
  risk_tags: string[];
  rationale: string;
  confidence?: number | null;
  search_debug?: SearchDebug | null;
};

type AnalyzeResponse = {
  analysis: AnalysisResult;
  rewrites?: RewriteSuggestions | null;
};

const NAV_ITEMS = [
  { icon: FlaskConical, label: "Market Analyzer", sectionId: "section-analyzer" },
  { icon: ScrollText, label: "Rewrite Suggestions", sectionId: "section-rewrites" },
  { icon: FileSearch, label: "Evidence Chain", sectionId: "section-evidence" },
  { icon: Sparkles, label: "Debug Payload", sectionId: "section-debug" },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [useFewShot, setUseFewShot] = useState(true);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [includeSearchDebug, setIncludeSearchDebug] = useState(true);
  const [includeRewrites, setIncludeRewrites] = useState(true);
  const [rewriteCount, setRewriteCount] = useState("2");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState(NAV_ITEMS[0].sectionId);
  const [isPending, startTransition] = useTransition();

  const score = result?.analysis.risk_score ?? 0;
  const scoreTone = score < 35 ? "text-emerald-600" : score < 65 ? "text-amber-600" : "text-rose-600";
  const scoreLabel =
    score < 35 ? "Low clarity risk" : score < 65 ? "Moderate dispute risk" : "High ambiguity risk";

  function jumpToSection(sectionId: string) {
    setActiveNav(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function resetWorkspace() {
    setQuestion("");
    setContext("");
    setError(null);
    setResult(null);
    setActiveNav(NAV_ITEMS[0].sectionId);
  }

  function runAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!question.trim()) {
      setError("Enter a market question before running analysis.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            context: context.trim() || null,
            use_few_shot: useFewShot,
            use_web_search: useWebSearch,
            include_search_debug: useWebSearch && includeSearchDebug,
            include_rewrites: includeRewrites,
            rewrite_count: Number(rewriteCount),
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || `API request failed with ${response.status}`);
        }

        const payload: AnalyzeResponse = await response.json();
        setResult(payload);
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "Unexpected error while analyzing.";
        setError(message);
      }
    });
  }

  return (
    <div className="market-desk-bg min-h-screen text-zinc-900" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
      <div className="mx-auto flex h-screen w-full max-w-[1700px] overflow-hidden">
        <aside className="hidden w-[270px] shrink-0 border-r border-zinc-200 bg-[#efeff0] p-4 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:overflow-y-auto">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.35)]">
              <Compass className="h-4 w-4" />
            </div>
            <p className="text-xl font-semibold tracking-tight text-blue-700">Trueo</p>
          </div>

          <Button
            className="mb-4 justify-start rounded-xl border-blue-200 bg-white text-blue-700 shadow-none hover:bg-blue-50"
            onClick={resetWorkspace}
            type="button"
            variant="outline"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            New analysis
          </Button>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${
                  activeNav === item.sectionId
                    ? "bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)]"
                    : "text-blue-800 hover:bg-blue-100/70"
                }`}
                key={item.label}
                onClick={() => jumpToSection(item.sectionId)}
                type="button"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-3 rounded-2xl border border-zinc-200 bg-white p-3">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-zinc-500 uppercase">
              <Settings2 className="h-3.5 w-3.5" />
              Controls
            </p>
            <ToggleRow checked={useFewShot} onCheckedChange={setUseFewShot} title="Few-shot" />
            <ToggleRow
              checked={useWebSearch}
              onCheckedChange={(value) => {
                setUseWebSearch(value);
                if (!value) {
                  setIncludeSearchDebug(false);
                }
              }}
              title="Web search"
            />
            <ToggleRow
              checked={includeSearchDebug}
              disabled={!useWebSearch}
              onCheckedChange={setIncludeSearchDebug}
              title="Search debug"
            />
            <ToggleRow checked={includeRewrites} onCheckedChange={setIncludeRewrites} title="Rewrites" />
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500" htmlFor="rewrite-count">
                Rewrite count
              </Label>
              <Input
                className="h-8 rounded-lg border-zinc-300 bg-white text-sm"
                id="rewrite-count"
                max={3}
                min={1}
                onChange={(event) => setRewriteCount(event.target.value)}
                type="number"
                value={rewriteCount}
              />
            </div>
          </div>
        </aside>

        <main className="flex h-screen flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between border-b border-white/50 bg-white/35 px-4 backdrop-blur-xl md:px-8">
            <p className="text-sm font-medium text-zinc-700">Trueo Ambiguity Risk Desk</p>
            <span className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs text-zinc-600">Internal</span>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
              {error ? (
                <Alert className="mb-5" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Analysis failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <section className={`flex flex-col items-center text-center ${result ? "pb-8" : "min-h-[58vh] justify-center"}`}>
                <h1 className={`${editorial.className} text-balance text-4xl font-medium tracking-tight text-zinc-900`}>
                  How can I help your market quality review?
                </h1>
                <p className="mt-4 max-w-xl text-base text-zinc-500">
                  Ask one question with a clear date, threshold, and source constraint for the best analysis quality.
                </p>

                <form className="input-glass-shell mt-5 w-full max-w-2xl rounded-2xl p-2.5" onSubmit={runAnalysis}>
                  <Label className="text-xs text-zinc-500" htmlFor="question">
                    Market question
                  </Label>
                  <Textarea
                    className="mt-1.5 min-h-[3.4rem] resize-none border-0 px-0 text-sm shadow-none focus-visible:ring-0"
                    id="question"
                    onChange={(event) => setQuestion(event.target.value)}
                    value={question}
                  />
                  <div className="mt-2.5 grid gap-2.5 md:grid-cols-[1fr_auto]">
                    <Input
                      className="h-9 rounded-lg border-white/65 bg-white/55 text-sm"
                      onChange={(event) => setContext(event.target.value)}
                      placeholder="Optional context (resolution source, exchange, timezone)"
                      value={context}
                    />
                    <Button className="h-9 rounded-lg px-4" disabled={isPending} type="submit">
                      <Send className="mr-2 h-4 w-4" />
                      {isPending ? "Analyzing..." : "Analyze"}
                    </Button>
                  </div>
                </form>
                {isPending ? <p className="mt-3 text-sm text-zinc-500">Analyzing...</p> : null}
              </section>

              {result ? (
                <div className="space-y-4">
                  <section className="result-glass-card p-6" id="section-analyzer">
                    <p className="text-xs font-semibold tracking-[0.12em] text-zinc-500 uppercase">Market Analyzer</p>
                    <p className={`mt-3 text-5xl font-semibold ${scoreTone}`}>{score}/100</p>
                    <Progress className="mt-4" value={Math.min(100, Math.max(0, score))} />
                    <p className="mt-3 text-sm font-medium text-zinc-700">{scoreLabel}</p>
                    <p className="mt-4 text-sm leading-6 text-zinc-700">{result.analysis.rationale}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.analysis.risk_tags.length === 0 ? (
                        <Badge variant="secondary">No risk tags</Badge>
                      ) : (
                        result.analysis.risk_tags.map((tag) => (
                          <Badge className="rounded-full border-zinc-300 bg-zinc-100 text-zinc-700" key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="result-glass-card p-6" id="section-rewrites">
                    <p className="text-xs font-semibold tracking-[0.12em] text-zinc-500 uppercase">Rewrite Suggestions</p>
                    {result.rewrites?.suggestions?.length ? (
                      <div className="mt-4 space-y-3">
                        {result.rewrites.suggestions.map((item, index) => (
                          <div className="result-glass-subcard p-4" key={item.rewritten_question}>
                            <p className="text-xs font-semibold text-zinc-500">Suggestion {index + 1}</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-zinc-900">{item.rewritten_question}</p>
                            <p className="mt-1 text-sm text-zinc-600">{item.why_clearer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-600">No rewrite suggestions returned.</p>
                    )}
                  </section>

                  <section className="result-glass-card p-6" id="section-evidence">
                    <p className="text-xs font-semibold tracking-[0.12em] text-zinc-500 uppercase">Evidence Chain</p>
                    {result.analysis.search_debug?.display_evidence?.length ? (
                      <div className="mt-4 space-y-3">
                        {result.analysis.search_debug.display_evidence.slice(0, 6).map((item) => (
                          <a
                            className="result-glass-subcard block p-4 transition-colors hover:bg-white/62"
                            href={item.url}
                            key={`${item.rank}-${item.url}`}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <div className="flex items-center justify-between text-xs text-zinc-500">
                              <span>#{item.rank}</span>
                              <span>{item.is_official ? "official" : "context"}</span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-zinc-900">{item.title}</p>
                            <p className="mt-1 text-xs text-zinc-500">{item.source ?? "unknown source"}</p>
                            <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{item.snippet}</p>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-600">Enable web search and search debug to view evidence cards.</p>
                    )}
                  </section>

                  <section className="result-glass-card p-6" id="section-debug">
                    <p className="text-xs font-semibold tracking-[0.12em] text-zinc-500 uppercase">Debug Payload</p>
                    {result.analysis.search_debug ? (
                      <div className="mt-4 space-y-3 text-sm text-zinc-700">
                        <div className="result-glass-subcard p-4">
                          <p className="text-xs font-semibold tracking-[0.12em] text-zinc-500 uppercase">Initial query</p>
                          <p className="mt-2">{result.analysis.search_debug.initial_query}</p>
                        </div>
                        <div className="result-glass-subcard p-4">
                          <p className="text-xs font-semibold tracking-[0.12em] text-zinc-500 uppercase">Provider answer</p>
                          <p className="mt-2">{result.analysis.search_debug.raw_answer ?? "No raw provider answer."}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-zinc-600">Search debug not returned.</p>
                    )}
                  </section>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

type ToggleRowProps = {
  title: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function ToggleRow({ title, checked, disabled, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5">
      <span className="text-xs font-medium text-zinc-700">{title}</span>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}
