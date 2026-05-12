# Outline: EVM 기반 프라이버시 토큰 전송 방법 분석 및 실용적 구현 가이드

## 1. Abstract (초록)
EVM/Ethereum 환경에서 프라이버시 토큰 전송 기술의 현황, 각 접근법의 핵심 원리·트레이드오프, 실제 서비스 개발에 가장 현실적인 방식 요약.

## 2. Introduction (서론)
- Ethereum의 투명성: 모든 주소·잔액·거래가 공개
- 프라이버시가 필요한 합법적 사용 사례: 기업 결제, OTC 거래, 개인정보 보호
- 프라이버시 기술의 규제 딜레마: Tornado Cash OFAC 제재 사례
- 연구 범위: EVM 메인넷/L2에서 동작하는 프라이버시 토큰 전송 방법론 비교

## 3. 배경: 프라이버시 위협 모델과 암호학 기초
- Ethereum 계정 모델의 투명성: 주소·잔액·거래 내역 공개
- 프라이버시 목표 분류: 발신자 익명성, 수신자 익명성, 금액 기밀성
- 핵심 암호학 도구: zk-SNARK, FHE(완전동형암호), ECDH, 커밋-공개(commit-reveal)
- 선행 기술: Zcash의 shielded pool, Monero의 링 서명 — EVM 적용의 한계

## 4. 기술 접근법별 분류 및 메커니즘
- **스텔스 주소 (Stealth Address, ERC-5564/ERC-6538)**: 수신자 익명성, SECP256k1 기반 ECDH
- **ZK 쉴드 풀 (Railgun)**: zk-SNARK 기반 완전 프라이버시, Private Proofs of Innocence(컴플라이언스)
- **ZK L2 프라이버시 (Aztec Network)**: 프로그래머블 프라이버시 L2, 스마트 컨트랙트 수준 프라이버시
- **완전동형암호 기반 (Zama FHEVM / ERC-7984)**: 온체인 암호화 잔액, 코프로세서 네트워크
- **믹서/텀블러 (Tornado Cash)**: 역사적 접근법, OFAC 제재로 실용성 종료

## 5. 주요 구현체 상세 분석
- **Railgun**: 멀티체인 EVM(Ethereum, Polygon, Arbitrum, BNB Chain), Private POI 컴플라이언스 레이어
- **Aztec Network**: Noir 언어, ZK² Rollup, 프라이빗 스마트 컨트랙트, 2026년 3월 취약점 이슈
- **Zama FHEVM / ERC-7984**: 코프로세서 아키텍처, OpenZeppelin 연동, 기관 OTC 사용 사례
- **Umbra / ScopeLift SDK (ERC-5564)**: 스텔스 주소 레퍼런스 구현체, 메인넷 배포
- **Tornado Cash / Privacy Pools**: 규제 제재 이후 대안으로 등장한 Privacy Pools 개념

## 6. 규제 및 컴플라이언스 환경
- Tornado Cash OFAC 제재(2022): 코드·스마트 컨트랙트 제재의 전례
- Privacy Pools(Vitalik Buterin, 2023): 컴플라이언스와 프라이버시 공존 모델
- Private Proofs of Innocence(Railgun): ZK 기반 무결성 증명
- ERC-7984 기관 도입: GSR·OpenZeppelin·Zama의 KYC 기관 OTC 사례
- 개발자가 고려해야 할 규제 리스크와 컴플라이언스 설계 원칙

## 7. 실용적 구현 가이드: 사용 사례별 최적 선택
- 선택 기준 프레임워크: 프라이버시 강도 / 컴플라이언스 요구 / 개발 복잡도 / 생태계 성숙도
- **수신자 익명성만 필요한 경우**: ERC-5564 스텔스 주소 (가장 단순, SDK 존재)
- **DeFi 프로토콜 통합 + 완전 프라이버시**: Railgun (Private POI로 컴플라이언스)
- **프로그래머블 프라이버시 애플리케이션**: Aztec Network (Noir 학습 비용, 아직 불안정)
- **기관 대상 컴피덴셜 전송**: Zama FHEVM / ERC-7984 (코프로세서 의존성)
- 비교 표: 기술 성숙도 / 감사 완료 여부 / 지원 체인 / 개발자 경험

## 8. 한계 및 불확실성 (Limitations)
- Aztec 2026년 3월 치명적 취약점 (7월 v5 패치 예정)
- FHE 코프로세서 네트워크의 중앙화 리스크
- 규제 변화에 따른 서비스 중단 가능성
- 독립 보안 감사 부재 혹은 불완전한 감사
- 스텔스 주소의 UX 문제 (가스비, 메타데이터 누출 가능성)
