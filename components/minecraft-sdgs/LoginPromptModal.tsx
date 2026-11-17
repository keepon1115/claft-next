'use client'

import React from 'react'
import { X, Lock, User, Zap } from 'lucide-react'

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
  stageId: number
}

export default function LoginPromptModal({ 
  isOpen, 
  onClose, 
  onLoginClick, 
  stageId 
}: LoginPromptModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="minecraft-login-modal">
        {/* ヘッダー */}
        <div className="minecraft-modal-header">
          <div className="flex items-center gap-3">
            <Lock className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">冒険者登録が必要です</h2>
              <p className="text-sm text-gray-200">ステージ {stageId} にアクセスするには</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="minecraft-close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="minecraft-login-content">
          <div className="minecraft-feature-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <User className="w-6 h-6" />
              </div>
              <h3>プロフィール作成</h3>
              <p>あなただけの冒険者プロフィールを作成して、成長を記録しよう！</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <Zap className="w-6 h-6" />
              </div>
              <h3>進捗保存</h3>
              <p>SDGsワークとマイクラワークの進捗をしっかり保存できます。</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <Lock className="w-6 h-6" />
              </div>
              <h3>全ステージアクセス</h3>
              <p>19のSDGsステージすべてにアクセスして、持続可能な未来を学ぼう！</p>
            </div>
          </div>

          <div className="minecraft-cta-section">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-minecraft-brown mb-2">
                🌍 今すぐ始めて、SDGsマスターになろう！
              </h3>
              <p className="text-minecraft-brown-light">
                無料で始められる冒険者登録で、あなたの学習を次のレベルへ
              </p>
            </div>
            
            <div className="action-buttons">
              <button
                onClick={onLoginClick}
                className="minecraft-action-button primary large"
              >
                <User className="w-5 h-5" />
                冒険者登録 / ログイン
              </button>
              
              <button
                onClick={onClose}
                className="minecraft-action-button secondary"
              >
                後で登録する
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .minecraft-login-modal {
            background: linear-gradient(135deg, 
              rgba(255,255,255,0.95) 0%, 
              rgba(154,205,50,0.1) 100%
            );
            border: 4px solid var(--minecraft-brown);
            border-radius: 0;
            width: 100%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 
              inset 3px 3px 0 rgba(255,255,255,0.3),
              inset -3px -3px 0 rgba(0,0,0,0.3),
              8px 8px 16px rgba(0,0,0,0.4);
          }

          .minecraft-modal-header {
            background: linear-gradient(135deg, 
              var(--minecraft-dirt) 0%, 
              var(--minecraft-brown) 100%
            );
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid var(--minecraft-brown);
          }

          .minecraft-close-button {
            background: rgba(255,255,255,0.2);
            border: 2px solid white;
            border-radius: 0;
            color: white;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.1s ease;
          }

          .minecraft-close-button:hover {
            background: white;
            color: var(--minecraft-brown);
            transform: translate(-1px, -1px);
          }

          .minecraft-login-content {
            padding: 30px;
          }

          .minecraft-feature-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }

          .feature-item {
            padding: 20px;
            background: linear-gradient(135deg, 
              rgba(154,205,50,0.1) 0%, 
              rgba(255,255,255,0.1) 100%
            );
            border: 2px solid var(--minecraft-grass);
            border-radius: 0;
            text-align: center;
          }

          .feature-icon {
            width: 50px;
            height: 50px;
            background: var(--minecraft-emerald);
            border: 3px solid var(--minecraft-brown);
            border-radius: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin: 0 auto 15px;
          }

          .feature-item h3 {
            font-size: 16px;
            font-weight: bold;
            color: var(--minecraft-brown);
            margin-bottom: 8px;
          }

          .feature-item p {
            font-size: 14px;
            color: var(--minecraft-brown-light);
            line-height: 1.4;
          }

          .minecraft-cta-section {
            padding: 20px;
            background: rgba(255,255,255,0.5);
            border: 2px solid var(--minecraft-dirt-light);
            border-radius: 0;
          }

          .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }

          .minecraft-action-button {
            padding: 15px 20px;
            border: 3px solid var(--minecraft-brown);
            border-radius: 0;
            font-family: var(--font-dot-gothic);
            font-weight: bold;
            cursor: pointer;
            transition: all 0.1s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
          }

          .minecraft-action-button.primary {
            background: linear-gradient(135deg, 
              var(--minecraft-emerald) 0%, 
              var(--minecraft-grass) 100%
            );
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }

          .minecraft-action-button.primary.large {
            padding: 18px 25px;
            font-size: 16px;
          }

          .minecraft-action-button.secondary {
            background: linear-gradient(135deg, 
              var(--minecraft-stone) 0%, 
              #777 100%
            );
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }

          .minecraft-action-button:hover {
            transform: translate(-1px, -1px);
            box-shadow: 
              inset 2px 2px 0 rgba(255,255,255,0.3),
              inset -2px -2px 0 rgba(0,0,0,0.3),
              3px 3px 6px rgba(0,0,0,0.4);
          }

          .minecraft-action-button:active {
            transform: translate(1px, 1px);
            box-shadow: 
              inset 2px 2px 0 rgba(0,0,0,0.3),
              inset -2px -2px 0 rgba(255,255,255,0.1),
              1px 1px 3px rgba(0,0,0,0.3);
          }

          /* レスポンシブ対応 */
          @media (max-width: 768px) {
            .minecraft-login-modal {
              margin: 10px;
              max-height: 95vh;
            }
            
            .minecraft-modal-header {
              padding: 15px;
              flex-direction: column;
              gap: 10px;
              text-align: center;
            }
            
            .minecraft-login-content {
              padding: 20px;
            }
            
            .minecraft-feature-grid {
              gap: 15px;
            }
            
            .feature-item {
              padding: 15px;
            }
            
            .minecraft-cta-section {
              padding: 15px;
            }
          }
        `}</style>
      </div>
    </div>
  )
}