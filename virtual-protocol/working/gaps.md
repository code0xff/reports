# Gaps — Virtual Protocol 리포트

Phase 3/4 종료 시점. A 범위 claim 은 모두 최소 소스 기준 충족.

## 아직 해소되지 않은 기술적 격차

1. **ERC-6551 vs ERC-1155 표기 불일치**
   - ICV 페이지 (s08) 는 각 에이전트를 "ERC-6551 NFT" 로 명시.
   - Agent Creation 페이지 (s14) 는 "ERC-1155 token-bound address" 로 기술.
   - ERC-6551 이 token-bound account (TBA) 의 표준이므로 s14 쪽이 부정확한 표기로 보이나, 직접 온체인 컨트랙트 검증까지 수행하지 않음.
   - 드래프트에서는 양쪽 표기를 모두 보여주고 갈등을 남김.

2. **온체인/오프체인 경계 (c08)**
   - 공식 whitepaper 에 "on-chain vs off-chain" 경계를 한 줄로 정리한 문구는 없음.
   - 현재 기술은 ICV(온체인), ACP(온체인 escrow), GAME(오프체인 SDK) 개별 페이지에서 각자의 위치를 언급한 것을 합성한 것.
   - 드래프트에서 interpretive synthesis 로 명시.

3. **스마트 컨트랙트 주소 (Base) 직접 확인 미수행**
   - 본 리서치는 whitepaper 텍스트에 의존. Basescan/Etherscan 에서 AgentFactory, Bonding, VIRTUAL 토큰 컨트랙트의 배포 주소/코드 검증은 수행하지 않음.
   - Limitations 섹션에 명시.

4. **Messari / DWF Labs 리서치 본문 접근 불가 (페이월)**
   - s13 (Messari), DWF Labs 모두 paywalled.
   - c03, c16 은 A 범위에서 제외했으므로 현재 문제 없음. 후속 리포트 필요 시 재수집.

5. **PeckShield 감사 PDF 내부 검증 미수행**
   - s18, s19 URL 존재 자체는 확인됐으나 PDF 내용 quote 는 수집하지 않음 (`access_limited: true`).
   - "감사가 공개됐다" 라는 claim(c15) 자체는 s09 (whitepaper 언급) + s18/s19 (실제 URL) 로 충족.
   - PDF 의 지적 사항·심각도 분포는 후속 리포트에서 커버.

## 받아들이기로 한 한계

- 본 리포트는 **공식 문서 텍스트 + 공개 뉴스·기술 기사** 를 기반으로 하고, 온체인 데이터 감사나 스마트 컨트랙트 소스 레벨 검증은 수행하지 않는다. 이 한계는 Limitations 섹션에 명시해야 한다.
- 리서치 기준일: 2026-04-18. 이후 변경은 반영되지 않는다.
