# Google ADK (Agent Development Kit)

## Abstract

Google ADK (Agent Development Kit) is an open-source agent development framework Google unveiled at Cloud NEXT in April 2025; its official site, adk.dev, presents it as a code-first toolkit for "build[ing], debug[ging], and deploy[ing] reliable AI agents at enterprise scale." This report takes the adk.dev documentation as its primary source to describe what ADK is, how it works, its technical characteristics, and how to implement and use it, cross-checked against GitHub repositories, launch announcements, and independent comparisons. ADK's execution model is an event-driven structure built around Agents (LlmAgent plus deterministic workflow agents), Tools, a Runner, and Events; it layers context into Session/State/Memory, integrates the MCP and A2A protocols bidirectionally, ships a built-in evaluation framework, and offers deployment paths from Cloud Run and GKE to a managed Agent Runtime. ADK 2.0 (2026) replaces the hierarchical executor with a graph-based execution engine, introducing graph workflows that mix deterministic code and LLM reasoning at the node level. Independent analyses credit ADK's multi-language SDKs, enterprise integration, and native A2A support, while flagging its younger ecosystem and Google Cloud lock-in risk.

## 1. Introduction

Moving LLM-based agents from prototype to production requires solving orchestration, state management, tool integration, evaluation, and deployment. Google ADK attempts to cover that whole span in one framework: the official site (the user-designated `https://adk.dev/`) defines ADK as "the open-source agent development framework that lets you build, debug, and deploy reliable AI agents at enterprise scale"[^s01]. All SDKs are published under the GitHub `google` organization with the Apache-2.0 license[^s14], and Google states that this is "the same framework powering agents within Google products like Agentspace and the Google Customer Engagement Suite (CES)"[^s17][^s18].

This report describes what ADK is (Section 2), how it works (Section 3), and how to implement and use it (Section 4), based on the official documentation, and discusses its ecosystem position and limits in Section 5.

## 2. Background: history and position

ADK debuted as a Python SDK on April 9, 2025 at Google Cloud NEXT 2025[^s17][^s18]. Language support then expanded in stages: when the Go SDK arrived in November 2025 the lineup was Python, Java, and Go[^s19], and as of July 2026 adk.dev advertises five languages — Python (`pip install google-adk`), TypeScript/JavaScript (`npm install @google/adk`), Go (`go get google.golang.org/adk`), Java, and Kotlin[^s01]. Google Cloud's own documentation still lists four (Python, TypeScript, Go, Java)[^s21], and the Kotlin SDK is at an early v0.1.0 stage[^s04][^s16].

On the version axis, 2026 is the inflection point. ADK 2.0 reached GA for Python on May 19, 2026 and for Go on June 30, 2026, transitioning "from a hierarchical agent executor to a graph-based execution engine"[^s13]. By GitHub metrics, adk-python has 20,400 stars (v2.3.0), adk-go 8,325 (v2.0.0), and the adk-samples collection 9,807[^s14][^s15][^s16] — placing ADK among the mainstream agent frameworks fifteen months after release.

## 3. Architecture and how it works

### 3.1 Primitives: Agent, Tool, Runner, Event

ADK's foundational execution unit is the Agent, defined as "a self-contained execution unit designed to act autonomously to achieve specific goals," combining an AI model, task instructions, and optionally a set of tools[^s03]. Agents split into two families: `LlmAgent` for reasoning-heavy work, and workflow agents — deterministic controllers that "determine the execution sequence according to their type without consulting an AI model"[^s02][^s06]. The workflow templates are `SequentialAgent` (executes sub-agents one after another), `ParallelAgent` (executes them in parallel), and `LoopAgent` (repeats until a termination condition), yielding "deterministic and predictable execution patterns"[^s06].

Tools give agents "abilities beyond conversation" — external API calls, retrieval, code execution[^s02]. Execution is coordinated by the Runner, the engine that "manages the execution flow, orchestrates agent interactions based on Events, and coordinates with backend services"[^s02]. An Event is "the basic unit of communication representing things that happen during a session" (user messages, agent replies, tool invocations); the event stream is the conversation history[^s02].

### 3.2 Context layers: Session, State, Memory

Context management is layered. A Session "represents a single, ongoing interaction between a user and your agent system," holding its Event sequence and State (key-value data scoped to the current conversation)[^s04]. Memory "represents a store of information that might span multiple past sessions or include external data sources"[^s04]. Each layer is abstracted behind services (SessionService, MemoryService) with swappable backends, from in-memory implementations for local development — "all data … is lost when your application restarts" — to database and managed cloud options[^s04].

### 3.3 ADK 2.0: graph-based workflows

The core change in ADK 2.0 is graph workflows: "define your agent logic as a graph of execution nodes and edges, combining AI-powered agent reasoning with deterministic tools and code," where a node can be an agent, a tool invocation, or a custom code function[^s05]. Conditional branching uses route matching (`workflow.StringRoute`, `IntRoute`, `BoolRoute`), and you can "run chains of functions without AI: call agent tools and your own code without invoking a generative AI model"[^s05]. Version 2.0 adds dynamic workflows (code-based loops and branching) and collaborative workflows (a coordinator agent with multiple subagents), with breaking changes including an expanded Event schema (`node_info`, `output` fields)[^s13]. Graph workflows are currently supported in Python v2.0.0 and Go v2.0.0[^s05].

### 3.4 Tools and model support

Tools arrive through several channels: function tools that register plain functions directly (like the quickstart's `get_current_time` passed via `tools=[...]`)[^s10]; built-ins and Google Cloud integrations such as Google Search and code execution; OpenAPI-spec tools; and MCP tools[^s08][^s17]. The adk.dev integrations catalog lists dozens of MCP/partner tools (BigQuery, GitHub, Atlassian, …) and observability integrations (Datadog, Arize, …)[^s01].

On models, ADK "is designed for flexibility, allowing you to integrate various Large Language Models into your agents"[^s07]. Gemini, Claude, and Agent Platform endpoints take the native path, where "ADK's internal registry resolves this string"; Ollama, vLLM, LiteRT-LM, and the LiteLLM proxy take the connector path via wrapper classes (`LiteLlm`, `ApigeeLlm`)[^s07]. Model-agnosticism is real, but native integration centers on the Google ecosystem[^s07][^s23].

### 3.5 Protocol integrations: MCP and A2A

ADK integrates two open protocols bidirectionally. For MCP, "an ADK agent can act as an MCP client and use tools provided by external MCP servers," and conversely you can "build an MCP server that wraps ADK tools, making them accessible to any MCP client"[^s08]. The Python implementation leans on FastMCP — "in most cases, decorating a function is all you need"[^s08].

A2A (Agent2Agent) is a protocol for collaboration between agents on different runtimes. The docs cover both exposing your agent over A2A and consuming a remote A2A agent, with an example combining a root agent, a local sub-agent, and a remote A2A agent (supported in Python, Go, Java)[^s09]. InfoQ reports that "with A2A, a primary agent can seamlessly orchestrate and delegate tasks to specialized sub-agents"[^s19]. Multi-agent composition itself rests on hierarchical parent-child delegation and LLM-driven routing — "when processing a user message, the LLM considers the query, the current agent's description, and the description fields of related agents"[^s02][^s17].

## 4. Implementation and usage

### 4.1 Installation and a minimal agent

For Python, installation is one line: `pip install google-adk`[^s10]. Running `adk create my_agent` scaffolds a package with `agent.py` (the agent), `.env` (API keys / project IDs), and `__init__.py`[^s10]. Every ADK agent must expose a `root_agent`; the official quickstart's minimal example[^s10]:

```python
from google.adk.agents.llm_agent import Agent

def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city."""
    return {"status": "success", "city": city, "time": "10:30 AM"}

root_agent = Agent(
    model='gemini-flash-latest',
    name='root_agent',
    description="Tells the current time in a specified city.",
    instruction="You are a helpful assistant that tells the current time in cities.",
    tools=[get_current_time],
)
```

A plain Python function becomes a tool as-is; declaratively binding model, instruction, and tools is ADK's core grammar[^s10].

### 4.2 Running and debugging: the adk CLI and dev UI

The adk CLI drives execution: `adk run my_agent` opens an interactive terminal interface, and `adk web --port 8000` serves a development web UI at `localhost:8000`[^s10]. The web UI is a debugging surface with execution tracing, but the docs state it is "not meant for use in production deployments"[^s10][^s18].

### 4.3 Evaluation

Evaluation is built into the framework. "Due to the probabilistic nature of models, deterministic 'pass/fail' assertions are often unsuitable for evaluating agent performance," so evaluation splits into trajectory/tool-use and final-response dimensions[^s12]. Development uses per-session test files (`.test.json`); integration testing uses multi-turn EvalSets; `adk eval <AGENT_MODULE> <EVAL_SET_FILE>` slots into CI/CD[^s12]. Defaults are `tool_trajectory_avg_score: 1.0` and `response_match_score: 0.8`, with criteria including ROUGE similarity, LLM-judged equivalence, rubrics, hallucination detection, and safety checks[^s12].

### 4.4 Deployment

Four deployment paths are documented[^s11]: ① Agent Runtime on Agent Platform — "a fully managed auto-scaling service on Google Cloud specifically designed for deploying, managing, and scaling AI agents"; ② Cloud Run, the container-based auto-scaling platform; ③ GKE for "more control over the deployment as well as for running Open Models"; ④ any container-friendly infrastructure via manual packaging. The managed runtime was called "Vertex AI Agent Engine" at the 2025 launch[^s17]; current Google Cloud docs present ADK under the Gemini Enterprise Agent Platform alongside managed session and Memory Bank services[^s21] — the naming is mid-rebrand _(naming in flux)_.

### 4.5 Safety and guardrails

The official safety documentation names as risk sources "vague instructions, model hallucination, jailbreaks and prompt injections from adversarial users, and indirect prompt injections via tool use," and prescribes mitigations: a Before Tool Callback for pre-validating tool calls, deterministic in-tool policy enforcement via Tool Context, sandboxed execution of model-generated code, Gemini's built-in content filters, and VPC-SC perimeters against data exfiltration[^s20]. On identity it distinguishes Agent-Auth (one service account for all users) from User-Auth, which uses OAuth so that "agents only perform actions that the user could have performed themselves"[^s20].

## 5. Discussion

### 5.1 ADK among its competitors

Independent comparisons locate ADK's edge in multi-language SDKs and enterprise integration. One 2026 comparison calls ADK the "best enterprise option, especially for teams that need multi-language SDKs," noting that while all three frameworks support MCP, "A2A: only ADK has native support"[^s22]. Another highlights the interoperability A2A buys — "an ADK agent can discover and invoke an agent built with LangGraph or CrewAI" — and its use of Gemini's multimodal API[^s23].

The weaknesses cited are consistent: a steeper learning curve than CrewAI, "fewer third-party tutorials, integrations, and production case studies compared to LangGraph or CrewAI," and Google Cloud lock-in risk from its optimization for Gemini and Vertex AI[^s22][^s23]. One analysis rates ADK's production readiness as "early"[^s23]. On orchestration models, ADK's hierarchical tree has been contrasted with LangGraph's conditional-edge graphs[^s22]; ADK 2.0's move to a graph engine changes that framing _(interpretive)_[^s13].

### 5.2 Adoption signals and open questions

GitHub metrics (adk-python at 20.4k stars in fifteen months) and the breadth of the partner-integration catalog indicate rapid ecosystem formation[^s14][^s01]. Governance questions surfaced from the start, however: commentary relayed by InfoQ asked "what happens when systems begin to act with autonomy … who defines the orchestration logic?" and called for metrics covering "bias, resilience, and emergent behavior" beyond task success[^s18].

Upgrade-path friction is confirmed by field reports. One practitioner account of the 2.0 transition describes a symptomless failure mode — without two newly required JSONB columns on the events table, "the container boots fine, /health returns 200 — but every chat turn 500s" — plus a connection-URL conflict caused by the forced async driver, and a storage restructuring (pickled bytea to unified JSONB) that "cannot be performed in-place"[^s24]. The absence of automatic schema migration predates 2.0: an open adk-python issue reports that "we as the users are obliged to manually update the schema" and that "required changes were not even mentioned and I had to manually find out"[^s25].

## 6. Limitations

First, the architecture and usage descriptions rely mostly on adk.dev official documentation (vendor primary sources) — appropriate for technical claims, but quality claims like "reliable at enterprise scale" lack independent verification _(vendor-stated)_. Second, the Runner's event loop was verified only at the level of the technical-overview page, not via source-code analysis. Third, the managed runtime's name is mid-rebrand between "Vertex AI Agent Engine" (2025) and "Agent Runtime on Agent Platform" / "Gemini Enterprise Agent Platform" (2026), so documents disagree. Fourth, the language count differs between adk.dev (five, including Kotlin) and Google Cloud docs (four), and the Kotlin SDK is at v0.1.0. Fifth, ADK 2.0 (Python GA 2026-05, Go GA 2026-06) is recent enough that independent assessment is limited to a few early field reports (§5.2); systematic post-GA evaluation of the graph-engine transition and the 2.0 roadmap for TypeScript, Java, and Kotlin remain unconfirmed. Sixth, the competitive comparison in Section 5.1 relies on practitioner blogs whose quantitative figures (e.g. star counts) were already stale, so only their qualitative judgments are cited.
