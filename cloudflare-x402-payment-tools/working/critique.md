# Critique — cloudflare-x402-payment-tools (verification pass 1)

## 1. Unsupported claims
- §4.1 마지막 문장(양면 폐루프 설계 해석), §5.2 마지막 문장(Gateway가 공급 부족 겨냥): 해석적 주장 — `_(해석)_`/`_(interpretive)_` 표기로 처리됨. 통과.
- 나머지 사실 서술은 전부 [^sNN] 인용 보유. draft.md / draft.en.md 각각 refs 21종 전부 sources.jsonl에 존재, 미사용 소스 없음.

## 2. Citation integrity
- 전 소스(21건) HEAD 체크: 20건 200 OK. s16(npmjs.com)은 스크립트 HEAD에 403 반환 — npm의 봇 차단이며 데이터 자체는 npm registry CLI(`npm view`)로 수집·검증됨. **nit** (조치 불요, 브라우저 접근 정상).
- accessed 전부 2026-07-02 (당일). 통과.
- 인용문 스팟 체크 3건: s12(`withX402Client`/`confirmationCallback` 시그니처) raw 소스에서 원문 일치. s03("drop-in replacement", Circle faucet) 페이지 원문 일치. s15("It will never force reliance on a single party", exact/upto 정의) README 원문 일치. 통과.

## 3. Reasoning gaps
- **[해소] must-fix였던 항목**: 초안이 "결제 스킴은 두 가지가 문서화되어 있다"고 서술했으나 s15 원문 확인 결과 표준 모노레포는 exact/upto/batch-settlement 3개 스킴을 문서화. → "Cloudflare 문서는 두 가지를 기술, 모노레포에는 batch-settlement도 존재"로 수정 완료 (양 언어).
- Chainalysis 수치(100M 건)는 기간(2025 중반–2026 Q1)과 체인(Base) 한정이 명시됨. 통과.
- 인과 단정 없음: 채택 급증 원인은 Chainalysis의 귀속(PING 주도)을 attribution과 함께 인용.

## 4. Missing counter-evidence
- **[해소] must-fix**: §5.2가 Chainalysis의 온건한 유보만 담고 있었음. 반대 증거 스윕에서 CoinDesk 2026-03-11 기사(Artemis: 일 $28k, ~50% 인위적 활동, "mostly a mirage") 확보 → s21로 추가하고 양 언어 §5.2에 반영, Limitations도 갱신 완료.

## 5. Tone and structure
- 초록은 본문 내용(양면 툴킷, Foundation/NET Dollar/Gateway, 리스크 3종)과 일치. 통과.
- Limitations는 gaps.md·uncertainties.md의 미해결 항목(Gateway vendor-stated, deferred 스킴 병합 여부, 지표 방법론, 패키지 버전 전환, 문서 경로 재편)을 모두 반영. 통과.
- 이모지·마케팅 어조 없음. 6문장 초과 문단 없음. 수동 References 섹션·각주 정의 블록 없음. 통과.

## 6. Must-fix vs nit
| # | 항목 | 분류 | 상태 |
|---|------|------|------|
| 1 | 스킴 개수 서술 부정확 (2개 → Cloudflare 문서 2개 + 모노레포 batch-settlement) | must-fix | 해소 |
| 2 | 채택 관련 반대 증거(Artemis/CoinDesk) 미반영 | must-fix | 해소 |
| 3 | s16 npm HEAD 403 (봇 차단, 데이터는 CLI 검증) | nit | 수용 |
| 4 | ainvest 하락 수치 인용 불가 → Limitations에 명시 | nit | 수용 |

**미해결 must-fix: 0건.**
