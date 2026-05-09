'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Filter, Trophy, Code, Brain, Palette, Layers, DollarSign, Cpu, RefreshCw } from 'lucide-react';
import { GreenChatbot } from '@/components/ui/GreenChatbot';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

type Dimension = 'overall' | 'coding' | 'reasoning' | 'creativity' | 'multimodal';

const dimensions: { key: Dimension; label: string; icon: typeof Code }[] = [
  { key: 'overall', label: '综合', icon: Trophy },
  { key: 'coding', label: '代码', icon: Code },
  { key: 'reasoning', label: '推理', icon: Brain },
  { key: 'creativity', label: '创意', icon: Palette },
  { key: 'multimodal', label: '多模态', icon: Layers },
];

// 模型类型
interface ModelRanking {
  id: string;
  rank: number;
  model: string;
  provider: string;
  logo: string;
  benchmark: string;
  scores: {
    overall: number;
    coding: number;
    reasoning: number;
    creativity: number;
    multimodal: number;
  };
  pricing?: {
    input: number;
    output: number;
    context: number;
  };
  token_plan?: {
    context_window: number;
    function_calling: boolean;
    vision: boolean;
    max_output: number;
  };
  updated: string;
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<ModelRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDimension, setActiveDimension] = useState<Dimension>('overall');
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'chart'>('table');
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  useEffect(() => {
    loadRankings();
  }, []);
  
  async function loadRankings() {
    setLoading(true);
    try {
      const response = await fetch('/api/rankings');
      const data = await response.json();
      if (data.success && data.data) {
        // 转换数据格式
        const formattedData = data.data.map((r: any) => ({
          id: r.id,
          rank: r.rank,
          model: r.model || r.model_name,
          provider: r.provider,
          logo: r.logo || '🤖',
          benchmark: r.benchmark,
          scores: typeof r.scores === 'string' ? JSON.parse(r.scores) : r.scores,
          pricing: r.pricing,
          token_plan: r.token_plan,
          updated: r.updated || r.updated_at,
        }));
        setRankings(formattedData);
        setLastUpdate(data.updated);
      }
    } catch (error) {
      console.error('Failed to load rankings:', error);
    } finally {
      setLoading(false);
    }
  }
  
  // 根据维度排序
  const sortedRankings = [...rankings].sort((a, b) => {
    if (activeDimension === 'overall') {
      return b.scores.overall - a.scores.overall;
    }
    return b.scores[activeDimension] - a.scores[activeDimension];
  });
  
  // 准备雷达图数据
  const radarData = sortedRankings.slice(0, 5).map(model => ({
    model: model.model.length > 12 ? model.model.slice(0, 10) + '...' : model.model,
    overall: model.scores.overall,
    coding: model.scores.coding,
    reasoning: model.scores.reasoning,
    creativity: model.scores.creativity,
    multimodal: model.scores.multimodal,
  }));
  
  // 准备价格对比数据（只显示有价格的模型）
  const pricingData = sortedRankings.filter(m => m.pricing && m.pricing.input > 0).slice(0, 6).map(model => ({
    model: model.model.length > 10 ? model.model.slice(0, 8) + '..' : model.model,
    input: model.pricing!.input,
    output: model.pricing!.output,
  }));
  
  // 准备上下文窗口对比数据
  const contextData = sortedRankings.slice(0, 8).map(model => ({
    model: model.model.length > 10 ? model.model.slice(0, 8) + '..' : model.model,
    context: model.token_plan?.context_window || 0,
    maxOutput: model.token_plan?.max_output || 0,
  }));
  
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* 页面标题 */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 mb-6">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          大模型能力榜单
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          展示主流大模型的能力排行，数据来源：SuperCLUE / LMSYS Chatbot Arena / AlpacaEval
        </p>
        {lastUpdate && (
          <p className="text-xs text-muted-foreground mt-2">
            数据更新时间：{new Date(lastUpdate).toLocaleString('zh-CN')}
          </p>
        )}
      </header>
      
      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* 维度选择 */}
        <div className="flex flex-wrap gap-2">
          {dimensions.map((dim) => {
            const Icon = dim.icon;
            return (
              <button
                key={dim.key}
                onClick={() => setActiveDimension(dim.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeDimension === dim.key
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {dim.label}
              </button>
            );
          })}
        </div>
        
        {/* 视图切换 */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-background shadow' : 'hover:bg-background/50'
            }`}
            aria-label="表格视图"
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'card' ? 'bg-background shadow' : 'hover:bg-background/50'
            }`}
            aria-label="卡片视图"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'chart' ? 'bg-background shadow' : 'hover:bg-background/50'
            }`}
            aria-label="图表视图"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* 加载状态 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* 图表视图 */}
          {viewMode === 'chart' && (
            <div className="space-y-8">
              {/* 性能雷达图 */}
              <div className="glass-card-enhanced p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Top 5 模型能力雷达图
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="model" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                    <Radar name="综合" dataKey="overall" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                    <Radar name="代码" dataKey="coding" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name="推理" dataKey="reasoning" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              
              {/* 价格对比图 */}
              {pricingData.length > 0 && (
                <div className="glass-card-enhanced p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Token 价格对比 ($ / 1M tokens)
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pricingData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                      <YAxis dataKey="model" type="category" width={80} tick={{ fill: 'var(--foreground)', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => `$${value}`}
                      />
                      <Legend />
                      <Bar dataKey="input" name="输入价格" fill="#10b981" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="output" name="输出价格" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">* 开源模型（如Llama4、Gemma3）价格显示为$0</p>
                </div>
              )}
              
              {/* 上下文窗口对比 */}
              <div className="glass-card-enhanced p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-500" />
                  上下文窗口对比 (Token)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contextData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="model" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => Number(value).toLocaleString()}
                    />
                      <Legend />
                    <Bar dataKey="context" name="上下文窗口" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maxOutput" name="最大输出" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* 数据表格视图 */}
          {viewMode === 'table' && (
            <div className="glass-card-enhanced overflow-hidden">
              <div className="overflow-x-auto">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th className="w-20">排名</th>
                      <th>模型</th>
                      <th className="hidden sm:table-cell">厂商</th>
                      <th className="w-32">{dimensions.find(d => d.key === activeDimension)?.label}得分</th>
                      <th className="hidden md:table-cell">上下文</th>
                      <th className="hidden lg:table-cell">输入价格</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRankings.map((model) => (
                      <tr key={model.id}>
                        <td>
                          <span className={`rank-badge ${
                            model.rank === 1 ? 'rank-1' :
                            model.rank === 2 ? 'rank-2' :
                            model.rank === 3 ? 'rank-3' : ''
                          }`}>
                            {model.rank <= 3 ? '' : model.rank}
                            {model.rank === 1 && <Trophy className="w-4 h-4" />}
                            {model.rank === 2 && <span className="text-lg">🥈</span>}
                            {model.rank === 3 && <span className="text-lg">🥉</span>}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{model.logo}</span>
                            <div>
                              <div className="font-semibold text-foreground">{model.model}</div>
                              <div className="text-xs text-muted-foreground sm:hidden">{model.provider}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell text-muted-foreground">{model.provider}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">
                              {model.scores[activeDimension].toFixed(1)}
                            </span>
                            <div className="score-bar flex-1 max-w-20">
                              <div 
                                className="score-bar-fill" 
                                style={{ width: `${model.scores[activeDimension]}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell text-sm text-muted-foreground">
                          {(model.token_plan?.context_window || 0).toLocaleString()}
                        </td>
                        <td className="hidden lg:table-cell text-sm">
                          {model.pricing?.input === 0 ? (
                            <span className="text-green-600 dark:text-green-400">免费</span>
                          ) : (
                            <span className="text-muted-foreground">${model.pricing?.input || '-'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* 卡片视图 */}
          {viewMode === 'card' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRankings.map((model) => (
                <article 
                  key={model.id} 
                  className={`glass-card-enhanced p-5 hover-lift relative overflow-hidden ${
                    model.rank <= 3 ? 'ring-2 ring-primary/30' : ''
                  }`}
                >
                  {/* 排名标识 */}
                  {model.rank <= 3 && (
                    <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg ${
                      model.rank === 1 ? 'bg-amber-500 text-white' :
                      model.rank === 2 ? 'bg-gray-400 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      Top {model.rank}
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{model.logo}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{model.model}</h3>
                      <p className="text-xs text-muted-foreground">{model.provider}</p>
                    </div>
                  </div>
                  
                  {/* 各项得分 */}
                  <div className="space-y-2">
                    {dimensions.map((dim) => (
                      <div key={dim.key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{dim.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="score-bar w-16">
                            <div 
                              className="score-bar-fill" 
                              style={{ width: `${model.scores[dim.key]}%` }}
                            />
                          </div>
                          <span className="font-medium text-foreground w-8 text-right">
                            {model.scores[dim.key].toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 价格和上下文 */}
                  <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">上下文：</span>
                      <span className="font-medium">{(model.token_plan?.context_window || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">输入：</span>
                      <span className="font-medium">
                        {model.pricing?.input === 0 ? '免费' : `$${model.pricing?.input}`}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                    更新于 {model.updated}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* 数据说明 */}
      <div className="mt-8 glass-card p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-foreground mb-2">数据说明</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• 综合得分 = 各项得分的加权平均</li>
          <li>• 数据来源：SuperCLUE评测集、LMSYS Chatbot Arena、Arena-Hard等</li>
          <li>• 价格数据来自各厂商官方定价（2026年5月）</li>
          <li>• 得分范围：0-100分，数据每周更新</li>
        </ul>
      </div>
      
      {/* 绿的对话看板娘 */}
      <GreenChatbot />
    </div>
  );
}
