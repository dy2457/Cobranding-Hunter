
import React, { useEffect, useState } from 'react';

const steps = [
  "正在启动AI Agent...",
  "检索全球数据库...",
  "扫描官网与新闻源...",
  "挖掘社媒舆论...",
  "交叉验证数据源...",
  "提炼关键信息...",
  "格式化研究案例..."
];

export const LoadingState: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Step progress timer
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500); // Slower steps to match realistic API time

    // Elapsed time timer
    const timeInterval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timeInterval);
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-32 bg-white/80 backdrop-blur-xl p-10 rounded-[32px] shadow-2xl border border-white/50 animate-fade-in">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-pink-100"></div>
          {/* Brand Color Spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-[#b5004a] border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold text-[#b5004a]">
             {elapsedSeconds}s
          </div>
        </div>
        
        <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight text-center">摸会儿鱼吧<br/>AI正在以十倍于你自己手动搜素的时间进行快速收集中…</h3>
        <p className="text-[#b5004a] font-bold text-sm text-center mb-6 h-6 animate-pulse">{steps[currentStep]}</p>
        
        <div className="w-full space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
             <span>任务进度</span>
             <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#b5004a] to-purple-500 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="mt-4 space-y-2 pl-2">
             {steps.slice(0, currentStep + 1).slice(-3).map((s, i) => (
                <div key={i} className="flex items-center text-xs font-medium text-slate-600 animate-slide-in-right">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-3"></span>
                   {s}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
