import React, { useState } from 'react';
import { PackedContainer, PlacedItem } from '../types';
import { Maximize2, ArrowRight, ArrowDown } from 'lucide-react';

interface Props {
  container: PackedContainer;
}

export const Visualization: React.FC<Props> = ({ container }) => {
  const { length, width, height, name } = container.containerType;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Calculate colors for legend
  const itemColors = new Map<string, string>();
  container.items.forEach(item => itemColors.set(item.cargoId, item.color));

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative">
      {/* Toolbar / Header */}
      <div className="px-4 py-2 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
         <h3 className="font-bold text-slate-700 flex items-center gap-2">
           <Maximize2 className="w-4 h-4 text-indigo-500" />
           {name} 装载蓝图
         </h3>
         <div className="flex gap-3 text-[10px] text-slate-500">
            <div className="flex items-center gap-1">
               <div className="w-2 h-2 bg-slate-300 rounded-full"></div> 未选中
            </div>
            <div className="flex items-center gap-1">
               <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_4px_rgba(99,102,241,0.6)]"></div> 悬停高亮
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-100">
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            
            {/* 1. 俯视图 (TOP VIEW) - Floor Plan */}
            <BlueprintView 
               title="俯视图 (TOP VIEW) - 地板排布" 
               type="top"
               container={container}
               widthDim={length}
               heightDim={width}
               hoveredItem={hoveredItem}
               setHoveredItem={setHoveredItem}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. 侧视图 (SIDE VIEW) - Stacking */}
                <BlueprintView 
                    title="侧视图 (SIDE VIEW) - 堆叠高度" 
                    type="side"
                    container={container}
                    widthDim={length}
                    heightDim={height}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                />

                {/* 3. 后视图 (REAR VIEW) - Section */}
                <BlueprintView 
                    title="后视图 (REAR VIEW) - 车门截面" 
                    type="rear"
                    container={container}
                    widthDim={width}
                    heightDim={height}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                />
            </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredItem && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl pointer-events-none backdrop-blur-sm z-50 border border-white/10">
              选中货物 ID: <span className="text-yellow-400 font-bold ml-1">{hoveredItem}</span>
          </div>
      )}
    </div>
  );
};

interface ViewProps {
    title: string;
    type: 'top' | 'side' | 'rear';
    container: PackedContainer;
    widthDim: number;
    heightDim: number;
    hoveredItem: string | null;
    setHoveredItem: (id: string | null) => void;
}

const BlueprintView: React.FC<ViewProps> = ({ title, type, container, widthDim, heightDim, hoveredItem, setHoveredItem }) => {
    // Calculate Aspect Ratio for container display
    // We fix width to 100% and calculate height
    const aspectRatio = heightDim / widthDim;
    const pctHeight = `${aspectRatio * 100}%`;

    return (
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</span>
                <span className="text-[10px] text-slate-400 font-mono">{widthDim}cm x {heightDim}cm</span>
            </div>
            
            <div className="relative w-full bg-slate-50 overflow-hidden rounded border border-slate-200" style={{ paddingBottom: pctHeight }}>
                <div className="absolute inset-0">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 opacity-[0.05]" 
                         style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    </div>

                    {/* Axis Labels */}
                    <div className="absolute bottom-1 left-2 text-[9px] text-slate-400 font-mono z-10">0,0</div>
                    {type === 'top' && (
                         <>
                            <div className="absolute top-1/2 -right-6 rotate-90 text-[9px] text-slate-400 font-bold flex items-center gap-1 origin-center w-20 justify-center"><ArrowRight className="w-3 h-3" /> 宽 (W)</div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 font-bold flex items-center gap-1"><ArrowRight className="w-3 h-3" /> 长 (L)</div>
                            <div className="absolute right-2 top-1 text-[9px] text-slate-400 font-bold">车门</div>
                            <div className="absolute left-2 top-1 text-[9px] text-slate-400 font-bold">车头</div>
                         </>
                    )}
                    {type === 'side' && (
                         <>
                            <div className="absolute top-1/2 -left-6 -rotate-90 text-[9px] text-slate-400 font-bold flex items-center gap-1 origin-center w-20 justify-center"><ArrowRight className="w-3 h-3" /> 高 (H)</div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 font-bold flex items-center gap-1"><ArrowRight className="w-3 h-3" /> 长 (L)</div>
                            <div className="absolute right-2 bottom-1 text-[9px] text-slate-400 font-bold">车门</div>
                            <div className="absolute left-2 bottom-1 text-[9px] text-slate-400 font-bold">车头</div>
                         </>
                    )}

                    {/* Items */}
                    {container.items.map((item, idx) => {
                        const isHovered = hoveredItem === item.cargoId;
                        
                        // Calculate Position %
                        let left = 0, top = 0, w = 0, h = 0;
                        
                        if (type === 'top') {
                            // X (Length) -> Left, Z (Width) -> Top
                            // Z is width in packer terms. Top of chart is Z=0 (Right Wall) or Z=Width (Left Wall)?
                            // Let's assume Z=0 is top.
                            left = (item.x / widthDim) * 100;
                            top = (item.z / heightDim) * 100;
                            w = (item.length / widthDim) * 100;
                            h = (item.width / heightDim) * 100;
                        } else if (type === 'side') {
                            // X (Length) -> Left, Y (Height) -> Bottom
                            // HTML coords: Top is Y=0. We need to invert Y.
                            left = (item.x / widthDim) * 100;
                            // item.y is from bottom. 
                            // CSS top = 100% - (y + height) / H * 100
                            const yTop = item.y + item.height;
                            top = 100 - (yTop / heightDim) * 100;
                            w = (item.length / widthDim) * 100;
                            h = (item.height / heightDim) * 100;
                        } else if (type === 'rear') {
                             // Z (Width) -> Left, Y (Height) -> Bottom
                             left = (item.z / widthDim) * 100;
                             const yTop = item.y + item.height;
                             top = 100 - (yTop / heightDim) * 100;
                             w = (item.width / widthDim) * 100;
                             h = (item.height / heightDim) * 100;
                        }

                        return (
                            <div
                                key={`${item.cargoId}-${idx}`}
                                onMouseEnter={() => setHoveredItem(item.cargoId)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className="absolute transition-all duration-200 border border-slate-900/20 flex items-center justify-center overflow-hidden group hover:z-20"
                                style={{
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    width: `${w}%`,
                                    height: `${h}%`,
                                    backgroundColor: item.color,
                                    opacity: hoveredItem ? (isHovered ? 1 : 0.2) : 0.9,
                                    boxShadow: isHovered ? '0 0 0 2px #fff, 0 0 0 4px #6366f1' : 'none',
                                    zIndex: isHovered ? 10 : 1
                                }}
                            >
                                {w > 5 && h > 10 && (
                                    <span className="text-[8px] font-bold text-slate-900/70 truncate px-0.5 select-none group-hover:text-black">
                                        {item.cargoId}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}