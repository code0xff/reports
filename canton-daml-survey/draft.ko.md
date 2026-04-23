# Canton과 Daml — 빌더와 개발자 관점을 중심으로 한 상세 조사

## 초록

Canton은 프라이버시 보존형 블록체인 프로토콜이며, 그 스마트 컨트랙트는 Digital Asset이 원래 설계하고 오픈소스로 공개한 순수 함수형 Haskell 계열 도메인 특화 언어인 Daml로 작성된다 [^s01][^s19][^s20][^s21]. 본 보고서는 Canton과 Daml을 두 가지 축으로 조사한다. **개발자 관점** — 애플리케이션 로직을 어떻게 작성·테스트·통합·업그레이드하는가 — 과 **빌더 관점** — 사설(private) Canton, 컨소시엄, 공개 Canton Network 중 어느 배포 형태를 선택하고, Global Synchronizer에 어떻게 온보딩하며, 비용·라이선스·거버넌스를 어떻게 다룰 것인가 — 이다 [^s03][^s28][^s30][^s31][^s37]. 대표적인 프로덕션 레퍼런스로는 Goldman Sachs의 GS DAP, Deutsche Börse / Clearstream의 D7, HKEX Synapse, Broadridge의 Distributed Ledger Repo가 있다 [^s11][^s13][^s15][^s17]. Canton Network 메인넷은 2024년에 런칭되었고 [^s02], Canton Coin(CC)이 그 네이티브 유틸리티 토큰이다 [^s06][^s07][^s08]. 다만 상당수의 정량 지표는 여전히 벤더가 직접 공개한 값이며, 동료심사 수준의 공개 분석은 Canton 프로토콜이 아니라 Daml 언어 논문에 한정된다는 한계가 있다 [^s35].

## 1. 서론

Canton은 "모두가 모두를 본다"는 공개 EVM 체인 모델과 달리, 처음부터 데이터 파티셔닝·당사자 수준 프라이버시·규제 준수를 염두에 두고 설계된 엔터프라이즈 DLT 계열에 속한다 [^s04]. Digital Asset은 2023년 5월 약 30개 창립 기관과 함께 Canton Network를 공개 발표했고 [^s01], 공개망의 중심에 있는 BFT 정렬 상호운용성 서비스인 **Global Synchronizer** 는 2024년 6–7월 메인넷에 런칭되면서 Canton Coin도 함께 공개되었다 [^s02][^s03]. 이 공개망의 거버넌스는 Digital Asset 단독이 아니라 Linux Foundation 산하의 **Global Synchronizer Foundation(GSF)** 을 통해 운영된다 [^s03][^s36].

"빌더"와 "개발자"를 구분하는 이유는 두 역할이 실제로 접하는 스택 층이 다르기 때문이다. 자본시장 워크플로우를 구현하는 개발자는 주로 Daml 언어, Ledger API, 테스트 도구, Daml Finance 라이브러리를 본다 [^s10][^s22][^s23][^s25][^s09]. 프로덕션 배포를 세우는 빌더는 Canton 프로토콜 자체를 다룬다 — 토폴로지 선택, 싱크로나이저 운영, 라이선스, 공개망의 경우 Canton Foundation의 온보딩 절차 등이다 [^s28][^s30][^s31][^s37]. 본 보고서는 각 주장이 어느 층에 해당하는지 명시한다.

## 2. 배경 — 기원, 라이선스, 생태계

Daml은 Canton 프로토콜보다 먼저 존재했다. Digital Asset은 2018년 비공개 베타를 거쳐 2019년 4월 4일 Daml SDK를 Apache 2.0 라이선스로 공개했고, 언어·런타임·SDK가 이때부터 제3자에게 개방되었다 [^s19]. GitHub의 `digital-asset/daml` 저장소는 지금도 Apache-2.0이며 주 언어는 Haskell(약 66%)이다. `sdk/` 하위 트리가 컴파일러와 SDK 도구를 담고 있다 [^s20]. Daml 참여자 노드를 동기화하는 원장 상호운용성 프로토콜인 Canton은 `digital-asset/canton` 저장소에 올라가 있으며 역시 Apache-2.0, Scala가 거의 전부(~96%)를 차지하고, README는 Canton을 "Daml의 내장 권한·프라이버시 모델을 충실하게 구현하는 차세대 Daml 원장 상호운용성 프로토콜"이라고 기술한다 [^s21]. 참조 구현과 138개 이상의 릴리스가 이 저장소에 있다 [^s21].

그러나 스택 전부가 허용적(permissive) 라이선스로 공개되어 있지는 않다. Digital Asset은 별도의 **Enterprise Suite for Canton** 을 제공하는데, 이는 엔터프라이즈 등급 밸리데이터 노드 기능, PQS·Shell 같은 통합 컴포넌트, 합성 가능한 "DA Utilities" 모듈, 프라이빗 서브넷용 추가 인프라 구성요소를 담고 있다 [^s31]. 엔터프라이즈 릴리스는 요청 기반이며 공개 프로토콜 저장소의 Apache 라이선스와는 다른 조건으로 제공된다 [^s31]. Global Synchronizer의 구동 코드(Amulet 레퍼런스 결제 앱 포함)를 담은 Hyperledger Labs 프로젝트 **Splice** 는 Apache-2.0이며 커뮤니티가 유지하지만 원래 Digital Asset이 개발했다 [^s28][^s29]. 실무적으로 "Canton과 Daml은 오픈소스다"라는 문장은 참이긴 하지만 완전하지는 않다 — 프로덕션에서 중요한 일부 컴포넌트는 상용 라이선스로 유통된다 _(해석적 판단)_ [^s31][^s32].

프로덕션 채택은 일반 사용자 서비스가 아니라 규제 받는 금융 인프라에서 먼저 일어났다. Goldman Sachs의 토큰화 플랫폼 GS DAP™은 2023년 1월 라이브되었고, 유럽투자은행(EIB)의 1억 유로 디지털 채권 발행이 그 첫 거래였다. Canton Network 생태계 페이지는 GS DAP가 Canton 위에 네이티브로 배포되어 있음을 명시한다 [^s11][^s12]. Deutsche Börse와 Clearstream의 포스트-트레이드 플랫폼 D7도 Daml 기반이며, 2023년 시점에 25만 건이 넘는 디지털 발행을 처리했다고 Ledger Insights는 보도했다 [^s13][^s14]. HKEX는 2023년 10월 북행(Northbound) Stock Connect 결제를 위한 DAML 기반 플랫폼 **Synapse** 를 런칭했다 [^s15][^s16]. Broadridge의 **Distributed Ledger Repo(DLR)** 플랫폼은 Daml과 VMware Blockchain을 사용해 2021년 중반 프로덕션에 들어갔고 [^s18], 보도자료에 따르면 2025년 10월 일평균 3,850억 달러, 11월 3,680억 달러(월 7.4조 달러)의 레포 거래를 처리했다 [^s38][^s17]. 이 숫자는 프로토콜 처리량이 아니라 거래 볼륨이지만, Daml이 파일럿 단계를 지나 실제 기관 워크플로우를 유지하고 있음을 보여주는 자료다.

## 3. 아키텍처와 프라이버시 모델

Canton은 "네트워크들의 네트워크" 구조를 채택한다 [^s21][^s33]. Canton 배포는 하나 이상의 온체인 당사자를 대신해 Daml 컨트랙트 상태를 보관하는 **참여자 노드(participant node)** 들과, 암호화된 메시지를 분배하고 트랜잭션 순서를 결정하며 커밋을 확정하는 **싱크로나이저(synchronizer)** (구 문서에서는 "sync domain")로 구성된다 [^s21]. 하나의 Canton 설치는 여러 싱크로나이저에 접속할 수 있고 컨트랙트는 싱크로나이저 사이를 이동할 수 있다 — 외부 브리지 없이 서브넷 간 조합성(composability)을 확보하는 방식이다 [^s33].

특징은 프라이버시 모델이다. Canton은 **알 필요 있음(need-to-know) 기반 서브-트랜잭션 프라이버시**를 구현한다. 참여자는 자신에게 해당하는 트랜잭션 부분만 수신·기록하며, 싱크로나이저 운영자는 트랜잭션 페이로드 자체를 볼 수 없고 순서와 참여자 식별자 같은 메타데이터만 본다 [^s04]. 예컨대 DvP(Delivery vs Payment) 결제에서 현금 은행은 결제 leg만, 증권 등록기관은 자산 leg만 보게 된다 [^s04]. 이 방식을 뒷받침하는 암호학적 구성은 Canton 화이트페이퍼에 기술되어 있다 [^s05] _(unverified — 단일 1차 자료이자 벤더 저작)_. 이 영역에서 동료심사된 유일한 문서인 Daml 언어 논문은 Daml이 평가되는 추상 원장을 정리하지만 Canton 구현 자체를 측정하거나 외부 감사하는 결과는 아니다 [^s35].

공개 Canton Network에는 한 층이 더 얹힌다. **Global Synchronizer** 는 다수의 독립적인 **Super Validator** 가 운영하는 탈중앙 BFT 싱크로나이저이며, 2/3 BFT 쿼럼으로 합의한다 [^s03][^s28]. Super Validator 역시 원 트랜잭션 데이터를 보지 않고 암호화된 블롭의 순서만 매긴다 — 동일한 서브-트랜잭션 프라이버시 보장이 공개 백본까지 확장된다 [^s04]. **Canton Coin(CC)** 는 Global Synchronizer의 애플리케이션 및 인프라 수수료 지불 수단이자, 이 BFT 운영에 대한 보상 토큰으로 Super Validator와 애플리케이션 밸리데이터에게 지급된다 [^s06][^s07][^s08]. 보상은 10분 주기의 "round" 단위로 방출되며, Super Validator / 애플리케이션 / 최종 사용자 밸리데이터 간 분배 비율은 시간에 따라 변한다. Digital Asset의 토크노믹스 문서는 2029년 중반까지 애플리케이션 62% / Super Validator 20%로 이동하는 경로를 서술한다 [^s08]. CC는 프리마인, 프리세일, 창립자·VC 할당 없이 시작했다고 프로젝트 측이 밝혔는데, 사실이라면 기관용 L1치고는 이례적이다 _(벤더 진술)_ [^s07].

## 4. 개발자 관점 — Canton 위에 Daml 쓰기

Daml은 순수 함수형이며 Haskell 계열이다 [^s35]. 작성의 핵심 단위는 **template** 이다. template은 컨트랙트의 데이터, 생성에 대한 권한을 갖는 당사자인 **signatory**, 컨트랙트를 볼 수 있는 **observer**, 그리고 명시적으로 지정된 **controller** 당사자 집합이 행사하는 일련의 이름 붙은 **choice** 로 구성된다 [^s22]. 권한 검증은 언어 수준에서 이루어진다 — controller 집합이 해당 choice를 행사할 권한이 없으면 컴파일러와 런타임이 이를 거부한다. 이는 일반적인 EVM 컨트랙트가 `require(msg.sender == …)` 같은 런타임 단언에 의존하는 방식과 대비된다 [^s22][^s35]. arXiv 논문은 이를 "실제 비즈니스 워크플로우의 법적 규칙을 포착하는 개념"에 위임·조합성을 포함한 내장 권한 프레임워크로 정리한다 [^s35].

애플리케이션은 두 개의 병렬 Ledger API로 Canton과 상호작용한다. **gRPC Ledger API** 는 트랜잭션 스트리밍, 명령 제출, 활성 컨트랙트 조회를 위한 저수준 프로토콜로, `.proto` 정의가 SDK와 함께 배포된다 [^s23]. **HTTP JSON API** 는 웹 앱과 스크립팅을 위한 REST 유사 인터페이스이며 TypeScript/JavaScript 프런트엔드에 권장된다 [^s24]. `daml` 어시스턴트는 DAML-LF 이진 표현을 TypeScript 또는 Java의 관용 바인딩으로 변환하는 코드 생성기를 포함해, 통합 코드를 원 와이어 프로토콜 수준에서 쓰지 않아도 되게 한다 [^s23]. 이 바인딩과 Daml React 라이브러리 덕분에 빌더는 보통 애플리케이션 로직은 Daml로, 글루 코드는 TypeScript 혹은 JVM 기반 Java로 작성한다.

테스트는 **Daml Script** 가 담당한다. 개발자는 다자간 워크플로우를 코드로 스크립팅해 IDE 샌드박스, CLI, 로컬 Sandbox 원장, 또는 임의의 실제 Ledger API 엔드포인트에 대해 실행할 수 있다 [^s25][^s26]. Hardhat류 오프체인 테스트 역할을 한다 — 컨트랙트 생성, 다른 당사자 신분으로 choice 행사, 결과 원장 상태 검증까지 가능하다 [^s25]. 원장 이벤트에 반응하는 장시간 자동화에는 **Daml Triggers** 가 사용된다. Triggers는 Ledger API 엔드포인트에 상시 연결되어 동작하며 Script와 문서상 함께 언급되지만 별개의 도구다 [^s26].

자본시장 개발자에게는 **Daml Finance** 가 실질적인 생산성 레버다. 이는 금융상품, 계정, 결제, 라이프사이클 이벤트를 위한 재사용 가능한 template을 제공하는 1차 오픈소스 Daml 라이브러리다 [^s09][^s10]. Daml Finance는 애플리케이션 코드를 대체하지 않고, 자산을 표현하는 공통되고 조합 가능한 어휘를 제공해 Canton 애플리케이션 간, 나아가 Canton Network 전반에서 재사용을 가능하게 한다 [^s10][^s14].

Daml의 업그레이드 스토리는 EVM 대비 진짜 차별점이다. **Smart Contract Upgrade(SCU)** 는 Daml 패키지의 새 버전을 게시해도 기존 컨트랙트가 그대로 유효하도록 해준다. 호환 가능한 변경은 컨트랙트별 수동 마이그레이션 없이 적용되고, 호환되지 않는 변경은 새 패키지 이름으로 표현한다 [^s27]. SCU는 최소 DAML-LF 1.17과 Canton 프로토콜 버전 7을 요구하며, 런타임 패키지 해석은 결정론적이다 — (package-name, package-version) 관계가 유일해야 한다 [^s27]. 이는 문서화된 기능이며, Canton Network 전반에서의 운영 경험은 아직 열린 질문이다 _(초기 신호)_ [^s27].

## 5. 빌더 관점 — Canton을 배포하고 운영하고 공개망에 합류하기

Canton을 선택한 빌더가 가질 수 있는 토폴로지는 최소 세 가지다. **완전 사설(private) Canton** 은 한 운영자가 Daml 참여자 노드와 단일 싱크로나이저를 직접 운영하는 형태로, GS DAP·D7·HKEX Synapse·Broadridge DLR 같은 규제 사업자가 Daml의 권한·프라이버시 모델만 필요하고 기관 간 상태 공유가 필요하지 않을 때 쓰는 구조다 [^s11][^s13][^s15][^s17][^s37]. **컨소시엄 Canton** 은 복수의 기관이 공유 싱크로나이저(한 기관 혹은 중립적 제3자 운영)에 참여자 노드를 붙이는 방식으로, Global Synchronizer가 나오기 전 Canton Network가 파일럿되던 방식이다 [^s01][^s37]. **공개 Canton Network** 는 참여자 노드로 Global Synchronizer에 합류하는 최신 토폴로지로, 2024년 메인넷 런칭과 함께 열렸다 [^s02][^s03]. Canton Network 팀이 제시한 "5 developer pathways" 틀은 이 스펙트럼을 명시적으로 펼쳐 실무 빌더의 선택지와 그대로 맞는다 [^s37].

공개 Canton Network 운영은 아직 자유 합류가 아니다. 메인넷은 **초대 전용(invite-only)** 단계에 있으며, 밸리데이터는 스폰서 Super Validator가 필요하고 고정 egress IP를 제공해야 하며 온보딩 시크릿은 일회성이고 48시간 안에 만료된다 [^s30]. sync.global의 Tokenomics Committee가 신청을 검토하며, 평균 약 2주가 소요된다고 명시되어 있다 [^s30]. **Super Validator** 승인은 더 무겁다 — BFT 시퀀싱 인프라를 운영하고 GSF를 통해 거버넌스에 참여하며, 그 대가로 CC 표시 배출 보상의 일정 지분을 받는다 [^s03][^s08]. 보상 분배는 거버넌스 제어 대상이어서 변동하며, 현재 계획 경로는 2029년 중반까지 애플리케이션 62% / Super Validator 20% 구조다 [^s08]. Super Validator 슬롯은 유한하고 GSF 승인으로 게이팅되므로, 개방형 PoS 밸리데이터 시장보다는 허가된 마켓메이커 시트에 가깝다 _(해석적 판단)_ [^s03][^s30].

Super Validator를 운영할 계획이 없는 팀에게도 상용 의존성은 중요하다. Canton Enterprise는 프로덕션 등급 밸리데이터 노드, 통합 커넥터, 인프라 컴포넌트를 비공개 상용 라이선스로 묶어 제공하며 가격은 공개되지 않고 직접 문의 기반이다 [^s31]. Digital Asset은 2025년 6월 DRW Venture Capital과 Tradeweb 주도로 1억 3,500만 달러 전략적 투자를 유치했고 BNP Paribas, Citadel Securities, DTCC, Goldman Sachs, Circle Ventures 등이 참여했다 [^s32] — 상용 레이어가 자금과 추진력을 갖춘 증거이면서 동시에 Digital Asset이 스택의 핵심에 단일 벤더로 남아 있다는 뜻이기도 하다 _(해석적 판단)_ [^s31][^s32].

상호운용성은 두 가지 이야기로 나뉜다. Canton **내부**에서는 원자적 크로스-도메인 전송이 네이티브다. 컨트랙트는 싱크로나이저 사이를 이동할 수 있고, 참여자들이 공통 싱크로나이저를 공유하는 한 여러 싱크로나이저에 걸친 트랜잭션이 원자적으로 조합된다 [^s33]. Canton **외부** 에 대한 이야기는 성숙도가 낮다. Canton Network 팀 자체가 외부 브리지(예: 이더리움·솔라나)를 기본 통합 경로가 아닌 "좁은 용도" 연결 장치로 명시적으로 위치시킨다 [^s34]. Circle의 USDCx Canton 연동은 외부 브리지 방향의 최근 구체 사례이지만, 업계 해설은 이런 통합을 아직 보편화된 기능이 아니라 부상 중인 역량으로 다룬다 _(해석적 판단)_ [^s34]. 요컨대 Canton **안에서의** 상호운용성은 잘 작동하고, 나머지 크립토 세계와의 상호운용성은 로드맵 진행 중 항목이다 [^s33][^s34].

## 6. 한계와 남은 질문

**외부 검증이 얇다.** 본 조사에서 확인한 동료심사 자료는 Daml 언어에 관한 arXiv 논문 1편뿐이다 [^s35]. Canton 프로토콜 화이트페이퍼(s05)와 Canton Network 화이트페이퍼(s06)는 벤더 저작이며 본 조사의 PDF 파서에서는 텍스트 추출이 제한되었다 — 핵심 주장은 공개 블로그와 공식 문서로 간접 확인되지만 [^s04][^s08], Canton의 서브-트랜잭션 프라이버시와 프로덕션 규모에서의 BFT 특성에 대한 독립적 정형 감사는 찾지 못했다.

**정량 성능 지표는 벤더 진술이다.** Canton 프로토콜의 처리량·지연·수수료 수치는 Digital Asset과 파트너 블로그에서 유래한다 [^s07][^s08]. Broadridge DLR의 월별 레포 볼륨 보도자료는 독립적이고 매우 큰 숫자이지만(2025년 11월 일평균 3,680억 달러 [^s17][^s38]), 이는 사설 Daml 배포의 거래 볼륨이지 공개 Canton Network의 프로토콜 TPS 벤치마크가 아니다. Global Synchronizer의 하드 처리량이 필요한 독자라면 현재 숫자를 보장이 아닌 스냅샷으로 취급해야 한다.

**Canton Coin 토크노믹스는 젊다.** CC는 2024년 중반에야 공개 유통을 시작했고 [^s02], 보상 분배는 시간에 따라 변하도록 설계되어 있으며 [^s08], Super Validator 집합은 아직 완전 무허가형이 아니라 GSF 승인으로 게이팅된다 [^s30]. 본 보고서의 구체적 CC 수치는 프로토콜 불변항이 아니라 2025년 전후의 스냅샷으로 읽어야 한다.

**라이선스는 혼합형이다.** 핵심 Daml(s20)과 Canton(s21)은 Apache-2.0이고, Splice와 Global Synchronizer 레퍼런스 앱도 Apache-2.0이다 [^s28][^s29]. 그러나 Canton Enterprise 컴포넌트는 상용이다 [^s31]. 빌더는 목표 토폴로지를 각 컴포넌트의 실제 출하 라이선스에 매핑한 뒤에야 "오픈소스"라는 문구가 필요한 전부를 덮는지 확인할 수 있다.

**거버넌스 집중도 문제는 여전히 열려 있다.** Global Synchronizer Foundation은 Linux Foundation 거버넌스 아래에 있지만 [^s03], Digital Asset 역시 창립 멤버이면서 Splice의 주요 코드 작성자다 [^s28]. GSF 거버넌스가 시간이 지나면서 실질적 통제력을 분산시키는지는, 누가 실제로 Super Validator를 운영하고 누가 프로토콜 변경을 제안하며 누가 신규 밸리데이터를 스폰하는지를 관찰해야 답할 수 있는 질문이다 _(해석적 판단)_ [^s03][^s28][^s30].

## 7. 참고문헌

자료 상세는 `working/sources.jsonl`에 있으며 `id`로 참조된다.

[^s01]: Digital Asset, *Introducing the Canton Network* (2023). https://www.canton.network/canton-network-press-releases/canton-network-press-release
[^s02]: *Canton Network*, Wikipedia. https://en.wikipedia.org/wiki/Canton_Network
[^s03]: Linux Foundation, *Leading Market Participants Partner with the Linux Foundation to Form the Global Synchronizer Foundation* (2024-07-01). https://www.linuxfoundation.org/press/leading-market-participants-partner-with-the-linux-foundation-to-form-the-global-synchronizer-foundation
[^s04]: Canton Network 블로그, *How Canton Network Delivers Institutional-Grade Privacy*. https://www.canton.network/blog/how-canton-network-delivers-institutional-grade-privacy
[^s05]: Digital Asset, *Canton: A Daml based ledger interoperability protocol* (화이트페이퍼 PDF). https://www.canton.io/publications/canton-whitepaper.pdf
[^s06]: Digital Asset, *Canton Coin: A Canton-Network-native payment application* (화이트페이퍼 PDF). https://www.digitalasset.com/hubfs/Canton%20Network%20Files/Documents%20(whitepapers,%20etc...)/Canton%20Coin_%20A%20Canton-Network-native%20payment%20application.pdf
[^s07]: Canton Network 블로그, *Canton Coin: Rewarding Utility*. https://www.canton.network/blog/canton-coin-rewarding-utility
[^s08]: Digital Asset 플랫폼 문서, *Tokenomics and Rewards*. https://docs.digitalasset.com/integrate/devnet/tokenomics-and-rewards/index.html
[^s09]: *digital-asset/daml-finance* (GitHub). https://github.com/digital-asset/daml-finance
[^s10]: Daml SDK 문서, *Daml Finance — Introduction*. https://docs.daml.com/daml-finance/overview/intro.html
[^s11]: Digital Asset 보도자료, *Goldman Sachs' Tokenization Platform GS DAP, Leveraging Daml, Goes Live* (2023). https://blog.digitalasset.com/press-release/goldman-sachs-tokenization-platform-gs-dap-leveraging-daml-goes-live
[^s12]: Canton Network, *GS DAP 생태계 페이지*. https://www.canton.network/ecosystem/gs-dap
[^s13]: Ledger Insights, *Deutsche Börse Clearstream's D7 issues €10 billion+ in digital securities*. https://www.ledgerinsights.com/deutsche-borse-clearstreams-d7-issues-e10-billion-in-digital-securities/
[^s14]: Digital Asset, *Customer story: Deutsche Börse and Clearstream*. https://www.digitalasset.com/customer-story/deutsche-b%C3%B6rse
[^s15]: Ledger Insights, *HKEX launches Synapse stock settlement platform using DAML smart contracts*. https://www.ledgerinsights.com/hkex-synapse-daml-smart-contracts/
[^s16]: Digital Asset 블로그, *HKEX Connects Hong Kong and Mainland China Markets with DAML*. https://blog.digitalasset.com/blog/hkex-revolutionizes-post-trade-processing-with-daml
[^s17]: Broadridge 보도자료, *DLR processes $368B average daily repo volume in November 2025*. https://www.broadridge.com/press-release/2025/broadridge-distributed-ledger-repo-platform-november
[^s18]: Ledger Insights, *Broadridge's DLT repo platform goes into production*. https://www.ledgerinsights.com/broadridge-blockchain-dlt-repo-platform-goes-into-production/
[^s19]: CryptoNinjas, *Digital Asset open sources its smart contract language DAML* (2019-04-04). https://www.cryptoninjas.net/2019/04/04/digital-asset-open-sources-its-smart-contract-language-to-enable-integration-with-other-blockchains/
[^s20]: *digital-asset/daml* (GitHub). https://github.com/digital-asset/daml
[^s21]: *digital-asset/canton* (GitHub). https://github.com/digital-asset/canton
[^s22]: Daml SDK 문서, *Reference: Choices*. https://docs.daml.com/daml/reference/choices.html
[^s23]: Daml SDK 문서, *Build Integration with the Ledger API*. https://docs.daml.com/app-dev/ledger-api.html
[^s24]: Daml SDK 문서, *HTTP JSON API Service*. https://docs.daml.com/json-api/index.html
[^s25]: Daml SDK 문서, *React to Off-Ledger Events: Daml Script*. https://docs.daml.com/daml-script/index.html
[^s26]: Daml SDK 문서, *Test Daml Contracts*. https://docs.daml.com/daml/intro/12_Testing.html
[^s27]: Daml SDK 문서, *Smart Contract Upgrade*. https://docs.daml.com/upgrade/smart-contract-upgrades.html
[^s28]: LF Decentralized Trust, *Introducing Splice, a New Hyperledger Lab for Canton Network Interoperability* (2024). https://www.lfdecentralizedtrust.org/blog/introducing-splice-a-new-hyperledger-lab-that-supports-canton-network-interoperability
[^s29]: *hyperledger-labs/splice* (GitHub). https://github.com/hyperledger-labs/splice
[^s30]: Splice 문서, *Validator Onboarding Process*. https://docs.sync.global/validator_operator/validator_onboarding.html
[^s31]: Digital Asset 플랫폼 문서, *Enterprise Suite for Canton*. https://docs.digitalasset.com/overview/3.3/overview/enterprise.html
[^s32]: CoinDesk, *Digital Asset, Builder of Privacy-Focused Blockchain Canton, Raises $135M* (2025-06-23). https://www.coindesk.com/business/2025/06/23/digital-asset-builder-of-privacy-focused-blockchain-canton-raises-usd135m
[^s33]: Canton Network 블로그, *What do you mean by blockchain interoperability?*. https://www.canton.network/blog/what-do-you-mean-by-blockchain-interoperability
[^s34]: Canton Network 블로그, *Multi-chain and bridges for regulated finance*. https://www.canton.network/blog/multi-chain-and-bridges-for-regulated-finance-0
[^s35]: Bernauer et al., *Daml: A Smart Contract Language for Securely Automating Real-World Multi-Party Business Workflows*, arXiv:2303.03749 (2023). https://arxiv.org/abs/2303.03749
[^s36]: Canton Foundation, *About The Foundation*. https://canton.foundation/about-the-foundation/
[^s37]: Canton Network 블로그, *5 Developer Pathways for Canton Builders*. https://www.canton.network/blog/5-developer-pathways-for-canton-builders
[^s38]: Broadridge 보도자료, *DLR processes $385B average daily repo volume in October 2025*. https://www.broadridge.com/press-release/2025/broadridges-dlr-platform-processes-385-billion-dollars-in-average-daily-trade-volumes-in-october
