# Google A2A in depth

## Abstract

`A2A (Agent2Agent)`, announced by Google on `2025-04-09`, is an open protocol for interoperability between independent agent systems, and it was transferred to a Linux Foundation project on `2025-06-23`.[^s01][^s02] As of `2026-04-23`, the latest official specification is `1.0.0`, and the protocol is organized around discovery (`Agent Card`), stateful work units (`Task`), outputs (`Artifact`), multimodal content parts (`Part`), and three bindings: JSON-RPC, HTTP+JSON/REST, and gRPC.[^s03] The important point is that A2A is not "tool calling for agents." It is a protocol for independently operated agents to advertise capabilities, run long-lived work, and exchange status via streaming or push notifications.[^s01][^s03]

What is clearer in this revision is that A2A is no longer just an idea on paper. The Linux Foundation said on `2026-04-09` that A2A had more than 150 supporting organizations, major cloud integrations, and active production deployments; AWS now documents A2A server deployment in AgentCore Runtime, and Microsoft documents A2A connectivity in Foundry Agent Service.[^s15][^s16][^s17] But much of that public adoption evidence is still project-hosted or vendor-hosted rather than independent long-form postmortem material. So the right reading is not "A2A is still purely experimental," but also not "A2A is already a fully settled universal operating standard."[^s15][^s17][^s26]

In practice, A2A is more demanding than it first appears. A production implementation needs at least an `Agent Card`, auth declarations, a `Task` store, a task state machine, artifact persistence, SSE streaming, cancellation, observability, and API management.[^s05][^s12][^s13] There is also an important versioning caveat: the official spec is `1.0.0`, but some official SDK READMEs still foreground `0.3.x` compatibility, and the public issue tracker still shows version-transition and semantic-friction work in progress.[^s03][^s09][^s10][^s21][^s22][^s25] The practical conclusion is that A2A is a strong candidate for a standardized external interface between collaborating agents, but successful adoption is a production-engineering problem with uncertainty management, not a hello-world integration exercise.[^s05][^s08][^s19]

## 1. What Google A2A is, and where it stands now

According to Google's announcement, A2A is an open protocol that allows agents built by different vendors and frameworks to exchange information securely and coordinate work.[^s01] From the beginning, Google described A2A not as a replacement for MCP but as a complement to it. MCP is about giving agents access to tools and context, while A2A is about collaboration between agents.[^s01][^s06]

The governance status matters too. A2A was transferred to a Linux Foundation project on `2025-06-23`, and the official project page now shows the specification, language SDKs, samples, an inspector, and a TCK under a community-governed structure.[^s02][^s08] That means A2A should be understood not as a Google-only document, but as a protocol on an explicit standardization path with neutral governance.[^s02][^s08]

As of `2026-04-23`, the adoption signals are also more concrete. The Linux Foundation's one-year update highlighted more than 150 supporting organizations, cross-industry production use, and Google/Microsoft/AWS platform integrations.[^s15] AWS documents A2A deployment in AgentCore Runtime with JSON-RPC and Agent Card preservation, while Microsoft documents A2A endpoint integration for Foundry Agent Service.[^s16][^s17] At the same time, some of Microsoft's A2A-related surface is still documented in a preview context, so "platform support exists" and "everything is fully hardened" are not the same claim.[^s17]

Independent coverage gives the story a slightly different tone. TechRepublic described the Linux Foundation move as the launch of a vendor-neutral hub, while Builder.io's early write-up treated A2A as promising but still "barely out of the oven."[^s27][^s26] Taken together, the public record suggests that A2A is becoming institutionalized quickly, but it still needs to be read with evidence quality in mind rather than as settled infrastructure lore.[^s15][^s26][^s27]

## 2. Ecosystem maturity and remaining uncertainty

There are real reasons to call A2A mature enough for serious evaluation. The project now combines the spec with SDKs, samples, an Inspector, and a TCK, and the Linux Foundation publicly positions the ecosystem as production-ready in multiple industries.[^s08][^s15] AWS's docs also treat A2A as an actual deployable server protocol rather than a conceptual whitepaper topic.[^s16]

But the same public record also shows why maturity needs to be qualified. The TCK structure is useful, but its public README separates mandatory compliance checks from `quality` and `features`, and explicitly says those latter categories do not block compliance in CI by default.[^s19] That is a strong signal that the ecosystem has testing discipline, but also a reminder that "passes the protocol tests" and "is production-hardened" are not identical claims.[^s19]

The Inspector tells a similar story. Its README presents it as a web-based tool for Agent Card fetching, basic compliance checks, live chat, and raw JSON-RPC debugging.[^s20] Yet a public issue says it still does not use Agent Card security schemes to perform actual A2A authentication flows.[^s24] So the tooling exists and is useful, but it does not yet eliminate all the operational work an enterprise integrator still has to do.[^s20][^s24]

Version transition and semantics are still moving too. Public issues discuss adding client-side protocol-version fields for 0.3-to-1.0 compatibility, the Python SDK tracks 1.0 support and breaking changes in a dedicated umbrella issue, task identifier naming inconsistencies have been raised, and the Python SDK has had real handler hang bugs reported in edge cases.[^s21][^s22][^s23][^s25] Those are not signs of a fake ecosystem; they are signs of a real ecosystem still converging on operationally stable details.[^s21][^s22][^s23][^s25]

The most accurate current reading is therefore this: A2A is no longer just a launch announcement. It is a rapidly maturing standard with governance, public tooling, and concrete platform integration.[^s08][^s15][^s16][^s17] But much of the strongest adoption evidence is still project-hosted or vendor-hosted, and independent long-form operating reports are comparatively sparse. If that distinction is ignored, a research report easily turns into ecosystem promotion instead of analysis.[^s15][^s26][^s27]

## 3. Core protocol model

### 3.1 Agent Card: the starting point for discovery and contract

The first core object in A2A is the `Agent Card`. It is discovery metadata describing the agent's name, description, service URL, protocol version, capabilities, skills, and security requirements.[^s03][^s11] As the official docs emphasize, other agents use the card to determine what the agent can do, what inputs and outputs it expects, and what authentication it requires.[^s01][^s11]

In practice, the Agent Card is closer to a contract than a brochure. How you describe `skills`, `inputModes`, `outputModes`, `securityRequirements`, and transport-facing interfaces will directly affect whether clients can call the agent correctly.[^s03][^s11] For that reason, skill descriptions should read less like marketing text and more like precise interface documentation: accepted inputs, emitted outputs, authorization requirements, and failure conditions.[^s11]

### 3.2 Message, Part, and Artifact: the content model

A2A does not assume that content is a single string. In the spec, a `Part` is a container for text, file bytes, file URLs, or structured JSON data, along with MIME types and metadata.[^s03] `Message` and `Artifact` are then modeled as collections of `Part` objects.[^s03]

The implication is important. A2A was designed from the start not just for text chat, but for multimodal collaboration involving documents, images, structured payloads, and potentially richer media over time.[^s01][^s03] If an implementation is built entirely around plain strings, it will probably need a redesign later when file uploads, structured outputs, or richer UI-oriented artifacts become necessary.[^s01][^s03]

### 3.3 Task and Context: the center of stateful collaboration

The most important design difference in A2A is the `Task` model. Both Google's launch material and the latest spec describe A2A as a protocol for long-running, multi-turn interactions.[^s01][^s03] A `Task` is not just a request-response wrapper; it represents the lifecycle of work, and an `Artifact` represents the output of that work.[^s01][^s03]

The spec also uses `contextId` and `taskId` to connect follow-up messages and new work items inside the same ongoing interaction.[^s03] That is a much stronger state model than a one-shot RPC. It allows a remote research agent, for example, to ask for additional input mid-run, require more authentication, emit a partial draft first, and attach the final artifact later.[^s03][^s05]

That distinction is not always obvious in practice. Public issues have raised task identifier naming inconsistencies, and version-transition discussions have proposed additional protocol-version signaling for compatibility between 0.3 and 1.0 clients.[^s21][^s25] So it is safer to read A2A as having a strong conceptual model whose exact field-level semantics are still being refined in public.[^s21][^s25]

## 4. Transport bindings and asynchronous execution

The current spec defines three standard bindings: `JSON-RPC`, `HTTP+JSON/REST`, and `gRPC`, with the same core semantics preserved across transports.[^s03] This is a practical design choice. HTTP-family bindings fit web-service and API-gateway environments, while gRPC can fit internal high-performance systems where strongly typed contracts are more important.[^s03][^s14]

The JSON-RPC binding in the latest spec runs over HTTP and uses `Server-Sent Events` for streaming.[^s03] That means an A2A server cannot stop at synchronous replies if it wants to support long-running work. In practice, at least one of the following update paths needs to exist:

1. Polling via `Get Task`
2. SSE subscription via `message/stream` or an equivalent streaming endpoint
3. Asynchronous updates through a push-notification webhook

The official spec says that in blocking mode, a task can wait not only for terminal states but also until it reaches interrupted states such as `INPUT_REQUIRED` or `AUTH_REQUIRED`.[^s03] The enterprise docs also explain that when extra credentials are required, the system should acquire them through an external OAuth-style process and then continue the task.[^s05] A2A is therefore better understood as "an interface for advancing work until it completes or interrupts" rather than "an API that returns one final answer immediately."[^s03][^s05]

That directly affects implementation scope. A demo may work with only `message/send`, but production systems are very likely to need `tasks/get`, `tasks/cancel`, streaming, push config, task history policies, and resume logic.[^s03][^s13][^s14]

## 5. Enterprise design points

### 5.1 Authentication and authorization

The enterprise guidance says that A2A does not carry identity inside the payload itself. Authentication is handled at the transport and HTTP layer.[^s05] At the same time, the Agent Card declares supported auth schemes via its security fields, aligning A2A with established API security practice rather than inventing a new auth protocol.[^s05][^s03]

That design is realistic, but it puts responsibility on implementers. The server must decide who the authenticated caller is, which skills that caller may invoke, and whether downstream data access is allowed.[^s05] The official enterprise docs explicitly recommend least privilege and skill-level access control.[^s05] In other words, an A2A server should be treated like a real API surface with a full authorization layer, not like a thin wrapper around an LLM prompt endpoint.[^s05]

### 5.2 Discovery strategy

The discovery docs describe three representative patterns: a well-known Agent Card URL, a centralized registry, and direct configuration.[^s04] For public internet services or environments with strong URL conventions, the `/.well-known/agent-card.json` pattern is simple and effective.[^s04] In larger enterprise or marketplace settings, though, registries matter more because they make it possible to search agents by skill, tag, security requirement, version, and similar metadata.[^s04]

Operationally, direct configuration is fast when the number of partners is small, but once the number of agents grows it becomes difficult to maintain governance and onboarding without a registry. That does not mean a team needs a complete central catalog on day one, but it is wise to separate Agent Card validation and registration as explicit components early.[^s04][^s05]

### 5.3 Observability, audit, and API management

The enterprise docs emphasize that because A2A is HTTP-based, it fits naturally with OpenTelemetry, standard logging, metrics, and API-management infrastructure.[^s05] They also recommend logging `taskId`, `sessionId`, correlation IDs, and trace context.[^s05] This is critical because failures in A2A systems rarely look like a single request error; they usually look like "somewhere in the multi-agent workflow, some task stopped progressing, and nobody knows where."[^s05]

For that reason, production systems should prioritize `task lifecycle telemetry` over generic application logging. At minimum, the system should make it easy to observe transitions like `created -> working -> input_required/auth_required -> completed/failed/canceled/rejected`, plus artifact emission events.[^s03][^s05]

### 5.4 Extensions and compatibility

The official extensions docs explain that an A2A extension can add new data, requirements, RPC methods, or state machines.[^s07] They also make it clear that extensions should not casually fragment or replace the core protocol.[^s07] This matters because if each team starts by inventing its own required extensions, the interoperability benefit of A2A disappears quickly.[^s07]

The safer strategy is to confirm first that the core protocol is insufficient, and only then add narrowly scoped metadata or formal extensions.[^s07] This matters especially in regulated or industry-specific environments where teams are tempted to encode policy directly into protocol shape. When extensions are unavoidable, the `required` surface should stay as small as possible.[^s07]

## 6. Technical implementation examples

The examples in this section are reference-style implementations reconstructed from the official Python and JavaScript SDKs and tutorials.[^s09][^s10][^s12][^s13] The core idea is consistent across them: expose the external contract through an `Agent Card`, put domain logic in an `AgentExecutor`, and let a `DefaultRequestHandler` coordinate standard A2A methods and task storage.[^s10][^s12][^s13]

### 6.1 Minimal Python server structure

```python
from a2a.types import AgentCard, AgentSkill
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from my_agent import ResearchAgentExecutor

skill = AgentSkill(
    id="research",
    name="Research",
    description="Accepts research requests and produces a report",
    tags=["research", "analysis"],
    inputModes=["text/plain", "application/json"],
    outputModes=["text/plain", "application/json"]
)

card = AgentCard(
    name="Research Agent",
    description="An A2A-based research agent",
    url="https://agent.example.com/a2a",
    version="1.0.0",
    skills=[skill],
    defaultInputModes=["text/plain", "application/json"],
    defaultOutputModes=["text/plain", "application/json"],
)

executor = ResearchAgentExecutor()
task_store = InMemoryTaskStore()
handler = DefaultRequestHandler(
    agent_executor=executor,
    task_store=task_store,
)
```

The architectural point is straightforward: keep the external protocol layer separate from business logic.[^s12][^s13] The executor interprets the request and talks to internal orchestrators or workers, while the request handler owns standard method mapping and task lifecycle management.[^s12][^s13] If REST is required, the official REST handler can sit in front of the same core objects; if JSON-RPC or gRPC is preferred, the corresponding transport adapters can be used instead.[^s14][^s10]

### 6.2 Task-first implementation example

It is possible to build a stateless agent that returns only direct message responses, and that is the easiest way to get started.[^s10][^s12] But most business agents eventually involve external API calls, human approval, retrieval, or document generation. In those cases, it is better to design around Tasks from the beginning.[^s01][^s03][^s12]

For example, an agent that produces vendor-risk reports can follow this flow:

1. Receive `message/send`
2. Create a Task and immediately move it to `working`
3. Run search, collection, and analysis workers
4. Emit a draft artifact
5. If more material is needed, move to `input_required`
6. Resume with the same `taskId` and `contextId` after the caller provides additional material
7. Store final PDF or JSON artifacts and move to `completed`

This matches the task lifecycle and multi-turn continuation model in the spec.[^s03][^s12] It also makes retries, resume behavior, and auditability easier to manage.[^s05]

### 6.3 TypeScript/Express edge example

The official JavaScript SDK README shows an Express-based server that combines `AgentExecutor`, `DefaultRequestHandler`, `InMemoryTaskStore`, and transport adapters for JSON-RPC, REST, and gRPC.[^s10] In the Node.js ecosystem, that makes an architecture with "Express as the A2A edge, actual agent execution behind it" a natural fit.[^s10]

The recommended structure looks like this:

```text
internet / partner agents
        |
   API gateway / WAF
        |
   A2A edge (Express)
        |
   authn/authz middleware
        |
   request handler + task store
        |
   orchestrator / worker queue
        |
   tools, models, databases, artifact storage
```

This lines up well with the enterprise guidance around API management, tracing, and authorization.[^s05] It is also consistent with the SDK's explicit separation between request handlers and task stores, which strongly suggests a layered architecture rather than a monolithic agent process.[^s09][^s10][^s13]

## 7. Production architecture and implementation strategy

### 7.1 Recommended architecture

For production systems, it is better not to weld the A2A server directly into the LLM application. A cleaner design separates at least five layers:

1. `A2A edge`
2. `authn/authz and policy`
3. `task orchestration`
4. `worker/tool execution`
5. `artifact and audit storage`

This architecture is the practical synthesis of the enterprise guidance around HTTP-layer auth, tracing, audit, and API management, combined with the SDK's separation of executors, request handlers, and task stores.[^s05][^s09][^s10][^s13] It lets A2A own the external contract and state machine while keeping internal toolchains and model orchestration replaceable.

### 7.2 Data-model strategy

At minimum, the persistence layer should retain:

1. `taskId`, `contextId`, tenant, and caller identity
2. Current state plus state-transition history
3. Request messages and a summarized history
4. Artifact metadata and a reference to the actual blob
5. Push-notification configuration
6. Trace IDs, correlation IDs, and audit events

This is a direct operational interpretation of the spec's task/context/artifact model plus the enterprise observability requirements.[^s03][^s05] In particular, whether artifact bodies live directly in a database or only as object-storage references should be treated as an explicit design decision driven by data size and compliance needs.[^s03][^s05]

### 7.3 Security strategy

The most important security principle is that everything coming from a remote agent must be treated as untrusted input. Because Message and Artifact parts can contain text, files, URLs, and structured JSON, teams need to defend not only against prompt injection but also schema abuse, oversized payloads, malicious URLs, and content-type spoofing.[^s03][^s05][^s07]

Recommended guardrails include:

1. Agent Card schema validation and allowlisting
2. Media-type and size limits
3. Sandboxed URL fetching
4. Skill-level authorization boundaries
5. Signature- or registry-based trust assignment
6. Validation for extension-provided inputs

Extensions deserve special attention. Because they can open new methods and states, they need the same authn and authz enforcement as core methods.[^s07]

### 7.4 Versioning strategy

The most realistic design issue right now is version alignment. The spec is `1.0.0`, but SDK READMEs and some samples still describe `0.3.x` compatibility.[^s03][^s09][^s10] A safe initial policy is:

1. Pin the supported `protocolVersion` explicitly
2. Automate transport-level compatibility tests
3. Cross-check Agent Card and server version values in CI
4. Publish the validated version matrix in partner-onboarding docs

If this is skipped, systems that look superficially like "A2A servers" can still break on method names, field names, enum handling, or transport behavior.[^s03][^s09][^s10]

### 7.5 Staged implementation strategy

The most realistic rollout sequence is:

1. First release with `JSON-RPC + direct config + polling`
2. Add task persistence and cancellation
3. Add SSE streaming
4. Add webhook-based push notifications
5. Add registry-based discovery
6. Introduce extensions only if strictly necessary

This does not reject the broader feature set in the spec. It is simply the lower-risk adoption order.[^s03][^s04][^s07] Trying to ship registry discovery, custom extensions, push, and a full multi-tenant policy engine all at once is more likely to create operational failure before interoperability value is realized.[^s04][^s05][^s07]

## 8. When to use A2A, and when not to

A2A is most compelling when two conditions are both true: the other side is a remote independent service, and the collaboration is stateful.[^s03][^s06] Partner agents, cross-organization approval flows, long-running research, document generation, and workflows with human approval all fit well.[^s01][^s03]

By contrast, if the problem is only local sub-agent calls inside one process, simple function execution, or tool and resource access standardization, MCP or internal orchestration may be enough.[^s06] The official docs explicitly describe A2A and MCP as complementary.[^s01][^s06] The right question is therefore not "Should we use A2A because it is new?" but "Are we solving an external agent-collaboration problem, or an internal tool-connection problem?"[^s06]

## Limitations

This report is based on public materials, so it does not directly verify private enterprise deployment data such as real SLA performance, incident rates, or internal operating procedures. In particular, many of the strongest current adoption signals are still Linux Foundation or platform-vendor statements, so they should not be treated as equivalent to an independent audit record.[^s15][^s16][^s17] The same applies to maturity signals from the TCK, Inspector, SDKs, and issue tracker: they are valuable, but they only expose the public surface of the ecosystem.[^s19][^s20][^s21][^s22][^s23][^s24][^s25]

The result is that this report evaluates A2A as a protocol that is serious enough for production-minded evaluation, but some conclusions still need to be read as `early signal` or `vendor-stated` rather than settled industry fact. The relative lack of independent long-form operating reports and failure postmortems remains a meaningful limitation.[^s15][^s26][^s27]

## Conclusion

Google A2A is one of the strongest current candidates for agent interoperability. The official spec has reached `1.0.0`, and the project now has Linux Foundation governance, multiple language SDKs, samples, and testing tools.[^s02][^s03][^s08] With the additional 2026 platform-integration and production-use signals, it has clearly moved beyond the stage of being only a launch-paper idea.[^s15][^s16][^s17] In particular, the combination of `Agent Card + Task + Artifact + multi-binding` models stateful collaboration far better than simple tool invocation.[^s01][^s03]

But implementation success depends more on system design and evidence discipline than on protocol familiarity. Authentication and authorization need to live at the HTTP and skill-policy layer, task and artifact storage should be treated as first-class infrastructure, streaming and push should be chosen to fit operations, and version compatibility has to be tested continuously.[^s05][^s09][^s10][^s13][^s14] At the same time, stronger public adoption signals do not mean that semantics, tooling quality, and operating practice are already fully settled.[^s19][^s20][^s21][^s22][^s23][^s24][^s25] The most defensible practical strategy is to start small while building the task state machine and operational layer correctly from day one and re-checking ecosystem maturity as you go.[^s03][^s05][^s15]

## References

This report is based on Google's A2A launch post, the Linux Foundation transfer announcement, the latest A2A specification, the Agent Discovery / Enterprise / Extensions / A2A and MCP documentation, the official Python/JavaScript SDK and tutorial materials, the Linux Foundation's one-year ecosystem update, AWS/Microsoft platform documentation, public GitHub issues, and independent technical/news coverage.[^s01][^s02][^s03][^s04][^s05][^s06][^s07][^s09][^s10][^s11][^s12][^s13][^s14][^s15][^s16][^s17][^s18][^s19][^s20][^s21][^s22][^s23][^s24][^s25][^s26][^s27]
