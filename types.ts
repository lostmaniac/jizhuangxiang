export enum CargoType {
  CARTON = 'Carton',
  PALLET = 'Pallet',
  DRUM = 'Drum',
  CRATE = 'Crate',
  IRREGULAR = 'Irregular',
}

export interface CargoItem {
  id: string;
  name: string;
  length: number; // cm
  width: number; // cm
  height: number; // cm
  weight: number; // kg
  quantity: number;
  canRotate: boolean;
  type: CargoType;
  priority: 'High' | 'Medium' | 'Low';
  color: string;
}

export interface ContainerType {
  id: string;
  name: string; // e.g., 20GP
  length: number; // cm
  width: number; // cm
  height: number; // cm
  maxWeight: number; // kg
  cost: number; // currency
  enabled: boolean;
}

export interface PlacedItem {
  cargoId: string;
  x: number;
  y: number;
  z: number;
  width: number;
  length: number;
  height: number;
  rotation: boolean; // true if rotated 90 degrees on floor
  color: string;
}

export interface PackedContainer {
  containerType: ContainerType;
  items: PlacedItem[];
  totalWeight: number;
  totalVolume: number;
  utilizationVolume: number;
  utilizationWeight: number;
  containerId: string;
}

export interface Solution {
  id: string;
  name: string;
  containers: PackedContainer[];
  totalCost: number;
  totalVolumeUtil: number;
  totalWeightUtil: number;
  unpackedItems: { cargoId: string; quantity: number }[];
  aiAnalysis?: string; // Markdown content from Gemini
}
