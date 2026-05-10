// 重新分类 API
// POST /api/admin/reclassify

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// 新分类系统
const AI_CATEGORIES: Record<string, string[]> = {
  '模型发布': ['模型', 'model', 'gpt', 'claude', 'gemini', 'llama', 'qwen', '通义', '文心', '发布', 'release', 'launch', '升级', 'update', '版本', 'version', '新模型', '大模型', 'llm', 'foundation model'],
  '工具发布': ['工具', 'tool', '产品', 'product', 'app', '应用', '平台', 'platform', '插件', 'plugin', '扩展', 'extension', 'sdk', 'api', '框架', 'framework', '开源', 'open source', 'github', 'agent', '智能体'],
  '政策融资': ['政策', '法规', '监管', 'regulation', 'policy', '融资', 'funding', '投资', 'investment', '收购', 'acquisition', '上市', 'ipo', '估值', 'valuation', '亿美元', 'million', 'billion', '轮', 'round', '风投', 'vc', '政府', 'government'],
};

function categorize(title: string, summary: string = ''): string {
  const text = (title + ' ' + summary).toLowerCase();
  for (const [category, keywords] of Object.entries(AI_CATEGORIES)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  return '项目相关';
}

export async function POST(request: NextRequest) {
  try {
    // 获取所有日报
    const { data: reports, error } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('id, date, period, news')
      .order('date', { ascending: false });
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    let updatedCount = 0;
    
    // 更新每个日报的分类
    for (const report of reports || []) {
      const news = report.news || [];
      let updated = false;
      
      for (const item of news) {
        const oldCategory = item.category || '';
        const newCategory = categorize(item.title || '', item.summary || '');
        
        if (oldCategory !== newCategory) {
          item.category = newCategory;
          updated = true;
        }
      }
      
      if (updated) {
        const { error: updateError } = await supabaseAdmin
          .from('xyai_daily_reports')
          .update({ news })
          .eq('id', report.id);
        
        if (!updateError) {
          updatedCount++;
        }
      }
    }
    
    // 也更新待审核表
    const { data: pendingNews } = await supabaseAdmin
      .from('xyai_pending_news')
      .select('id, title, summary, category')
      .limit(100);
    
    let pendingUpdated = 0;
    for (const item of pendingNews || []) {
      const newCategory = categorize(item.title || '', item.summary || '');
      if (item.category !== newCategory) {
        await supabaseAdmin
          .from('xyai_pending_news')
          .update({ category: newCategory })
          .eq('id', item.id);
        pendingUpdated++;
      }
    }
    
    return NextResponse.json({
      success: true,
      updated: updatedCount,
      pending_updated: pendingUpdated
    });
    
  } catch (error) {
    console.error('Reclassify error:', error);
    return NextResponse.json(
      { success: false, error: 'Reclassify failed' },
      { status: 500 }
    );
  }
}
