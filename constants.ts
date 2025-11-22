import { CargoItem, CargoType, ContainerType } from './types';

export const DEFAULT_CONTAINERS: ContainerType[] = [
  {
    id: '20GP',
    name: '20GP (标准箱)',
    length: 589,
    width: 235,
    height: 239,
    maxWeight: 28000,
    cost: 8500, // RMB Example
    enabled: true,
  },
  {
    id: '40GP',
    name: '40GP (大柜)',
    length: 1203,
    width: 235,
    height: 239,
    maxWeight: 28000,
    cost: 14000, // RMB Example
    enabled: true,
  },
  {
    id: '40HQ',
    name: '40HQ (高柜)',
    length: 1203,
    width: 235,
    height: 269,
    maxWeight: 28500,
    cost: 16000, // RMB Example
    enabled: true,
  },
];

export const DEFAULT_CARGO: CargoItem[] = [
  {
    id: 'SKU-001',
    name: '标准纸箱 A',
    length: 60,
    width: 40,
    height: 40,
    weight: 15,
    quantity: 450,
    canRotate: true,
    type: CargoType.CARTON,
    priority: 'Low',
    color: '#3b82f6',
  },
  {
    id: 'SKU-002',
    name: '重型配件 B',
    length: 80,
    width: 60,
    height: 50,
    weight: 45,
    quantity: 50,
    canRotate: false,
    type: CargoType.CRATE,
    priority: 'Medium',
    color: '#ef4444',
  },
  {
    id: 'SKU-003',
    name: '长管件 C',
    length: 200,
    width: 20,
    height: 20,
    weight: 10,
    quantity: 100,
    canRotate: true,
    type: CargoType.IRREGULAR,
    priority: 'High',
    color: '#10b981',
  },
];