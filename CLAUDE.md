# image-fuji-render

Fuji 胶片滤镜 Web 应用 — 上传照片，应用经典 Fujifilm 胶片滤镜，下载结果。

## 技术栈

- React 19 + TypeScript 5.9
- Vite 8
- Tailwind CSS v4（@tailwindcss/vite 插件）
- WebGL（参数化 fragment shader 实现胶片滤镜）

## 目录结构

```
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── PRD.md                    # MVP 需求文档
├── CLAUDE.md                 # 本文件
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx              # 入口
    ├── App.tsx               # 主应用（路由：网格视图/编辑视图）
    ├── index.css             # 全局样式 + Tailwind 导入
    ├── filters.ts            # 10 款 Fuji 滤镜参数定义
    ├── renderer.ts           # WebGL 滤镜渲染引擎
    ├── utils.ts              # 图片加载/下载工具
    └── components/
        ├── UploadGrid.tsx    # 上传区 + 缩略图网格
        └── EditorView.tsx    # 编辑视图（预览 + 滤镜栏 + 下载）
```

## 构建命令

```bash
npm install         # 安装依赖
npm run dev         # 开发服务器
npm run build       # 生产构建（输出到 dist/）
npm run preview     # 预览生产��建
npm run lint        # ESLint 检查
```

## 部署

Cloudflare Pages：构建命令 `npm run build`，输出目录 `dist`。

## 滤镜实现

采用参数化 WebGL fragment shader 方案：
- 每款滤镜定义一组参数（饱和度、对比度、色调曲线、色温、颗粒、暗角等）
- 统一 shader 根据参数实时渲染
- 缩略图预览用小 canvas 预渲染
- 下载时用原始分辨率 canvas 渲染

## 代码规范

- TypeScript strict mode
- 类型导入用 `import type`
- 组件用函数式 + hooks
- 状态管理用 React 内置 useState/useCallback
