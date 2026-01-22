module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // 品質基準: AI開発最適化
    'max-len': ['warn', { code: 120 }], // 行長: 120文字
    'max-lines-per-function': ['warn', { max: 100 }], // 関数行数: 100行
    'max-lines': ['warn', { max: 700 }], // ファイル行数: 700行
    'complexity': ['warn', 10], // 複雑度: 10
  },
};
