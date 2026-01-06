
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getCelebrationMessage = async (itemName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `เขียนคำแสดงความยินดีแบบสดใสและตื่นเต้นสุดๆ สำหรับคนที่ได้รับของรางวัลคือ "${itemName}" ขอแบบสั้นๆ 1 ประโยค (ไม่เกิน 15 คำ) ให้ดูเป็นทางการน้อยแต่สนุกมาก`,
      config: {
        systemInstruction: "You are a cheerful and energetic prize announcer. Speak in Thai only, use emojis sparingly but effectively.",
        temperature: 1.0,
      }
    });
    return response.text.trim() || `เย้! คุณได้รับ ${itemName} แล้ว!`;
  } catch (error) {
    console.error("AI Error:", error);
    return `ว้าว! ยินดีด้วยกับรางวัล ${itemName}! 🎉`;
  }
};
