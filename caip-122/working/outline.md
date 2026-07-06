# Outline — CAIP-122 (Sign in With X) 체인 불가지론적 지갑 인증 표준 분석

1. **초록 (Abstract)** — 본문 완성 후 작성.
2. **서론 (Introduction)** — 체인별 사인인 표준 난립 문제, CAIP-122의 위치(EIP-4361의 일반화), 리서치 범위.
3. **배경: CAIP 체계와 ChainAgnostic 표준 스택** — CASA/ChainAgnostic의 CAIP 프로세스, CAIP-2(체인 ID)·CAIP-10(계정 ID)·CAIP-104(네임스페이스)·CAIP-74(CACAO)와의 관계.
4. **CAIP-122 데이터 모델 분석** — 추상 데이터 모델(필수/선택 필드), 서명 타입과 네임스페이스 프로파일 요구(서명 알고리즘, type 문자열, signing input 절차), 체인별 프로파일(eip155=EIP-4361, solana, tezos 등), CACAO 직렬화와의 연계.
5. **구현과 생태계** — 네임스페이스 프로파일 현황(namespaces.chainagnostic.org), Reown(WalletConnect) AppKit SIWX, x402 SIWX 확장, Ceramic/DID 세션(did:pkh, CACAO) 등 실제 구현 경로.
6. **평가와 논의** — 추상화의 득실(체인 확장성 vs 프로파일 파편화), Review 상태에 머무는 표준의 성숙도, EIP-4361과의 차이(무엇이 일반화에서 빠졌나), 채택 신호.
7. **한계 (Limitations)**
8. **References** — 자동 생성.
