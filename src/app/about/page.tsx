import { Info, Leaf, MessageSquare } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* 项目介绍 */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 mb-6">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            关于新叶AI
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            新叶AI是一个AI资讯聚合网站，致力于为AI从业者和爱好者提供最新、最有价值的行业资讯。
          </p>
        </div>
      </section>
      
      {/* 绿的角色介绍 */}
      <section className="glass-card p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🌿</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              看板娘：绿（Midori）
            </h2>
            <p className="text-sm text-muted-foreground">
              新叶AI的AI资讯播音员
            </p>
          </div>
        </div>
        
        <div className="space-y-4 text-sm text-foreground/80">
          <p>
            <strong className="text-foreground">绿</strong>是一位元气满满、好奇心旺盛的AI资讯播音员。
            她每天凌晨就开始准备素材，为观众带来最新的AI行业资讯。
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div>
              <h3 className="font-medium text-foreground mb-2">性格特点</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 元气满满、乐观积极</li>
                <li>• 信息敏感度高</li>
                <li>• 善于提炼重点</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">口头禅</h3>
              <p className="text-muted-foreground italic">
                「今天的AI圈又有大事了！」
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 视频品牌 */}
      <section className="glass-card p-6 sm:p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📺</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              视频品牌：新叶早报
            </h2>
            <p className="text-sm text-muted-foreground">
              在B站等视频平台发布AI资讯视频，每天3-4分钟，快速了解AI圈大事。
            </p>
          </div>
        </div>
      </section>
      
      {/* 技术栈 */}
      <section className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          技术栈
        </h2>
        <div className="flex flex-wrap gap-2">
          {['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel'].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-accent rounded-full text-sm text-accent-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
