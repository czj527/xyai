// 数据清理 API
// POST /api/cleanup - 清理旧数据

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST: 清理旧数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { days_to_keep = 7 } = body;
    
    // 计算截止日期
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days_to_keep);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    
    // 获取要删除的数据（用于统计）
    const { data: oldReports, error: fetchError } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('id, date, news')
      .lt('date', cutoffDateStr);
    
    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }
    
    if (!oldReports || oldReports.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No old data to cleanup',
        deleted_count: 0
      });
    }
    
    // 删除旧数据
    const { error: deleteError } = await supabaseAdmin
      .from('xyai_daily_reports')
      .delete()
      .lt('date', cutoffDateStr);
    
    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }
    
    // 统计删除的新闻数量
    let totalNews = 0;
    oldReports.forEach(report => {
      if (report.news && Array.isArray(report.news)) {
        totalNews += report.news.length;
      }
    });
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up data older than ${cutoffDateStr}`,
      deleted_reports: oldReports.length,
      deleted_news: totalNews
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup data' },
      { status: 500 }
    );
  }
}
