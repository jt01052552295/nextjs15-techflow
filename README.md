1. 프로젝트:
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


npm run prisma -- generate
npm run prisma -- db push