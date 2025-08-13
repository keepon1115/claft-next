'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Play, Book, Code, CheckCircle, Trophy, ExternalLink, Clock } from 'lucide-react'
import { useMinecraftSdgsStore } from '@/stores/minecraftSdgsStore'
import type { MinecraftStageStatus } from '@/stores/minecraftSdgsStore'

interface MinecraftStageModalProps {
  stageId: number
  isOpen: boolean
  onClose: () => void
}

// ① ファイル先頭の import 群の下あたりに追加
const withTimeout = <T,>(p: Promise<T>, ms = 5000) =>
  Promise.race<T | 'timeout'>([
    p,
    new Promise<'timeout'>(resolve => setTimeout(() => resolve('timeout'), ms)),
  ]);



export default function MinecraftStageModal({ stageId, isOpen, onClose }: MinecraftStageModalProps) {
  const {
    stageDetails,
    watchSdgsVideo,
    completeSdgsWork,
    watchProgrammingVideo,
    completeProgrammingWork,
    completeStage,
  } = useMinecraftSdgsStore()

  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<
    'sdgs_video' | 'sdgs_work' | 'programming_video' | 'programming_work' | 'message'
  >('sdgs_video')

  // ── 送信多重防止（モーダル再オープン時に必ず初期化） ─────────────────────────
  const submittingRef = useRef(false)
  useEffect(() => {
    if (!isOpen) return
    submittingRef.current = false
    setIsLoading(false)
  }, [isOpen])
  // ───────────────────────────────────────────────────────────────────

  const stage = stageDetails[stageId]
  if (!isOpen || !stage) return null

  // ステップ決定
  useEffect(() => {
    if (!stage) return
    switch (stage.status) {
      case 'current':
      case 'locked':
        setCurrentStep('sdgs_video')
        break
      case 'sdgs_video_watched':
        setCurrentStep('sdgs_work')
        break
      case 'sdgs_work_completed':
        setCurrentStep('programming_video')
        break
      case 'programming_video_watched':
        setCurrentStep('programming_work')
        break
      case 'programming_work_completed':
      case 'completed':
        setCurrentStep('message')
        break
      default:
        setCurrentStep('sdgs_video')
    }
  }, [stage])

  // ── 外部リンク遷移：意図を保存→先に閉じる→新規タブで開く ─────────────────────
  const openExternal = useCallback(
    (url: string, intent: 'sdgs_video' | 'sdgs_work' | 'programming_video' | 'programming_work') => {
      try {
        localStorage.setItem('sdgs:return', JSON.stringify({ stageId, intent, ts: Date.now() }))
      } catch {}
      onClose() // 先に閉じてオーバーレイ等を確実に解除
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    [stageId, onClose]
  )

  // ── 復帰直後のフォーカス補正（完了ボタンへ）＆フラグクリア ─────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sdgs:return')
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.stageId === stageId) {
        setTimeout(() => {
          document.querySelector<HTMLButtonElement>('[data-testid="complete-button"]')?.focus()
        }, 0)
        localStorage.removeItem('sdgs:return')
      }
    } catch {}
  }, [stageId])
  // ───────────────────────────────────────────────────────────────────

  // 完了処理（finally で解除を保証）
  const handleStepComplete = async (step: MinecraftStageStatus) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setIsLoading(true)
    try {
      switch (step) {
        case 'sdgs_video_watched':
          await watchSdgsVideo(stageId)
          setCurrentStep('sdgs_work')
          break
        case 'sdgs_work_completed':
          await completeSdgsWork(stageId)
          setCurrentStep('programming_video')
          break
        case 'programming_video_watched':
          await watchProgrammingVideo(stageId)
          setCurrentStep('programming_work')
          break
        case 'programming_work_completed':
          await completeProgrammingWork(stageId)
          setCurrentStep('message')
          break
          case 'completed': {
            try {
              const result = await withTimeout(completeStage(stageId), 5000);
            } catch (e) {
              console.error('completeStage failed:', e);
            } finally {
              onClose(); 
            }
            break;
          }
      }
    } catch (e) {
      console.error('Step completion failed:', e)
    } finally {
      setIsLoading(false)
      submittingRef.current = false
    }
  }

  const getStepInfo = (step: string) => {
    switch (step) {
      case 'sdgs_video':
        return { title: 'SDGsワークを見る', icon: <Book className="w-6 h-6" />, description: 'SDGsについて学ぼう！', url: stage.sdgsWorkUrl, intent: 'sdgs_video' as const }
      case 'sdgs_work':
        return { title: 'SDGsワークに挑む', icon: <CheckCircle className="w-6 h-6" />, description: '学んだ内容を実践しよう！', url: stage.sdgsFormUrl, intent: 'sdgs_work' as const }
      case 'programming_video':
        return { title: 'マイクラワークを見る', icon: <Code className="w-6 h-6" />, description: 'プログラミングスキルを身につけよう！', url: stage.programmingWorkUrl, intent: 'programming_video' as const }
      case 'programming_work':
        return { title: 'マイクラワークに挑む', icon: <CheckCircle className="w-6 h-6" />, description: 'コードを書いて解決策を作ろう！', url: stage.programmingFormUrl, intent: 'programming_work' as const }
      case 'message':
        return { title: 'みんなの作品', icon: <Trophy className="w-6 h-6" />, description: '完了メッセージを確認しよう！', url: null, intent: undefined }
      default:
        return { title: '', icon: null, description: '', url: null, intent: undefined }
    }
  }
  const stepInfo = getStepInfo(currentStep)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="minecraft-modal-container">
        {/* header */}
        <div className="minecraft-modal-header">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{stage.fallbackIcon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{stage.title}</h2>
              <p className="text-sm text-gray-200">{stage.description}</p>
              {stage.sdgsGoal && stage.sdgsGoal > 0 && (
                <span className="inline-block bg-minecraft-emerald text-white text-xs px-2 py-1 rounded mt-1">
                  SDG {stage.sdgsGoal}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="minecraft-close-button" disabled={isLoading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* steps */}
        <div className="minecraft-step-progress-bar">
          {['sdgs_video', 'sdgs_work', 'programming_video', 'programming_work', 'message'].map((s, i) => {
            const info = getStepInfo(s)
            const isActive = currentStep === s
            const isCompleted =
              ['sdgs_video', 'sdgs_work', 'programming_video', 'programming_work', 'message'].indexOf(currentStep) > i ||
              (stage.status === 'completed' && s === 'message')
            return (
              <div key={s} className={`minecraft-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-icon">{info.icon}</div>
                <span className="step-label">{info.title}</span>
              </div>
            )
          })}
        </div>

        {/* body */}
        <div className="minecraft-modal-content">
          <div className="minecraft-step-content">
            <div className="step-header">
              <div className="step-icon-large">{stepInfo.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-minecraft-brown mb-2">{stepInfo.title}</h3>
                <p className="text-minecraft-brown-light">{stepInfo.description}</p>
              </div>
            </div>

            {currentStep === 'message' ? (
              <div className="minecraft-message-content">
                <div className="text-center p-6">
                  <Trophy className="w-16 h-16 text-minecraft-gold mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-minecraft-brown mb-2">ステージクリア！</h4>
                  <p className="text-minecraft-brown-light mb-4">{stage.message}</p>
                  {stage.status !== 'completed' && (
                    <button
                      data-testid="complete-button"
                      onClick={() => handleStepComplete('completed')}
                      disabled={isLoading}
                      className="minecraft-action-button primary"
                    >
                      {isLoading ? (<><Clock className="w-4 h-4 animate-spin" />処理中...</>) : (<><Trophy className="w-4 h-4" />完了する</>)}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="minecraft-action-content">
                {stepInfo.url ? (
                  <div className="action-buttons">
                    <button
                      type="button"
                      onClick={() => openExternal(stepInfo.url!, stepInfo.intent!)}
                      className="minecraft-action-button primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {currentStep.includes('video') ? '動画を見る' : 'フォームに回答する'}
                    </button>

                    <button
                      data-testid="complete-button"
                      onClick={() => {
                        const nextStatus =
                          currentStep === 'sdgs_video'
                            ? 'sdgs_video_watched'
                            : currentStep === 'sdgs_work'
                            ? 'sdgs_work_completed'
                            : currentStep === 'programming_video'
                            ? 'programming_video_watched'
                            : 'programming_work_completed'
                        handleStepComplete(nextStatus as MinecraftStageStatus)
                      }}
                      disabled={isLoading}
                      className="minecraft-action-button secondary"
                    >
                      {isLoading ? (<><Clock className="w-4 h-4 animate-spin" />処理中...</>) : (<><CheckCircle className="w-4 h-4" />完了した</>)}
                    </button>
                  </div>
                ) : (
                  <p className="text-minecraft-brown-light text-center">このステップはまだ準備中です</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* styles（省略せずそのまま） */}
        <style jsx>{`/* 既存のスタイルをそのまま残しています */ 
          .minecraft-modal-container{background:linear-gradient(135deg,rgba(255,255,255,.95) 0%,rgba(154,205,50,.1) 100%);border:4px solid var(--minecraft-brown);border-radius:0;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;box-shadow:inset 3px 3px 0 rgba(255,255,255,.3), inset -3px -3px 0 rgba(0,0,0,.3),8px 8px 16px rgba(0,0,0,.4);position:relative}
          .minecraft-modal-header{background:linear-gradient(135deg,var(--minecraft-grass) 0%,var(--minecraft-emerald) 100%);padding:20px;display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid var(--minecraft-brown)}
          .minecraft-close-button{background:rgba(255,255,255,.2);border:2px solid #fff;border-radius:0;color:#fff;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.1s}
          .minecraft-close-button:hover{background:#fff;color:var(--minecraft-brown);transform:translate(-1px,-1px)}
          .minecraft-close-button:active{transform:translate(1px,1px)}
          .minecraft-step-progress-bar{display:flex;padding:15px;background:var(--minecraft-dirt);border-bottom:2px solid var(--minecraft-brown);overflow-x:auto;gap:10px}
          .minecraft-step{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:80px;opacity:.5;transition:.3s}
          .minecraft-step.active{opacity:1;transform:scale(1.1)}
          .minecraft-step.completed{opacity:.8}
          .minecraft-step .step-icon{width:30px;height:30px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.3);border-radius:0;display:flex;align-items:center;justify-content:center;color:#fff}
          .minecraft-step.active .step-icon{background:var(--minecraft-emerald);border-color:var(--minecraft-grass);box-shadow:0 0 10px rgba(80,200,120,.5)}
          .minecraft-step.completed .step-icon{background:var(--minecraft-gold);border-color:var(--minecraft-wood)}
          .minecraft-step .step-label{font-size:10px;color:#fff;text-align:center;font-weight:bold;text-shadow:1px 1px 1px rgba(0,0,0,.5)}
          .minecraft-modal-content{padding:30px}
          .minecraft-step-content{display:flex;flex-direction:column;gap:20px}
          .step-header{display:flex;align-items:center;gap:15px;padding:20px;background:linear-gradient(135deg,rgba(154,205,50,.1) 0%,rgba(255,255,255,.1) 100%);border:2px solid var(--minecraft-grass);border-radius:0}
          .step-icon-large{width:50px;height:50px;background:var(--minecraft-emerald);border:3px solid var(--minecraft-brown);border-radius:0;display:flex;align-items:center;justify-content:center;color:#fff}
          .minecraft-action-content,.minecraft-message-content{padding:20px;background:rgba(255,255,255,.5);border:2px solid var(--minecraft-dirt-light);border-radius:0}
          .action-buttons{display:flex;gap:15px;flex-direction:column}
          .minecraft-action-button{padding:12px 20px;border:3px solid var(--minecraft-brown);border-radius:0;font-family:var(--font-dot-gothic);font-weight:bold;cursor:pointer;transition:.1s;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;font-size:14px}
          .minecraft-action-button.primary{background:linear-gradient(135deg,var(--minecraft-emerald) 0%,var(--minecraft-grass) 100%);color:#fff;text-shadow:1px 1px 2px rgba(0,0,0,.5)}
          .minecraft-action-button.secondary{background:linear-gradient(135deg,var(--minecraft-wood) 0%,var(--minecraft-dirt-light) 100%);color:#fff;text-shadow:1px 1px 2px rgba(0,0,0,.5)}
          .minecraft-action-button:hover:not(:disabled){transform:translate(-1px,-1px);box-shadow:inset 2px 2px 0 rgba(255,255,255,.3), inset -2px -2px 0 rgba(0,0,0,.3),3px 3px 6px rgba(0,0,0,.4)}
          .minecraft-action-button:active:not(:disabled){transform:translate(1px,1px);box-shadow:inset 2px 2px 0 rgba(0,0,0,.3), inset -2px -2px 0 rgba(255,255,255,.1),1px 1px 3px rgba(0,0,0,.3)}
          .minecraft-action-button:disabled{opacity:.6;cursor:not-allowed;transform:none!important}
          @media (max-width:768px){.minecraft-modal-container{margin:10px;max-height:95vh}.minecraft-modal-header{padding:15px;flex-direction:column;gap:10px;text-align:center}.minecraft-step-progress-bar{padding:10px;gap:5px}.minecraft-step{min-width:60px}.step-header{flex-direction:column;text-align:center;gap:10px}.action-buttons{gap:10px}}
        `}</style>
      </div>
    </div>
  )
}
