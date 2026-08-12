# How Trusted Execution Environments Work, and What They Make Possible

## Abstract

A Trusted Execution Environment (TEE) is hardware's attempt to close the one gap encryption never covered: data **in use**. The Confidential Computing Consortium defines confidential computing as "the protection of data in use by performing computation in a hardware-based, attested Trusted Execution Environment."[^s01] This report decomposes that definition into the four mechanisms that actually implement it — isolation, measurement, remote attestation, and sealing — checks them against primary documentation and academic analysis for Intel SGX, Intel TDX, AMD SEV-SNP and Arm CCA, and then sets out both what becomes possible and where those guarantees actually stop.

At the mechanism level, the organising fact is that the unit of isolation determines everything else. SGX protects enclaves inside a process using a dedicated Enclave Page Cache and a hardware metadata structure, enforcing that "only a CPU executing inside an enclave can directly access enclave memory."[^s03] TDX raises the boundary to a whole VM, loading an Intel-signed, CPU-attested TDX Module into a reserved SEAM range and placing "hypervisors and peripheral devices" outside the TCB.[^s04] SEV-SNP formalises integrity as the guarantee that "if a guest reads a private page, it sees the value it last wrote, or it gets an exception," enforced through the Reverse Map Table and PVALIDATE.[^s05] Arm CCA introduces a fourth execution state so Realms get their own world — while deliberately leaving policy decisions such as which Realm to run **with the host hypervisor**.[^s06] What makes any of this verifiable from outside is remote attestation, which RFC 9334 standardises into the roles of Attester, Verifier, Relying Party, Endorser and Reference Value Provider, and two topologies: Passport and Background-Check.[^s02]

The applications follow directly: computation that excludes the cloud operator from the trust base, multi-party data collaboration without disclosing raw inputs, and confidential AI inference protecting both the user's prompt and the provider's weights. The performance cost of GPU TEEs is lower than commonly assumed — a Hopper-generation benchmark reports that "for the majority of typical LLM queries, the overhead remains below 7%, with larger models and longer sequences experiencing nearly zero overhead," with the bottleneck sitting in PCIe transfer rather than in-GPU computation.[^s12]

Three peer-reviewed results from 2025–2026 substantially change this picture. WireTap used a DDR4 interposer to exploit SGX's deterministic memory encryption and **extract the Quoting Enclave's ECDSA attestation key**, allowing an attacker to forge attestations while running with no SGX protection at all.[^s07] Battering RAM showed that a roughly $50 interposer, transparent at boot and switched to malicious at runtime, defeats **both** SGX and SEV-SNP by introducing memory aliasing.[^s08] RMPocalypse needs no physical access: exploiting a race during the AMD Secure Processor's initialisation of the RMP, **a single 8-byte write compromises the entire RMP**, enabling attestation forgery and code injection with a 100% success rate (CVE-2025-0033, Zen 3/4/5).[^s09][^s10] For the two physical attacks, both Intel and AMD stated that physical attacks on DRAM fall outside their current products' threat model.[^s07][^s08]

A fourth attack removed the remaining refuge. TEE.Fail targeted DDR5 servers and extracted keys from **both** Intel TDX and AMD SEV-SNP, recovering TDX's Provisioning Certification Key "in a fully automated manner from a single signing operation" and thereby forging "attestations from both TDX and SGX."[^s13] DDR5 proved easier to attack, not harder — two independent channels on one DIMM mean "only 50% of the soldering work is required."[^s13]

The practical conclusion divides by threat model. Against **software adversaries**, TEEs remain strong and mature, and they are a reasonable way to reduce operator privilege in the cloud. But now that attestation keys have been shown to be physically extractable across generations and vendors, any design resting on "trust anonymous hardware purely on the strength of a remote attestation" needs to be revisited. The affected networks' own responses confirm this: Phala decommissioned its entire SGX infrastructure,[^s14] and Secret Network retreated to an allowlist of trusted nodes.[^s15]

## Introduction

Encryption solved two of three states long ago. Data on disk is protected at rest; data crossing a network is protected by TLS. The hole is the third state. To compute on data you must place it in memory in the clear, and at that moment every piece of privileged software managing that memory — the OS, the hypervisor, and the people operating them — can read it. In the cloud this surfaces as a trust question: how much do you have to believe your provider?

A TEE answers by moving the object of trust. Instead of trusting privileged software, you trust the CPU silicon and a small amount of signed firmware, and assume everything else may be hostile. In the CCC's own words, confidential computing is "the protection of data in use by performing computation in a hardware-based, attested Trusted Execution Environment."[^s01]

This report follows the question. Section 3 sets out what TEEs claim to guarantee and against whom. Section 4 decomposes the mechanisms that produce those guarantees. Section 5 compares four implementations along the axis of isolation granularity. Section 6 covers what becomes possible; Section 7 covers where the guarantees actually stop.

On scope and method: CPU TEEs are the focus and GPU TEEs are treated as an extension. Vendor primary documentation is read alongside academic literature, with particular attention to **what vendors themselves declare they do not defend against**. The most common failure in TEE discussions is overestimating what is protected, and the most reliable correction starts from the vendors' own exclusions.

## What a TEE is — definition and threat model

### Three properties

TEE guarantees are conventionally stated along three axes: data confidentiality (outsiders cannot view data in use), data integrity (outsiders cannot alter it), and code integrity (the executing code is not tampered with). The Gartner definition quoted in the CCC's own governance document compresses the structure well — "confidential computing is a security mechanism that executes code in a hardware-based trusted execution environment (TEE), also called an enclave. Enclaves isolate and protect code and data from **the host system (plus the host system's owners)** and may also provide code integrity and attestation."[^s01]

The parenthetical is the politically significant part. A TEE aims to remove from the trust base not only technical attackers but **the parties who legitimately own and operate the infrastructure**.

### Moving the trust boundary

That aim becomes concrete in the definition of the TCB. The TDX analysis states it plainly: "TCB of TDX consists of the TDX-enabled Intel processors and the built-in technologies, such as VT, MKTME, and SGX," while "hypervisors and peripheral devices are considered untrusted."[^s04] The entire software stack the cloud provider operates sits outside the TCB.

### What is not guaranteed

The most reliable guard against overestimation is to read the exclusions first. The SEV-SNP academic primer names four.[^s05]

- **Side channels**: "The CPU shares microarchitectural state between the guest and the hypervisor: caches, branch predictors, prefetchers, and execution-port contention."
- **Physical attacks**: "Memory bus interposition, DRAM probing, voltage glitching, chip decapsulation, and similar attacks require physical possession of the running machine and specialized equipment. They are **outside** the software-adversary model the design targets."
- **Availability**: "SEV-SNP does not guarantee availability. The hypervisor controls scheduling, memory provisioning, and physical resources, and may terminate a guest at any time."
- **Guest software bugs**: "SEV-SNP protects the execution environment, not the software. A buffer overflow in the guest kernel is exploitable in the same way it would be on any other Linux system."

All four return in Section 7 — the second and third in particular define the last two years of this field.

## How TEEs work — four pillars

### Isolation — at which layer the blocking happens

Isolation is often summarised as "the memory is encrypted," but real implementations split into encryption and **access control**, and the centre of gravity is the latter.

**SGX (process granularity).** SGX defines memory regions "called enclaves," which "can be only entered at a fixed set of entry points."[^s03] Pages live in the Enclave Page Cache (EPC), and "the processor tracks EPC pages in a hardware metadata structure called the Enclave Page Cache Map (EPCM)."[^s03] Two rules are enforced, both important: "only a CPU executing inside an enclave can directly access enclave memory," and "the region is denied from outside access by the CPU, and encrypted before it leaves from LLC."[^s03] The design detail worth noticing is permission separation — "EPCM permissions are separate from the normal page tables. This prevents the kernel from allowing writes to data which an enclave wishes to remain read-only."[^s03] Even a kernel that owns the page tables cannot override the enclave's intent. Access control, not encryption, is the substance of isolation.

**TDX (VM granularity).** TDX raises the protected unit to an entire VM. At the centre sits the "TDX Module, an Intel-signed and CPU-attested software module that leverages the features of TDX-enabled processors to facilitate the construction, execution, and termination of TD."[^s04] It does not run just anywhere: it is loaded into "SEAM RANGE, which is a portion of system memory reserved via UEFI/BIOS," and executes in "SEAM VMX root mode."[^s04] A privilege layer above the hypervisor is created, and only Intel-signed code is admitted to it. Memory protection comes from MKTME, which "encrypts memory at the cache line granularity using AES-128 XTS cryptography," while "when the memory controller writes to a physical address with a private HKID, it sets the TD Owner bit to 1."[^s04]

**SEV-SNP (VM granularity, integrity-centred).** AMD's lineage shows what each generation lacked. "SEV introduced per-VM keys. Each VM gets its own VEK, selected by ASID." Then "SEV-ES closes the register exposure gap. The save area, now called the VMSA, is encrypted with the guest's VEK on every exit." Finally "SEV-SNP adds hardware-enforced integrity."[^s05] The core guarantee is stated in one sentence: "if a guest reads a private page, it sees the value it last wrote, or it gets an exception."[^s05]

The enforcement structure is the Reverse Map Table. An RMP entry records "Assigned, ASID, GPA, Validated, Immutable, VMSA, Page_Size, VMPL perms."[^s05] Paired with it is PVALIDATE, under a strict rule: "the guest must never validate the same GPA twice. If the guest validates GPA A, and later (after a Validated=0 fault) validates GPA A again, the integrity guarantee breaks."[^s05] Ownership records plus validation discipline are what block the remapping, replay and aliasing that encryption alone cannot.

SEV-SNP also adds a privilege hierarchy inside the guest. VMPLs are "a hardware-enforced privilege hierarchy with four levels (0 through 3, with VMPL0 the highest privilege)," and each virtual CPU "runs at exactly one VMPL at any given time." Delegation is one-directional: "RMPADJUST can only grant permissions to less-privileged VMPLs ... it cannot grant more permission than the current VMPL has."[^s05]

**Arm CCA (world granularity).** Arm partitions execution states instead. Armv9-A's Realm Management Extension "creates secure 'Realms' to isolate models and data," and "Realms are trusted execution environments."[^s06] There are four worlds: the Normal world running non-confidential workloads and the host hypervisor; the Secure world for "first-party secure software used as part of our TrustZone architecture"; the Realm world for confidential computing; and the Root world, where the TF-A Monitor performs the switching between them.[^s06] The controlling software in the Realm world is the TF-RMM, which "reacts to requests from the hypervisor in the Normal world to allow the management of the Realm VM execution."[^s06]

One design decision deserves emphasis. The RMM "is responsible for managing communication and context switching, but **it does not make policy decisions**, such as which Realm to run or what memory to allocate to a Realm. Those decisions remain with the host hypervisor."[^s06] Confidentiality moves; resource control does not. This is the architectural expression of the principle that a TEE does not guarantee availability.[^s05]

### Measurement — what gets hashed

Isolation alone is insufficient: an outside observer needs to know **what** is running inside. So a TEE accumulates a hash over the code, initial data and configuration loaded at initialisation. That measurement becomes the raw material for attestation.

Its meaning is frequently misread. A measurement fixes **what was loaded**; it says nothing about whether that code is safe. "SEV-SNP protects the execution environment, not the software"[^s05] is the same limitation stated another way. A verifier only compares the measurement against reference values it trusts — and if those reference values point at vulnerable code, attestation will successfully attest to vulnerable code.

### Remote attestation — moving trust outward

Remote attestation is the single most important mechanism here, because however strong the isolation, there is no reason to send data to it if it cannot be verified remotely.

RFC 9334 decomposes the procedure into roles.[^s02] The **Attester** produces Evidence; the **Verifier** appraises that Evidence and produces Attestation Results; the **Relying Party** applies application-specific decisions based on those results. Two suppliers support them: the **Endorser** (typically a manufacturer) vouches for the integrity of the Attester's ability to collect and sign claims, and the **Reference Value Provider** supplies the values against which the Verifier appraises Evidence.[^s02] The flow is `Attester → Evidence → Verifier → Attestation Results → Relying Party`.

Two topologies are standardised.[^s02] In the **Passport model** the Attester obtains an Attestation Result from the Verifier first and then presents it to multiple Relying Parties, cacheable like a passport. In the **Background-Check model** the Attester gives Evidence to the Relying Party, which forwards it to the Verifier — as an employer verifies a credential with the school directly.

The signing chains are vendor-specific. On AMD, "the ARK is AMD's ultimate trust anchor... The ASK signs per-chip VCEK certificates... The VCEK signs the attestation report."[^s05] The report itself is constructed and signed by the AMD Secure Processor, which also "generates per-VM encryption keys, called VEKs" and "maintains a Guest Context (GCTX) page for each SNP guest"; its signing key is "derived from fuses set during chip manufacturing."[^s05]

On the Intel side the notable fact is reuse. TDX does not build new attestation infrastructure: "TDX leverages the remote attestation mechanism provided by SGX. The attestation report of a TDX platform can be verified and signed within a QE."[^s04] That dependency becomes decisive in Section 7.

### Sealing — keeping secrets across time

TEE memory is volatile; a reboot erases it. Sealing lets a TEE derive a key from its own measurement and a hardware-unique secret, encrypt data with it, and later allow **only a TEE with the same measurement** to decrypt. This is how an enclave carries state across restarts.

The policy choice — bind to the measurement (any code change locks the data out) or to the signer (updates from the same signer retain access) — trades updateability against security. This report could not verify the instruction-level details of sealing against primary sources and therefore describes it only at the conceptual level (see Limitations).

## Comparing architectures — granularity decides the design

One axis runs through all four technologies: **what counts as a single unit of protection.**

The TDX analysis puts it succinctly: "SGX and TDX protect memory at different granularities."[^s04] SGX protects enclaves within a process; TDX, SEV-SNP and CCA Realms protect whole VMs.

That choice cascades into three consequences.

**TCB size.** With enclave granularity you can place only the minimal part of an application inside the boundary, so the TCB — and the attack surface — is small. With VM granularity the entire guest OS falls inside, so the TCB is far larger, and a kernel vulnerability is a vulnerability inside the TEE. "SEV-SNP protects the execution environment, not the software"[^s05] shows up here as a concrete cost.

**Development burden and portability.** Enclave granularity requires splitting an application into trusted and untrusted halves and designing the boundary; existing applications cannot simply be moved. VM granularity is the opposite, which is why Arm lists "lift-and-shift migration from non-confidential Virtual Machines" among CCA's benefits.[^s06]

**Resource control.** At every granularity, resource allocation stays with the host. CCA leaving policy decisions with the hypervisor[^s06] and SEV-SNP declining to guarantee availability[^s05] are two statements of the same fact.

### Extending to GPUs

AI workloads compute on GPUs, so a CPU TEE alone is insufficient. NVIDIA's GPU confidential computing is designed as an extension of the CPU TEE: "Confidential GPUs ... extend CPU-based TEEs by enabling secure data transfer and control signal communication between the CPU and GPU."[^s11] CC mode (H100, H200, B200, GB200) "adds remote attestation to let workload operators cryptographically verify the hardware and firmware state before trusting the environment," and "all command buffers, kernels, and data transfers over PCIe between CPU and GPU are encrypted and authenticated via a bounce buffer."[^s11]

The dependency matters: GPU TEEs do not stand alone but require "CPU TEEs such as AMD SEV-SNP or Intel TDX."[^s11] If the CPU TEE's guarantees fail, the GPU TEE's guarantees fail with them.

## What TEEs make possible

### Computation that excludes the operator

The most direct application. TDX's design of placing the hypervisor and cloud operator outside the TCB[^s04] becomes the product itself. The primary market is the regulated-industry constraint of "we would move to the cloud, but the provider could read the data." Arm points at the same place when it lists "confidentiality for regulated workloads, such as healthcare or financial services, where data and IP must remain hidden to comply with regulation."[^s06]

### Multi-party data collaboration

Where several organisations need to combine data to extract value but cannot show each other raw records — inter-bank fraud detection, cross-hospital cohort analysis — a TEE creates a structure that combines the computation while hiding the inputs. Each participant verifies through attestation that only the agreed code runs, then sends data. Attestation is doing the decisive work here: what participants trust is not the counterparty organisation but **the attested code**.

### Confidential AI inference, and its cost

AI has two things to protect at once: the user's input (prompts, documents) and the provider's model weights. TEEs offer a rare structure that can protect both. Arm positions CCA for AI on exactly this basis, describing Realms as isolating "models and data,"[^s06] as does NVIDIA in presenting CC as an AI security solution.[^s11]

The open question is performance, and measurements are more optimistic than the folklore. The Hopper benchmark study reports that "for the majority of typical LLM queries, the overhead remains below 7%, with larger models and longer sequences experiencing nearly zero overhead."[^s12] The reason lies in where the bottleneck sits: overhead is dominated not by in-GPU computation but by CPU-GPU data transfer over PCIe.[^s12] The more compute-intensive the workload, the more the relative cost is diluted. That also reads as a design rule: to reduce the cost of confidential AI, reduce host-device round trips.

### Key management and signing infrastructure

Combining sealing with attestation lets you enforce in hardware the policy that "only this specific code may use this key" — more flexible than a dedicated HSM, stronger than a pure software key store. But this application depends entirely on the integrity of the attestation chain, which makes it among the most sensitive to Section 7's results.

### Blockchain and decentralised systems

TEEs were especially attractive here. Public chains publish everything, which makes confidential smart contracts impossible; a TEE promised state that "not even the node operator can see." Several real networks were built on that assumption — the WireTap research names Secret Network, Phala Network, Crust and IntegriTEE among those affected.[^s07]

And this is precisely the structurally weakest category, because of a threat-model mismatch. In the cloud scenario the parties operating the hardware are a small number of providers bound by contract and reputation. In the decentralised scenario **anyone may run a node, and that operator may themselves be the physical attacker.** Attacks presupposing physical access are exceptional in the cloud but the default assumption on a public network. The next section takes this up.

## Where the guarantees actually stop — what 2025–2026 changed

TEE literature contains a long history of side-channel attacks, but the last two years produced results of a different kind. These do not leak information gradually; they target **the attestation system itself**.

### WireTap — extracting the attestation key

WireTap (CCS '25, Purdue and Georgia Tech) attacked the fact that SGX's memory encryption is **deterministic**. Under deterministic encryption, a given plaintext and key produce a fixed ciphertext on every run, so a repeated ciphertext reveals a repeated plaintext.[^s07] The attacker places an interposer between motherboard and DRAM and observes memory accesses with a logic analyser.[^s07]

The result is decisive: the researchers **extracted the SGX Quoting Enclave's ECDSA signing key from a single quote-signing operation**.[^s07] The QE key is the terminal signing key of remote attestation. Once it leaks, the consequence is explicit — the attack extracts "the CPU's secret attestation key," breaking the chain of trust and allowing an attacker to "pose as a real enclave without SGX protection."[^s07] A valid attestation can be forged on a machine with no SGX at all.

The target was 3rd Generation Intel Xeon Scalable processors on DDR4, and the blockchain networks noted above were identified as affected.[^s07] Intel's position is that WireTap falls outside its threat model and that there is no current mitigation beyond operating servers in a physically secure environment.[^s07]

Placing this beside the fact that TDX reuses SGX's QE-based attestation[^s04] shows that sharing attestation infrastructure means sharing risk. WireTap itself targeted SGX, but that concern did not remain speculative — as the TEE.Fail subsection below shows, TDX attestation keys were subsequently extracted directly.[^s13]

### Battering RAM — runtime aliasing

Battering RAM (47th IEEE S&P, May 2026, KU Leuven and Birmingham) is cheaper and more active. An interposer costing about $50 sits in the memory path, "transparent during startup," and is later "flipped malicious with a single switch," silently redirecting protected addresses to attacker-controlled locations.[^s08]

The timing is the point. Intel and AMD were aware of the risk and added boot-time aliasing checks; Battering RAM "dynamically introduces memory aliases at runtime," after those checks have completed, and thereby bypasses them.[^s08] Encryption does not help: "encryption is static, so identical plaintexts map to identical ciphertexts," meaning replayed data decrypts to the original value.[^s08] The attacker "captures victim ciphertext and replays it into their own enclave to gain read access to victim plaintext."[^s08]

Where WireTap targeted SGX alone, Battering RAM defeats **both SGX and SEV-SNP**, and supports active manipulation as well as reading. Both vendors acknowledged the findings but stated that physical attacks on DRAM are out of scope for current products.[^s08]

The Battering RAM authors note the hardware generation as a mitigating factor: "DDR5 restructures the command/address bus," preventing the simple switch on address lines that **this particular attack** relies on.[^s08] That should not be read as "move to DDR5 and you are safe." The next subsection explains why.

### TEE.Fail — neither DDR5 nor TDX is exempt

The hope that DDR5 was a refuge did not last. TEE.Fail (47th IEEE S&P '26, Georgia Tech and Purdue) built a "memory interposition device that allows attackers to physically inspect all memory traffic inside a DDR5 server."[^s13] The principle is the same as before: because encryption is deterministic, "the same inputs can be matched to the same outputs."[^s13]

Three points matter especially.

First, **DDR5 was easier, not harder.** "DDR5 memory has two independent channels on a single DIMM," so "only 50% of the soldering work is required."[^s13]

Second, **the target set expanded to the current generation.** TEE.Fail can "extract cryptographic keys from Intel TDX and AMD SEV-SNP," obtaining "secret attestation keys from fully updated machines in trusted status."[^s13] For TDX specifically, the researchers "recover the [Provisioning Certification] key in a fully automated manner from a single signing operation," which lets them "forge attestations from both TDX and SGX."[^s13] TDX's reuse of SGX attestation infrastructure, noted in Section 4,[^s04] is confirmed here as a real transfer of risk. Against AMD, they report "extracting private signing keys from OpenSSL's ECDSA implementation from an SEV-SNP VM."[^s13]

Third, **an existing vendor mitigation does not help.** Of AMD's Ciphertext Hiding, TEE.Fail states that it "does not fix issues with deterministic encryption nor does it prevent physical bus interposition."[^s13]

This largely exhausts the DDR5 caveat from the previous subsection. Battering RAM's **specific technique** does not carry to DDR5, but bus interposition against DDR5 servers is possible — and easier.

### RMPocalypse — no physical access required

If the first two could be qualified with "assuming physical access," RMPocalypse (CCS '25, ETH Zurich) removes that comfort. It breaks SEV-SNP in software alone.

The root cause is a catch-22 in initialisation ordering. A race occurs while the AMD Secure Processor initialises the RMP: asynchronous timing "allows x86 cores to create dirty cache lines in RMP memory before full protection activates."[^s09] The consequence is extremely asymmetric — "a single overwrite of 8 bytes within the RMP causes the entire RMP to become subsequently compromised."[^s09]

As Section 4 showed, the RMP is the root of SEV-SNP's integrity. Once it is controlled, everything above collapses. The researchers report the ability to activate hidden features such as debug mode, forge attestation, roll back to previous states, and inject third-party code, exfiltrating all secrets from confidential VMs "with 100% success rate."[^s09]

AMD assigned CVE-2025-0033 (CVSS v4 5.9), describing it as "a race condition that can occur while the AMD Secure Processor (ASP or PSP) is initializing the RMP." The affected range is Zen 3, Zen 4 and Zen 5, including EPYC server chips in production. It was disclosed to AMD on 3 February 2025 and presented at CCS in October 2025.[^s10]

### What changed

Taken together, the three results share a structure: **the objective has moved from data exfiltration to attestation forgery.** WireTap extracted the attestation key, Battering RAM bypassed isolation, RMPocalypse forged attestation.

This matters because attestation is the single point of failure in the TEE trust model. In RFC 9334's structure[^s02], all the Relying Party does is act on an Attestation Result. If Evidence can be forged, every procedure beneath it loses meaning. Broken isolation exposes the data of one TEE; **a broken attestation key makes everything claiming to be that vendor's TEE unbelievable.**

What changes in practice depends on the threat model.

**Where the hardware operator is controlled** (own data centre, contracted cloud provider) — TEEs remain useful. What is being defended against is primarily software adversaries and incidental or insider operator access, while physical attack is a separate layer handled by facility security, contracts and audit. Intel's proposed mitigation — operate servers in a physically secure environment[^s07] — is not evasion so much as a control that genuinely does hold in this deployment shape.

**Where the hardware operator is arbitrary** (public decentralised networks) — the premise fails. Node operators are anonymous, and their physical access to their own hardware is not an attack but the normal state. If a $50 interposer can extract an attestation key, a design that trusts any node presenting a TEE attestation does not hold. WireTap naming real networks as affected[^s07] confirms the structural problem.

**RMPocalypse blurs even this distinction.** Requiring no physical access, it is a threat in controlled environments too, and with no hardware fix yet available, the practical line of defence is whether firmware and microcode patches have been applied.[^s09][^s10]

### What the affected networks actually did

This report's draft stated that the blockchain projects' responses had not been investigated. Checking them shows the responses were fast, and their content supports the analysis above.

**Phala abandoned SGX.** In a statement dated 30 September 2025, Phala announced it would shut down all SGX compute infrastructure, immediately halting approval of new SGX workers and decommissioning existing SGX workloads. The stated reason was that forged attestations let an attacker make a malicious enclave appear legitimate, extract encryption keys, and forge proofs of execution or storage. The migration targets are "Intel TDX and NVIDIA Confidential Computing."[^s14]

There is an irony this report should name. TDX — Phala's migration target — is precisely the technology whose attestation keys TEE.Fail extracted shortly afterwards.[^s13] Changing hardware generation or vendor does not, by itself, exit this class of problem.

**Secret Network narrowed its trust set.** In a statement the same day, Secret described three measures shipped in its 1.22 upgrade: "We suspended the acceptance of new nodes to the network," "We established a curated allowlist of known and trusted nodes," and a seed rotation. On assets it stated that "on Secret Network, the attack can only put data privacy at risk. It cannot affect any funds," adding that the researchers gave "explicit assurances that they did NOT extract any confidential information from Secret Mainnet" and that all attacks were performed on testnet only.[^s15]

The divergence between the two responses is instructive. Phala changed technology; Secret **retreated to permissioning** — admitting only known nodes instead of trusting arbitrary ones on the strength of an attestation. The latter matches the threat-model analysis above exactly. In a world where physical attacks are feasible, continuing to use a TEE requires narrowing the set of hardware operators to a controllable one, and that means giving up decentralisation. Secret's 1.23 plans — "allowing new nodes to be added to the network through Governance approval" and "detection of end-of-life (EOL) hardware"[^s15] — confirm the direction.

## Limitations

- **Intel primary documentation inaccessible.** intel.com blocks automated requests wholesale (403), so Intel's own SGX and TDX documents could not be cited directly; the kernel documentation[^s03] and the IBM researchers' academic analysis[^s04] were used instead. Consequently **no claim is made in the body about whether SGX has been deprecated on client CPUs** — search results contained such statements, but primary confirmation failed.
- **AMD whitepaper not extracted.** The SEV-SNP whitepaper PDF was downloaded but the environment has no PDF text-extraction tooling and stream decompression failed. The SEV-SNP account therefore rests on the arXiv primer[^s05], which is a preprint by authors affiliated with Confidential.ai — **not an AMD primary document and not peer-reviewed.** Details such as RMP field composition and VMPL rules were not cross-checked against AMD's own text.
- **RMPocalypse paper body unread.** PDF extraction failed, so the CCS '25 paper itself was not read. The technical account relies on the paper's project page and ETH Zurich's official announcement[^s10]; that source is marked `access_limited`.
- **Measurement and sealing details unverified.** Instruction-level specifics such as MRENCLAVE/MRSIGNER computation and EREPORT/EGETKEY behaviour could not be confirmed against primary sources (only the IACR eprint landing page was reachable), so those subsections are kept at a conceptual level.
- **Draft statements about TDX and DDR5 were revised.** The draft declined to judge TDX's exposure to physical attack and described DDR5 as a mitigating factor; the critique pass surfaced TEE.Fail[^s13] and both were corrected. TEE.Fail itself, however, was read only via its project page — the paper body was not read.
- **Only two project responses were checked.** The official statements from Phala[^s14] and Secret Network[^s15] were obtained and incorporated, but the positions of Crust and IntegriTEE — also named by WireTap — were not investigated. Both statements are also the projects' own accounts; the effectiveness of their mitigations has not been independently verified.
- **Patch status not tracked.** For all three attacks, vendor firmware and microcode patch availability and cloud-provider deployment status were out of scope. Real risk assessment requires this information.
- **Scope of the performance figure.** The sub-7% GPU TEE overhead[^s12] is a 2024 Hopper-generation measurement on LLM inference. It does not transfer to other workloads (small models, transfer-heavy jobs) or to later generations.
- **Side-channel literature not covered.** The long lineage of microarchitectural side channels — Foreshadow, SGAxe, Downfall and others — is not treated. This report concentrates on recent attacks against the attestation system, and mentions side channels only by citing the vendors' own exclusion.[^s05]
