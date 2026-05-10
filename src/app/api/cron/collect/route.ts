// Vercel Cron 定时采集端点
// 每天 8:00, 12:00, 18:00 (UTC+8) 自动触发采集
// 验证 CRON_SECRET 防止未授权访问

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 验证 cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // 也支持 Vercel Cron 的方式传参
      const url = new URL(request.url);
      const token = url.searchParams.get('token');
      if (token !== cronSecret) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    console.log('[Cron] 定时采集触发', new Date().toISOString());
    
    // 调用采集API
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const collectResponse = await fetch(`${baseUrl}/api/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dry_run: false }),
    });
    
    const result = await collectResponse.json();
    
    console.log('[Cron] 采集完成', {
      success: result.success,
      count: result.count,
      db_write: result.db_write,
    });
    
    return NextResponse.json({
      success: true,
      message: '定时采集完成',
      result: {
        count: result.count,
        db_write: result.db_write,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('[Cron] 定时采集失败:', error);
    return NextResponse.json(
      { success: false, error: '定时采集失败' },
      { status: 500 }
    );
  }
}
