import type { TranslationRequest, TranslationResponse } from '../types';

// MyMemory API（無料・登録不要）
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Google Cloud Translation API（オプション）
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
const GOOGLE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * MyMemory APIを使用してテキストを翻訳（無料・登録不要）
 */
const translateWithMyMemory = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResponse> => {
  const langPair = `${sourceLanguage}|${targetLanguage}`;
  const url = `${MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`MyMemory API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(`MyMemory API error: ${data.responseDetails}`);
  }

  return {
    translatedText: data.responseData.translatedText,
    detectedSourceLanguage: sourceLanguage,
  };
};

/**
 * Google Cloud Translation APIを使用してテキストを翻訳
 */
const translateWithGoogle = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResponse> => {
  const response = await fetch(`${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Translation API error: ${response.status}`);
  }

  const data = await response.json();
  const translation = data.data.translations[0];

  return {
    translatedText: translation.translatedText,
    detectedSourceLanguage: translation.detectedSourceLanguage,
  };
};

/**
 * テキストを翻訳（Google APIがあればGoogle、なければMyMemory）
 */
export const translateText = async (
  request: TranslationRequest
): Promise<TranslationResponse> => {
  const { text, sourceLanguage, targetLanguage } = request;

  if (!text.trim()) {
    return { translatedText: '' };
  }

  try {
    // Google APIキーがあればGoogleを使用
    if (GOOGLE_API_KEY) {
      return await translateWithGoogle(text, sourceLanguage, targetLanguage);
    }

    // なければMyMemory API（無料）を使用
    return await translateWithMyMemory(text, sourceLanguage, targetLanguage);
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};
