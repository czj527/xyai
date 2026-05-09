-- =====================================================
-- 新叶AI Supabase 数据库迁移脚本
-- 版本：v1.0.0
-- 日期：2026-05-08
-- 描述：创建 xyai_ 系列表（MVP阶段禁用RLS）
-- =====================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 日报表
-- =====================================================
CREATE TABLE IF NOT EXISTS xyai_daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('morning', 'afternoon', 'evening')),
  news JSONB NOT NULL DEFAULT '[]',
  headline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 唯一约束：每天每个时段只能有一条记录
  UNIQUE (date, period)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON xyai_daily_reports(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_reports_period ON xyai_daily_reports(period);
CREATE INDEX IF NOT EXISTS idx_daily_reports_created_at ON xyai_daily_reports(created_at DESC);

-- =====================================================
-- 周报表
-- =====================================================
CREATE TABLE IF NOT EXISTS xyai_weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary TEXT NOT NULL,
  highlights JSONB NOT NULL DEFAULT '[]',
  daily_report_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 唯一约束：每周只能有一条周报
  UNIQUE (week_start)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week ON xyai_weekly_reports(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_created_at ON xyai_weekly_reports(created_at DESC);

-- =====================================================
-- 月报表
-- =====================================================
CREATE TABLE IF NOT EXISTS xyai_monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  summary TEXT NOT NULL,
  highlights JSONB NOT NULL DEFAULT '[]',
  weekly_report_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 唯一约束：每月只能有一条月报
  UNIQUE (month)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_monthly_reports_month ON xyai_monthly_reports(month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_created_at ON xyai_monthly_reports(created_at DESC);

-- =====================================================
-- 大模型榜单表
-- =====================================================
CREATE TABLE IF NOT EXISTS xyai_model_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  benchmark TEXT NOT NULL CHECK (benchmark IN ('superclue', 'arena', 'alpacaeval')),
  scores JSONB NOT NULL DEFAULT '{"overall": 0, "coding": 0, "reasoning": 0, "creativity": 0, "multimodal": 0}',
  rank INT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_rankings_benchmark ON xyai_model_rankings(benchmark);
CREATE INDEX IF NOT EXISTS idx_rankings_rank ON xyai_model_rankings(rank);
CREATE INDEX IF NOT EXISTS idx_rankings_updated_at ON xyai_model_rankings(updated_at DESC);

-- =====================================================
-- 采集记录日志表（用于调试和监控）
-- =====================================================
CREATE TABLE IF NOT EXISTS xyai_collect_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collect_type TEXT NOT NULL CHECK (collect_type IN ('daily', 'weekly', 'monthly', 'rankings')),
  status TEXT NOT NULL CHECK (status IN ('started', 'success', 'failed')),
  message TEXT,
  items_collected INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_collect_logs_type ON xyai_collect_logs(collect_type);
CREATE INDEX IF NOT EXISTS idx_collect_logs_created_at ON xyai_collect_logs(created_at DESC);

-- =====================================================
-- 注释说明（用于Supabase Dashboard展示）
-- =====================================================
COMMENT ON TABLE xyai_daily_reports IS '新叶AI日报表 - 存储每日AI资讯';
COMMENT ON TABLE xyai_weekly_reports IS '新叶AI周报表 - 存储每周资讯汇总';
COMMENT ON TABLE xyai_monthly_reports IS '新叶AI月报表 - 存储每月资讯汇总';
COMMENT ON TABLE xyai_model_rankings IS '新叶AI大模型榜单表 - 存储各榜单数据';
COMMENT ON TABLE xyai_collect_logs IS '新叶AI采集日志表 - 记录采集任务执行情况';

COMMENT ON COLUMN xyai_daily_reports.news IS 'JSON数组，每项包含 {id, title, summary, source, source_url, priority, category, published_at}';
COMMENT ON COLUMN xyai_daily_reports.period IS '时段：morning(00:00-08:00), afternoon(08:00-16:00), evening(16:00-24:00)';
