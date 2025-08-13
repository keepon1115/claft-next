'use client'

import React, { useState, useEffect } from 'react'
import { X, Play, Book, Code, CheckCircle, Trophy, ExternalLink, Clock } from 'lucide-react'
import { useMinecraftSdgsStore } from '@/stores/minecraftSdgsStore'
import type { MinecraftStageProgress, MinecraftStageStatus } from '@/stores/minecraftSdgsStore'

interface MinecraftStageModalProps {
  stageId: number
  isOpen: boolean
  onClose: () => void
}

export default function MinecraftStageModal({ stageId, isOpen, onClose }: MinecraftStageModalProps) {
  const { stageDetails, watchSdgsVideo, completeSdgsWork, watchProgrammingVideo, completeProgrammingWork, completeStage } = useMinecraftSdgsStore()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'sdgs_video' | 'sdgs_work' | 'programming_video' | 'programming_work' | 'message'>('sdgs_video')

  const stage = stageDetails[stageId]

  // ステージの進行状況に応じて現在のステップを決定
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
        setCurrentStep('message')
        break
      case 'completed':
        setCurrentStep('message')
        break
      default:
        setCurrentStep('sdgs_video')
    }
  }, [stage])

  if (!isOpen || !stage) return null

  // 各ステップの完了処理
  const handleStepComplete = async (step: MinecraftStageStatus) => {
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
        case 'completed':
          await completeStage(stageId)
          onClose()
          break
      }
    } catch (error) {
      console.error('Step completion failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ステップのタイトルとアイコンを取得
  const getStepInfo = (step: string) => {
    switch (step) {
      case 'sdgs_video':
        return { 
          title: 'SDGsワークを見る', 
          icon: <Book className="w-6 h-6" />, 
          description: 'SDGsについて学ぼう！',
          url: stage.sdgsWorkUrl
        }
      case 'sdgs_work':
        return { 
          title: 'SDGsワークに挑む', 
          icon: <CheckCircle className="w-6 h-6" />, 
          description: '学んだ内容を実践しよう！',
          url: stage.sdgsFormUrl
        }
      case 'programming_video':
        return { 
          title: 'マイクラワークを見る', 
          icon: <Code className="w-6 h-6" />, 
          description: 'プログラミングスキルを身につけよう！',
          url: stage.programmingWorkUrl
        }
      case 'programming_work':
        return { 
          title: 'マイクラワークに挑む', 
          icon: <CheckCircle className="w-6 h-6" />, 
          description: 'コードを書いて解決策を作ろう！',
          url: stage.programmingFormUrl
        }
      case 'message':
        return { 
          title: 'みんなの作品', 
          icon: <Trophy className="w-6 h-6" />, 
          description: '完了メッセージを確認しよう！',
          url: null
        }
      default:
        return { title: '', icon: null, description: '', url: null }
    }
  }

  const stepInfo = getStepInfo(currentStep)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="minecraft-modal-container">
        {/* ヘッダー */}
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
          <button
            onClick={onClose}
            className="minecraft-close-button"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* プログレスステップ */}
        <div className="minecraft-step-progress-bar">
          {['sdgs_video', 'sdgs_work', 'programming_video', 'programming_work', 'message'].map((step, index) => {
            const info = getStepInfo(step)
            const isActive = currentStep === step
            const isCompleted = ['sdgs_video', 'sdgs_work', 'programming_video', 'programming_work', 'message'].indexOf(currentStep) > index ||
                               (stage.status === 'completed' && step === 'message')
            
            return (
              <div 
                key={step}
                className={`minecraft-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="step-icon">
                  {info.icon}
                </div>
                <span className="step-label">{info.title}</span>
              </div>
            )
          })}
        </div>

        {/* メインコンテンツ */}
        <div className="minecraft-modal-content">
          <div className="minecraft-step-content">
            <div className="step-header">
              <div className="step-icon-large">
                {stepInfo.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-minecraft-brown mb-2">
                  {stepInfo.title}
                </h3>
                <p className="text-minecraft-brown-light">
                  {stepInfo.description}
                </p>
              </div>
            </div>

            {currentStep === 'message' ? (
              // 完了メッセージ
              <div className="minecraft-message-content">
                <div className="text-center p-6">
                  <Trophy className="w-16 h-16 text-minecraft-gold mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-minecraft-brown mb-2">
                    ステージクリア！
                  </h4>
                  <p className="text-minecraft-brown-light mb-4">
                    {stage.message}
                  </p>
                  {stage.status !== 'completed' && (
                    <button
                      onClick={() => handleStepComplete('completed')}
                      disabled={isLoading}
                      className="minecraft-action-button primary"
                    >
                      {isLoading ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          処理中...
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4" />
                          完了する
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // 動画・フォームコンテンツ
              <div className="minecraft-action-content">
                {stepInfo.url ? (
                  <div className="action-buttons">
                    <a
                      href={stepInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="minecraft-action-button primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {currentStep.includes('video') ? '動画を見る' : 'フォームに回答する'}
                    </a>
                    
                    <button
                      onClick={() => {
                        const nextStatus = currentStep === 'sdgs_video' ? 'sdgs_video_watched' :
                                         currentStep === 'sdgs_work' ? 'sdgs_work_completed' :
                                         currentStep === 'programming_video' ? 'programming_video_watched' :
                                         'programming_work_completed'
                        handleStepComplete(nextStatus as MinecraftStageStatus)
                      }}
                      disabled={isLoading}
                      className="minecraft-action-button secondary"
                    >
                      {isLoading ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          処理中...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          完了した
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-minecraft-brown-light text-center">
                    このステップはまだ準備中です
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .minecraft-modal-container {
            background: linear-gradient(135deg, 
              rgba(255,255,255,0.95) 0%, 
              rgba(154,205,50,0.1) 100%
            );
            border: 4px solid var(--minecraft-brown);
            border-radius: 0;
            width: 100%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 
              inset 3px 3px 0 rgba(255,255,255,0.3),
              inset -3px -3px 0 rgba(0,0,0,0.3),
              8px 8px 16px rgba(0,0,0,0.4);
            position: relative;
          }

          .minecraft-modal-header {
            background: linear-gradient(135deg, 
              var(--minecraft-grass) 0%, 
              var(--minecraft-emerald) 100%
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

          .minecraft-close-button:active {
            transform: translate(1px, 1px);
          }

          .minecraft-step-progress-bar {
            display: flex;
            padding: 15px;
            background: var(--minecraft-dirt);
            border-bottom: 2px solid var(--minecraft-brown);
            overflow-x: auto;
            gap: 10px;
          }

          .minecraft-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            min-width: 80px;
            opacity: 0.5;
            transition: all 0.3s ease;
          }

          .minecraft-step.active {
            opacity: 1;
            transform: scale(1.1);
          }

          .minecraft-step.completed {
            opacity: 0.8;
          }

          .minecraft-step .step-icon {
            width: 30px;
            height: 30px;
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .minecraft-step.active .step-icon {
            background: var(--minecraft-emerald);
            border-color: var(--minecraft-grass);
            box-shadow: 0 0 10px rgba(80,200,120,0.5);
          }

          .minecraft-step.completed .step-icon {
            background: var(--minecraft-gold);
            border-color: var(--minecraft-wood);
          }

          .minecraft-step .step-label {
            font-size: 10px;
            color: white;
            text-align: center;
            font-weight: bold;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
          }

          .minecraft-modal-content {
            padding: 30px;
          }

          .minecraft-step-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .step-header {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 20px;
            background: linear-gradient(135deg, 
              rgba(154,205,50,0.1) 0%, 
              rgba(255,255,255,0.1) 100%
            );
            border: 2px solid var(--minecraft-grass);
            border-radius: 0;
          }

          .step-icon-large {
            width: 50px;
            height: 50px;
            background: var(--minecraft-emerald);
            border: 3px solid var(--minecraft-brown);
            border-radius: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .minecraft-action-content,
          .minecraft-message-content {
            padding: 20px;
            background: rgba(255,255,255,0.5);
            border: 2px solid var(--minecraft-dirt-light);
            border-radius: 0;
          }

          .action-buttons {
            display: flex;
            gap: 15px;
            flex-direction: column;
          }

          .minecraft-action-button {
            padding: 12px 20px;
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
            text-decoration: none;
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

          .minecraft-action-button.secondary {
            background: linear-gradient(135deg, 
              var(--minecraft-wood) 0%, 
              var(--minecraft-dirt-light) 100%
            );
            color: white;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }

          .minecraft-action-button:hover:not(:disabled) {
            transform: translate(-1px, -1px);
            box-shadow: 
              inset 2px 2px 0 rgba(255,255,255,0.3),
              inset -2px -2px 0 rgba(0,0,0,0.3),
              3px 3px 6px rgba(0,0,0,0.4);
          }

          .minecraft-action-button:active:not(:disabled) {
            transform: translate(1px, 1px);
            box-shadow: 
              inset 2px 2px 0 rgba(0,0,0,0.3),
              inset -2px -2px 0 rgba(255,255,255,0.1),
              1px 1px 3px rgba(0,0,0,0.3);
          }

          .minecraft-action-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
          }

          /* レスポンシブ対応 */
          @media (max-width: 768px) {
            .minecraft-modal-container {
              margin: 10px;
              max-height: 95vh;
            }
            
            .minecraft-modal-header {
              padding: 15px;
              flex-direction: column;
              gap: 10px;
              text-align: center;
            }
            
            .minecraft-step-progress-bar {
              padding: 10px;
              gap: 5px;
            }
            
            .minecraft-step {
              min-width: 60px;
            }
            
            .step-header {
              flex-direction: column;
              text-align: center;
              gap: 10px;
            }
            
            .action-buttons {
              gap: 10px;
            }
          }
        `}</style>
      </div>
    </div>
  )
}