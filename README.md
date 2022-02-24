# 매입출 관리 및 장부관리 개발 프로젝트
홀로 장사하시는 어머니를 위한 아들의 웹 개발 프로젝트
## 개발 Stack
- Vue.js (v3.2.25)
- Vite (v2.8.0)

## 실행 전 준비사항
※ 모든 버전은 프로젝트 개시 당시 버전
1. Node.js 설치
- 버전: v14.17.3
- 링크: https://nodejs.org/ko/

2. npm or yarn 설치
- npm
    - version: v6.14.13
- yarn
    - version: v1.19.1

## 프로젝트 실행
```bash
# 프로젝트 dependencies 설치
yarn

# serve with hot reload in dev
yarn run dev

# build for production
yarn run build

# show preview(Integration-test) after build
yarn run preview
```

## 프로젝트 구성도
```bash
<root-project>
├─index.html      # root html
├─package.json    # project packages
├─vite.config.js  # vite config
├─dist/           # build output
├─public/         # favicon
└─src/
   ├─assets/      # image
   ├─components/  # vue files
   │   ├─App.vue  # root vue
   │   ├─Home.vue # Main page vue
   │   ├─store/   # 스마트스토어 관리페이지 Component vue
   │   ├─cafe/    # 카페관리 페이지 Component vue
   │   ├─common/  # 공통모듈 Directory
   │   └─except/  # Error Page Component vue
   └─scripts/     # javascript files
```

## 프로젝트 세부내용
[블로그 바로가기](https://aibees.github.io/storeAdmin-project-1/)
