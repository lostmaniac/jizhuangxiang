import { CargoItem, ContainerType, PackedContainer, PlacedItem, Solution } from '../types';

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Logistics Packer 2.0
 * Supports:
 * 1. SKU Concentration (Group by ID)
 * 2. Cost Optimization Strategy
 * 3. Operational Efficiency Strategy
 */
export const generateSolutions = (
  cargoList: CargoItem[],
  availableContainers: ContainerType[]
): Solution[] => {
  const solutions: Solution[] = [];

  // 1. Prepare Items: Flatten but KEEP SORTED BY SKU to ensure "Concentration Principle"
  // Sort Cargo List by Priority (High first) -> Then by Volume (Big first)
  const sortedCargo = [...cargoList].sort((a, b) => {
     if (a.priority === 'High' && b.priority !== 'High') return -1;
     if (b.priority === 'High' && a.priority !== 'High') return 1;
     return (b.length * b.width * b.height) - (a.length * a.width * a.height);
  });

  let allItemsFlattened: CargoItem[] = [];
  sortedCargo.forEach(c => {
    for (let i = 0; i < c.quantity; i++) {
      allItemsFlattened.push({ ...c, quantity: 1, id: `${c.id}` }); // Keep ID clean for grouping logic
    }
  });

  // Strategy Definitions
  const strategies = [
    { 
      id: 'COST_SAVER',
      name: '方案一：总成本最小化 (推荐)', 
      desc: '优先使用性价比较高的箱型，即使增加操作复杂度。',
      sortContainers: (containers: ContainerType[]) => {
         // Sort by Cost per Cubic Meter (Ascending) -> Cheapest per volume first
         return [...containers].sort((a, b) => {
             const volA = a.length * a.width * a.height;
             const volB = b.length * b.width * b.height;
             return (a.cost / volA) - (b.cost / volB);
         });
      }
    },
    { 
      id: 'OPERATION_EFFICIENCY',
      name: '方案二：操作效率优先', 
      desc: '优先使用大容量箱型，减少集装箱数量，便于管理。',
      sortContainers: (containers: ContainerType[]) => {
         // Sort by Volume (Descending) -> Largest box first
         return [...containers].sort((a, b) => {
             const volA = a.length * a.width * a.height;
             const volB = b.length * b.width * b.height;
             return volB - volA;
         });
      }
    }
  ];

  strategies.forEach((strat, idx) => {
    const packedContainers: PackedContainer[] = [];
    let itemsToPack = clone(allItemsFlattened);
    let totalCost = 0;
    
    // Sort containers based on strategy
    const sortedContainers = strat.sortContainers(availableContainers);

    let safetyBreak = 0;
    while (itemsToPack.length > 0 && safetyBreak < 50) {
      safetyBreak++;
      
      // Try to fit remaining items into the best available container
      // We iterate through sorted containers and pick the first one that fits a "decent" amount 
      // OR just pick the top one if we assume greedy approach.
      // For this heuristic: Pick the top ranked container.
      const targetContainer = sortedContainers[0];

      const result = packSingleContainer(targetContainer, itemsToPack);
      
      if (result.items.length > 0) {
        packedContainers.push(result);
        totalCost += targetContainer.cost;
        
        // Remove packed items
        // Logic: We need to remove specifically the items packed. 
        // Since we have duplicate IDs (SKUs), we need to be careful.
        // The pack function returns the items with their specific instance data.
        
        // Count how many of each SKU were packed
        const packedCounts = result.items.reduce((acc, item) => {
            acc[item.cargoId] = (acc[item.cargoId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Remove from main list
        const nextItems: CargoItem[] = [];
        const seenCounts: Record<string, number> = {};
        
        for (const item of itemsToPack) {
            const packedLimit = packedCounts[item.id] || 0;
            const seen = seenCounts[item.id] || 0;
            
            if (seen < packedLimit) {
                seenCounts[item.id] = seen + 1;
            } else {
                nextItems.push(item);
            }
        }
        itemsToPack = nextItems;

      } else {
        // Cannot fit anything into the largest/best container? 
        // Try smaller containers? Or just break.
        // If the biggest container can't fit the item, nothing can (assuming strict dim constraints).
        break; 
      }
    }

    // Calculate Stats
    const totalVol = packedContainers.reduce((acc, c) => acc + c.containerType.length * c.containerType.width * c.containerType.height, 0);
    const usedVol = packedContainers.reduce((acc, c) => acc + c.utilizationVolume, 0);
    const totalWeight = packedContainers.reduce((acc, c) => acc + c.totalWeight, 0);

    solutions.push({
      id: strat.id,
      name: strat.name,
      containers: packedContainers,
      totalCost: totalCost,
      totalVolumeUtil: totalVol > 0 ? usedVol / totalVol : 0,
      totalWeightUtil: 0, 
      unpackedItems: aggregateUnpacked(itemsToPack),
    });
  });

  return solutions;
};

const aggregateUnpacked = (items: CargoItem[]) => {
    const map = new Map<string, number>();
    items.forEach(i => {
        map.set(i.id, (map.get(i.id) || 0) + 1);
    });
    return Array.from(map.entries()).map(([id, qty]) => ({ cargoId: id, quantity: qty }));
};

// Simplified Layer/Shelf Packing Algorithm
// This attempts to pack items closely.
const packSingleContainer = (container: ContainerType, items: CargoItem[]): PackedContainer => {
    const placed: PlacedItem[] = [];
    let currentWeight = 0;
    let usedVol = 0;
    
    // Cursors
    let x = 0;
    let y = 0;
    let z = 0;
    
    let rowMaxH = 0; // Max height in current row (along X)
    let layerMaxZ = 0; // Max depth in current layer (along Y)

    // Items are already sorted by SKU in the main loop.
    // This naturally adheres to "Concentration Principle".
    
    // Optimization: We can re-sort the *current batch* slightly to fit gaps?
    // No, user wants strict SKU grouping. Keep order.
    
    for (const item of items) {
        if (currentWeight + item.weight > container.maxWeight) continue;

        // Determine dimensions (Basic rotation logic: Lay flat if possible)
        let l = item.length;
        let w = item.width;
        let h = item.height;

        if (item.canRotate) {
            // Try to align longest dimension with X (Length of container)
            const dims = [l, w, h].sort((a, b) => b - a);
            l = dims[0];
            w = dims[1];
            h = dims[2];
        }

        // Simple First Fit Shelf Algo
        // 1. Try current position
        if (x + l > container.length) {
            // New Row
            x = 0;
            y += rowMaxH; // Move UP in height (Standard Pallet racking logic)
            // OR
            // Standard Container Packing:
            // Fill Floor (X then Z), then Stack (Y).
            // Let's do: Fill Row (X), then Next Strip (Z), then Next Layer (Y).
            
            // Re-logic:
            // X axis: Length of container
            // Z axis: Width of container
            // Y axis: Height of container
            
            // Current approach:
            // Fill X until full.
            // Then increment Z (Depth).
            // If Z full, increment Y (Height).
        }
    }

    // RESTART with correct X-Z-Y Loop
    // Clear vars
    x=0; y=0; z=0;
    let rowMaxZ = 0; // Max width used in this X-row
    let layerMaxY = 0; // Max height used in this floor layer

    for (const item of items) {
        if (currentWeight + item.weight > container.maxWeight) continue;

        let l = item.length;
        let w = item.width;
        let h = item.height;

        // Rotation Preference: Align L with Container L
        if (item.canRotate) {
             // Naive rotation: Put longest side on X
             const dims = [item.length, item.width, item.height].sort((a, b) => b - a);
             l = dims[0];
             w = dims[1];
             h = dims[2];
        }

        // Check Bounds
        if (x + l > container.length) {
            // End of row, move back in Z
            x = 0;
            z += rowMaxZ;
            rowMaxZ = 0;
        }

        if (z + w > container.width) {
            // Floor layer full, move up in Y
            x = 0;
            z = 0;
            rowMaxZ = 0;
            y += layerMaxY;
            layerMaxY = 0;
        }

        if (y + h > container.height) {
            // Container completely full
            continue; // Skip this item, try next (maybe smaller?) or stop?
            // If strict grouping, we should probably stop if we break a group.
            // But for filling gaps, we continue.
        }

        // Place Item
        placed.push({
            cargoId: item.id,
            x, y, z,
            length: l, width: w, height: h,
            rotation: false, // Simplified visual rotation
            color: item.color
        });

        // Update State
        currentWeight += item.weight;
        usedVol += (l * w * h);
        x += l;
        
        // Update max dimensions for next cursors
        rowMaxZ = Math.max(rowMaxZ, w);
        layerMaxY = Math.max(layerMaxY, h);
    }

    return {
        containerType: container,
        items: placed,
        totalWeight: currentWeight,
        totalVolume: container.length * container.width * container.height,
        utilizationVolume: usedVol,
        utilizationWeight: currentWeight,
        containerId: `CN-${Math.floor(Math.random()*10000)}`
    };
};