// 管理后台API - 待审核新闻列表
// GET /api/admin/pending?status=draft|pending|published|rejected

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'draft';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    let query = supabaseAdmin
      .from('xyai_pending_news')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Admin pending query error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
      hasMore: (startIndex + limit) < (count || 0),
    });
    
  } catch (error) {
    console.error('Admin pending API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
