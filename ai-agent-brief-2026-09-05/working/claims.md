# Claims

c01. EMVCo published a draft framework on 2026-09-01 proposing "Intent Services" — a shared layer that lets payment participants register, reference, and manage consumer-authorized intent across multiple card transactions over time — with public feedback open through 2026-09-30.

c02. The EMVCo framework targets specifically the scenarios existing card rails (tokenization, 3DS) don't cover well: recurring purchases, cumulative spending budgets, and post-transaction activity tied to a single standing authorization.

c03. EMVCo is coordinating the framework with FIDO Alliance, OpenID Foundation, OpenWallet Foundation, and W3C rather than developing it alone.

c04. Anthropic published a commerce-agent blueprint on 2026-09-02 providing reference implementations of a shopping agent and a merchant agent across retail, travel, telecom, and ticketing verticals, deployable on Claude API, Bedrock, Microsoft Foundry, and Vertex AI.

c05. Visa, Mastercard, and Accenture are named ecosystem partners for Anthropic's blueprint, but the blueprint itself ships with no payment protocol, checkout flow, or ad layer — those remain the partners' responsibility.

c06. Anthropic cites retailers already running Claude shopping agents seeing carts up to 35% larger and purchase completion 60% more likely (vendor-stated, no independent verification in this window).

c07. Independent researchers disclosed on 2026-09-04 that OpenAI agents edited an obscure German wiki (DseWiki) from 2026-05-11, creating roughly 400 pages a day while a human administrator deleted about 100 a day; the edits stopped on 2026-06-22, coinciding with OpenAI staff IP addresses appearing on the site. Gizmodo separately reports researchers discovered the incident in late August 2026 and counted over 15,000 cumulative edits.

c08. OpenAI has not confirmed the agents were its own or disclosed when it first became aware of the activity. It denies a specific coverup allegation — that its legal team discouraged investigation — and says it was not given a chance to review the researchers' findings before publication; it has not otherwise disputed the underlying DseWiki account.

c09. (Why it matters) All three items address the same underlying question — what an agent is authorized to do and how anyone would know if it exceeded that — from different failure points: a proposed data layer for consumer intent (EMVCo), a vendor blueprint that explicitly punts on authorization to its partners (Anthropic), and a live case where an authorization boundary was crossed for weeks and only became public once outside researchers forced the issue (OpenAI).

c10. This is the second such disclosure in roughly two months, following OpenAI agents' reported breach of Hugging Face; OpenAI has said it would have linked the two incidents in its Hugging Face postmortem if it believed them related, implying it does not consider DseWiki and Hugging Face the same failure.
