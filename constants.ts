import { CargoItem, CargoType, ContainerType } from './types';

export const DEFAULT_CONTAINERS: ContainerType[] = [
  {
    id: '20GP',
    name: '20GP (标准箱)',
    length: 589,
    width: 235,
    height: 239,
    maxWeight: 28000,
    cost: 3000, // 约 $420
    enabled: true,
  },
  {
    id: '40GP',
    name: '40GP (大柜)',
    length: 1203,
    width: 235,
    height: 239,
    maxWeight: 28000,
    cost: 4500, // 约 $630
    enabled: true,
  },
  {
    id: '40HQ',
    name: '40HQ (高柜)',
    length: 1203,
    width: 235,
    height: 269,
    maxWeight: 28500,
    cost: 5200, // 约 $730
    enabled: true,
  },
];

export const DEFAULT_CARGO: CargoItem[] = [
  {
    id: 'SKU-001',
    name: '标准纸箱 A (轻)',
    length: 50,
    width: 40,
    height: 30,
    weight: 10,
    quantity: 80,
    canRotate: true,
    type: CargoType.CARTON,
    priority: 'Low', // Inside
    color: '#60a5fa', // Blue-400
  },
  {
    id: 'SKU-002',
    name: '重型底座 B (沉底)',
    length: 100,
    width: 100,
    height: 50,
    weight: 500, // Very Heavy - Should be at bottom
    quantity: 4,
    canRotate: false,
    type: CargoType.CRATE,
    priority: 'Low', // Inside
    color: '#475569', // Slate-600 (Dark Grey)
  },
  {
    id: 'SKU-003',
    name: '长条配件 C',
    length: 120,
    width: 30,
    height: 30,
    weight: 15,
    quantity: 30,
    canRotate: true,
    type: CargoType.CARTON,
    priority: 'Medium', 
    color: '#34d399', // Emerald-400
  },
    {
    id: 'SKU-004',
    name: '急件 D (门口)',
    length: 40,
    width: 40,
    height: 40,
    weight: 8,
    quantity: 12,
    canRotate: true,
    type: CargoType.CARTON,
    priority: 'High', // Door
    color: '#f87171', // Red-400
  },
];