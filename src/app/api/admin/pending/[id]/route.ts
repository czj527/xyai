// 管理后台API - 审核新闻（发布/拒绝）
// POST /api/admin/pending/[id]
// Body: { action: 'approve' | 'reject', reject_reason?: string }

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reject_reason, edits } = body as {
      action: 'approve' | 'reject';
      reject_reason?: string;
      edits?: {
        title?: string;
        summary?: string;
        priority?: string;
        category?: string;
      };
    };
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }
    
    // 获取待审核新闻
    const { data: pendingNews, error: fetchError } = await supabaseAdmin
      .from('xyai_pending_news')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !pendingNews) {
      return NextResponse.json(
        { success: false, error: 'News item not found' },
        { status: 404 }
      );
    }
    
    if (pendingNews.status === 'published') {
      return NextResponse.json(
        { success: false, error: 'Already published' },
        { status: 400 }
      );
    }
    
    if (action === 'reject') {
      // 拒绝
      const { error: updateError } = await supabaseAdmin
        .from('xyai_pending_news')
        .update({
          status: 'rejected',
          reject_reason: reject_reason || '不符合发布标准',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin',
        })
        .eq('id', id);
      
      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: '已拒绝',
        id,
      });
    }
    
    // 批准 → 写入 xyai_daily_reports
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    const period = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    
    // 应用编辑（如果有）
    const finalNews = {
      id: pendingNews.id,
      title: edits?.title || pendingNews.title,
      summary: edits?.summary || pendingNews.summary,
      source: pendingNews.source,
      source_url: pendingNews.source_url,
      priority: edits?.priority || pendingNews.priority,
      category: edits?.category || pendingNews.category,
      published_at: pendingNews.published_at,
      core_facts: pendingNews.core_facts,
      key_data: pendingNews.key_data,
      related_links: pendingNews.related_links,
    };
    
    // 查找今天的日报
    const { data: existingReport } = await supabaseAdmin
      .from('xyai_daily_reports')
      .select('id, news')
      .eq('date', today)
      .eq('period', period)
      .single();
    
    if (existingReport) {
      // 追加到已有日报
      const updatedNews = [...(existingReport.news || []), finalNews];
      const { error: updateError } = await supabaseAdmin
        .from('xyai_daily_reports')
        .update({ news: updatedNews })
        .eq('id', existingReport.id);
      
      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // 创建新日报
      const { error: insertError } = await supabaseAdmin
        .from('xyai_daily_reports')
        .insert({
          date: today,
          period,
          news: [finalNews],
          headline: finalNews.title,
        });
      
      if (insertError) {
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }
    }
    
    // 更新待审核状态为已发布
    await supabaseAdmin
      .from('xyai_pending_news')
      .update({
        status: 'published',
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin',
      })
      .eq('id', id);
    
    return NextResponse.json({
      success: true,
      message: '已发布',
      id,
    });
    
  } catch (error) {
    console.error('Admin review API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
