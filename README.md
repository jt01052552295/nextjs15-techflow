This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started 11111

First, run the development server:

```bash
npm install --save-dev eslint-config-prettier eslint-plugin-prettier prettier

npm i @formatjs/intl-localematcher
npm i negotiator --save-dev @types/negotiator


npm i sass
npm install -D typescript-plugin-css-modules
npm i classnames
npm install next-themes

npm i zustand immer sonner
npm i zod react-hook-form @hookform/resolvers
npm i react-countdown react-textarea-autosize
npm i react-quill
npm i bcryptjs --save-dev @types/bcryptjs
npm i jsonwebtoken --save-dev @types/jsonwebtoken

npm i uuid --save-dev @types/uuid
npm i nodemailer --save-dev @types/nodemailer
npm i dayjs
npm i @tanstack/react-query @tanstack/react-query-devtools
npm i -D @tanstack/eslint-plugin-query
npm i react-date-range date-fns
npm i --save-dev @types/react-date-range
npm install react-datepicker --save

npm install next-auth@beta
npm install @prisma/client @auth/prisma-adapter
npm install prisma --save-dev
npm install ua-parser-js
npm i --save-dev @types/ua-parser-js
npm install chartjs-plugin-datalabels --save

npm install mathjs
npm install node-fetch @types/node-fetch

```

호환확인
npm install next-auth@beta
npm i react-quill
npm install -D typescript-plugin-css-modules

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


📁 admin
├── 📁 app
│   ├── 📁 api
│   │   └── 📁 test
│   │       └── route.ts
│   └── 📁 [language]
│       ├── layout.tsx
│       └── 📁 (afterLogin)
│           └── 📁 main
│               └── page.tsx
├── 📁 components
│   ├── 📁 common
│   │   └── Navigation.tsx
│   ├── 📁 context
│   │   ├── LanguageContext.tsx
│   │   └── RoutesContext.tsx
│   ├── 📁 locale
│   │   └── LanguageSwitcher.tsx
│   └── 📁 main
│       └── Main.tsx
├── 📁 constants
│   └── routes.ts
├── 📁 data
│   └── routesData.ts
├── 📁 lib
│   ├── cookie.ts
│   ├── prisma.ts
│   └── util.ts
├── 📁 locales
│   ├── index.ts
│   ├── 📁 ko
│   │   ├── columns.json
│   │   ├── common.json
│   │   └── routes.json
│   └── 📁 en
│       ├── columns.json
│       ├── common.json
│       └── routes.json
├── 📁 prisma
│   └── schema.prisma
├── 📁 types
│   ├── auth.ts
│   └── locales.ts
├── 📁 utils
│   ├── mergeRoutesWithDictionary.ts
│   └── routes.ts
├── .eslintrc.json
├── .prettierignore
├── .prettierrc
├── README.md
├── env.local
├── middleware.ts
├── next.config.ts
├── package.json
└── tsconfig.json


/app
  /[language]                     # 다국어 처리
    /(afterLogin)                # 로그인 후 접근 영역
      /todos                     # 게시판 이름
        @modal                   # 패러렐라우트(모달 상세)
          (.)[uid]               # 모달 상세 보기
            page.tsx
            default.tsx
        [uid]
          edit/
            page.tsx            # 일반 수정 페이지
        p/
          create/
            page.tsx            # 등록 폼
        layout.tsx              # 공통 레이아웃 (선택)
        page.tsx                # 목록 페이지