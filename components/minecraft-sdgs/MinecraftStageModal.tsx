'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Book, Code, CheckCircle, Trophy, ExternalLink, Clock } from 'lucide-react'
import { useMinecraftSdgsStore } from '@/stores/minecraftSdgsStore'
import type { MinecraftStageStatus } from '@/stores/minecraftSdgsStore'

interface MinecraftStageModalProps {
  stageId: number
  isOpen: boolean
  onClose: () => void
}

// タイムアウト付き（完了時に“処理中”が残らないための楽観 UI）
const withTimeout = <T,>(p: Promise<T>, ms = 5000) =>
  Promise.race<T | 'timeout'>([
    p,
    new Promise<'timeout'>(resolve => setTimeout(() => resolve('timeout'), ms)),
  ])

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

  // 送信多重防止（再オープン時に初期化）
  const submittingRef = useRef(false)
  useEffect(() => {
    if (!isOpen) return
    submittingRef.current = false
    setIsLoading(false)
  }, [isOpen])

  const stage = stageDetails[stageId]
  if (!isOpen || !stage) return null

  // 進行度から表示ステップを決定
  useEffect(() => {
    if (!stage) return
    // 完了済みステージでは最初のステップから表示し、ユーザーが自由に選択できるようにする
    if (stage.status === 'completed') {
      setCurrentStep('sdgs_video')
      return
    }
    
    switch (stage.status) {
      case 'current':
      case 'locked':
        setCurrentStep('sdgs_video'); break
      case 'sdgs_video_watched':
        setCurrentStep('sdgs_work'); break
      case 'sdgs_work_completed':
        setCurrentStep('programming_video'); break
      case 'programming_video_watched':
        setCurrentStep('programming_work'); break
      case 'programming_work_completed':
        setCurrentStep('message'); break
      default:
        setCurrentStep('sdgs_video')
    }
  }, [stage])

  // 外部リンクへ遷移（意図を保存→先に閉じる→新規タブで開く）
  const openExternal = useCallback(
    (url: string, intent: 'sdgs_video' | 'sdgs_work' | 'programming_video' | 'programming_work') => {
      try {
        localStorage.setItem('sdgs:return', JSON.stringify({ stageId, intent, ts: Date.now() }))
      } catch {}
      onClose()
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    [stageId, onClose]
  )

  // 復帰直後のフォーカス補正＆フラグクリア
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

  // ステップ完了
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
          try { await withTimeout(completeStage(stageId), 5000) }
          catch (e) { console.error('completeStage failed:', e) }
          finally { onClose() } // UIは確実に閉じる
          break
        }
      }
    } catch (e) {
      console.error('Step completion failed:', e)
    } finally {
      setIsLoading(false)
      submittingRef.current = false
    }
  }

  // ステップ情報
  const getStepInfo = (step: string) => {
    switch (step) {
      case 'sdgs_video':
        return { title: 'SDGsワークを見る', icon: <Book className="w-6 h-6" />, description: 'SDGsについて学ぼう！', url: stage.sdgsWorkUrl, intent: 'sdgs_video' as const }
      case 'sdgs_work':
        return { title: 'SDGsワークに挑む', icon: <CheckCircle className="w-6 h-6" />, description: 'SDGsの解決案を建築しよう！', url: stage.sdgsFormUrl, intent: 'sdgs_work' as const }
      case 'programming_video':
        return { title: 'マイクラワークを見る', icon: <Code className="w-6 h-6" />, description: 'プログラミングスキルを身につけよう！', url: stage.programmingWorkUrl, intent: 'programming_video' as const }
      case 'programming_work':
        return { title: 'マイクラワークに挑む', icon: <CheckCircle className="w-6 h-6" />, description: 'プログラミング＆マイクラ建築を提出しよう！', url: stage.programmingFormUrl, intent: 'programming_work' as const }
      case 'message':
        return { title: 'ステージクリア', icon: <Trophy className="w-6 h-6" />, description: '完了メッセージを確認しよう！', url: null, intent: undefined }
      default:
        return { title: '', icon: null, description: '', url: null, intent: undefined }
    }
  }
  const stepInfo = getStepInfo(currentStep)

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-[#0B1024]/70 backdrop-blur-[2px]">
      <div className="minecraft-modal-container">
        {/* ヘッダー */}
        <div className="minecraft-modal-header">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{stage.fallbackIcon}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{stage.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="minecraft-close-button" disabled={isLoading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 進行ステップ */}
        <div className="minecraft-step-progress-bar">
          {['sdgs_video', 'sdgs_work', 'programming_video', 'programming_work', 'message'].map((s, i) => {
            const info = getStepInfo(s)
            const isActive = currentStep === s
            const isCompleted =
              ['sdgs_video', 'sdgs_work', 'programming_video', 'programming_work', 'message'].indexOf(currentStep) > i ||
              (stage.status === 'completed' && s === 'message')
            // 進行中ステージでも「前のステップ」へは戻れるようクリック可能
            const activeIndex = ['sdgs_video', 'sdgs_work', 'programming_video', 'programming_work', 'message'].indexOf(currentStep)
            // 完了済みのステップはいつでも振り返れる（アクティブ以前は常に可、完了後も可）
            const isClickable = i <= activeIndex || stage.status === 'completed'
            
            return (
              <div 
                key={s} 
                className={`minecraft-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
                onClick={isClickable ? () => setCurrentStep(s as typeof currentStep) : undefined}
              >
                <div className="step-icon">{info.icon}</div>
                <span className="step-label">{info.title}</span>
              </div>
            )
          })}
        </div>

        {/* 本文 */}
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
                {stepInfo.url !== undefined ? (
                  <div className="action-buttons">
                    {/* SDGsワークに挑む: 発表ステージダウンロード（未設定時はdisabledで表示） */}
                    {currentStep === 'sdgs_work' && (
                      <button
                        type="button"
                        onClick={() => stage.sdgsStageDownloadUrl && window.open(stage.sdgsStageDownloadUrl!, '_blank', 'noopener,noreferrer')}
                        className="minecraft-action-button primary"
                        aria-label="発表ステージをダウンロード"
                        disabled={!stage.sdgsStageDownloadUrl}
                      >
                        <ExternalLink className="w-4 h-4" />
                        発表ステージダウンロード
                      </button>
                    )}

                    {/* メインCTA（動画/フォーム） */}
                    <button
                      type="button"
                      onClick={() => stepInfo.url && openExternal(stepInfo.url!, stepInfo.intent!)}
                      className="minecraft-action-button primary"
                      disabled={!stepInfo.url}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {currentStep.includes('video') ? '動画を見る' : 'フォームに回答する'}
                    </button>

                    {currentStep === 'sdgs_video' && stage.sdgsSupportPrintUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          window.open(stage.sdgsSupportPrintUrl!, '_blank', 'noopener,noreferrer')
                        }}
                        className="minecraft-action-button support"
                      >
                        <ExternalLink className="w-4 h-4" />
                        補助プリント
                      </button>
                    )}

                    {/* マイクラワークに挑む: CTA順序 1) AP道場 2) 補助プリント 3) フォーム */}
                    {currentStep === 'programming_work' && (
                      <>
                        <button
                          type="button"
                          onClick={() => stage.programmingApDojoUrl && window.open(stage.programmingApDojoUrl!, '_blank', 'noopener,noreferrer')}
                          className="minecraft-action-button support"
                          aria-label="AP道場をダウンロード"
                          disabled={!stage.programmingApDojoUrl}
                        >
                          <ExternalLink className="w-4 h-4" />
                          AP道場ダウンロード
                        </button>
                        <button
                          type="button"
                          onClick={() => stage.programmingSupportPrintUrl && window.open(stage.programmingSupportPrintUrl!, '_blank', 'noopener,noreferrer')}
                          className="minecraft-action-button support"
                          disabled={!stage.programmingSupportPrintUrl}
                        >
                          <ExternalLink className="w-4 h-4" />
                          補助プリント
                        </button>
                      </>
                    )}

                    {stage.status !== 'completed' && (
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
                    )}
                    
                    {stage.status === 'completed' && (
                      <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-green-700 font-semibold">このステップは完了済みです</p>
                        <p className="text-green-600 text-sm">動画やワークの内容を確認できます</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-minecraft-brown-light text-center">このステップはまだ準備中です</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* styles */}
        <style jsx>{`
          .minecraft-modal-container{
            background:linear-gradient(135deg,rgba(255,255,255,.98) 0%,rgba(154,205,50,.12) 100%);
            border:4px solid var(--minecraft-brown);
            border-radius:0;
            width:100%;
            max-width:600px;
            max-height:90vh;
            overflow-y:auto;
            box-shadow:
              inset 3px 3px 0 rgba(255,255,255,.35),
              inset -3px -3px 0 rgba(0,0,0,.28),
              12px 12px 24px rgba(0,0,0,.45);
            position:relative;
          }
          .minecraft-modal-header{
            background:linear-gradient(135deg,var(--minecraft-grass) 0%,var(--minecraft-emerald) 100%);
            padding:20px;
            display:flex;justify-content:space-between;align-items:center;
            border-bottom:4px solid var(--minecraft-brown);
            box-shadow: inset 0 -1px 0 rgba(255,255,255,.25);
          }
          .minecraft-close-button{
            background:rgba(255,255,255,.2);
            border:2px solid #fff;border-radius:0;color:#fff;
            width:40px;height:40px;display:flex;align-items:center;justify-content:center;
            cursor:pointer;transition:all .1s ease;
          }
          .minecraft-close-button:hover{background:#fff;color:var(--minecraft-brown);transform:translate(-1px,-1px)}
          .minecraft-close-button:active{transform:translate(1px,1px)}

          .minecraft-step-progress-bar{
            display:flex;padding:15px;background:var(--minecraft-dirt);
            border-bottom:2px solid var(--minecraft-brown);overflow-x:auto;gap:10px;
          }
          .minecraft-step{display:flex;flex-direction:column;align-items:center;gap:5px;min-width:80px;opacity:.5;transition:all .3s ease}
          .minecraft-step.active{opacity:1;transform:scale(1.1)}
          .minecraft-step.completed{opacity:.8}
          .minecraft-step.clickable{cursor:pointer}
          .minecraft-step.clickable:hover{opacity:1;transform:scale(1.05)}
          .minecraft-step .step-icon{
            width:30px;height:30px;background:rgba(255,255,255,.2);
            border:2px solid rgba(255,255,255,.3);border-radius:0;display:flex;align-items:center;justify-content:center;color:#fff;
          }
          .minecraft-step.active .step-icon{background:var(--minecraft-emerald);border-color:var(--minecraft-grass);box-shadow:0 0 10px rgba(80,200,120,.5)}
          .minecraft-step.completed .step-icon{background:var(--minecraft-gold);border-color:var(--minecraft-wood)}
          .minecraft-step .step-label{font-size:11px;color:#fff;text-align:center;font-weight:bold;text-shadow:1px 1px 1px rgba(0,0,0,.5)}

          .minecraft-modal-content{padding:30px}
          .minecraft-step-content{display:flex;flex-direction:column;gap:20px}
          .step-header{
            display:flex;align-items:center;gap:15px;padding:20px;
            background:linear-gradient(135deg,rgba(154,205,50,.1) 0%,rgba(255,255,255,.1) 100%);
            border:2px solid var(--minecraft-grass);border-radius:0
          }
          .step-icon-large{
            width:50px;height:50px;background:var(--minecraft-emerald);
            border:3px solid var(--minecraft-brown);border-radius:0;display:flex;align-items:center;justify-content:center;color:#fff
          }
          .minecraft-action-content,.minecraft-message-content{
            padding:20px;background:rgba(255,255,255,.5);
            border:2px solid var(--minecraft-dirt-light);border-radius:0
          }
          .action-buttons{display:flex;gap:15px;flex-direction:column}
          .minecraft-action-button{
            padding:12px 20px;border:3px solid var(--minecraft-brown);border-radius:0;
            font-family:var(--font-dot-gothic);font-weight:bold;cursor:pointer;transition:all .1s ease;
            display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;font-size:14px
          }
          .minecraft-action-button.primary{
            background:linear-gradient(135deg,#1a9a5a 0%,#158a52 100%);
            color:#fff;text-shadow:1px 1px 2px rgba(0,0,0,.5)
          }
          .minecraft-action-button.secondary{
            background:linear-gradient(135deg,#6a4b2f 0%,#5a3f27 100%);
            color:#fff;text-shadow:1px 1px 2px rgba(0,0,0,.5)
          }
          .minecraft-action-button.support{
            background:linear-gradient(135deg,#4CAF50 0%,#388E3C 100%);
            color:#fff;text-shadow:1px 1px 2px rgba(0,0,0,.5)
          }
          .minecraft-action-button:hover:not(:disabled){
            transform:translate(-1px,-1px);
            box-shadow:inset 2px 2px 0 rgba(255,255,255,.3), inset -2px -2px 0 rgba(0,0,0,.3), 3px 3px 6px rgba(0,0,0,.4)
          }
          .minecraft-action-button:active:not(:disabled){
            transform:translate(1px,1px);
            box-shadow:inset 2px 2px 0 rgba(0,0,0,.3), inset -2px -2px 0 rgba(255,255,255,.1), 1px 1px 3px rgba(0,0,0,.3)
          }
          .minecraft-action-button:focus-visible{
            outline:3px solid #fff; outline-offset:2px;
            box-shadow:0 0 0 4px rgba(26,154,90,.45)
          }
          .minecraft-action-button:disabled{opacity:.6;cursor:not-allowed;transform:none!important}

          @media (max-width:768px){
            .minecraft-modal-container{margin:10px;max-height:95vh}
            .minecraft-modal-header{padding:15px;flex-direction:column;gap:10px;text-align:center}
            .minecraft-step-progress-bar{padding:10px;gap:5px}
            .minecraft-step{min-width:60px}
            .step-header{flex-direction:column;text-align:center;gap:10px}
            .action-buttons{gap:10px}
          }
        `}</style>
      </div>
    </div>
  )
}
