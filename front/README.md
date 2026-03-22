使用 yarn create next-app --typescript 构建我的前端页面
语言：TypeScript
架构：Next.js+React
包管理：yarn
UI：Ant Design
http请求：axios
目录结构：
    front/
    ├── .yarn/                          # Yarn 插件与缓存 (Git 忽略)
    ├── .yarnrc.yml                     # Yarn 配置文件 (指定版本与镜像)
    ├── public/                         # 静态资源目录 (直接映射到根路径)
    │   ├── zkp/                        # [核心] ZKP 电路资源 (Wasm, Zkey)
    │   │   ├── health_circuit.wasm
    │   │   └── health_circuit.zkey
    │   ├── images/                     # 项目图片资源
    │   │   ├── logo.svg
    │   │   └── banner.png
    │   └── locales/                    # (可选) 国际化资源
    │       └── zh-CN.json
    src/
    ├── app/                        # 【路由层】
    │   ├── layout.tsx              # 🖥️ Server (默认)
    │   │                           # 职责：包裹 Providers，渲染 HTML 骨架
    │   │                           # 注意：Antd Registry 需在此处理 SSR 样式
    │   ├── page.tsx                # 🖥️ Server (默认)
    │   │                           # 职责：SEO 元数据，静态展示，重定向
    │   ├── verify/
    │   │   ├── page.tsx            # 🖥️ Server (默认) -> 包裹客户端容器
    │   │   │                       # 职责：获取初始配置(如有)，渲染 <VerifyClientWrapper />
    │   │   ├── step-input/
    │   │   │   └── page.tsx        # 🖥️ Server (仅作为路由占位，实际逻辑在组件)
    │   │   ├── step-signing/
    │   │   │   └── page.tsx        # 🖥️ Server
    │   │   └── step-result/
    │   │       └── page.tsx        # 🖥️ Server
    │   │
    ├── core/                       # 【核心基建层】
    │   ├── crypto/                 # 🔒 纯函数库 (无 React 组件)
    │   │   ├── index.ts            # 🌐 通用 (Node/Browser 兼容)
    │   │   ├── ecdsa.ts            # 🌐 通用 (依赖 elliptic/crypto-js)
    │   │   └── keys.ts             # 🌐 通用
    │   │                           # 注意：虽然代码通用，但【调用生成私钥】必须在 Client 端
    │   ├── http/                   # 🌐 通用
    │   │   ├── client.ts           # 🌐 Axios 实例 (Browser/Node 均可运行)
    │   │   └── interceptors.ts     # 🌐 拦截器逻辑
    │   ├── ui/                     # 【UI 适配层】
    │   │   ├── providers.tsx       # 📱 Client ('use client')
    │   │   │                       # 原因：Antd ConfigProvider 需要 React Context (浏览器端)
    │   │   ├── registry.tsx        # 🖥️ Server (特殊处理 Antd SSR)
    │   │   └── theme.ts            # 🌐 纯 JS 对象
    │   │
    ├── features/                   # 【业务领域层】
    │   └── health-verification/
    │       ├── types.ts            # 🌐 纯类型定义
    │       ├── api.ts              # 🌐 纯函数 (返回 Promise)
    │       ├── service.ts          # 🌐 纯业务逻辑编排 (组合 crypto + api)
    │       ├── store.ts            # 📱 Client ('use client')
    │       │                       # 原因：Zustand 依赖 React hooks / Context
    │       ├── hooks/              # 📱 Client ('use client')
    │       │   ├── useSigner.ts    # 封装签名逻辑，访问 window.crypto 或内存私钥
    │       │   └── useVerificationFlow.ts # 控制步骤流转
    │       └── components/         # 【组件分层】
    │           ├── _client/        # 📱 强制客户端组件目录 (约定俗成)
    │           │   ├── HealthForm.tsx       # 📱 Client (表单交互，onFinish)
    │           │   ├── SignatureStatus.tsx  # 📱 Client (实时动画，轮询)
    │           │   ├── ProofCard.tsx        # 📱 Client (复制剪贴板功能)
    │           │   └── ResultSummary.tsx    # 📱 Client (用户交互)
    │           │
    │           ├── _server/        # 🖥️ 强制服务端组件目录 (可选，用于 SEO 内容)
    │           │   └── SeoContent.tsx       # 🖥️ Server (静态文本，元数据)
    │           │
    │           └── index.ts        # 统一导出 (自动区分或显式导入)
    │
    ├── shared/                     # 【共享层】
    │   ├── components/
    │   │   ├── PageContainer.tsx   # 🖥️ Server (默认，纯布局 div)
    │   │   ├── LoadingScreen.tsx   # 📱 Client (如果需要 spinner 动画)
    │   │   └── ErrorBoundary.tsx   # 📱 Client (必须捕获运行时错误)
    │   ├── hooks/                  # 📱 Client
    │   └── utils/                  # 🌐 通用纯函数
    │
    └── types/                      # 🌐 纯类型
        └── global.d.ts
    │
    ├── .env.local                      # 本地环境变量 (API_URL, DEBUG_MODE)
    ├── .env.example                    # 环境变量模板
    ├── .gitignore                      # Git 忽略规则
    ├── next.config.js                  # Next.js 配置 (WASM, Export, Images)
    ├── tsconfig.json                   # TypeScript 配置 (路径别名 @/)
    ├── package.json                    # 依赖管理
    ├── yarn.lock                       # 依赖锁定文件
    └── README.md                       # 项目文档

客户端加入'use client';