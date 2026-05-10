# 新叶AI (xyai) 项目优化文档

> 更新时间：2026-05-10
> 最近一次优化：2026-05-10 (Hermes Agent)

---

## 📋 项目概述

新叶AI是一个AI资讯聚合网站，包含资讯流、大模型榜单、周报月报归档、视频展示、AI对话等功能。

- **仓库**：https://github.com/czj527/xyai
- **线上**：https://xyai.czj527.xyz
- **技术栈**：Next.js 16 + TypeScript + Tailwind CSS v4 + Supabase

---

## ✅ 本次优化完成项 (2026-05-10)

### 1. 环境配置修复
- **创建 `.env.local`**：补充缺失的环境变量文件，包含 Supabase Service Role Key、MiMo API Key、CRON_SECRET 等
- 之前项目只有 `.env.example`，导致本地开发和 Vercel 部署无法正确连接 Supabase

### 2. Navbar 视频导航补全
- **文件**：`src/components/ui/Navbar.tsx`
- **改动**：在导航栏添加「视频」入口，使用 `Video` 图标
- 桌面端和移动端导航均已更新

### 3. 采集API全面重写 (`src/app/api/collect/route.ts`)

| 问题 | 修复前 | 修复后 |
|------|--------|--------|
| MiMo模型 | `MiMo-8B-FunctionCall-4bit`（旧模型） | `mimo-v2.5`（批量摘要）/ `mimo-v2.5-pro`（用户对话） |
| 数据库回写 | ❌ 采集结果不入库 | ✅ 自动写入 `xyai_daily_reports` |
| 去重逻辑 | ❌ 无 | ✅ 基于标题比对（3天内已有数据） |
| 摘要生成 | 逐条调用API（慢且贵） | 批量生成（单次API调用处理多条） |
| 分类函数 | 重复关键词 `'安全'` | 已修复 |
| dry_run模式 | 无 | 支持 `dry_run: true` 只预览不入库 |
| 错误处理 | 简单 | 超时控制(15s) + 降级策略 |

**新采集流程**：
```
RSS源 → 抓取(15s超时) → XML解析 → 关键词过滤(≥15分)
  → 优先级排序(取前15) → 批量AI摘要 → 标题去重(3天窗口)
  → 写入Supabase(同期合并)
```

**新增函数**：
- `generateBatchSummary()` — 批量生成摘要，单次API调用
- `getExistingTitles()` — 从Supabase获取已有标题做去重
- `writeToSupabase()` — 智能写入（同日期同时段自动合并）

### 4. Chat API 修复 (`src/app/api/chat/route.ts`)
- **问题**：MiMo API URL 硬编码为旧地址 `api.xiaomimimo.com`
- **修复**：改为从环境变量 `MIMO_BASE_URL` 读取，回退到 `token-plan-cn.xiaomimimo.com`

---

## 🔧 优化任务清单

### Phase 1：基础修复 ✅ 已完成

| 任务 | 状态 | 说明 |
|------|------|------|
| ✅ 视频页导航补全 | 已完成 | Navbar添加「视频」链接 |
| ✅ 环境变量配置 | 已完成 | 创建 .env.local |
| ✅ MiMo模型统一 | 已完成 | 全部使用 mimo-v2-pro |
| ✅ Chat API URL修复 | 已完成 | 从环境变量读取 |
| ⬜ 视频页导航高亮 | 待办 | 当前页面对应的导航项应高亮显示 |

---

### Phase 2：爬取系统优化 ✅ 已完成

| 任务 | 状态 | 说明 |
|------|------|------|
| ✅ 采集→入库自动化 | 已完成 | 采集后自动写入 xyai_daily_reports |
| ✅ 修复模型名配置 | 已完成 | 改为 mimo-v2-pro |
| ✅ 添加去重逻辑 | 已完成 | 基于标题比对(3天窗口) |
| ✅ 批量摘要生成 | 已完成 | 单次API调用处理多条新闻 |
| ⬜ 替换RSS解析器 | 待办 | 后续可用 rss-parser 库替代正则解析 |
| ⬜ 定时采集 | 待办 | Vercel Cron 或外部触发 |
| ⬜ 添加更多源 | 待办 | arXiv、GitHub Trending、HuggingFace等 |

---

### Phase 3：审核系统（待开始）

**设计方案**：

| 任务 | 优先级 | 说明 |
|------|--------|------|
| ⬜ 新闻状态字段 | P0 | 添加 status: draft/pending/published/rejected |
| ⬜ 管理后台页面 | P1 | /admin 路由，查看待审核新闻 |
| ⬜ 人工审核功能 | P1 | 编辑标题/摘要/优先级，发布/拒绝 |
| ⬜ 敏感词过滤 | P2 | 自动检测敏感内容 |
| ⬜ 批量操作 | P2 | 一键发布/批量删除 |

**审核流程**：
```
采集(draft) → AI增强(pending) → 人工审核 → 发布(published)
                                         → 拒绝(rejected)
```

---

### Phase 4：展示优化（待开始）

| 任务 | 优先级 | 说明 |
|------|--------|------|
| ⬜ 首页改版 | P1 | 当日热点 + 本周回顾 + 周报 + 月报 分层展示 |
| ⬜ 榜单数据接入 | P1 | rankings页面接入真实数据 |
| ⬜ 搜索功能 | P2 | 关键词搜索新闻 |
| ⬜ 新闻详情增强 | P2 | 相关链接、相关新闻 |
| ⬜ 视频页优化 | P2 | 支持自动播放、分享功能 |

---

### Phase 5：视频系统优化（待开始）

| 任务 | 优先级 | 说明 |
|------|--------|------|
| ⬜ 自动播放模式 | P2 | 定时切换新闻，适合录屏 |
| ⬜ 分享链接 | P2 | 带参数的分享链接 |
| ⬜ 视频模板 | P3 | 多种展示模板可选 |

---

## 📁 数据库改动计划

### 新增字段（xyai_daily_reports）

```sql
-- 新闻状态
ALTER TABLE xyai_daily_reports ADD COLUMN status TEXT DEFAULT 'published';

-- 审核信息
ALTER TABLE xyai_daily_reports ADD COLUMN reviewed_at TIMESTAMPTZ;
ALTER TABLE xyai_daily_reports ADD COLUMN reviewed_by TEXT;
```

### 新增表（xyai_pending_news）

```sql
-- 待审核新闻表
CREATE TABLE xyai_pending_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  source_url TEXT,
  priority TEXT DEFAULT 'B',
  category TEXT,
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft',
  ai_enhanced BOOLEAN DEFAULT false,
  core_facts JSONB DEFAULT '[]',
  key_data JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);
```

---

## 🛠 技术债务

| 项目 | 说明 | 优先级 | 状态 |
|------|------|--------|------|
| ~~MiMo API版本~~ | ~~collect/route.ts 中模型名错误~~ | ~~P0~~ | ✅ 已修复 |
| ~~Chat API URL~~ | ~~硬编码旧地址~~ | ~~P0~~ | ✅ 已修复 |
| ~~采集无入库~~ | ~~采集结果不写Supabase~~ | ~~P0~~ | ✅ 已修复 |
| RSS解析器 | 仍用正则解析XML | P1 | 待优化 |
| 客户端/服务端 | supabase.ts 客户端混用 | P1 | 待优化 |
| 错误处理 | 部分API缺少错误处理 | P1 | 待优化 |
| 类型安全 | 部分any类型需要收窄 | P2 | 待优化 |

---

## 📅 里程碑

- **M1**（本周）：Phase 1 + Phase 2 部分 ✅
- **M2**（下周）：Phase 2 完成 + Phase 3 部分
- **M3**（第三周）：Phase 3 完成 + Phase 4 部分
- **M4**（第四周）：Phase 4 + Phase 5

---

## 📝 备注

- 暂不需要分页功能，首页只展示当日+本周+周报+月报
- 视频页主要用于截图/录屏，保持简洁
- 管理后台可以简单实现，不需要复杂的权限系统
- `.env.local` 已创建，包含所有必要的环境变量
