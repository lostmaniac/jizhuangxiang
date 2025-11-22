import { GoogleGenAI } from "@google/genai";
import { Solution } from "../types";

const API_KEY = process.env.API_KEY || ''; 

export const analyzeSolution = async (solutions: Solution[]): Promise<string> => {
  if (!API_KEY) {
    return "API Key 未配置。请检查环境变量。";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const summary = solutions.slice(0, 2).map((s, idx) => `
    ${s.name} (ID: ${s.id})
    - 总运费成本: ¥${s.totalCost.toLocaleString()}
    - 使用集装箱: ${s.containers.length} 个 (${s.containers.map(c => c.containerType.name).join(', ')})
    - 平均体积利用率: ${(s.totalVolumeUtil * 100).toFixed(1)}%
    - 剩余未装载货物: ${s.unpackedItems.length > 0 ? s.unpackedItems.map(i => i.cargoId + 'x' + i.quantity).join(',') : '无'}
  `).join('\n');

  const prompt = `
    你是一位世界级的供应链和物流专家。请根据“成本最小化”和“操作效率最大化”的原则，分析以下两个集装箱装载方案，并给出最终决策建议。

    方案数据如下：
    ${summary}

    请严格使用 Markdown 格式输出，结构如下：

    ### 🏆 最终推荐方案
    [明确指出推荐方案一还是方案二]

    ### 💡 核心决策理由
    *   **💰 成本效益分析**: 详细解释为什么这个方案在财务上更优（或者虽然贵一点但值得）。
    *   **⚙️ 操作效率与风险**: 分析集装箱数量对装卸、报关、管理复杂度的影响。评估空间利用率，是否存在爆仓风险或空间浪费。
    *   **📦 货物集中度与合规**: 评价方案是否符合“同一批货尽量在同一箱”的原则。

    请保持语气专业、客观、具体。不需要废话。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "分析完成。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 分析服务暂时不可用，请稍后再试。";
  }
};