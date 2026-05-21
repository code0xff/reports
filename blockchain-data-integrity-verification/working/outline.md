# Outline — Blockchain Data Integrity Verification

## 1. Abstract / 초록
- 블록체인이 풀 수 있는 "데이터 정합성 검증"의 범위 정리.

## 2. Introduction — 데이터 정합성 검증 문제
- "정합성"의 두 의미: tamper-evidence vs availability.
- 왜 블록체인이 후보가 되는가.

## 3. 기술적 접근 — 6가지 패턴
- 3.1 해시 앵커링 (anchor a hash on-chain)
- 3.2 Merkle proof와 transparency log
- 3.3 콘텐츠 주소화 (CIDs, IPFS)
- 3.4 증명-기반 분산 스토리지 (Filecoin PoRep/PoSt, Arweave SPoRA)
- 3.5 Attestation / signed credentials (EAS, sigstore Fulcio)
- 3.6 Oracle / data feed (Chainlink Proof of Reserve)
- 3.7 Data Availability layers (Celestia, EigenDA)

## 4. Product Landscape — 실제로 운용되는 제품들
- 4.1 OpenTimestamps (Bitcoin 앵커링)
- 4.2 Guardtime KSI (Estonia 정부, 국가 인프라)
- 4.3 OriginStamp (다중 체인 타임스탬프 SaaS)
- 4.4 Sigstore Rekor (소프트웨어 공급망 transparency log)
- 4.5 Ethereum Attestation Service (EAS)
- 4.6 Chainlink Proof of Reserve
- 4.7 Filecoin / Arweave (저장 증명)
- 4.8 VeChain · IBM Food Trust (공급망)
- 4.9 Celestia / EigenDA (DA layers)

## 5. Comparison — 패턴 × 제품 매트릭스
- 누가 어떤 패턴을 채택하는지.

## 6. Discussion — 트레이드오프
- 비공개 데이터 보호 vs 공공 검증.
- 비용·지연·신뢰 모델.
- "블록체인이 꼭 필요한가" 반론.

## 7. Limitations.
## 8. References — auto-generated.
