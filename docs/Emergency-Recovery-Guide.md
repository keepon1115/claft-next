# CLAFT 緊急復旧ガイド

## 🚨 Phase 5: 問題発生時の対処法

### 無限コンパイルが再発した場合の即座対応

#### 1. **緊急サーバー停止**
```bash
# Windows PowerShell
taskkill /f /im node.exe

# 確認（プロセス数チェック）
tasklist | findstr node.exe
```

#### 2. **最後の変更を巻き戻し**
- 最後に追加/変更したコンポーネントを一時的に削除
- またはコメントアウトで無効化

#### 3. **キャッシュ完全クリア**
```bash
# .nextフォルダ削除
Remove-Item -Recurse -Force .next

# node_modules再インストール（必要に応じて）
Remove-Item -Recurse -Force node_modules
npm install
```

#### 4. **問題のコンポーネント調査チェックリスト**

##### 🔍 循環インポートチェック
- [ ] `import`文の相互参照がないか
- [ ] `@/components`間の循環依存
- [ ] `@/stores`と`@/hooks`の相互依存

##### ⚡ 重い処理チェック
- [ ] `useEffect`内の無限ループ
- [ ] 巨大なオブジェクト/配列の処理
- [ ] 画像・ファイルの同期読み込み

##### 🔄 無限ループチェック
- [ ] State更新が連鎖していないか
- [ ] `useCallback`/`useMemo`の依存配列
- [ ] イベントハンドラーの重複実行

#### 5. **シンプル版で段階的再作成**
```tsx
// ❌ 複雑版（危険）
const ComplexComponent = () => {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  // ... 複雑なロジック
};

// ✅ シンプル版（安全）
const SimpleComponent = () => {
  return <div>基本機能のみ</div>;
};
```

---

## 🎯 予防策

### 開発時の基本原則

#### **1つずつ追加原則**
- 新機能は1つずつ実装
- 毎回動作確認してからコミット
- プロセス数とメモリ使用量を監視

#### **プロセス監視**
```bash
# プロセス数確認
tasklist | findstr node.exe | measure-object | select Count

# メモリ使用量確認
Get-Process node | Measure-Object WorkingSet -Sum
```

**安全基準:**
- **プロセス数**: 3-4個（5個以上で要注意）
- **メモリ使用量**: 700MB以下（1GB超で要注意）

#### **TypeScript安全設定**
```json
// tsconfig.json（開発時推奨）
{
  "compilerOptions": {
    "strict": false,           // 一時的に緩和
    "noImplicitAny": false,    // any型許可
    "skipLibCheck": true       // ライブラリチェック省略
  }
}
```

---

## 🔧 復旧手順テンプレート

### 段階的復活の順序
1. **globals.css** - TailwindCSS基本
2. **Header** - シンプルナビゲーション
3. **Sidebar** - 基本メニュー
4. **AppProviders** - 最小プロバイダー
5. **各ページコンポーネント** - 1つずつ

### 各段階の確認項目
- [ ] HTTP 200 OK レスポンス
- [ ] ブラウザ正常表示
- [ ] プロセス数 ≤ 4個
- [ ] メモリ使用量 ≤ 700MB
- [ ] TypeScriptエラー 0個

## 📊 成功基準チェックリスト

**各フェーズ後に必ず確認:**
- [ ] **ブラウザでページが表示される** - HTTP 200 OK
- [ ] **スタイルが適用されている** - TailwindCSS動作確認
- [ ] **コンソールエラーがない** - 開発者ツールチェック
- [ ] **Node.jsプロセスが3個以下** - `tasklist | findstr node.exe`
- [ ] **メモリ使用量が1GB以下** - タスクマネージャー確認
- [ ] **ファンが静か** - CPU使用率正常
- [ ] **ページ遷移が機能する** - ナビゲーション動作確認

## 🎯 最終目標

**すべてのフェーズ完了後の達成状態:**
- ✅ **TailwindCSSスタイル適用** - 完全なスタイリング機能
- ✅ **Header/Sidebar表示** - 基本ナビゲーション構造
- ✅ **基本的なレイアウト構造** - Flexboxレスポンシブデザイン
- ✅ **Providersによる状態管理準備** - React Context基盤
- ✅ **安定したパフォーマンス** - プロセス最適化完了

**🎉 これで基盤が整い、機能開発に集中できます！**

---

## 📊 トラブルシューティング

### よくある問題と解決策

| 症状 | 原因 | 解決策 |
|------|------|--------|
| 無限コンパイル | 循環インポート | インポート経路確認 |
| メモリ急増 | 無限ループ | useEffect依存配列チェック |
| ファン高速回転 | CPU使用率100% | 即座にプロセス停止 |
| HTTPタイムアウト | 重いコンポーネント | シンプル版で再作成 |

### 緊急時コマンド集
```bash
# 全Node.jsプロセス強制終了
taskkill /f /im node.exe

# 開発サーバー再起動
npm run dev

# キャッシュ完全クリア
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
npm install

# TypeScriptエラー確認
npx tsc --noEmit
```

---

## 💡 学んだ教訓

### Phase 1-4で得た知見
1. **一度に多くを変更しない**
2. **プロセス数の常時監視が重要**
3. **TypeScript strict modeは最後に有効化**
4. **シンプル版 → 複雑版の段階的アプローチ**
5. **定期的なキャッシュクリアが効果的**

### 成功パターン
- 最小構成から段階的に拡張
- 各段階での動作確認必須
- メモリ使用量700MB以下維持
- プロセス数4個以下で安定運用

---

**🔗 関連ドキュメント:**
- [Performance-Optimization-Guide.md](./Performance-Optimization-Guide.md)
- [Dynamic-Import-Bundle-Optimization.md](./Dynamic-Import-Bundle-Optimization.md)

*最終更新: 復旧作業完了時* 