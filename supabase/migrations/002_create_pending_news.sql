-- Phase 3: 审核系统
-- 新增待审核新闻表 + 为现有表添加状态字段

-- 1. 新增待审核新闻表
CREATE TABLE IF NOT EXISTS xyai_pending_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  ai_summary TEXT,
  source TEXT,
  source_url TEXT UNIQUE,
  priority TEXT DEFAULT 'B' CHECK (priority IN ('SSS', 'SS', 'S', 'A', 'B')),
  category TEXT DEFAULT '大模型',
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  ai_enhanced BOOLEAN DEFAULT false,
  core_facts JSONB DEFAULT '[]',
  key_data JSONB DEFAULT '[]',
  related_links JSONB DEFAULT '[]',
  reject_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

-- 2. 索引
CREATE INDEX IF NOT EXISTS idx_pending_news_status ON xyai_pending_news(status);
CREATE INDEX IF NOT EXISTS idx_pending_news_created ON xyai_pending_news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pending_news_source_url ON xyai_pending_news(source_url);

-- 3. 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_pending_news_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pending_news_updated
  BEFORE UPDATE ON xyai_pending_news
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_news_timestamp();

-- 4. 为 xyai_daily_reports 添加审核字段（如果不存在）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xyai_daily_reports' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE xyai_daily_reports ADD COLUMN reviewed_at TIMESTAMPTZ;
    ALTER TABLE xyai_daily_reports ADD COLUMN reviewed_by TEXT;
  END IF;
END $$;

-- 5. RLS 策略（MVP阶段暂时允许所有操作）
ALTER TABLE xyai_pending_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on xyai_pending_news" ON xyai_pending_news
  FOR ALL USING (true) WITH CHECK (true);
