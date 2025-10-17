This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


# Getting Started

This is a Next.js project bootstrapped with create-next-app.

## Quick start

1. Install dependencies:
```bash
# production deps
npm install next react react-dom sass classnames next-themes zustand immer sonner zod react-hook-form @hookform/resolvers react-countdown react-textarea-autosize react-quill dayjs @tanstack/react-query @tanstack/react-query-devtools react-date-range date-fns react-datepicker next-auth@beta @prisma/client ua-parser-js chartjs-plugin-datalabels mathjs node-fetch uuid nodemailer jsonwebtoken

# dev deps
npm install -D prettier eslint-config-prettier eslint-plugin-prettier typescript-plugin-css-modules @types/negotiator @types/bcryptjs @types/jsonwebtoken @types/uuid @types/nodemailer @types/ua-parser-js @tanstack/eslint-plugin-query prisma

npm run dev
# Open http://localhost:3000
```


2. 프로젝트:
📁 admin
├── 📁 app
│   ├── 📁 api
│   │   └── route.ts                # 간단한 API 엔트리
│   └── 📁 [language]
│       ├── layout.tsx
│       └── page.tsx
├── 📁 components
│   ├── 📁 common
│   │   └── Navigation.tsx
│   ├── 📁 main
│   │   └── Main.tsx
│   └── 📁 ui
│       └── Button.tsx
├── 📁 actions
│   ├── auth
│   │   └── login.ts
│   └── board
│       └── fetchPosts.ts
├── 📁 services
│   ├── apiClient.ts
│   └── userService.ts
├── 📁 store
│   └── useStore.ts
├── 📁 lib
│   ├── prisma.ts
│   └── util.ts
├── 📁 prisma
│   └── schema.prisma
├── 📁 locales
│   ├── index.ts
│   └── ko/common.json
├── 📁 public
│   └── favicon.ico
├── 📁 scss
│   └── globals.scss
├── 📁 types
│   └── locales.ts
├── 📁 utils
│   └── mergeRoutesWithDictionary.ts
├── .eslintrc.json
├── README.md
└── next.config.ts




3. 게시판:

├── 📁 app
│   └── 📁 [language]                 # 다국어 처리
│       ├── 📁 (afterLogin)           # 로그인 후 접근 영역
│       │   └── 📁 todos              # 게시판 리소스
│       │       ├── page.tsx         # 목록 페이지
│       │       ├── layout.tsx       # 공통 레이아웃
│       │       ├── 📁 p
│       │       │   └── 📁 create
│       │       │       └── page.tsx # 등록 폼
│       │       ├── 📁 [uid]
│       │       │   ├── page.tsx      # 상세 페이지
│       │       │   └── 📁 edit
│       │       │       └── page.tsx  # 수정 폼
│       │       └── 📁 @modal
│       │           └── 📁 (.)[uid]
│       │               ├── page.tsx
│       │               └── default.tsx