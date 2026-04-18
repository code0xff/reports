# reports — deepsearch 리서치 산출물

이 repo 는 [`code0xff/deepsearch`](https://github.com/code0xff/deepsearch) harness 가 렌더링한 리서치 리포트의 공개 사이트다. GitHub Pages 로 서빙되며, 여기서는 **직접 편집하지 않는다**.

## 구조

```
.
├── index.html              # 루트 인덱스 (harness render-index 가 재생성)
├── <slug>/                 # 리포트 디렉토리는 루트에 평탄하게 놓인다
│   ├── index.html          # 렌더된 리포트 HTML
│   ├── meta.yaml           # 메타데이터
│   ├── draft.md            # 원본 마크다운
│   └── working/            # 리서치 감사 트레일
├── assets/style.css        # 템플릿이 참조하는 스타일시트
├── .nojekyll
└── .github/workflows/pages.yml
```

`assets`, `index`, `reports`, `readme`, `.git`, `.github`, `.nojekyll` 은 루트에서 예약된 이름이므로 slug 로 사용할 수 없다.

## 편집 방법

1. `code0xff/deepsearch` 를 체크아웃하고 harness CLI 를 사용한다.
2. `DEEPSEARCH_SITE=<이 repo 의 로컬 경로>` 환경변수를 설정한다(또는 `--site` 플래그).
3. `python3 scripts/harness.py init-report "<topic>"` 등으로 scaffold 를 이 repo 쪽에 생성한다.
4. draft 작성·검증·렌더가 끝나면 이 repo 에서 `git add . && git commit && git push`.
5. push 가 완료되면 Actions 가 자동으로 Pages 에 배포한다.

## URL

`https://code0xff.github.io/reports/`
