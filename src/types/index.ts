// 言語情報の型定義
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

// 翻訳リクエストの型定義
export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// 翻訳レスポンスの型定義
export interface TranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

// OCRリクエストの型定義
export interface OCRRequest {
  image: string | Blob;
  sourceLanguage?: string;
}

// OCRレスポンスの型定義
export interface OCRResponse {
  text: string;
  confidence: number;
}

// プランタイプ
export type PlanType = 'free' | 'premium';

// 言語設定の型定義
export interface LanguageSettings {
  sourceLanguage: string;
  targetLanguage: string;
}
