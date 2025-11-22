import React, { useState } from 'react';
import { Layout, Truck, Plus, Trash2, Box, Package, ChevronRight, Settings, Info } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Layout className="w-5 h-5" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">智运装箱 <span className="text-indigo-600">Pro</span></h1>
                <p className="text-[10px] text-slate-500 font-medium">智能物流优化系统</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
                 <Info className="w-3 h-3" />
                 基于 Gemini AI 2.5 决策支持
             </div>
             <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isCalculating ? (
                    <>正在计算最优方案...</>
                ) : (
                    <>
                    <Truck className="w-4 h-4" />
                    生成装载方案
                    </>
                )}
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Inputs */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-100">
                        <button 
                            onClick={() => setActiveTab('cargo')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'cargo' ? 'bg-slate-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            货物信息 (SKU)
                        </button>
                        <button 
                            onClick={() => setActiveTab('containers')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'containers' ? 'bg-slate-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            可选集装箱
                        </button>
                    </div>

                    <div className="p-4 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                        {activeTab === 'cargo' ? (
                            <div className="space-y-4">
                                {cargoList.map((item, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative group hover:border-indigo-300 transition-colors">
                                        <button 
                                            onClick={() => removeCargo(idx)}
                                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div className="col-span-2">
                                                <label className="text-[10px] uppercase text-slate-400 font-bold">货物ID / 名称</label>
                                                <input 
                                                    type="text" 
                                                    value={item.name}
                                                    onChange={(e) => updateCargo(idx, 'name', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:border-indigo-500 outline-none"
                                                    placeholder="SKU-001"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-400 font-bold">数量 (件)</label>
                                                <input 
                                                    type="number" 
                                                    value={item.quantity}
                                                    onChange={(e) => updateCargo(idx, 'quantity', parseInt(e.target.value))}
                                                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase text-slate-400 font-bold">单件重量 (KG)</label>
                                                <input 
                                                    type="number" 
                                                    value={item.weight}
                                                    onChange={(e) => updateCargo(idx, 'weight', parseFloat(e.target.value))}
                                                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded border border-slate-100">
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-bold">长 (CM)</label>
                                                <input 
                                                    type="number" 
                                                    value={item.length}
                                                    onChange={(e) => updateCargo(idx, 'length', parseFloat(e.target.value))}
                                                    className="w-full border-b border-slate-200 text-sm focus:border-indigo-500 outline-none py-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-bold">宽 (CM)</label>
                                                <input 
                                                    type="number" 
                                                    value={item.width}
                                                    onChange={(e) => updateCargo(idx, 'width', parseFloat(e.target.value))}
                                                    className="w-full border-b border-slate-200 text-sm focus:border-indigo-500 outline-none py-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-bold">高 (CM)</label>
                                                <input 
                                                    type="number" 
                                                    value={item.height}
                                                    onChange={(e) => updateCargo(idx, 'height', parseFloat(e.target.value))}
                                                    className="w-full border-b border-slate-200 text-sm focus:border-indigo-500 outline-none py-1"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={item.canRotate}
                                                    onChange={(e) => updateCargo(idx, 'canRotate', e.target.checked)}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                                />
                                                <span className="text-xs text-slate-600">允许旋转</span>
                                            </label>
                                            <div className="flex-1"></div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400">颜色</span>
                                                <input 
                                                    type="color"
                                                    value={item.color}
                                                    onChange={(e) => updateCargo(idx, 'color', e.target.value)}
                                                    className="w-6 h-6 rounded cursor-pointer border-none p-0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={addCargo}
                                    className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" /> 添加新货物
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {containers.map((c, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg border transition-all ${c.enabled ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="checkbox" 
                                                    checked={c.enabled} 
                                                    onChange={(e) => updateContainer(idx, 'enabled', e.target.checked)}
                                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div>
                                                    <span className="font-bold text-sm text-slate-800 block">{c.name}</span>
                                                    <span className="text-[10px] text-slate-500 block">{c.length}x{c.width}x{c.height}cm</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-slate-400">单箱运费</span>
                                                <div className="flex items-center gap-1 text-slate-700 font-semibold">
                                                    <span className="text-xs">¥</span>
                                                    <input 
                                                        type="number"
                                                        value={c.cost}
                                                        onChange={(e) => updateContainer(idx, 'cost', parseFloat(e.target.value))}
                                                        className="w-20 text-right bg-transparent border-b border-slate-300 text-sm focus:border-indigo-500 outline-none hover:border-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded">
                                            <span>最大载重: {c.maxWeight / 1000} 吨</span>
                                            <span>体积: {((c.length * c.width * c.height) / 1000000).toFixed(1)} m³</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Stats Summary */}
                <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg bg-gradient-to-br from-indigo-900 to-slate-900">
                    <h3 className="text-xs font-bold text-indigo-200 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <Package className="w-4 h-4" /> 货物总览
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-3xl font-bold tracking-tight">{cargoList.reduce((acc, i) => acc + i.quantity, 0)}</div>
                            <div className="text-xs text-indigo-300 font-medium mt-1">总件数 (PCS)</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold tracking-tight">{(cargoList.reduce((acc, i) => acc + (i.weight * i.quantity), 0) / 1000).toFixed(2)}</div>
                            <div className="text-xs text-indigo-300 font-medium mt-1">总重量 (吨)</div>
                        </div>
                        <div className="col-span-2 border-t border-indigo-800 pt-4">
                             <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-3xl font-bold tracking-tight text-white">
                                        {cargoList.reduce((acc, i) => acc + ((i.length * i.width * i.height * i.quantity) / 1000000), 0).toFixed(2)} <span className="text-base font-normal text-indigo-300">m³</span>
                                    </div>
                                    <div className="text-xs text-indigo-300 font-medium mt-1">总体积</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-indigo-300 mb-1">预估需要</div>
                                    <div className="text-sm font-semibold text-white">
                                        ~{Math.ceil(cargoList.reduce((acc, i) => acc + ((i.length * i.width * i.height * i.quantity) / 1000000), 0) / 65)} 个 40HQ
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-8">
                {solutions.length > 0 ? (
                    <Results solutions={solutions} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200 min-h-[600px] p-8 text-center shadow-sm">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                             <Truck className="w-10 h-10 text-indigo-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">准备开始计算</h3>
                        <p className="max-w-md text-slate-500 leading-relaxed">
                            请在左侧配置货物清单和可用集装箱类型。<br/>
                            系统将为您生成“成本最低”和“效率最高”的两套对比方案。
                        </p>
                    </div>
                )}
            </div>
         </div>
      </main>
    </div>
  );
};

export default App;