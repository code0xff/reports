# Claims — agent identity, reputation, discovery, exposure

Format per `/research` Phase 2. Check a box only when the minimum sourcing in
`PROTOCOL.md` §3 is met (factual ≥2 independent, interpretive ≥1 marked,
technical ≥1 primary).

## 서론 및 배경 (Introduction and Background)

- [x] c01: 2025–2026년 사이에 에이전트 신원·탐색·평판을 다루는 서로 독립적인 신규 프로토콜/레지스트리가 최소 6개 이상 공개되었다.
  - kind: factual
  - needs: 6개 이상의 별개 프로토콜·서비스에 대한 1차 자료(스펙, 공식 발표) 목록
- [x] c02: 기존 웹 신원 스택(TLS 서버 인증, User-Agent 문자열, robots.txt)은 "이 요청이 어떤 사람을 대신하는 어떤 에이전트인가"를 검증할 수 없어서 에이전트 트래픽 식별에 부적합하다.
  - kind: interpretive
  - needs: User-Agent 위조 가능성/robots.txt의 비강제성을 지적하는 표준 문서 또는 인프라 사업자 문서
- [x] c03: 에이전트 트래픽은 2025–2026년에 측정 가능한 규모로 증가했고, 인프라 사업자가 이를 별도 카테고리로 관리하기 시작했다.
  - kind: factual
  - needs: CDN/인프라 사업자의 트래픽 통계 또는 별도 정책 도입 발표 2건 이상
- [x] c04: 평판(reputation) 계층은 안정적인 신원(identity) 계층 없이는 성립할 수 없으므로, 스택 순서상 신원 표준이 선행 조건이다.
  - kind: interpretive
  - needs: 스펙 또는 논문에서 identity를 reputation의 전제로 명시한 근거

## 신원과 인증 (Identity and Authentication)

- [x] c05: Web Bot Auth는 RFC 9421 HTTP Message Signatures를 사용해 자동화 클라이언트가 요청에 암호학적 서명을 붙이도록 하는 IETF 초안 기반 방식이다.
  - kind: technical
  - needs: IETF 초안 및/또는 Cloudflare 공식 문서의 1차 근거
- [x] c06: Cloudflare는 서명 기반 에이전트 인증을 실제 프로덕션 기능으로 제공하며, 검증된 봇/에이전트 목록을 운영한다.
  - kind: factual
  - needs: Cloudflare 공식 문서 + 독립 보도 또는 IETF 초안 상호 참조
- [x] c07: Visa Trusted Agent Protocol은 상거래 맥락에서 에이전트가 가맹점에 자신의 신원과 위임 관계를 제시하도록 HTTP Message Signatures를 재사용한다.
  - kind: technical
  - needs: Visa 공식 스펙/발표 1차 자료
- [x] c08: MCP 인가 규격은 OAuth 2.1 리소스 서버 모델을 채택하고, RFC 9728 Protected Resource Metadata로 인가 서버를 발견하도록 규정한다.
  - kind: technical
  - needs: modelcontextprotocol.io 인가 스펙 원문
- [x] c09: 주요 IdP 벤더들은 에이전트를 사람 계정이 아닌 별도의 1급 신원 객체로 등록·관리하는 제품을 2025–2026년에 출시했다.
  - kind: factual
  - needs: Microsoft Entra Agent ID 등 벤더 공식 문서 2곳 이상
- [x] c10: W3C DID / Verifiable Credentials는 에이전트 신원 제안에서 반복적으로 재사용되지만, 실제 대규모 에이전트 배포의 기본 신원 형식으로는 아직 자리 잡지 못했다.
  - kind: interpretive
  - needs: DID를 채택한 에이전트 스펙 사례 + 채택 한계를 지적하는 독립 자료
- [x] c11: 에이전트 위임(delegation)을 표현하는 방식이 표준마다 다르다(JWT 계열 토큰 vs 서명 헤더 vs 온체인 권한), 즉 단일 위임 표현 표준이 존재하지 않는다.
  - kind: factual
  - needs: 서로 다른 위임 표현을 쓰는 스펙 3건 이상의 1차 자료

## 탐색 · 레지스트리 · 노출 (Discovery, Registries, and Exposure)

- [x] c12: A2A 프로토콜은 에이전트가 `/.well-known/agent-card.json` 경로에 기계 판독 가능한 Agent Card를 게시하는 것을 표준 탐색 방식으로 정의한다.
  - kind: technical
  - needs: A2A 스펙 원문의 해당 절
- [x] c13: Agent Card는 서명(JWS)으로 무결성을 보장할 수 있는 선택적 메커니즘을 포함한다.
  - kind: technical
  - needs: A2A 스펙의 signature/JWS 관련 절
- [x] c14: MCP는 2025년에 공식 서버 레지스트리를 출범시켰고, 이 레지스트리는 하위 레지스트리가 미러링하는 메타 레지스트리 모델을 채택한다.
  - kind: factual
  - needs: MCP 레지스트리 공식 발표/문서 + GitHub 저장소
- [x] c15: ERC-8004는 신원·평판·검증을 각각 별도의 온체인 레지스트리로 분리하며, 신원 레지스트리는 오프체인 등록 파일을 가리키는 URI를 저장한다.
  - kind: technical
  - needs: EIP 원문 + 참조 구현 컨트랙트
- [x] c16: 대형 클라우드/SaaS 사업자는 자체 심사를 통과한 에이전트만 노출하는 큐레이션형 마켓플레이스를 운영하며, 이 심사가 사실상의 신원 보증 역할을 한다.
  - kind: factual
  - needs: AWS/Microsoft/Salesforce 등 마켓플레이스 공식 문서 2곳 이상 + 심사 요건 기술
- [x] c17: 탐색 가능성의 반대편, 즉 에이전트 접근을 차단하거나 유료화하는 인프라 계층 통제도 2025–2026년에 제품화되었다.
  - kind: factual
  - needs: 크롤러 차단/유료 접근 제품의 공식 발표 2건 이상
- [x] c18: `/.well-known` 기반 에이전트 탐색은 도메인 소유권에 의존하므로, 도메인을 갖지 않는 에이전트에는 별도의 이름공간(온체인 레지스트리 또는 분산 인덱스)이 필요하다.
  - kind: interpretive
  - needs: well-known 방식의 전제를 명시한 스펙 + 대안 이름공간을 제시하는 1차 자료

## 평판 · 검증 · 신뢰 신호 (Reputation, Verification, and Trust Signals)

- [x] c19: ERC-8004 평판 레지스트리는 점수 자체를 온체인에 저장하는 대신 피드백 포인터/태그 구조를 저장해 해석을 클라이언트에 위임한다.
  - kind: technical
  - needs: EIP 원문의 Reputation Registry 절
- [ ] c20: 온체인 어테스테이션 인프라(EAS 등)는 에이전트 평판·검증 신호의 대체 담체로 실제 사용되고 있다.
  - kind: factual
  - needs: EAS 공식 문서 + 에이전트 맥락 사용 사례 1차 자료
- [x] c21: 학술 문헌은 에이전트 평판 시스템의 핵심 난점으로 Sybil 공격과 위조 피드백을 지목하며, 순수 온체인 평판만으로는 이를 해결하지 못한다고 본다.
  - kind: factual
  - needs: 관련 논문 2편 이상(arXiv/Semantic Scholar)
- [x] c22: 검증(validation) 계층은 재실행, TEE 증명, zkML 등 서로 비용·신뢰 가정이 다른 방식을 병렬로 제시하며, 어느 하나가 표준으로 수렴하지 않았다.
  - kind: interpretive
  - needs: 서로 다른 검증 방식을 규정/구현한 1차 자료 2건 이상
- [x] c23: 2026년 중반 기준으로 배포된 에이전트 평판 데이터의 양은 신원 등록 건수에 비해 현저히 적다.
  - kind: factual
  - needs: 등록 건수와 피드백 건수를 비교할 수 있는 온체인/대시보드 자료 — 확보 불가 시 한계로 기록

## 비교 분석 (Comparative Analysis)

- [x] c24: 웹 인프라 계층(서명 기반), 엔터프라이즈 IAM 계층(OAuth/토큰 기반), 온체인 계층(레지스트리 기반)은 서로 다른 신뢰 앵커를 사용하므로 직접 상호운용되지 않는다.
  - kind: interpretive
  - needs: 각 계층의 신뢰 앵커를 명시하는 1차 자료 3건
- [x] c25: 여러 표준이 동일한 하위 구성요소(RFC 9421, OAuth 2.1, JWS, well-known URI)를 재사용하는 것은 부분적 수렴의 증거다.
  - kind: interpretive
  - needs: 동일 구성요소를 재사용하는 서로 다른 스펙 3건 이상
- [x] c26: 현재 어떤 단일 프로토콜도 신원·인증·탐색·평판 네 계층을 모두 규정하지 않는다.
  - kind: factual
  - needs: 주요 스펙별 커버 범위 대조표를 1차 자료로 구성
- [x] c27: 실무 채택 관점에서는 표준 스펙보다 플랫폼 사업자의 마켓플레이스·IdP 제품이 먼저 신뢰 게이트키퍼로 기능하고 있다.
  - kind: interpretive
  - needs: 플랫폼 제품의 실제 배포 규모/요건 자료 + 표준 채택 지표의 부재 근거

## 한계와 열린 질문 (Limitations and Open Questions)

- [x] c28: 본 보고서가 인용하는 채택 규모 수치의 상당 부분은 벤더 자체 발표이며 독립 검증이 없다.
  - kind: interpretive
  - needs: 각 수치의 출처 유형 분류
- [x] c29: 공개된 Agent Card / 등록 파일은 에이전트의 기능·엔드포인트를 노출하므로 공격 표면과 프라이버시 문제를 동시에 만든다.
  - kind: interpretive
  - needs: 스펙의 보안 고려 절 또는 관련 논문
- [x] c30: 여기서 다룬 초안 표준 중 다수는 IETF/W3C/EIP 절차상 아직 최종 확정되지 않았으므로 세부 내용이 변경될 수 있다.
  - kind: factual
  - needs: 각 문서의 상태 필드(draft, review, final) 확인

## Resolution notes

- All claims except c20 met the minimum sourcing bar in `PROTOCOL.md` §3.
- c20 stays open: the only support for on-chain attestation infrastructure
  actually carrying agent reputation signals is first-party (s27) plus a
  standard that permits it (s39). Carried into Limitations and stated in the
  draft with a `_(vendor-stated)_` qualifier.
- c03 and c06 are checked but flagged in `gaps.md` for source-independence
  weakness; both are qualified in prose.
