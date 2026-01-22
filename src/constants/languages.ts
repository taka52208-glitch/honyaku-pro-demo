import type { Language } from '../types';

// 対応言語一覧（デモ用10言語）
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ja', name: '日本語', nativeName: '日本語' },
  { code: 'en', name: '英語', nativeName: 'English' },
  { code: 'zh', name: '中国語（簡体）', nativeName: '简体中文' },
  { code: 'ko', name: '韓国語', nativeName: '한국어' },
  { code: 'es', name: 'スペイン語', nativeName: 'Español' },
  { code: 'fr', name: 'フランス語', nativeName: 'Français' },
  { code: 'de', name: 'ドイツ語', nativeName: 'Deutsch' },
  { code: 'pt', name: 'ポルトガル語', nativeName: 'Português' },
  { code: 'it', name: 'イタリア語', nativeName: 'Italiano' },
  { code: 'ru', name: 'ロシア語', nativeName: 'Русский' },
];

// デフォルト言語設定
export const DEFAULT_SOURCE_LANGUAGE = 'ja';
export const DEFAULT_TARGET_LANGUAGE = 'en';

// 言語コードから言語情報を取得
export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
};

// 言語コードから表示名を取得
export const getLanguageName = (code: string): string => {
  const lang = getLanguageByCode(code);
  return lang ? lang.name : code;
};
