# Uncertainties

- multisig와 MPC의 "언제 선택해야 하는가" 섹션은 논문과 1차 문서, 그리고 여러 벤더 문서를 종합한 해석이다. 절대 규칙이 아니라 요구사항 기반 권고로 읽어야 한다.
- DKLs23의 수학적 성질은 공개 논문으로 확인 가능하지만, 실제 상용 배포에서의 coordinator 모델, relay, telemetry, recovery 운영은 구현체마다 크게 다를 수 있다.
- account-based 체인에서 MPC가 유리하다는 결론은 대체로 맞지만, 특정 앱/체인/AA 스택에서는 smart account 쪽의 호환성 비용이 계속 줄어들 수 있다.
