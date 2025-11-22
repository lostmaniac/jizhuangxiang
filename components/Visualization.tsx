import React, { useState } from 'react';
import { PackedContainer } from '../types';
import { Box, Rotate3d, Eye, Layers } from 'lucide-react';

interface Props {
  container: PackedContainer;
}

export const Visualization: React.FC<Props> = ({ container }) => {
  const [viewMode, setViewMode] = useState<'3d' | 'top' | 'side'>('3d');
  const [rotation, setRotation] = useState(45);

  const { length, width, height, name } = container.containerType;
  
  // Scale factor to fit in view
  const scale = 0.5;

  const containerStyle = {
    width: length * scale,
    height: height * scale,
    depth: width * scale,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-600" />
            {name} 3D 装载图
            </h3>
            <span className="text-xs text-slate-400 px-2 border-l border-slate-300">
                {length} x {width} x {height} cm
            </span>
        </div>
        <div className="flex gap-1 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              viewMode === '3d' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Rotate3d className="w-3 h-3" /> 3D 透视
          </button>
          <button
             onClick={() => setViewMode('top')}
             className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
               viewMode === 'top' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:text-slate-700'
             }`}
          >
            <Layers className="w-3 h-3" /> 俯视
          </button>
          <button
             onClick={() => setViewMode('side')}
             className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
               viewMode === 'side' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:text-slate-700'
             }`}
          >
            <Eye className="w-3 h-3" /> 侧视
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[400px] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200 overflow-hidden relative shadow-inner">
        {/* Controls for 3D */}
        {viewMode === '3d' && (
          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <button 
              onClick={() => setRotation(r => r - 15)}
              className="p-2 bg-white rounded-full shadow text-slate-600 hover:text-indigo-600 transition-colors"
              title="向左旋转"
            >
              <Rotate3d className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setRotation(r => r + 15)}
              className="p-2 bg-white rounded-full shadow text-slate-600 hover:text-indigo-600 transition-colors"
              title="向右旋转"
            >
              <Rotate3d className="w-5 h-5 -scale-x-100" />
            </button>
          </div>
        )}

        {/* The Scene */}
        <div 
          className="perspective-1000 relative transition-all duration-500"
          style={{ 
            width: containerStyle.width, 
            height: containerStyle.height 
          }}
        >
          {/* The Container Box */}
          <div
            className="transform-style-3d relative transition-transform duration-500 ease-out"
            style={{
              width: '100%',
              height: '100%',
              transform: viewMode === '3d' 
                ? `rotateX(-20deg) rotateY(${rotation}deg)` 
                : viewMode === 'top' 
                  ? 'rotateX(90deg)' 
                  : 'rotateY(0deg)', 
            }}
          >
            {/* Walls */}
            <div className="absolute inset-0 border-2 border-slate-400/50 bg-slate-100/10 pointer-events-none box-border backdrop-blur-[1px]" style={{ transform: `translateZ(${containerStyle.depth / 2}px)` }}></div>
            <div className="absolute inset-0 border-2 border-slate-400/50 bg-slate-100/10 pointer-events-none box-border backdrop-blur-[1px]" style={{ transform: `translateZ(-${containerStyle.depth / 2}px)` }}></div>
            
            {/* Floor */}
            <div 
                className="absolute bg-slate-200/50 border border-slate-300 grid-pattern" 
                style={{ 
                    width: containerStyle.width, 
                    height: containerStyle.depth, 
                    transform: `rotateX(90deg) translateZ(-${containerStyle.height / 2}px)`,
                    transformOrigin: 'bottom'
                }} 
            />

            {/* Items */}
            {container.items.map((item, idx) => {
               const w = item.length * scale;
               const h = item.height * scale;
               const d = item.width * scale;
               
               const x = (item.x * scale);
               const y = (item.y * scale);
               const z = (item.z * scale); 

               return (
                 <div
                    key={idx}
                    className="absolute border border-black/20 hover:border-white transition-all cursor-pointer group shadow-sm"
                    style={{
                        width: w,
                        height: h,
                        backgroundColor: item.color,
                        opacity: 0.95,
                        left: 0,
                        bottom: 0,
                        transformOrigin: 'bottom left',
                        transform: `
                           translateX(${x}px) 
                           translateY(${-y}px)
                           translateZ(${z - (containerStyle.depth/2)}px) 
                        `,
                    }}
                 >
                    {/* Tooltip */}
                    <div className="hidden group-hover:block absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-2 rounded shadow-xl z-50 whitespace-nowrap pointer-events-none">
                        <div className="font-bold mb-0.5">{item.cargoId}</div>
                        <div>{item.length}x{item.width}x{item.height}cm</div>
                    </div>

                    {/* Side Face (Right) */}
                    <div 
                        className="absolute top-0 right-0 h-full bg-black/10"
                        style={{ width: d, transform: `rotateY(90deg) translateZ(${d/2}px)`, transformOrigin: 'right' }}
                    />
                    {/* Top Face */}
                    <div 
                        className="absolute top-0 left-0 w-full bg-white/20"
                        style={{ height: d, transform: `rotateX(90deg) translateZ(${d/2}px)`, transformOrigin: 'top' }}
                    />
                 </div>
               );
            })}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-xs text-slate-500 mt-3">
         <div className="text-center bg-slate-50 p-2 rounded border border-slate-100">
            长: {length} cm
         </div>
         <div className="text-center bg-slate-50 p-2 rounded border border-slate-100">
            高: {height} cm
         </div>
         <div className="text-center bg-slate-50 p-2 rounded border border-slate-100">
            宽: {width} cm
         </div>
      </div>
    </div>
  );
};