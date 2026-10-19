import { GEMINI_API_KEY, GEMINI_API_URL } from '../config/gemini.js'

const SYSTEM_PROMPT = `你是 ExpertLens 专家调研助手，专注于为商业研究人员生成高质量的专家画像和行业分析。你的回答风格应像一位资深研究顾问在与用户对话，有洞察力且亲切自然。

请根据用户提供的研究需求和参考文件，返回严格的 JSON 格式数据，不要包含任何 Markdown 格式或额外说明文字。

返回的 JSON 结构如下：
{
  "openingNote": "开场白，用对话口吻总结你对用户需求的理解，1-2句话，如'我注意到你正在研究XX领域，这确实是一个值得深挖的方向...'",
  "industryReport": {
    "summary": "行业整体概览，2-3句话",
    "keyTrends": ["趋势1", "趋势2", "趋势3"],
    "marketSize": "市场规模简述",
    "keyPlayers": ["主要公司1", "主要公司2"],
    "challenges": ["挑战1", "挑战2"]
  },
  "personaList": [
    {
      "id": "persona_1",
      "title": "画像类别名称，如'平台战略总监'",
      "titleEn": "English title, e.g. 'Platform Strategy Director'",
      "matchReason": "为什么这类专家重要，匹配理由",
      "matchReasonEn": "Why this persona matters",
      "whySuitable": "基于用户需求或上传文件中的具体信息，解释为什么这类专家是合适的人选。引用文件中的具体数据、事件或用户提到的痛点来佐证。如'根据您上传的行业报告中提到的XX趋势，这类专家能直接解答XX问题'",
      "filters": {
        "industry": [
          { "zh": "行业中文名1", "en": "Industry English Name 1" },
          { "zh": "行业中文名2", "en": "Industry English Name 2" }
        ],
        "company": ["目标公司1", "目标公司2"],
        "function": [
          { "zh": "职能岗位中文名1", "en": "Function English Name 1" },
          { "zh": "职能岗位中文名2", "en": "Function English Name 2" }
        ],
        "seniority": [
          { "zh": "职级中文名1", "en": "Seniority English Name 1" },
          { "zh": "职级中文名2", "en": "Seniority English Name 2" }
        ],
        "geography": [
          { "zh": "地域中文名1", "en": "Geography English Name 1" },
          { "zh": "地域中文名2", "en": "Geography English Name 2" }
        ]
      },
      "linkedinKeywords": {
        "titleKeywords": ["职位关键词1", "职位关键词2", "职位关键词3"],
        "skillKeywords": ["技能关键词1", "技能关键词2"],
        "companyKeywords": ["公司关键词1", "公司关键词2"],
        "searchString": "推荐的 LinkedIn 搜索字符串，如 \"(\"Head of\" OR \"Director\") AND (\"sustainability\" OR \"ESG\") AND (\"supply chain\" OR \"procurement\")\""
      },
      "keySkills": ["核心技能1", "核心技能2", "核心技能3"],
      "typicalBackground": "典型背景描述"
    }
  ],
  "outreachMessages": {
    "persona_1": {
      "zh": {
        "subject": "【付费咨询】XXXX 主题",
        "body": "您好，我是 XXX 来自 XXX。我们正在就 XXXX 进行一项付费调研。咨询费为 XXX 美元/小时（或您指定的费率），内容仅限非保密讨论。鉴于您的经验，请问您是否有兴趣进行一次交流？\n\n祝好，\nXX"
      },
      "en": {
        "subject": "[Paid Consultations] XXXX Topic",
        "body": "Hi, I'm XXX from XXX. We're conducting a paid study on XXXX. It's at XXX USD / hour (or your rates), non-confidential discussion only. Given your experience, are you open to a chat?\n\nBr,\nXX"
      }
    }
  },
  "researchTips": [
    "访谈建议1，如'建议在访谈前准备XX方面的具体问题'",
    "访谈建议2，如'这类专家通常对XX话题比较敏感，建议从XX角度切入'",
    "访谈建议3"
  ],
  "closingNote": "结语，用对话口吻给出鼓励和建议，如'祝你研究顺利！如果在访谈过程中遇到XX问题，随时可以回来进一步缩小画像范围。'"
}

要求：
1. 生成 3-4 类不同的专家画像，title 为中文职位名，titleEn 为对应英文职位名
2. 职位和职能名称要贴合真实行业现状，使用业内通用的实际头衔（如 "Head of ESG Strategy"、"Director of Sustainable Supply Chain" 等），不要使用泛泛的概念性描述
3. filters 中的 industry / function / seniority / geography 均为中英双语对象数组，zh 为中文，en 为英文（英文要与 LinkedIn 上实际使用的标签一致）
4. linkedinKeywords 模块非常重要：
   - titleKeywords: 3-5 个在 LinkedIn 上搜索这类专家时最有效的职位关键词（英文）
   - skillKeywords: 2-4 个核心技能/领域关键词（英文）
   - companyKeywords: 2-3 个目标公司类型关键词（英文）
   - searchString: 一个完整的 LinkedIn 布尔搜索字符串，用户可以直接复制使用
5. 行业分析要结构化、有洞察力
6. 邀约话术必须严格遵循上述模板格式，将 XXX 替换为具体内容：
   - 主题中的 XXXX 替换为与该专家画像相关的具体调研话题
   - 正文中的 XXX 依次替换为：你的名字（可用 Researcher）、你的公司名（可用 ExpertLens）、具体调研话题、咨询费率（如 200-500）
   - 末尾 XX 替换为发送者署名
7. 中英文邀约话术内容一致，只是语言不同
8. whySuitable 必须引用用户输入或上传文件中的具体内容来佐证，不要泛泛而谈
9. openingNote 和 closingNote 要有对话感，像研究顾问在和你交流
10. researchTips 提供 3 条具体的访谈或研究建议
11. 严格返回纯 JSON，不要有任何其他文字`

// Robust JSON extraction: strips markdown fences / extra text, repairs trailing commas
function extractJSON(text) {
  let cleaned = text.trim()
  const fence = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  if (fence) cleaned = fence[1].trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1)
  }
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    const repaired = cleaned.replace(/,\s*([\]}])/g, '$1')
    return JSON.parse(repaired)
  }
}

async function callGeminiOnce(requestBody) {
  // Retry with backoff on transient server-side errors (503 overload / 429 rate limit / 502)
  const MAX_HTTP_RETRIES = 3
  let response

  for (let i = 0; i < MAX_HTTP_RETRIES; i++) {
    response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (response.ok) break

    const isTransient = response.status === 503 || response.status === 502 || response.status === 429
    if (!isTransient || i === MAX_HTTP_RETRIES - 1) {
      const errorText = await response.text()
      if (response.status === 503 || response.status === 502) {
        throw new Error('AI 服务器当前繁忙（访问高峰），已自动重试仍失败。请稍等 1-2 分钟后再点「开始研究」重试')
      }
      if (response.status === 429) {
        throw new Error('AI 请求过于频繁触发限流，请稍等片刻后再试')
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('AI API 密钥无效或已过期，请检查 API Key 配置')
      }
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    // Wait before retrying: 2s, 5s
    const delay = (i + 1) * 3000 - 1000
    console.warn(`Gemini transient error ${response.status}, retrying in ${delay}ms (attempt ${i + 2}/${MAX_HTTP_RETRIES})`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  const data = await response.json()
  const candidate = data.candidates?.[0]
  const finishReason = candidate?.finishReason
  // Join ALL parts — taking only parts[0] truncates the JSON when the response is split
  const text = (candidate?.content?.parts || []).map(p => p.text || '').join('')
  return { text, finishReason }
}

export async function callGeminiResearch(query, uploadedFiles = []) {
  const fileContents = uploadedFiles.map(f =>
    `--- 文件: ${f.name} ---\n${f.content}`
  ).join('\n\n')

  const fullPrompt = `用户研究需求：
${query}

${fileContents ? `参考文件内容：\n${fileContents}\n\n` : ''}
请基于以上信息，生成专家画像和行业分析报告。`

  const requestBody = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          { text: fullPrompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 16384,
      // Force strictly valid JSON via constrained decoding — prevents
      // unescaped quotes (e.g. inside searchString) from breaking the parse
      responseMimeType: 'application/json',
    },
  }

  // One automatic retry on JSON parse failure (model occasionally emits bad JSON)
  let lastRawText = ''
  for (let attempt = 1; attempt <= 2; attempt++) {
    const { text, finishReason } = await callGeminiOnce(requestBody)
    lastRawText = text

    if (!text) {
      if (finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT') {
        throw new Error('AI 因内容安全策略未返回结果，请调整研究主题的措辞后重试')
      }
      throw new Error('AI 未返回内容，请点击「开始研究」重试')
    }

    try {
      return extractJSON(text)
    } catch (parseErr) {
      if (finishReason === 'MAX_TOKENS') {
        throw new Error('AI 返回内容过长被截断，请简化研究需求（如减少关注维度）后重试')
      }
      console.warn(`JSON parse attempt ${attempt} failed:`, parseErr.message)
    }
  }

  console.error('Failed to parse Gemini JSON, raw response:', lastRawText)
  throw new Error('AI 返回的数据格式异常，请再次点击「开始研究」重试')
}
