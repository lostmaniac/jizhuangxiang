import React, { useState, useEffect } from 'react';
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

  // Reset state when new solutions are generated
  useEffect(() => {
    setSelectedSolutionIdx(0);
    setActiveContainerIdx(0);
    setAiReport(null);
    setLoadingAi(false);
  }, [solutions]);

  if (!solutions.length) return null;

  // Safety access
  const activeSolution = solutions[selectedSolutionIdx] || solutions[0];
  // Ensure container index is valid for the new solution
  const safeContainerIdx = activeSolution.containers[activeContainerIdx] ? activeContainerIdx : 0;
  const activeContainer = activeSolution.containers[safeContainerIdx];

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const report = await analyzeSolution(solutions);
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Top Bar: Solution Comparison & Selection */}
      <div className="shrink-0 p-4 bg-white border-b border-slate-200 shadow-sm z-10">
         <div className="flex gap-4 overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
            {solutions.map((sol, idx) => (
              <div 
                key={`${sol.id}-${idx}`} // Force unique key if IDs are same
                onClick={() => { setSelectedSolutionIdx(idx); setActiveContainerIdx(0); }}
                className={`cursor-pointer border rounded-xl p-3 min-w-[240px] flex-1 transition-all relative ${
                  selectedSolutionIdx === idx 
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-100' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${selectedSolutionIdx === idx ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                            {idx === 0 ? '方案 A' : '方案 B'}
                        </span>
                        {idx === 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">推荐</span>}
                   </div>
                   {selectedSolutionIdx === idx && <CheckCircle className="text-indigo-600 w-4 h-4" />}
                </div>
                
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-900">¥{sol.totalCost.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">{sol.containers.length} 个集装箱</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <div className="text-xs text-slate-500">
                        体积利用率: <span className="font-semibold text-slate-700">{(sol.totalVolumeUtil * 100).toFixed(1)}%</span>
                    </div>
                    {sol.unpackedItems.length > 0 && (
                        <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {sol.unpackedItems.reduce((a,b) => a+b.quantity, 0)} 件未装
                        </div>
                    )}
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
         
         {/* Left: Container List & Details */}
         <div className="w-[300px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
             {/* Container List */}
             <div className="p-3 bg-slate-50 border-b border-slate-200">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">集装箱明细 ({activeSolution.containers.length})</h4>
                <div className="space-y-2 max-h-[200px] lg:max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {activeSolution.containers.map((c, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveContainerIdx(idx)}
                            className={`w-full text-left px-3 py-2 rounded border text-xs transition-all flex justify-between items-center ${
                                safeContainerIdx === idx
                                ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-50 z-10 relative'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                        >
                            <span className="font-bold">#{idx + 1} {c.containerType.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${safeContainerIdx === idx ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100'}`}>
                                {(c.utilizationVolume / c.totalVolume * 100).toFixed(0)}%
                            </span>
                        </button>
                    ))}
                </div>
             </div>
             
             {/* Current Container Stats */}
             {activeContainer ? (
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {/* Volume Meter */}
                     <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                                <Package className="w-3.5 h-3.5 text-indigo-500" /> 体积
                            </div>
                            <span className="text-xs font-mono text-slate-500">{(activeContainer.utilizationVolume / 1000000).toFixed(2)} m³</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${(activeContainer.utilizationVolume / activeContainer.totalVolume) * 100}%` }}
                            ></div>
                        </div>
                     </div>
                     
                     {/* Weight Meter */}
                     <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                                <BarChart3 className="w-3.5 h-3.5 text-teal-500" /> 重量
                            </div>
                            <span className="text-xs font-mono text-slate-500">{(activeContainer.utilizationWeight / 1000).toFixed(2)} T</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${activeContainer.utilizationWeight > activeContainer.containerType.maxWeight ? 'bg-red-500' : 'bg-teal-500'}`}
                                style={{ width: `${Math.min((activeContainer.utilizationWeight / activeContainer.containerType.maxWeight) * 100, 100)}%` }}
                            ></div>
                        </div>
                     </div>

                     {/* Item List Summary */}
                     <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                         <h5 className="text-[10px] font-bold text-indigo-800 mb-2 uppercase">箱内货物清单</h5>
                         <div className="text-xs space-y-1 text-slate-600 font-mono">
                            {Object.entries(activeContainer.items.reduce((acc, item) => {
                                acc[item.cargoId] = (acc[item.cargoId] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>)).map(([id, count]) => (
                                <div key={id} className="flex justify-between border-b border-indigo-100/50 last:border-0 pb-1 last:pb-0">
                                    <span>{id}</span>
                                    <span className="font-bold text-indigo-700">x{count}</span>
                                </div>
                            ))}
                         </div>
                     </div>

                     <div className="pt-4">
                        <button 
                            onClick={handleAiAnalysis}
                            disabled={loadingAi}
                            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow hover:shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            {loadingAi ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                            {aiReport ? '更新分析报告' : 'AI 专家决策'}
                        </button>
                     </div>
                 </div>
             ) : (
                 <div className="p-4 text-center text-slate-400 text-xs mt-10">
                     暂无集装箱数据
                 </div>
             )}
         </div>

         {/* Center: Visualization */}
         <div className="flex-1 bg-slate-100 overflow-hidden relative flex flex-col">
             {activeContainer ? (
                 <Visualization container={activeContainer} />
             ) : (
                 <div className="flex-1 flex items-center justify-center text-slate-400">请选择一个集装箱</div>
             )}
             
             {/* AI Report Overlay Panel (if active) */}
             {aiReport && (
                 <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[50%] flex flex-col transition-transform duration-300 animate-in slide-in-from-bottom z-30">
                     <div className="flex justify-between items-center px-6 py-3 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-indigo-600" />
                            <h3 className="font-bold text-slate-800 text-sm">AI 决策报告</h3>
                        </div>
                        <button onClick={() => setAiReport(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2">×</button>
                     </div>
                     <div className="p-6 overflow-y-auto prose prose-sm prose-indigo max-w-none">
                        {aiReport.split('\n').map((line, i) => {
                            if (line.trim().startsWith('###')) return <h3 key={i} className="text-sm font-bold text-slate-900 mt-3 mb-1">{line.replace(/#/g, '')}</h3>;
                            if (line.trim().startsWith('*') || line.trim().startsWith('-')) return <li key={i} className="text-slate-600 ml-4 text-xs">{line.replace(/[*|-]/g, '')}</li>;
                            return <p key={i} className="text-slate-600 mb-1 text-xs leading-relaxed">{line}</p>;
                        })}
                     </div>
                 </div>
             )}
         </div>

      </div>
    </div>
  );
};