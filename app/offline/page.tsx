import { Metadata } from 'next'
import { Wifi, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { pageMetadata } from '@/lib/utils/seo'

// ==========================================
// メタデータ設定（noindex）
// ==========================================

export const metadata: Metadata = pageMetadata.offline()

// ==========================================
// オフラインページコンポーネント
// ==========================================

export default function OfflinePage() {
  return (
    <div className="offline-page">
      <div className="container">
        <div className="content">
          <div className="icon">📶</div>
          <h1 className="title">オフライン</h1>
          <p className="description">
            インターネット接続が切断されています。
          </p>
          <p className="sub-description">
            接続を確認してからもう一度お試しください。
          </p>
          
          <div className="status">
            <div className="status-indicator"></div>
            <span className="status-text">接続を確認中...</span>
          </div>
          
          <div className="actions">
            <button 
              onClick={() => window.location.reload()}
              className="button primary"
            >
              再読み込み
            </button>
            <button 
              onClick={() => window.history.back()}
              className="button secondary"
            >
              前のページに戻る
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .offline-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .container {
          max-width: 600px;
          width: 100%;
        }

        .content {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          margin-bottom: 1rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .description {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .sub-description {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ffa500;
          animation: pulse 2s infinite;
        }

        .status-text {
          font-size: 0.9rem;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .button {
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .button.primary {
          background: white;
          color: #ff6b6b;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .button.secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .button.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        @media (max-width: 768px) {
          .content {
            padding: 2rem;
          }

          .title {
            font-size: 2rem;
          }

          .actions {
            flex-direction: column;
            align-items: center;
          }

          .button {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
      
      {/* 接続状態を監視するスクリプト */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function checkConnection() {
              if (navigator.onLine) {
                window.location.href = '/';
              }
            }
            
            window.addEventListener('online', checkConnection);
            setInterval(checkConnection, 5000);
          `,
        }}
      />
    </div>
  )
} 