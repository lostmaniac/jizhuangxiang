import React, { useState } from 'react';
import { Solution } from '../types';
import { Visualization } from './Visualization';
import { CheckCircle, AlertTriangle, Cpu, DollarSign, Package, BarChart3 } from 'lucide-react';
import { analyzeSolution } from '../services/geminiService';

interface Props {
  solutions: Solution[];
}

export const Results: React.FC<Props> = ({ solutions }) => {
  const [selectedSolutionIdx, setSelectedSolutionIdx] = useState(0);
  const [activeContainerIdx, setActiveContainerIdx] = useState(0);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!solutions.length) return null;

  const activeSolution = solutions[selectedSolutionIdx];
  const activeContainer = activeSolution.containers[activeContainerIdx];

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const report = await analyzeSolution(solutions);
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Solution Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {solutions.map((sol, idx) => (
          <div 
            key={sol.id}
            onClick={() => { setSelectedSolutionIdx(idx); setActiveContainerIdx(0); }}
            className={`cursor-pointer border-2 rounded-xl p-5 transition-all relative overflow-hidden ${
              selectedSolutionIdx === idx 
                ? 'border-indigo-600 bg-indigo-50/30 shadow-md ring-1 ring-indigo-200' 
                : 'border-white bg-white hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-3 relative z-10">
               <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase">
                        {idx === 0 ? 'Scheme A' : 'Scheme B'}
                    </span>
                    {idx === 0 && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">推荐</span>}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mt-1">{sol.name}</h3>
               </div>
               {selectedSolutionIdx === idx && <CheckCircle className="text-indigo-600 w-6 h-6" />}
            </div>
            
            <div className="flex gap-4 items-baseline mb-4 relative z-10">
                <span className="text-3xl font-bold text-slate-900">¥{sol.totalCost.toLocaleString()}</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">总运费预估</span>
            </div>

            <div className="space-y-3 text-sm text-slate-600 relative z-10">
               <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>集装箱数量:</span>
                  <span className="font-bold text-slate-800">{sol.containers.length} 个</span>
               </div>
               <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>总体积利用率:</span>
                  <span className={`font-bold ${(sol.totalVolumeUtil * 100) > 85 ? 'text-green-600' : 'text-amber-600'}`}>
                    {(sol.totalVolumeUtil * 100).toFixed(1)}%
                  </span>
               </div>
               <div className="flex justify-between items-center pt-1">
                  <span>箱型组合:</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                     {Array.from(new Set(sol.containers.map(c => c.containerType.name))).map((name, i) => {
                         const count = sol.containers.filter(c => c.containerType.name === name).length;
                         return (
                             <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                 {count} x {name}
                             </span>
                         )
                     })}
                  </div>
               </div>
               {sol.unpackedItems.length > 0 && (
                   <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded flex items-start gap-2">
                       <AlertTriangle className="w-4 h-4 shrink-0" />
                       <div>
                           <strong>溢出警告:</strong> 有货物无法装入。
                           <div className="truncate w-full max-w-[200px]">
                               {sol.unpackedItems.map(i => i.cargoId).join(', ')}
                           </div>
                       </div>
                   </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
         {/* Left: Container Selector & Stats */}
         <div className="w-full lg:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 bg-white">
               <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">选择集装箱查看详情</h4>
               <div className="flex flex-wrap gap-2">
                  {activeSolution.containers.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveContainerIdx(idx)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all w-full flex justify-between items-center group ${
                            activeContainerIdx === idx
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span>#{idx + 1} {c.containerType.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeContainerIdx === idx ? 'bg-indigo-500 text-indigo-100' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                            {(c.utilizationVolume / c.totalVolume * 100).toFixed(0)}%
                        </span>
                      </button>
                  ))}
               </div>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
                        <Package className="w-4 h-4 text-indigo-500" />
                        装载体积 (CBM)
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-bold text-slate-900">{(activeContainer.utilizationVolume / 1000000).toFixed(2)}</span>
                        <span className="text-sm text-slate-400 mb-1">/ {(activeContainer.totalVolume / 1000000).toFixed(2)} m³</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${(activeContainer.utilizationVolume / activeContainer.totalVolume) * 100}%` }}
                        ></div>
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-slate-800 font-semibold">
                        <BarChart3 className="w-4 h-4 text-teal-500" />
                        装载重量 (KG)
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-bold text-slate-900">{(activeContainer.utilizationWeight / 1000).toFixed(2)}</span>
                        <span className="text-sm text-slate-400 mb-1">/ {(activeContainer.containerType.maxWeight / 1000).toFixed(2)} 吨</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${activeContainer.utilizationWeight > activeContainer.containerType.maxWeight ? 'bg-red-500' : 'bg-teal-500'}`}
                            style={{ width: `${Math.min((activeContainer.utilizationWeight / activeContainer.containerType.maxWeight) * 100, 100)}%` }}
                        ></div>
                    </div>
                    {activeContainer.utilizationWeight > activeContainer.containerType.maxWeight && (
                        <p className="text-xs text-red-500 mt-2 font-medium">⚠️ 超重警告</p>
                    )}
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                     <h5 className="text-xs font-bold text-indigo-800 mb-2 uppercase">箱内货物明细</h5>
                     <div className="text-xs space-y-1 text-indigo-700">
                        {/* Group items by ID for summary */}
                        {Object.entries(activeContainer.items.reduce((acc, item) => {
                            acc[item.cargoId] = (acc[item.cargoId] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>)).map(([id, count]) => (
                            <div key={id} className="flex justify-between">
                                <span>{id}</span>
                                <span className="font-bold">x {count}</span>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

            {/* AI Advisor Button */}
            <div className="p-4 border-t border-slate-200 bg-white">
                <button 
                  onClick={handleAiAnalysis}
                  disabled={loadingAi}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
                >
                   {loadingAi ? (
                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                       <Cpu className="w-5 h-5" />
                   )}
                   {aiReport ? '重新生成分析' : 'AI 专家点评与决策'}
                </button>
            </div>
         </div>

         {/* Middle/Right: Visualization */}
         <div className="flex-1 bg-white p-4 lg:p-6 flex flex-col">
             {activeContainer ? (
                 <Visualization container={activeContainer} />
             ) : (
                 <div className="h-full flex items-center justify-center text-slate-400">请选择一个集装箱查看3D视图</div>
             )}
         </div>
      </div>

      {/* AI Report Section */}
      {aiReport && (
          <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-8 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-indigo-50">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                      <Cpu className="w-6 h-6 text-indigo-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">AI 智能物流决策报告</h2>
                    <p className="text-sm text-slate-500">Powered by Google Gemini 2.5</p>
                  </div>
              </div>
              <div className="prose prose-indigo max-w-none text-slate-700">
                  {/* Simple markdown rendering */}
                  {aiReport.split('\n').map((line, i) => {
                      if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-slate-900 mt-4 mb-2">{line.replace(/#/g, '')}</h3>;
                      if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="ml-4 list-disc">{line.replace(/[*|-]/g, '')}</li>;
                      return <p key={i} className="mb-2">{line}</p>;
                  })}
              </div>
          </div>
      )}
    </div>
  );
};