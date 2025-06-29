# usePWA Hook

CLAFTアプリケーションでPWA機能を管理するカスタムフック

## 概要

`usePWA`フックは、Progressive Web App (PWA) の機能を React コンポーネントで簡単に使用できるようにします。

## 機能

### 状態管理
- **isInstallable**: アプリがインストール可能かどうか
- **isInstalled**: アプリがインストール済みかどうか
- **isOnline**: オンライン状態かどうか
- **isStandalone**: スタンドアロンモードで実行中かどうか
- **installPrompt**: インストールプロンプトのイベントオブジェクト

### アクション
- **install()**: アプリのインストールを実行
- **showInstallPrompt()**: カスタムインストールプロンプトを表示
- **clearInstallPrompt()**: インストールプロンプトをクリア

## 使用例

### 基本的な使用

```tsx
import { usePWA } from '@/hooks/usePWA'

function PWAButton() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    isStandalone,
    install 
  } = usePWA()

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      console.log('インストール完了!')
    }
  }

  if (isInstalled || isStandalone) {
    return (
      <div className="pwa-status">
        ✅ PWAアプリとして実行中
      </div>
    )
  }

  if (isInstallable) {
    return (
      <button onClick={handleInstall} className="install-button">
        📱 アプリをインストール
      </button>
    )
  }

  return null
}
```

### オンライン状態の監視

```tsx
import { usePWA } from '@/hooks/usePWA'

function ConnectionStatus() {
  const { isOnline } = usePWA()

  return (
    <div className={`status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? (
        <>🟢 オンライン</>
      ) : (
        <>🔴 オフライン</>
      )}
    </div>
  )
}
```

### インストールプロンプトのカスタマイズ

```tsx
import { usePWA } from '@/hooks/usePWA'
import { useState } from 'react'

function CustomInstallPrompt() {
  const { isInstallable, install, clearInstallPrompt } = usePWA()
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)

  useEffect(() => {
    if (isInstallable) {
      setShowCustomPrompt(true)
    }
  }, [isInstallable])

  const handleInstall = async () => {
    const success = await install()
    setShowCustomPrompt(false)
    
    if (success) {
      // インストール成功時の処理
      showNotification('success', 'アプリをインストールしました!')
    }
  }

  const handleDismiss = () => {
    setShowCustomPrompt(false)
    clearInstallPrompt()
  }

  if (!showCustomPrompt) return null

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt">
        <h3>📱 CLAFTアプリをインストール</h3>
        <p>ホーム画面に追加して、より快適にご利用いただけます。</p>
        
        <div className="prompt-actions">
          <button onClick={handleInstall} className="install-btn">
            インストール
          </button>
          <button onClick={handleDismiss} className="dismiss-btn">
            後で
          </button>
        </div>
      </div>
    </div>
  )
}
```

### PWAユーティリティの使用

```tsx
import { PWAUtils } from '@/hooks/usePWA'

function PWASettings() {
  const handleUpdateCheck = async () => {
    const updated = await PWAUtils.checkForSWUpdate()
    if (updated) {
      console.log('Service Worker を更新しました')
    }
  }

  const handleClearCache = async () => {
    const cleared = await PWAUtils.clearCache()
    if (cleared) {
      console.log('キャッシュをクリアしました')
      window.location.reload()
    }
  }

  return (
    <div className="pwa-settings">
      <h3>PWA設定</h3>
      
      <div className="setting-item">
        <span>実行モード:</span>
        <span>{PWAUtils.isRunningAsPWA() ? 'PWAアプリ' : 'ブラウザ'}</span>
      </div>
      
      <button onClick={handleUpdateCheck}>
        アプリを更新
      </button>
      
      <button onClick={handleClearCache}>
        キャッシュをクリア
      </button>
    </div>
  )
}
```

## イベント監視

### Service Worker の更新通知

```tsx
import { usePWA } from '@/hooks/usePWA'
import { useEffect } from 'react'

function ServiceWorkerUpdater() {
  const { isOnline } = usePWA()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Service Worker が更新された時の処理
        window.location.reload()
      })
    }
  }, [])

  useEffect(() => {
    if (isOnline) {
      // オンライン復旧時にService Workerの更新をチェック
      PWAUtils.checkForSWUpdate()
    }
  }, [isOnline])

  return null
}
```

## スタイリング例

```css
/* インストールボタンのスタイル */
.install-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.install-button:hover {
  transform: translateY(-2px);
}

/* 接続状態のスタイル */
.status.online {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.offline {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* カスタムインストールプロンプト */
.install-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.install-prompt {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
```

## 注意事項

1. **ブラウザサポート**: PWA機能はモダンブラウザでのみ利用可能
2. **HTTPS必須**: PWAはHTTPS環境でのみ動作
3. **インストール条件**: ブラウザによってインストール可能条件が異なる
4. **キャッシュ管理**: 適切なキャッシュ戦略が重要

## トラブルシューティング

### インストールボタンが表示されない
- HTTPS環境で実行されているか確認
- manifest.jsonが正しく設定されているか確認
- Service Workerが登録されているか確認

### オフライン機能が動作しない
- Service Workerのキャッシュ設定を確認
- ネットワークファーストの戦略を検討
- キャッシュの有効期限を確認 