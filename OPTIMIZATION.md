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

## ✅ 已完成优化项

### Phase 1：基础修复 ✅

| 任务 | 状态 | 说明 |
|------|------|------|
| ✅ 视频页导航补全 | 已完成 | Navbar添加「视频」链接，视频页导航添加榜单/归档/关于 |
| ✅ 环境变量配置 | 已完成 | 创建 .env.local |

### Phase 2：爬取系统优化 ✅

| 任务 | 状态 | 说明 |
|------|------|------|
| ✅ 替换RSS解析器 | 已完成 | 使用 rss-parser 库替代正则解析 |
| ✅ 采集→待审核自动化 | 已完成 | 采集后写入 xyai_pending_news 待审核表 |
| ✅ 修复模型名配置 | 已完成 | 采集用 mimo-v2.5，对话用 mimo-v2.5-pro |
| ✅ 添加去重逻辑 | 已完成 | 基于 source_url 去重 |
| ✅ 批量摘要生成 | 已完成 | 单次API调用处理多条新闻 |
| ✅ 添加更多源 | 已完成 | +arXiv CS.AI, HuggingFace Blog, The Verge AI, MIT Tech Review |
| ✅ 定时采集 | 已完成 | Vercel Cron 每天 8:00/12:00/18:00 自动触发 |

### Phase 3：审核系统 ✅ (AI 自动审核)

| 任务 | 状态 | 说明 |
|------|------|------|
| ✅ 新建待审核表 | 已完成 | xyai_pending_news (含 status/审核字段) |
| ✅ 管理后台页面 | 已完成 | /admin 路由，查看/审核新闻 |
| ✅ 发布/拒绝功能 | 已完成 | 审核通过→写入日报，拒绝→记录原因 |
| ✅ AI 自动审核 | 已完成 | MiMo 自动判断新闻质量，自动发布/待审 |
| ✅ 全局 AI 对话窗口 | 已完成 | 所有页面都有绿的对话入口 |
| ⬜ 敏感词过滤 | 待办 | 自动检测敏感内容 |
| ⬜ 批量操作 | 待办 | 一键发布/批量删除 |

---

## 🔧 当前采集流程

```
RSS源(10个) → rss-parser解析 → 关键词过滤(≥15分)
  → 优先级排序(取前15) → 批量AI摘要(mimo-v2.5)
  → source_url去重 → AI自动审核(mimo-v2.5)
  → 通过: 写入日报 + 标记published
  → 拒绝: 标记draft (待人工复审)
```

## 🔧 模型分配策略

| 场景 | 模型 | 原因 |
|------|------|------|
| 采集批量摘要 | mimo-v2.5 | 批量处理，成本优先 |
| AI 自动审核 | mimo-v2.5 | 批量审核，成本优先 |
| 绿的用户对话 | mimo-v2.5-pro | 用户交互，质量优先 |

---

## 📁 数据库结构

### xyai_daily_reports (已发布日报)
- date, period, news(JSONB), headline
- reviewed_at, reviewed_by (审核字段)

### xyai_pending_news (待审核新闻)
- title, summary, source, source_url(UNIQUE)
- priority(SSS/SS/S/A/B), category
- status(draft/pending/published/rejected)
- reject_reason, reviewed_at, reviewed_by
- created_at, updated_at (自动更新)

---

## 📡 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| /api/news | GET | 获取已发布新闻 |
| /api/collect | POST | 手动触发采集 |
| /api/collect | GET | 获取采集状态 |
| /api/chat | POST | 绿的对话 |
| /api/cron/collect | GET | Vercel Cron 定时采集 |
| /api/admin/pending | GET | 获取待审核新闻列表 |
| /api/admin/pending/[id] | POST | 审核新闻(发布/拒绝) |

---

## 🌐 RSS 信息源

| 源 | 语言 | 优先级 | 说明 |
|------|------|--------|------|
| 量子位 | zh | 5 | AI领域头部中文媒体 |
| 机器之心 | zh | 5 | AI技术深度报道 |
| 36氪 | zh | 4 | 科技创业媒体 |
| HackerNews | en | 3 | 技术社区热点 |
| OpenAI Blog | en | 5 | OpenAI 官方博客 |
| TechCrunch AI | en | 3 | 科技媒体AI专栏 |
| arXiv CS.AI | en | 4 | AI学术论文 (新增) |
| HuggingFace Blog | en | 4 | HuggingFace 官方博客 (新增) |
| The Verge AI | en | 3 | The Verge AI专栏 (新增) |
| MIT Tech Review AI | en | 4 | MIT科技评论 (新增) |

---

## ⏰ Vercel Cron 配置

```json
{
  "crons": [
    {
      "path": "/api/cron/collect",
      "schedule": "0 0,4,10 * * *"
    }
  ]
}
```

触发时间 (UTC+8)：
- 08:00 - 早报采集
- 12:00 - 午间采集
- 18:00 - 晚间采集

---

## 🛠 技术债务

| 项目 | 说明 | 优先级 | 状态 |
|------|------|--------|------|
| ~~MiMo API版本~~ | ~~模型名错误~~ | ~~P0~~ | ✅ 已修复 |
| ~~Chat API URL~~ | ~~硬编码旧地址~~ | ~~P0~~ | ✅ 已修复 |
| ~~采集无入库~~ | ~~不写Supabase~~ | ~~P0~~ | ✅ 已修复 |
| ~~RSS解析器~~ | ~~正则解析XML~~ | ~~P1~~ | ✅ 已替换为rss-parser |
| 客户端/服务端 | supabase.ts 客户端混用 | P1 | 待优化 |
| 错误处理 | 部分API缺少错误处理 | P1 | 待优化 |
| 类型安全 | 部分any类型需要收窄 | P2 | 待优化 |

---

## 📅 里程碑

- **M1**（本周）：Phase 1 + Phase 2 ✅
- **M2**（本周）：Phase 3 AI自动审核 ✅
- **M3**（下周）：Phase 4 展示优化
- **M4**（第三周）：Phase 5 视频系统

---

## 📝 备注

- 视频页主要用于截图/录屏，保持简洁，使用独立布局
- 管理后台在 /admin，暂无密码保护（MVP阶段）
- 采集的新闻先进入待审核表，审核通过后才显示在首页
