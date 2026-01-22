import { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from '../constants/languages';
import { translateText } from '../services/translateService';
import type { PlanType } from '../types';

const TranslationPage = () => {
  const navigate = useNavigate();

  // 状態管理
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [plan, setPlan] = useState<PlanType>('free');

  // 言語の入れ替え
  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  // 翻訳処理
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      // 無料プランの場合は遅延を追加（1.5〜2.5秒）
      if (plan === 'free') {
        const delay = 1500 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const result = await translateText({
        text: inputText,
        sourceLanguage,
        targetLanguage,
      });
      setTranslatedText(result.translatedText);
    } catch (error) {
      console.error('Translation failed:', error);
      setTranslatedText('翻訳エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sourceLanguage, targetLanguage, plan]);

  // 音声認識
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('お使いのブラウザは音声認識に対応していません。Chrome または Edge をお使いください。');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = sourceLanguage === 'zh' ? 'zh-CN' : sourceLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: Event & { results: SpeechRecognitionResultList }) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = (event: Event & { error: string }) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // 音声再生
  const handleSpeak = (text: string, lang: string) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'zh' ? 'zh-CN' : lang;
    speechSynthesis.speak(utterance);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          高精度翻訳アプリ
        </Typography>

        {/* プラン切替 */}
        <ToggleButtonGroup
          value={plan}
          exclusive
          onChange={(_, newPlan) => newPlan && setPlan(newPlan)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="free">無料プラン</ToggleButton>
          <ToggleButton value="premium">有料プラン（月額550円）</ToggleButton>
        </ToggleButtonGroup>

        {plan === 'premium' && (
          <Typography variant="body2" color="primary">
            専門用語対応・高速翻訳モード
          </Typography>
        )}
      </Box>

      {/* 言語選択 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>翻訳元</InputLabel>
          <Select
            value={sourceLanguage}
            label="翻訳元"
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton onClick={handleSwapLanguages} color="primary">
          <SwapIcon />
        </IconButton>

        <FormControl fullWidth>
          <InputLabel>翻訳先</InputLabel>
          <Select
            value={targetLanguage}
            label="翻訳先"
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 翻訳エリア */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* 入力エリア */}
        <Paper sx={{ flex: 1, p: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="テキストを入力..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            variant="standard"
            InputProps={{ disableUnderline: true }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <IconButton
              onClick={handleVoiceInput}
              color={isListening ? 'error' : 'default'}
            >
              {isListening ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <IconButton onClick={() => handleSpeak(inputText, sourceLanguage)}>
              <VolumeUpIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* 出力エリア */}
        <Paper sx={{ flex: 1, p: 2, bgcolor: 'grey.50' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="翻訳結果..."
              value={translatedText}
              variant="standard"
              InputProps={{ disableUnderline: true, readOnly: true }}
            />
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <IconButton onClick={() => handleSpeak(translatedText, targetLanguage)}>
              <VolumeUpIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* アクションボタン */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleTranslate}
          disabled={!inputText.trim() || isLoading}
        >
          翻訳する
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<CameraIcon />}
          onClick={() => navigate('/camera')}
        >
          カメラ翻訳
        </Button>
      </Box>
    </Container>
  );
};

export default TranslationPage;
