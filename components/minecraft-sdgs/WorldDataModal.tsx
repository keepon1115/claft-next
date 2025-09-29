'use client'

import React from 'react'
import { X, Download, Upload, ExternalLink } from 'lucide-react'

interface WorldDataModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WorldDataModal({ isOpen, onClose }: WorldDataModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="world-data-modal-title" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {/* モーダルコンテンツ */}
      <div className="relative bg-white minecraft-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="minecraft-modal-header">
          <h2 id="world-data-modal-title" className="text-2xl font-bold text-minecraft-brown flex items-center gap-2">
            📁 ワールドデータについて
          </h2>
          <button
            onClick={onClose}
            className="minecraft-close-button"
            aria-label="閉じる"
          >
            <X size={24} />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="minecraft-modal-content">
          <div className="space-y-6">
            {/* 説明文 */}
            <div className="minecraft-info-section">
              <p className="text-lg text-minecraft-brown font-semibold mb-4">
                マイクラのワールドをうけとるとき、おくるときは「ギガファイル便」をつかいます。
              </p>
            </div>

            {/* ギガファイル便について */}
            <div className="minecraft-section">
              <h3 className="minecraft-section-title">
                🌐 ギガファイル便ってなに？
              </h3>
              <div className="minecraft-section-content">
                <ul className="space-y-2">
                  <li>・だれでも無料でつかえる ファイルおくりサービス。</li>
                  <li>・1つのファイルが なんと300GBまでOK。マイクラの大きなワールドもへっちゃら！</li>
                  <li className="flex items-center gap-2">
                    ・
                    <a 
                      href="https://gigafile.nu" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="minecraft-link"
                    >
                      gigafile.nu <ExternalLink size={16} />
                    </a>
                  </li>
                  <li>・ファイルをサーバーにあずける期間（ほじきげん）は 3日・5日・7日・14日・30日・60日・100日 からえらべる。</li>
                </ul>
              </div>
            </div>

            {/* ダウンロード手順 */}
            <div className="minecraft-section">
              <h3 className="minecraft-section-title">
                <Download className="w-5 h-5" />
                ファイルをもらうとき（ダウンロード）
              </h3>
              <div className="minecraft-section-content">
                <ol className="space-y-3">
                  <li className="minecraft-step">
                    <span className="minecraft-step-number">1</span>
                    <div>
                      <strong>LINEでもらったリンクを タップ → Safari や Chrome で開く。</strong>
                      <div className="text-sm text-minecraft-brown-light mt-1">
                        ※LINEの中のブラウザだとダウンロードがうまくいかないことがあります。
                      </div>
                    </div>
                  </li>
                  <li className="minecraft-step">
                    <span className="minecraft-step-number">2</span>
                    <div>
                      <strong>ダウンロードしたZIPをダブルクリックでひらけばOK！</strong>
                      <div className="text-sm text-minecraft-brown-light mt-1">
                        ほじきげんをすぎると、その日の0時から順番に消されるので、早めにダウンロードしましょう。
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            {/* アップロード手順 */}
            <div className="minecraft-section">
              <h3 className="minecraft-section-title">
                <Upload className="w-5 h-5" />
                ファイルをおくるとき（アップロード）
              </h3>
              <div className="minecraft-section-content">
                <ol className="space-y-3">
                  <li className="minecraft-step">
                    <span className="minecraft-step-number">1</span>
                    <div>
                      <strong>ワールドをZIPにまとめる。</strong>
                      <div className="text-sm text-minecraft-brown-light mt-1">
                        フォルダーを右クリック → 「送る」→「ZIPフォルダー」をえらぶだけ。
                      </div>
                    </div>
                  </li>
                  <li className="minecraft-step">
                    <span className="minecraft-step-number">2</span>
                    <div>
                      <strong>ギガファイル便を開いたら、1番上で ほじきげん（おすすめ：14日） をえらぶ。</strong>
                    </div>
                  </li>
                  <li className="minecraft-step">
                    <span className="minecraft-step-number">3</span>
                    <div>
                      <strong>さっき作ったZIPファイルをドラッグ＆ドロップですぐアップロードがはじまる。</strong>
                    </div>
                  </li>
                  <li className="minecraft-step">
                    <span className="minecraft-step-number">4</span>
                    <div>
                      <strong>でてきた ダウンロードリンク をコピーして、LINEで送信。</strong>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="minecraft-modal-footer">
          <button 
            onClick={onClose}
            className="confirm-cta-btn"
            aria-label="わかった"
          >
            わかった！
          </button>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .minecraft-info-section {
          background: var(--minecraft-grass-light);
          border: 3px solid var(--minecraft-grass);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .minecraft-section {
          background: var(--minecraft-stone-light);
          border: 2px solid var(--minecraft-stone);
          border-radius: 8px;
          padding: 20px;
          box-shadow: 
            0 4px 0 var(--minecraft-stone-dark),
            0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .minecraft-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          font-weight: bold;
          color: var(--minecraft-brown);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--minecraft-stone);
        }

        .minecraft-section-content {
          color: var(--minecraft-brown);
          line-height: 1.6;
        }

        .minecraft-step {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px;
          background: white;
          border: 2px solid var(--minecraft-stone);
          border-radius: 6px;
          box-shadow: 0 2px 0 var(--minecraft-stone-dark);
        }

        .minecraft-step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: var(--minecraft-emerald);
          color: white;
          border-radius: 50%;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
          box-shadow: 0 2px 0 var(--minecraft-emerald-dark);
        }

        .minecraft-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--minecraft-blue);
          text-decoration: underline;
          font-weight: bold;
          transition: color 0.2s ease;
        }

        .minecraft-link:hover {
          color: var(--minecraft-blue-dark);
        }

        ul {
          list-style: none;
          padding: 0;
        }

        ol {
          list-style: none;
          padding: 0;
        }
      `}</style>
      <style jsx>{`
        .confirm-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 180px;
          padding: 12px 18px;
          font-weight: 800;
          color: #fff;
          background: linear-gradient(135deg, var(--btn-green) 0%, #0F6E40 100%);
          border: 3px solid var(--minecraft-brown);
          box-shadow: inset 2px 2px 0 rgba(255,255,255,.3), inset -2px -2px 0 rgba(0,0,0,.25), 4px 4px 0 rgba(0,0,0,.25);
          border-radius: 10px;
          text-decoration: none;
          transition: transform .1s ease, box-shadow .1s ease;
        }
        .confirm-cta-btn:hover { transform: translate(-1px, -1px); box-shadow: inset 2px 2px 0 rgba(255,255,255,.35), inset -2px -2px 0 rgba(0,0,0,.3), 6px 6px 0 rgba(0,0,0,.28); }
        .confirm-cta-btn:active { transform: translate(0,0); box-shadow: inset 2px 2px 0 rgba(0,0,0,.3), inset -2px -2px 0 rgba(255,255,255,.1), 2px 2px 0 rgba(0,0,0,.2); }
      `}</style>
    </div>
  )
}