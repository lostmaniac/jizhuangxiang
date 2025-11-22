import React, { useState } from 'react';
import { Layout, Truck, Plus, Trash2, Box, Package, ChevronRight, Settings } from 'lucide-react';
import { DEFAULT_CARGO, DEFAULT_CONTAINERS } from './constants';
import { CargoItem, ContainerType, Solution, CargoType } from './types';
import { generateSolutions } from './utils/packer';
import { Results } from './components/Results';

const App = () => {
  const [cargoList, setCargoList] = useState<CargoItem[]>(DEFAULT_CARGO);
  const [containers, setContainers] = useState<ContainerType[]>(DEFAULT_CONTAINERS);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'cargo' | 'containers'>('cargo');

  // Input Handlers
  const addCargo = () => {
    const newItem: CargoItem = {
      id: `SKU-${Math.floor(Math.random() * 1000)}`,
      name: '新货物',
      length: 50,
      width: 40,
      height: 30,
      weight: 10,
      quantity: 10,
      canRotate: true,
      type: CargoType.CARTON,
      priority: 'Low',
      color: '#cbd5e1',
    };
    setCargoList([...cargoList, newItem]);
  };

  const removeCargo = (index: number) => {
    setCargoList(cargoList.filter((_, i) => i !== index));
  };

  const updateCargo = (index: number, field: keyof CargoItem, value: any) => {
    const newList = [...cargoList];
    newList[index] = { ...newList[index], [field]: value };
    setCargoList(newList);
  };

  const updateContainer = (index: number, field: keyof ContainerType, value: any) => {
    const newList = [...containers];
    newList[index] = { ...newList[index], [field]: value };
    setContainers(newList);
  };

  // Calculation Handler
  const handleCalculate = () => {
    if (cargoList.length === 0) {
        alert("请至少添加一种货物");
        return;
    }
    setIsCalculating(true);
    // Determine enabled containers
    const enabledContainers = containers.filter(c => c.enabled);
    
    if (enabledContainers.length === 0) {
        alert("请至少启用一种集装箱类型");
        setIsCalculating(false);
        return;
    }

    // Simulate slight delay for "Processing" feel
    setTimeout(() => {
        try {
            const results = generateSolutions(cargoList, enabledContainers);
            setSolutions(results);
        } catch (e) {
            console.error(e);
            alert("计算失败，请检查输入参数是否合理。");
        } finally {
            setIsCalculating(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-14 shrink-0 z-50 shadow-sm">
        <div className="w-full px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-1.5 rounded text-white">
                <Layout className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">智运装箱 <span className="text-indigo-600">Pro</span></h1>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block">智能物流优化系统</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-sm font-semibold shadow shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isCalculating ? (
                    <>正在计算...</>
                ) : (
                    <>
                    <Truck className="w-4 h-4" />
                    生成方案
                    </>
                )}
             </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen Layout */}
      <main className="flex-1 flex overflow-hidden">
         
         {/* Left Sidebar: Inputs */}
         <div className="w-[380px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
            <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button 
                    onClick={() => setActiveTab('cargo')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'cargo' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    货物清单 (SKU)
                </button>
                <button 
                    onClick={() => setActiveTab('containers')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'containers' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    箱型配置
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
                {activeTab === 'cargo' ? (
                    <div className="space-y-3">
                        {cargoList.map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 relative group hover:border-indigo-300 hover:shadow-sm transition-all">
                                <button 
                                    onClick={() => removeCargo(idx)}
                                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                
                                <div className="grid grid-cols-12 gap-2 mb-2">
                                    <div className="col-span-7">
                                        <label className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">名称 / SKU</label>
                                        <input 
                                            type="text" 
                                            value={item.name}
                                            onChange={(e) => updateCargo(idx, 'name', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-medium focus:border-indigo-500 outline-none"
                                            placeholder="SKU-001"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">数量</label>
                                        <input 
                                            type="number" 
                                            value={item.quantity}
                                            onChange={(e) => updateCargo(idx, 'quantity', parseInt(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-1 text-xs font-medium text-center focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="text-[9px] uppercase text-slate-400 font-bold block mb-0.5">单重(KG)</label>
                                        <input 
                                            type="number" 
                                            value={item.weight}
                                            onChange={(e) => updateCargo(idx, 'weight', parseFloat(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-1 text-xs font-medium text-center focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase px-1">尺寸(CM)</span>
                                    <input 
                                        type="number" placeholder="长"
                                        value={item.length}
                                        onChange={(e) => updateCargo(idx, 'length', parseFloat(e.target.value))}
                                        className="w-12 bg-white border border-slate-200 rounded text-xs text-center py-0.5 outline-none focus:border-indigo-500"
                                    />
                                    <span className="text-slate-300">x</span>
                                    <input 
                                        type="number" placeholder="宽"
                                        value={item.width}
                                        onChange={(e) => updateCargo(idx, 'width', parseFloat(e.target.value))}
                                        className="w-12 bg-white border border-slate-200 rounded text-xs text-center py-0.5 outline-none focus:border-indigo-500"
                                    />
                                    <span className="text-slate-300">x</span>
                                    <input 
                                        type="number" placeholder="高"
                                        value={item.height}
                                        onChange={(e) => updateCargo(idx, 'height', parseFloat(e.target.value))}
                                        className="w-12 bg-white border border-slate-200 rounded text-xs text-center py-0.5 outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                        <input 
                                            type="checkbox"
                                            checked={item.canRotate}
                                            onChange={(e) => updateCargo(idx, 'canRotate', e.target.checked)}
                                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 border-slate-300"
                                        />
                                        <span className="text-[10px] text-slate-600 font-medium">允许旋转</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400">标记色</span>
                                        <input 
                                            type="color"
                                            value={item.color}
                                            onChange={(e) => updateCargo(idx, 'color', e.target.value)}
                                            className="w-5 h-5 rounded cursor-pointer border border-slate-200 p-0.5 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={addCargo}
                            className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide"
                        >
                            <Plus className="w-4 h-4" /> 添加新货物
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {containers.map((c, idx) => (
                            <div key={idx} className={`p-3 rounded-lg border transition-all ${c.enabled ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="checkbox" 
                                            checked={c.enabled} 
                                            onChange={(e) => updateContainer(idx, 'enabled', e.target.checked)}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                        />
                                        <div>
                                            <span className="font-bold text-sm text-slate-800 block">{c.name}</span>
                                            <span className="text-[10px] text-slate-500 block font-mono">{c.length}x{c.width}x{c.height}cm</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                     <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                        <span className="text-[9px] text-slate-400 block uppercase">运费 (￥)</span>
                                        <input 
                                            type="number"
                                            value={c.cost}
                                            onChange={(e) => updateContainer(idx, 'cost', parseFloat(e.target.value))}
                                            className="w-full bg-transparent text-xs font-bold text-slate-700 outline-none"
                                        />
                                     </div>
                                     <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                                        <span className="text-[9px] text-slate-400 block uppercase">载重 (KG)</span>
                                        <div className="text-xs font-bold text-slate-700">{c.maxWeight}</div>
                                     </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="bg-slate-900 text-slate-300 p-4 text-[10px] border-t border-slate-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="uppercase tracking-wider font-bold text-slate-500">总件数</span>
                    <span className="text-white font-mono text-sm">{cargoList.reduce((acc, i) => acc + i.quantity, 0)} PCS</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="uppercase tracking-wider font-bold text-slate-500">总重量</span>
                    <span className="text-white font-mono text-sm">{(cargoList.reduce((acc, i) => acc + (i.weight * i.quantity), 0) / 1000).toFixed(2)} T</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="uppercase tracking-wider font-bold text-slate-500">总体积</span>
                    <span className="text-white font-mono text-sm">{cargoList.reduce((acc, i) => acc + ((i.length * i.width * i.height * i.quantity) / 1000000), 0).toFixed(2)} m³</span>
                </div>
            </div>
         </div>

         {/* Right Content: Results Area */}
         <div className="flex-1 bg-slate-100 overflow-hidden relative">
            {solutions.length > 0 ? (
                <Results solutions={solutions} />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center mb-8 animate-bounce-slow">
                         <Truck className="w-14 h-14 text-indigo-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">准备开始智能装载</h2>
                    <p className="text-slate-500 max-w-lg text-lg">
                        左侧添加货物清单并选择集装箱，系统将自动计算出<br/>
                        <span className="text-indigo-600 font-semibold">成本最低</span> 和 <span className="text-indigo-600 font-semibold">空间利用率最高</span> 的装载方案。
                    </p>
                </div>
            )}
         </div>
      </main>
    </div>
  );
};

export default App;