// Supabase 客户端配置
// 使用 Service Role Key，MVP阶段禁用RLS

import { createClient } from '@supabase/supabase-js';

// 环境变量（禁止硬编码）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wotpzpegbgpqzxesqcas.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Service Role 客户端 - 用于服务端操作（绕过RLS）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 浏览器客户端 - 用于客户端操作（使用匿名访问）
// MVP阶段暂时使用Service Role，后续可切换为 anon key
export const supabase = supabaseAdmin;

// 类型定义
export interface DailyReport {
  id: string;
  date: string;
  period: 'morning' | 'afternoon' | 'evening';
  news: NewsItem[];
  headline: string | null;
  created_at: string;
}

// 新闻项类型 - 支持结构化字段
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string;
  priority: 'SSS' | 'SS' | 'S' | 'A' | 'B';
  category: string;
  published_at: string;
  // 结构化字段（可选，由AI增强添加）
  core_facts?: string[];        // 核心事实
  key_data?: string[];          // 关键数据
  related_links?: {              // 相关链接
    title: string;
    url: string;
  }[];
}

// 兼容类型：旧版NewsItem（无结构化字段）
export type LegacyNewsItem = Omit<NewsItem, 'core_facts' | 'key_data' | 'related_links'>;

export interface WeeklyReport {
  id: string;
  week_start: string;
  week_end: string;
  summary: string;
  highlights: NewsItem[];
  daily_report_ids: string[];
  created_at: string;
}

export interface MonthlyReport {
  id: string;
  month: string;
  summary: string;
  highlights: NewsItem[];
  weekly_report_ids: string[];
  created_at: string;
}

export interface ModelRanking {
  id: string;
  model_name: string;
  provider: string;
  benchmark: 'superclue' | 'arena' | 'alpacaeval';
  scores: {
    overall: number;
    coding: number;
    reasoning: number;
    creativity: number;
    multimodal: number;
  };
  rank: number;
  updated_at: string;
}
