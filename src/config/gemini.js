// Gemini API Configuration
// API Key 从环境变量读取，请在项目根目录创建 .env 文件（参考 .env.example）
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.6-flash'
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`
