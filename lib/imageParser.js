import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// 定義動態的 Schema 生成函數
function createSchemas(categories) {
  const categoryNames = categories.map(cat => cat.name);
  
  const CategorySchema = z.object({
    name: z.enum(categoryNames),
    description: z.string()
  });

  const RawBillItem = z.object({
    date: z.string().describe("交易日期 YYYY-MM-DD"),
    description: z.string().describe("交易描述"),
    amount: z.number().describe("金額"),
    category: CategorySchema
      .describe("交易類別")
      .optional(),
  });

  const RawBillStatement = z.object({
    bankName: z.string().describe("銀行名稱"),
    cardType: z.string().describe("信用卡類型"),
    statementDate: z.string().describe("帳單日期 YYYY-MM"),
    items: z.array(RawBillItem).describe("交易項目列表"),
  });

  const BillItem = z.object({
    date: z.string().describe("交易日期 YYYY-MM-DD"),
    description: z.string().describe("交易描述"),
    amount: z.number().describe("金額"),
    category: z.enum(categoryNames).describe("交易類別"),
  });

  const BillStatement = z.object({
    bankName: z.string().describe("銀行名稱"),
    cardType: z.string().describe("信用卡類型"),
    statementDate: z.string().describe("帳單日期 YYYY-MM"),
    totalAmount: z.number().describe("總金額"),
    categories: z.array(z.object({
      name: z.string().describe("類別名稱"),
      description: z.string().describe("類別描述"),
      amount: z.number().describe("類別總金額"),
      percentage: z.number().describe("類別佔比"),
      items: z.array(z.object({
        date: z.string().describe("交易日期 YYYY-MM-DD"),
        description: z.string().describe("交易描述"),
        amount: z.number().describe("金額"),
      })).describe("該類別的交易項目"),
    })).describe("各類別統計"),
    items: z.array(BillItem).describe("完整交易項目列表"),
  });

  return {
    RawBillStatement,
    BillStatement
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseImagesIntoBill(base64Images, settings) {
  try {
    // 使用設定中的類別創建 Schema
    const schemas = createSchemas(settings.categories);
    
    // 步驟 1: 解析帳單資訊（包含分類）
    const rawBillStatement = await parseRawBillData(base64Images, settings, schemas);
    
    // 步驟 2: 計算總金額
    const totalAmount = rawBillStatement.items.reduce((sum, item) => sum + item.amount, 0);
    
    // 步驟 3: 整理分類統計
    const categoryStats = calculateCategoryStats(rawBillStatement.items, settings.categories);
    
    // 組合最終結果
    const billStatement = {
      ...rawBillStatement,
      totalAmount,
      categories: categoryStats,
    };

    return billStatement;

  } catch (error) {
    console.error('Error parsing bill images:', error);
    throw new Error('Failed to parse bill images: ' + error.message);
  }
}

async function parseRawBillData(base64Images, settings, schemas) {
  const messages = [
    {
      role: "system",
      content: settings.systemPrompt,
    },
    {
      role: "user",
      content: [
        { type: "text", text: "請解析這些信用卡帳單圖片，並提供結構化的帳單資訊。" },
        ...base64Images.map(base64Image => ({
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`,
            detail: "low"
          }
        }))
      ],
    },
  ];

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 4096,
    response_format: zodResponseFormat(schemas.RawBillStatement, "statement"),
  });

  return {
    ...completion.choices[0].message.parsed,
  };
}

function calculateCategoryStats(items, categories) {
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  
  const categoryGroups = items.reduce((groups, item) => {
    if (!groups[item.category.name]) {
      const categoryInfo = categories.find(cat => cat.name === item.category.name);
      groups[item.category.name] = {
        name: item.category.name,
        description: categoryInfo?.description || '',
        amount: 0,
        items: []
      };
    }
    
    groups[item.category.name].amount += item.amount;
    groups[item.category.name].items.push({
      date: item.date,
      description: item.description,
      amount: item.amount
    });
    
    return groups;
  }, {});
  
  return Object.values(categoryGroups)
    .map(category => ({
      ...category,
      percentage: Number((category.amount / totalAmount * 100).toFixed(2)),
      items: category.items.sort((a, b) => new Date(a.date) - new Date(b.date))
    }))
    .sort((a, b) => b.amount - a.amount);
}