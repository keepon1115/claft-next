# パフォーマンス調査レポート(2026-07-19)

対象: `c:/dev/claft-next`(CLAFTアプリ、Next.js 15.3.6 / App Router)
調査目的: ローカル確認時の「起動が重い」「ボタンを押しても反応が鈍い/効かないことがある」の原因特定と改善方針の策定。
本ドキュメントは実際にコードを読んで確認した事実にもとづく。実装は別セッション/別モデルに引き継ぐ前提で、根拠ファイル・行番号を明記している。

---

## 結論(先に要約)

体感の重さは「1つの巨大な原因」ではなく、**開発モードで特に増幅される複数の要因が重なっている**。中でも次の2つが最重要かつ確実に直せる:

1. **Supabaseクライアントの使い捨て生成が全域で発生している**(最重要・要修正)
2. **Zustand devtoolsミドルウェアが全ストアで有効**+**Font Awesome全量CDN読み込み**が開発体験を継続的に悪化させている

「ボタンを押しても起動しない/反応しない」という**時間とともに悪化する**症状は、(1)のリスナー/タイマー蓄積と非常によく一致する。「そもそも初期表示が遅い」は、Font Awesome CDN読み込みとバンドルサイズの問題。

---

## 確認した原因(証拠つき・優先度順)

### 🔴 1. Supabaseクライアントをメモ化せず、各所で使い捨て生成している

**根拠**: `lib/supabase/client.ts:98` の `createBrowserSupabaseClient()` は呼び出すたびに `createBrowserClient<Database>(...)` で**新しいSupabaseクライアント**(独自のGoTrueClient認証リスナー・トークン自動リフレッシュタイマー・Realtimeソケット管理を内包)を生成する、ただの関数。モジュールレベルのシングルトンにはなっていない。

このリポジトリ全体で **59箇所**この関数が呼ばれているが、正しくメモ化されているのは4箇所のみ:
- `app/hirameki-post/page.tsx:22` — `useMemo(() => createBrowserSupabaseClient(), [])`
- `app/admin/hirameki-posts/page.tsx:18` — 同上
- `hooks/useRealtimeUpdates.ts:30` — `useRef(createBrowserSupabaseClient())`
- `lib/supabase/hooks.ts:12` — `useState(() => createBrowserSupabaseClient())`

残りは大きく2パターン:
- **(a) 関数/イベントハンドラ内で毎回生成**(`stores/authStore.ts` 9箇所、`stores/questStore.ts` 9箇所、`lib/api/*.ts` 多数)— ログイン・クエスト進捗更新などのアクションを呼ぶたびに新しいクライアントを使い捨てる。頻度は低めだが、呼ばれるたびにGoTrueClientの内部タイマーが増える。
- **(b) コンポーネント本体の直書き(最悪パターン)**: `app/profile/page.tsx:21`
  ```ts
  const supabase = createBrowserSupabaseClient()
  ```
  これは `ProfilePage` 関数の**トップレベル**にあり、`useMemo` 等でラップされていない。つまり **このコンポーネントが再レンダリングされるたびに** 新しいSupabaseクライアントが生成される。`ProfilePage` には `activeTab`・`saveStatus`・`localChanges`・アバターアップロード系など多数の `useState` があり、フォーム入力のたびに再レンダーが起きる構造。**プロフィール画面をしばらく操作していると、生成されたクライアント数(＝内部タイマー・リスナー数)が使うほど増え続ける。**

**なぜ「ボタンが反応しなくなる」症状と一致するか**:
supabase-js は同一ブラウザコンテキストで複数のGoTrueClientが動くと "Multiple GoTrueClient instances detected" という既知の警告を出し、トークンリフレッシュのタイマーやlocalStorageの監視が重複稼働する。数が増えるほどメインスレッドの負荷とメモリが増加し、他のイベントハンドラの実行が遅延する。**開発モードはReact StrictModeでeffectが2重実行されるため、この問題はローカル確認時に特に顕著に出る**(本番より悪化して見える)。

---

### 🔴 2. Zustand `devtools` ミドルウェアが全5ストアで有効(開発時のみ)

**根拠**: `stores/questStore.ts:350`, `stores/authStore.ts:47`, `stores/userStore.ts:207`, `stores/minecraftSdgsStore.ts:426`, `stores/tutorialStore.ts:28` すべてが `devtools(...)` でラップされている。`questStore.ts:1187` は `enabled: process.env.NODE_ENV === 'development'` と明記されており、**開発時のみ有効化される設計だが、まさにローカル確認で使われている状態そのもの**。

`questStore`(1243行、`userProgress`・`stageDetails`・`statistics`・`areas` など比較的大きな状態を保持)のように状態が大きいストアで `devtools` が有効だと、`set()` を呼ぶたびに状態をシリアライズしてRedux DevTools拡張に送信する。ブラウザにRedux DevTools拡張が入っている環境では、この送信コストが状態更新のたびに乗る。

---

### 🟠 3. Font Awesome全量CSSをCDNからrender-blockingで読み込み

**根拠**: `app/layout.tsx:54-60`
```tsx
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  ...
/>
```
これは`<head>`内の素の`<link>`で、**全ページ共通・render-blocking**。Font Awesome 6.4.0の`all.min.css`はアイコン全種類(数千種)分のCSS+Webフォントを含み、実際に使っているアイコンはごく一部(`fa-book-open`, `fa-cogs` など)のみ。

さらに `lucide-react`(軽量・Tree-shaking対応のアイコンライブラリ)がすでに `package.json` の依存関係にあり、`components/common/LockedContent.tsx` 等で実際に使われている。**2つのアイコン方式が併存している**状態。

外部CDN依存のため、キャッシュが効かない初回アクセス時や低速回線では特に効く。子ども向けプロダクトとして低速回線耐性を重視するなら優先度は高い。

---

### 🟠 4. `AnimatePresence mode="wait"` をアプリ全体のルートに適用

**根拠**: `components/common/AnimationProvider.tsx:66-74`
```tsx
const AnimationProvider = ({ children }) => (
  <MotionConfig reducedMotion="user">
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  </MotionConfig>
);
```
これが `app/providers.tsx` の `AppProviders` 経由で**全ページのchildrenをラップ**している。`mode="wait"` は「退出アニメーションが終わるまで新しい子要素をマウントしない」モード。ページ全体をこの粒度でラップする設計意図が本来のユースケース(個別コンポーネントのenter/exit制御)とズレており、Framer Motionの差分検知コストが全ページに常時乗っている。

---

### 🟡 5. 開発サーバーがTurbopack未使用

**根拠**: `package.json:6` — `"dev": "next dev"`(`--turbo`オプションなし)。Next.js 15.3.6はTurbopack devが実用段階にあり、有効化するとHMR・初回コンパイルの体感速度が大きく改善するケースが多い。**ノーリスクで一度試す価値がある**(既知の非互換がなければ即座に体感できる)。

---

### 🟡 6. 一部ページの初期JSバンドルが大きい

**根拠**: `npm run build` の出力(実測)
| ルート | First Load JS |
|---|---|
| `/quest` | 293 kB |
| `/minecraft-sdgs` | 232 kB |
| `/profile` | 227 kB |
| `/admin` | 218 kB |

動的インポート(`dynamic(..., { ssr: false })`)は `CraftStory`/`JibunCraft`/一部モーダルで部分的に使われているが(`app/page.tsx:19-20`、`app/quest/page.tsx:24-27`など)、クエストページ配下には `MediaPlayerModal` / `StageModal` / `UnlockAnimation` など複数の重量コンポーネントがあり、遅延ロードの適用漏れがないか個別確認が必要。

---

### 🟢 7. (補足・優先度低) 本番コードパスに大量の `console.log`

`stores/authStore.ts`・`app/providers.tsx` 等に多数の `console.log`(絵文字付きログ)が残っている。実行コスト自体は小さいが、DevToolsのプロファイリング時にノイズになる。修正は容易だが体感速度への寄与は小さい。

---

## 改良の方針(全体方針)

1. **「開発時にだけ重い」要因を先に潰す**(投資対効果が高い): Supabaseクライアントのシングルトン化、devtoolsミドルウェアの見直し。これだけでローカル確認の体感は大きく変わる可能性が高い。
2. **「本番でも効く」要因を次に潰す**: Font Awesome CDN依存の解消、AnimatePresenceの適用範囲の見直し。
3. **計測してから手を広げる**: 対象アプリには既に `npm run analyze`(bundle-analyzer)・`npm run lighthouse` の仕組みが用意されている(`package.json:12-16`)。勘に頼らず、各修正の前後でこれらを実行し効果を数値で確認する。
4. **1人保守の原則を守る**: 新しい抽象化(独自のクライアントプール等)は導入せず、Supabase/Zustand/Next.jsそれぞれの標準的な作法(シングルトン化・partialize・dynamic import)の範囲で直す。

---

## 具体的アプローチ(優先度順・実装向け)

### Step 1: Supabaseブラウザクライアントのシングルトン化 【最優先】
- `lib/supabase/client.ts` の `createBrowserSupabaseClient()` を、モジュールスコープの変数にキャッシュして同一インスタンスを返すよう変更する(例: `let browserClient: ReturnType<typeof createBrowserClient> | null = null` を用意し、既にあれば再利用)。
- サーバー用の `createServerSupabaseClient` 等はリクエストごとに新規生成が必要なので**対象外**(ブラウザ用のみ変更)。
- 変更後、`app/profile/page.tsx:21` のようなコンポーネント直書き箇所も含め、全呼び出し箇所が自動的にシングルトンの恩恵を受ける(呼び出し側の修正は最小限で済む設計にする)。
- 完了条件: ブラウザのコンソールに "Multiple GoTrueClient instances" 警告が出ないこと。

### Step 2: Zustand devtoolsの見直し
- 5ストア(`questStore`/`authStore`/`userStore`/`minecraftSdgsStore`/`tutorialStore`)の `devtools()` ラップについて、「Redux DevTools拡張を使ったデバッグが本当に必要か」を将一郎に確認する。
- 不要なら `devtools` ラップ自体を外す。必要なら状態が大きいストア(`questStore`)だけでも `partialize`相当の絞り込み(devtoolsは自前のtrace保存もするため、大きい状態は選択的に間引く)を検討する。

### Step 3: Font Awesomeの依存解消
- 実際に使われている `fa-*` アイコンをコードベース全体で洗い出す(`grep -r "fa-" --include=*.tsx`)。
- 洗い出したアイコンを `lucide-react` の同等アイコンに置き換えるか、どうしてもFont Awesome固有のアイコンが必要な場合のみ自己ホスト+使用アイコンだけのサブセット化を検討する。
- 置き換え後、`app/layout.tsx` の外部CDN `<link>` を削除する。

### Step 4: AnimatePresenceの適用範囲を見直す
- `components/common/AnimationProvider.tsx` の `AnimatePresence mode="wait"` を、アプリ全体のルートラップから外し、実際にenter/exitアニメーションが必要な個別コンポーネント(モーダル・通知など)側に移す。
- `FadeInElement` 等のユーティリティは個別コンポーネントの中で必要な範囲だけ `AnimatePresence` を使うようにする。

### Step 5: Turbopack devを試す
- `package.json` の `dev` スクリプトを `next dev --turbo` に変更し、既存機能(PWA・next-pwa、next-themes、動的import等)に非互換がないか一通り動作確認する。問題なければ採用、問題があれば原因を記録して見送る。

### Step 6: バンドルサイズの精査
- `npm run analyze` を実行し、`/quest` (293kB)・`/minecraft-sdgs` (232kB) の内訳を確認。
- 常時表示が不要なモーダル・アニメーション系コンポーネント(`MediaPlayerModal`・`StageModal`・`UnlockAnimation`等)で `dynamic(..., { ssr: false })` 化が漏れていないか確認し、漏れがあれば適用する。

### Step 7(任意・低優先): ログ整理
- `console.log` のうち本番でも動き続けるものを `process.env.NODE_ENV === 'development'` ガードで囲むか削除する。

---

## 効果測定の方法(実装担当モデルへ)

各Stepの前後で以下を実施し、"直った気がする" ではなく数値で確認すること:

1. `npm run build` の出力(各ルートのFirst Load JSサイズ)を比較
2. `npm run lighthouse`(`scripts/performance-audit.js`)のスコア比較
3. Step 1実施後は、ブラウザDevToolsのコンソールで "Multiple GoTrueClient" 警告の有無を確認
4. Step 1・2実施後は、Chrome DevTools Performanceタブでプロフィール画面を1〜2分操作し続けるプロファイルを取得、タイマー数・ヒープサイズの増加傾向(メモリリークの有無)を確認

---

## 引き継ぎメモ(実装を担当するモデルへ)

- 対象リポジトリ: `c:/dev/claft-next`(Next.js 15.3.6 App Router / TypeScript / Tailwind / Supabase / Zustand)
- 本ドキュメントの「具体的アプローチ」Step 1〜7は優先度順。Step 1・2だけでも着手する価値が高い。
- 各Stepは独立して着手可能(依存関係なし)。まとめて1つの巨大PRにせず、Stepごとに分けて動作確認しながら進めることを推奨。
- 変更対象ファイルは各Stepの「根拠」に記載したパス・行番号を参照。
- 完了条件は各Stepの記載を満たすこと。加えて全体として `npm run build` が成功し、既存ページ(特に `/quest`・`/profile`・`/admin`)にデグレがないことを確認する。
- 判断に迷ったら「1人で保守できるか」(新しい抽象化を増やさない、標準的なReact/Next.js/Supabaseの作法の範囲で直す)を優先する。
