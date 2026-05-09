'use client';

import { useState } from 'react';
import { BarChart3, Filter, Trophy, Code, Brain, Palette, Layers } from 'lucide-react';
import { GreenChatbot } from '@/components/ui/GreenChatbot';

// Mock模型排名数据
const mockRankings = [
  {
    id: '1',
    rank: 1,
    model: 'GPT-5',
    provider: 'OpenAI',
    logo: '🤖',
    scores: { overall: 98.5, coding: 99.2, reasoning: 99.0, creativity: 97.8, multimodal: 98.5 },
    updated: '2025-05-09',
  },
  {
    id: '2',
    rank: 2,
    model: 'Claude 4 Opus',
    provider: 'Anthropic',
    logo: '🧠',
    scores: { overall: 97.8, coding: 96.5, reasoning: 98.8, creativity: 98.5, multimodal: 97.2 },
    updated: '2025-05-09',
  },
  {
    id: '3',
    rank: 3,
    model: 'Gemini 2.5 Ultra',
    provider: 'Google',
    logo: '✨',
    scores: { overall: 97.2, coding: 96.0, reasoning: 96.8, creativity: 95.5, multimodal: 99.0 },
    updated: '2025-05-08',
  },
  {
    id: '4',
    rank: 4,
    model: 'Claude 4 Sonnet',
    provider: 'Anthropic',
    logo: '🧠',
    scores: { overall: 95.8, coding: 95.2, reasoning: 96.5, creativity: 96.8, multimodal: 94.5 },
    updated: '2025-05-09',
  },
  {
    id: '5',
    rank: 5,
    model: 'Llama 4 405B',
    provider: 'Meta',
    logo: '🦙',
    scores: { overall: 94.5, coding: 93.8, reasoning: 94.2, creativity: 95.0, multimodal: 95.5 },
    updated: '2025-05-07',
  },
  {
    id: '6',
    rank: 6,
    model: 'Qwen2.5 72B',
    provider: '阿里云',
    logo: '🌊',
    scores: { overall: 93.2, coding: 93.5, reasoning: 92.8, creativity: 93.5, multimodal: 92.0 },
    updated: '2025-05-06',
  },
  {
    id: '7',
    rank: 7,
    model: 'Mistral Large 2',
    provider: 'Mistral AI',
    logo: '🌬️',
    scores: { overall: 92.8, coding: 94.0, reasoning: 93.2, creativity: 91.5, multimodal: 91.0 },
    updated: '2025-05-05',
  },
  {
    id: '8',
    rank: 8,
    model: 'Gemma 3 27B',
    provider: 'Google',
    logo: '✨',
    scores: { overall: 91.5, coding: 90.8, reasoning: 91.2, creativity: 92.5, multimodal: 91.8 },
    updated: '2025-05-04',
  },
];

type Dimension = 'overall' | 'coding' | 'reasoning' | 'creativity' | 'multimodal';

const dimensions: { key: Dimension; label: string; icon: typeof Code }[] = [
  { key: 'overall', label: '综合', icon: Trophy },
  { key: 'coding', label: '代码', icon: Code },
  { key: 'reasoning', label: '推理', icon: Brain },
  { key: 'creativity', label: '创意', icon: Palette },
  { key: 'multimodal', label: '多模态', icon: Layers },
];

export default function RankingsPage() {
  const [activeDimension, setActiveDimension] = useState<Dimension>('overall');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  // 根据维度排序
  const sortedRankings = [...mockRankings].sort((a, b) => {
    if (activeDimension === 'overall') {
      return b.scores.overall - a.scores.overall;
    }
    return b.scores[activeDimension] - a.scores[activeDimension];
  });
  
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
        </div>
      </div>
      
      {/* 数据表格/卡片 */}
      {viewMode === 'table' ? (
        <div className="glass-card-enhanced overflow-hidden">
          <div className="overflow-x-auto">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th className="w-20">排名</th>
                  <th>模型</th>
                  <th className="hidden sm:table-cell">厂商</th>
                  <th className="w-32">{dimensions.find(d => d.key === activeDimension)?.label}得分</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
              
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                更新于 {model.updated}
              </p>
            </article>
          ))}
        </div>
      )}
      
      {/* 数据说明 */}
      <div className="mt-8 glass-card p-5 rounded-xl">
        <h3 className="text-sm font-semibold text-foreground mb-2">数据说明</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• 综合得分 = 各项得分的加权平均</li>
          <li>• 数据来源：SuperCLUE评测集、LMSYS Chatbot Arena、Arena-Hard等</li>
          <li>• 得分范围：0-100分，每周更新一次</li>
          <li>• 如有疑问或建议，欢迎反馈</li>
        </ul>
      </div>
      
      {/* 绿的对话看板娘 */}
      <GreenChatbot />
    </div>
  );
}
