# 과학 실험실 🔬

여러 과학 실험 페이지를 모아 놓은 웹사이트입니다.
`experiments/` 폴더에 실험 HTML 파일을 추가하면, **GitHub Actions가 자동으로
메인 목록(`index.html`)을 갱신하고 사이트를 배포**합니다.

## 🚀 어떻게 동작하나요?

```
experiments/ 에 새 실험 HTML 추가 → git push
        │
        ▼
GitHub Actions 자동 실행
   ① experiments/ 폴더 스캔
   ② index.html 재생성 (링크 목록 갱신)
   ③ 변경된 index.html 커밋
   ④ GitHub Pages 로 배포
        │
        ▼
   사이트에 새 실험 링크 자동 추가 🎉
```

## ➕ 새 실험 추가하는 법

1. `experiments/` 폴더에 새 HTML 파일을 만듭니다. (예: `experiments/volcano.html`)
2. 파일 상단 `<head>` 에 아래 메타 정보를 넣습니다.

   ```html
   <title>화산 폭발 실험</title>
   <meta name="description" content="베이킹소다와 식초로 화산 폭발을 재현합니다." />
   <meta name="experiment:emoji" content="🌋" />        <!-- 선택: 카드 이모지 -->
   <meta name="experiment:category" content="화학" />   <!-- 선택: 분류 태그 -->
   <meta name="experiment:order" content="30" />        <!-- 선택: 정렬 순서(작을수록 앞) -->
   ```

3. 커밋하고 `main` 브랜치에 push 합니다.
4. 끝! Actions가 알아서 `index.html` 을 갱신하고 배포합니다.

> `index.html` 은 자동 생성 파일이라 직접 수정할 필요가 없습니다.
> (수정해도 다음 빌드 때 덮어써집니다.)

## 🖥️ 로컬에서 미리 보기

```bash
# 목록 페이지 다시 생성
node scripts/build-index.js

# 간단한 로컬 서버로 확인 (Python 이 있다면)
python3 -m http.server
# → 브라우저에서 http://localhost:8000 접속
```

## ⚙️ 최초 1회 설정 (GitHub Pages 켜기)

저장소 **Settings → Pages → Build and deployment → Source** 를
**"GitHub Actions"** 로 설정하면 됩니다. 이후엔 push만 하면 자동 배포됩니다.

## 📁 프로젝트 구조

```
.
├── index.html              # 자동 생성되는 메인 목록 페이지
├── experiments/            # 실험 HTML 파일들 (여기에 추가!)
│   ├── rainbow-density.html
│   └── lemon-battery.html
├── scripts/
│   └── build-index.js      # 목록 자동 생성 스크립트
└── .github/workflows/
    └── deploy.yml          # 자동 빌드·배포 워크플로우
```
