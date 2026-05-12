# Uncertainties — evm-privacy-token-transfer

## Vendor-stated / early-signal claims

- **Aztec 1 TPS Alpha 처리량**: Aztec 공식 블로그에서 주장. 실제 네트워크 부하 조건에서 독립 검증 없음. _(vendor-stated)_
- **ERC-7984 FHE 가스 비용 100x 개선**: Zama가 주장하는 최근 개선치; 실제 Mainnet 벤치마크 미공개. _(vendor-stated)_
- **Railgun Private POI "기관 DeFi 표준"**: Flashift 블로그(s13) 주장; 독립 채택 데이터 없음. _(vendor-stated)_
- **Privacy Pools $6M TVL**: 2025년 11월 기준 수치; 이후 변동 가능. _(time-sensitive)_

## 구조적으로 불안정 / 변경 가능성

- **Aztec Network 취약점 패치**: 2026년 7월 v5 릴리즈 예정이나 연기 가능. Alpha 단계에서 새 취약점 발생 가능성 있음. _(early signal)_
- **ERC-7984 표준화**: Ethereum Magicians 토론 중인 Draft 상태. 최종 채택 여부 불확실. _(early signal)_
- **ERC-5564 생태계**: ScopeLift SDK v1.0.0-beta.5 — 아직 정식 릴리즈 전. _(early signal)_
- **Tornado Cash 재운영**: 제재 해제 후 Tornado Cash 프런트엔드 재가동 가능성 — 법적 불확실성 여전히 존재. _(early signal)_

## 인식론적 한계

- Railgun 컨트랙트에 대한 최신 독립 보안 감사 공개본 미확인.
- ERC-7984 코프로세서 네트워크의 탈중앙화 수준 — Zama 주장 외 독립 검증 없음.
- 스텔스 주소의 실제 가스 비용 수치(트랜잭션당) — 공식 벤치마크 없음.
- Aztec의 Noir 언어 개발자 경험 — 공식 문서 외 독립 평가 없음.
