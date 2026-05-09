import { BarChart3, Construction } from 'lucide-react';

export default function RankingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 mb-6">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
          大模型能力榜单
        </h1>
        <p className="text-muted-foreground mb-8">
          展示主流大模型的能力排行，数据来源：SuperCLUE / LMSYS Chatbot Arena / AlpacaEval 等
        </p>
        
        {/* 建设中提示 */}
        <div className="glass-card p-8 max-w-md mx-auto">
          <div className="flex flex-col items-center gap-3">
            <Construction className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              功能开发中，预计下周上线
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
