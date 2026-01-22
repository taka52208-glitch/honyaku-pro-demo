import { useState, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Tesseract from 'tesseract.js';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_SOURCE_LANGUAGE,
  DEFAULT_TARGET_LANGUAGE,
} from '../constants/languages';
import { translateText } from '../services/translateService';
import type { PlanType } from '../types';

const CameraPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 状態管理
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanType>('free');

  // カメラ起動
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('カメラにアクセスできません。カメラの権限を確認してください。');
    }
  };

  // カメラ停止
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  // 撮影
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      setCapturedImage(imageData);
      stopCamera();
      processOCR(imageData);
    }
  };

  // ファイル選択
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setCapturedImage(imageData);
      processOCR(imageData);
    };
    reader.readAsDataURL(file);
  };

  // OCR処理
  const processOCR = async (imageData: string) => {
    setIsProcessing(true);
    setOcrText('');
    setTranslatedText('');
    setError(null);

    try {
      // Tesseract.jsでOCR処理
      const langCode = sourceLanguage === 'zh' ? 'chi_sim' :
                       sourceLanguage === 'ja' ? 'jpn' :
                       sourceLanguage === 'ko' ? 'kor' :
                       sourceLanguage === 'ru' ? 'rus' :
                       sourceLanguage === 'de' ? 'deu' :
                       sourceLanguage === 'fr' ? 'fra' :
                       sourceLanguage === 'es' ? 'spa' :
                       sourceLanguage === 'pt' ? 'por' :
                       sourceLanguage === 'it' ? 'ita' : 'eng';

      const result = await Tesseract.recognize(imageData, langCode, {
        logger: (m) => console.log(m),
      });

      const extractedText = result.data.text.trim();
      setOcrText(extractedText);

      // 翻訳処理
      if (extractedText) {
        // 無料プランの場合は遅延を追加（1.5〜2.5秒）
        if (plan === 'free') {
          const delay = 1500 + Math.random() * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const translation = await translateText({
          text: extractedText,
          sourceLanguage,
          targetLanguage,
        });
        setTranslatedText(translation.translatedText);
      }
    } catch (err) {
      console.error('OCR/Translation error:', err);
      setError('テキストの認識に失敗しました。別の画像をお試しください。');
    } finally {
      setIsProcessing(false);
    }
  };

  // 音声再生
  const handleSpeak = useCallback((text: string, lang: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'zh' ? 'zh-CN' : lang;
    speechSynthesis.speak(utterance);
  }, []);

  // リセット
  const handleReset = () => {
    setCapturedImage(null);
    setOcrText('');
    setTranslatedText('');
    setError(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            カメラ翻訳
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={plan}
          exclusive
          onChange={(_, newPlan) => newPlan && setPlan(newPlan)}
          size="small"
        >
          <ToggleButton value="free">無料</ToggleButton>
          <ToggleButton value="premium">有料</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 言語選択 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>認識言語</InputLabel>
          <Select
            value={sourceLanguage}
            label="認識言語"
            onChange={(e) => setSourceLanguage(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>翻訳先</InputLabel>
          <Select
            value={targetLanguage}
            label="翻訳先"
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* カメラ/画像エリア */}
      <Paper sx={{ mb: 3, overflow: 'hidden', bgcolor: 'grey.900' }}>
        {isCameraActive ? (
          <Box sx={{ position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', display: 'block' }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<CameraIcon />}
                onClick={captureImage}
              >
                撮影
              </Button>
            </Box>
          </Box>
        ) : capturedImage ? (
          <Box sx={{ position: 'relative' }}>
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: '100%', display: 'block' }}
            />
            {isProcessing && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.5)',
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              height: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'grey.500',
            }}
          >
            <CameraIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography>カメラを起動するか、画像をアップロードしてください</Typography>
          </Box>
        )}
      </Paper>

      {/* 隠しCanvas（撮影用） */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* アクションボタン */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
        {!isCameraActive && !capturedImage && (
          <>
            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              onClick={startCamera}
            >
              カメラを起動
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              画像をアップロード
            </Button>
          </>
        )}
        {(capturedImage || isCameraActive) && (
          <Button variant="outlined" onClick={handleReset}>
            やり直す
          </Button>
        )}
      </Box>

      {/* OCR結果 */}
      {ocrText && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              認識テキスト
            </Typography>
            <IconButton size="small" onClick={() => handleSpeak(ocrText, sourceLanguage)}>
              <VolumeUpIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography>{ocrText}</Typography>
        </Paper>
      )}

      {/* 翻訳結果 */}
      {translatedText && (
        <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              翻訳結果
            </Typography>
            <IconButton size="small" onClick={() => handleSpeak(translatedText, targetLanguage)}>
              <VolumeUpIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="h6">{translatedText}</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default CameraPage;
