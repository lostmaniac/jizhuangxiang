import { CargoItem, ContainerType, PackedContainer, PlacedItem, Solution } from '../types';

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

interface Point {
  x: number;
  y: number;
  z: number;
}

interface Dimensions {
  length: number;
  width: number;
  height: number;
}

/**
 * Logistics Packer 3.0 - Anchor Point Based Heuristic
 * 核心策略:
 * 1. 锚点搜索 (Anchor Search): 维护一个潜在放置点集合，每次放置后生成新锚点。
 * 2. 严格排序 (Sorting): 优先级 -> 重量 -> 尺寸。
 * 3. 支撑检测 (Support Check): 确保悬空货物有足够的底部支撑。
 * 4. 由内向外 (Inside-Out): 优先选择 X 坐标小的锚点。
 */
export const generateSolutions = (
  cargoList: CargoItem[],
  availableContainers: ContainerType[]
): Solution[] => {
  const solutions: Solution[] = [];

  // 预处理货物：展开数量为单独的个体
  const allItems: CargoItem[] = [];
  cargoList.forEach(c => {
    for (let i = 0; i < c.quantity; i++) {
      allItems.push({ ...c, quantity: 1, id: `${c.id}` }); // Unique ID for processing
    }
  });

  // 定义优先级数值 (越小越优先)
  const priorityVal = (p: string) => {
      if (p === 'Low') return 1;    // 最先装 (里)
      if (p === 'Medium') return 2;
      if (p === 'High') return 3;   // 最后装 (门口)
      return 2;
  };

  // 全局排序：决定尝试装箱的顺序
  // 1. 优先级 (Low -> High)
  // 2. 重量 (Heavy -> Light) - 确保重物先被考虑，放在底部
  // 3. 体积 (Large -> Small) - 大件难装，先处理
  const sortedCargo = allItems.sort((a, b) => {
     const pA = priorityVal(a.priority);
     const pB = priorityVal(b.priority);
     if (pA !== pB) return pA - pB; 
     
     if (b.weight !== a.weight) return b.weight - a.weight;
     
     const volA = a.length * a.width * a.height;
     const volB = b.length * b.width * b.height;
     return volB - volA;
  });

  const strategies = [
    { 
      id: 'COST_SAVER',
      name: '方案一：总成本最小化 (推荐)', 
      desc: '优先使用性价比高的箱型。',
      sortContainers: (containers: ContainerType[]) => {
         return [...containers].sort((a, b) => {
             const volA = a.length * a.width * a.height;
             const volB = b.length * b.width * b.height;
             // Cost per CBM
             return (a.cost / volA) - (b.cost / volB);
         });
      }
    },
    { 
      id: 'OPERATION_EFFICIENCY',
      name: '方案二：操作效率优先', 
      desc: '优先使用大箱，减少箱数。',
      sortContainers: (containers: ContainerType[]) => {
         return [...containers].sort((a, b) => {
             const volA = a.length * a.width * a.height;
             const volB = b.length * b.width * b.height;
             return volB - volA;
         });
      }
    }
  ];

  strategies.forEach((strat) => {
    const packedContainers: PackedContainer[] = [];
    let itemsToPack = clone(sortedCargo); // Copy for this strategy
    let totalCost = 0;
    
    const sortedContainerTypes = strat.sortContainers(availableContainers);

    let safetyBreak = 0;
    // 循环直到所有货物装完或无法继续
    while (itemsToPack.length > 0 && safetyBreak < 500) {
      safetyBreak++;
      
      // 尝试所有箱型，看哪个能装载当前剩余货物中优先级最高且装载率最好的
      // 简化逻辑：直接取当前策略排序第一的箱型 (贪婪)
      const containerType = sortedContainerTypes[0];
      
      // 执行单箱装载
      const result = packSingleContainer(containerType, itemsToPack);

      if (result.items.length > 0) {
        packedContainers.push(result);
        totalCost += containerType.cost;

        // 从待装列表中移除已装载的货物 (使用 _uid 识别实例)
        // Note: packSingleContainer returns Items with the ORIGINAL CargoID.
        // This makes it hard to distinguish duplicates if we rely on cargoID.
        // However, packSingleContainer consumes items from the front of the sorted list based on logic.
        // Wait, packSingleContainer does NOT mutate input list. It returns placedItems.
        
        // We need to know EXACTLY which items (instances) were packed.
        // The simple greedy approach: for each placed item, remove ONE instance of that SKU from itemsToPack.
        
        const packedCounts: Record<string, number> = {};
        result.items.forEach(pi => {
            packedCounts[pi.cargoId] = (packedCounts[pi.cargoId] || 0) + 1;
        });
        
        const remaining: CargoItem[] = [];
        // Re-build remaining list
        // Since `itemsToPack` is sorted, we iterate and skip packed ones.
        // NOTE: This relies on items being interchangeable if they have same ID.
        const consumedCounts: Record<string, number> = {};
        
        for (const item of itemsToPack) {
            const packedNeeded = packedCounts[item.id] || 0;
            const packedAlready = consumedCounts[item.id] || 0;
            
            if (packedAlready < packedNeeded) {
                consumedCounts[item.id] = packedAlready + 1;
            } else {
                remaining.push(item);
            }
        }
        itemsToPack = remaining;
        
      } else {
        // 当前最大的箱子都装不进剩余的任何一件货物（可能是超大件）
        break; 
      }
    }

    // Stats
    const totalVol = packedContainers.reduce((acc, c) => acc + c.containerType.length * c.containerType.width * c.containerType.height, 0);
    const usedVol = packedContainers.reduce((acc, c) => acc + c.utilizationVolume, 0);
    const totalWeight = packedContainers.reduce((acc, c) => acc + c.totalWeight, 0);

    solutions.push({
      id: strat.id,
      name: strat.name,
      containers: packedContainers,
      totalCost: totalCost,
      totalVolumeUtil: totalVol > 0 ? usedVol / totalVol : 0,
      totalWeightUtil: totalWeight, 
      unpackedItems: aggregateUnpacked(itemsToPack),
    });
  });

  return solutions;
};

const aggregateUnpacked = (items: CargoItem[]) => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
        // item.id is the CargoID (SKU)
        counts[item.id] = (counts[item.id] || 0) + 1;
    });
    return Object.entries(counts).map(([id, quantity]) => ({
        cargoId: id,
        quantity
    }));
};

/**
 * 单箱装载核心算法 (Anchor Point Algorithm)
 */
const packSingleContainer = (container: ContainerType, items: CargoItem[]): PackedContainer => {
    // 1. 为每个待装项生成临时唯一 ID，以免混淆
    const workingItems = items.map((item, idx) => ({
        ...item,
        _uid: `${item.id}_${idx}`
    }));

    const placedItems: PlacedItem[] = [];
    let currentWeight = 0;
    let currentVolume = 0;

    // 锚点集合: 初始点 (0,0,0)
    let anchors: Point[] = [{ x: 0, y: 0, z: 0 }];

    // 用于碰撞检测的辅助函数
    const checkCollision = (x: number, y: number, z: number, l: number, w: number, h: number) => {
        // 1. 容器边界检查
        if (x + l > container.length) return true;
        if (y + h > container.height) return true;
        if (z + w > container.width) return true;

        // 2. 物品碰撞检查
        for (const item of placedItems) {
            if (
                x < item.x + item.length &&
                x + l > item.x &&
                y < item.y + item.height &&
                y + h > item.y &&
                z < item.z + item.width &&
                z + w > item.z
            ) {
                return true;
            }
        }
        return false;
    };

    // 支撑力检测 (简单版: 底部必须有 > 60% 的面积被支撑，或者在地面 y=0)
    const checkSupport = (x: number, y: number, z: number, l: number, w: number) => {
        if (y === 0) return true; // 地面

        let supportedArea = 0;
        const myArea = l * w;
        const checkHeight = y; // 我们检查紧贴着下方的平面

        for (const item of placedItems) {
            // 检查 item 是否在当前放置位置的正下方
            // item 的顶部必须大约等于 y
            if (Math.abs((item.y + item.height) - checkHeight) > 0.1) continue;

            // 计算重叠面积 (2D Intersection)
            const intersectX = Math.max(0, Math.min(x + l, item.x + item.length) - Math.max(x, item.x));
            const intersectZ = Math.max(0, Math.min(z + w, item.z + item.width) - Math.max(z, item.z));

            supportedArea += (intersectX * intersectZ);
        }

        return (supportedArea / myArea) > 0.6; // 60% 支撑
    };

    // 遍历所有货物 (First Fit)
    for (const item of workingItems) {
        if (currentWeight + item.weight > container.maxWeight) continue;

        let bestAnchor: Point | null = null;
        let bestOrientation = { l: item.length, w: item.width, h: item.height, rotated: false };
        let bestScore = Infinity;

        // 对锚点进行排序，优先填满内部 (X), 底部 (Y), 左侧 (Z)
        anchors.sort((a, b) => {
             if (Math.abs(a.x - b.x) > 0.1) return a.x - b.x;
             if (Math.abs(a.y - b.y) > 0.1) return a.y - b.y;
             return a.z - b.z;
        });

        for (const anchor of anchors) {
            
            // 尝试两种方向 (如果允许旋转)
            // Orientation 1: Standard
            const orientations = [
                { l: item.length, w: item.width, h: item.height, rotated: false }
            ];
            if (item.canRotate) {
                // Orientation 2: Rotated 90 deg (Swap L & W)
                orientations.push({ l: item.width, w: item.length, h: item.height, rotated: true });
            }

            for (const orient of orientations) {
                // 1. 检查是否碰撞/越界
                if (!checkCollision(anchor.x, anchor.y, anchor.z, orient.l, orient.w, orient.h)) {
                    // 2. 检查是否有支撑
                    if (checkSupport(anchor.x, anchor.y, anchor.z, orient.l, orient.w)) {
                        // 3. 评分 (Score) - 越小越好
                        // 策略：优先 X (Inside), 次优先 Y (Bottom), 再次 Z (Left)
                        const score = anchor.x * 10000 + anchor.y * 100 + anchor.z;
                        
                        if (score < bestScore) {
                            bestScore = score;
                            bestAnchor = anchor;
                            bestOrientation = orient;
                        }
                    }
                }
            }
            if (bestAnchor !== null) break; // 贪婪：找到第一个能放的点就放
        }

        // 如果找到了放置点
        if (bestAnchor) {
            placedItems.push({
                cargoId: item.id, // Restore original ID
                x: bestAnchor.x,
                y: bestAnchor.y,
                z: bestAnchor.z,
                length: bestOrientation.l,
                width: bestOrientation.w,
                height: bestOrientation.h,
                rotation: bestOrientation.rotated,
                color: item.color
            });
            
            // 更新统计
            currentWeight += item.weight;
            currentVolume += (bestOrientation.l * bestOrientation.w * bestOrientation.h);

            // 生成新锚点
            // 1. 顶部锚点
            anchors.push({ x: bestAnchor.x, y: bestAnchor.y + bestOrientation.h, z: bestAnchor.z });
            // 2. 右侧锚点 (X方向 - 向外)
            anchors.push({ x: bestAnchor.x + bestOrientation.l, y: bestAnchor.y, z: bestAnchor.z });
            // 3. 前侧锚点 (Z方向 - 向宽)
            anchors.push({ x: bestAnchor.x, y: bestAnchor.y, z: bestAnchor.z + bestOrientation.w });

            // 优化锚点列表
            // 1. 移除越界锚点
            // 2. 移除位于已有物品内部的锚点
            anchors = anchors.filter(p => {
                if (p.x >= container.length || p.y >= container.height || p.z >= container.width) return false;
                
                // 检查点是否在任何物品内部 (Tolerance 0.1)
                for (const pi of placedItems) {
                    if (
                        p.x >= pi.x && p.x < pi.x + pi.length &&
                        p.y >= pi.y && p.y < pi.y + pi.height &&
                        p.z >= pi.z && p.z < pi.z + pi.width
                    ) {
                        return false;
                    }
                }
                return true;
            });
            
            // 3. 合并非常接近的锚点 (去重)
            const uniqueAnchors: Point[] = [];
            anchors.forEach(p => {
                if (!uniqueAnchors.some(u => Math.abs(u.x - p.x) < 0.1 && Math.abs(u.y - p.y) < 0.1 && Math.abs(u.z - p.z) < 0.1)) {
                    uniqueAnchors.push(p);
                }
            });
            anchors = uniqueAnchors;

        } else {
             // 放不下，跳过该物品 (First Fit 尝试下一个)
        }
    }
    
    return {
        containerType: container,
        items: placedItems,
        totalWeight: currentWeight,
        totalVolume: container.length * container.width * container.height,
        utilizationVolume: currentVolume,
        utilizationWeight: currentWeight,
        containerId: `CN-${Math.floor(Math.random()*100000)}`
    };
};