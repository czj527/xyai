# 新叶AI (xyai.czj527.xyz)

> AI资讯早报网站，视频品牌「**新叶早报**」

## 项目概述

新叶AI是一个AI资讯聚合网站，包含：

- 🗞️ **AI资讯流**：每日自动采集/筛选AI领域最新资讯
- 📊 **大模型榜单**：主流大模型能力排行
- 📁 **周报月报归档**：历史资讯汇总浏览
- 🌿 **绿的看板娘**：AI资讯专家对话

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS + 春季主题（毛玻璃卡片+粒子飘落）
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MIMO_API_KEY=your_mimo_api_key
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
```

## 数据库

表前缀 `xyai_`：

- `xyai_daily_reports` - 日报表
- `xyai_weekly_reports` - 周报表
- `xyai_monthly_reports` - 月报表
- `xyai_model_rankings` - 大模型榜单
- `xyai_collect_logs` - 采集日志

详见 `supabase/migrations/001_create_xyai_tables.sql`

## 开发指南

### 目录结构

```
xyai/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # 首页（资讯流）
│   │   ├── news/[id]/    # 新闻详情页
│   │   ├── rankings/     # 榜单页
│   │   ├── archive/     # 归档页
│   │   ├── about/       # 关于页
│   │   └── api/         # API路由
│   ├── components/       # React组件
│   └── lib/             # 工具函数
├── supabase/            # 数据库迁移
└── public/              # 静态资源
```

### 样式规范

- **主题色**: 清新绿 (#22c55e)，辅色浅粉/嫩叶绿
- **毛玻璃卡片**: `glass-card` class
- **粒子飘落**: `SpringParticles` 组件（深色模式可见）
- **响应式**: 无前缀=桌面端，`sm:`=移动端覆盖

### Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
refactor: 重构
chore: 配置/依赖更新
```

## 角色：绿 (Midori)

新叶AI的看板娘，AI资讯播音员。

- 元气满满、好奇心旺盛
- 口头禅：「今天的AI圈又有大事了！」
- 设定详见 `AI早报/绿_角色卡.md`

## License

MIT
