'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Calendar, X } from 'lucide-react'

// =====================================================
// 型定義
// =====================================================

interface FilterValues {
  userSearch: string
  stageFilter: number | null
  dateFilter: string
}

interface FilterSectionProps {
  /** 初期フィルター値 */
  initialFilters?: Partial<FilterValues>
  /** フィルター変更時のコールバック */
  onFilterChange?: (filters: FilterValues) => void
  /** ローディング状態 */
  loading?: boolean
  /** フィルターリセット時のコールバック */
  onReset?: () => void
  /** デバウンス時間（ミリ秒）デフォルト: 500 */
  debounceMs?: number
}

// =====================================================
// カスタムフック: デバウンス処理
// =====================================================

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// =====================================================
// FilterSectionコンポーネント
// =====================================================

export default function FilterSection({
  initialFilters = {},
  onFilterChange,
  loading = false,
  onReset,
  debounceMs = 500
}: FilterSectionProps) {
  // フィルター状態管理
  const [filters, setFilters] = useState<FilterValues>({
    userSearch: initialFilters.userSearch || '',
    stageFilter: initialFilters.stageFilter || null,
    dateFilter: initialFilters.dateFilter || ''
  })

  // ユーザー検索のデバウンス処理
  const debouncedUserSearch = useDebouncedValue(filters.userSearch, debounceMs)

  // デバウンスされた値でフィルター変更を通知
  useEffect(() => {
    const debouncedFilters = {
      ...filters,
      userSearch: debouncedUserSearch
    }
    onFilterChange?.(debouncedFilters)
  }, [debouncedUserSearch, filters.stageFilter, filters.dateFilter, onFilterChange])

  // =====================================================
  // イベントハンドラー
  // =====================================================

  const handleUserSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, userSearch: value }))
  }, [])

  const handleStageFilterChange = useCallback((value: string) => {
    const stageId = value === '' ? null : parseInt(value, 10)
    setFilters(prev => ({ ...prev, stageFilter: stageId }))
  }, [])

  const handleDateFilterChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, dateFilter: value }))
  }, [])

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
      userSearch: '',
      stageFilter: null,
      dateFilter: ''
    }
    setFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
    onReset?.()
  }, [onFilterChange, onReset])

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Enterキーで即座にフィルターを適用（デバウンスをスキップ）
      const immediateFilters = {
        ...filters,
        userSearch: (e.target as HTMLInputElement).value
      }
      onFilterChange?.(immediateFilters)
    }
  }, [filters, onFilterChange])

  // =====================================================
  // 選択肢データ
  // =====================================================

  const stageOptions = [
    { value: '', label: '全ステージ' },
    { value: '1', label: 'ステージ1' },
    { value: '2', label: 'ステージ2' },
    { value: '3', label: 'ステージ3' },
    { value: '4', label: 'ステージ4' },
    { value: '5', label: 'ステージ5' },
    { value: '6', label: 'ステージ6（最終）' }
  ]

  const dateOptions = [
    { value: '', label: '全期間' },
    { value: 'today', label: '今日' },
    { value: 'week', label: '1週間以内' },
    { value: 'month', label: '1ヶ月以内' }
  ]

  // =====================================================
  // アクティブフィルター数の計算
  // =====================================================

  const activeFilterCount = [
    filters.userSearch,
    filters.stageFilter,
    filters.dateFilter
  ].filter(Boolean).length

  // =====================================================
  // レンダリング
  // =====================================================

  return (
    <div className="filter-section">
      {/* フィルター入力エリア */}
      <div className="filter-controls">
        {/* ユーザー検索 */}
        <div className="filter-group">
          <label className="filter-label">
            <Search size={16} />
            ユーザー検索
          </label>
          <div className="search-input-wrapper">
            <input
              type="text"
              className={`filter-input ${loading ? 'loading' : ''}`}
              value={filters.userSearch}
              onChange={(e) => handleUserSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ユーザー名またはメールで検索"
              disabled={loading}
            />
            {filters.userSearch && (
              <button
                className="clear-search-btn"
                onClick={() => handleUserSearchChange('')}
                type="button"
                aria-label="検索をクリア"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ステージフィルター */}
        <div className="filter-group">
          <label className="filter-label">
            <Filter size={16} />
            ステージ
          </label>
          <select
            className="filter-select"
            value={filters.stageFilter || ''}
            onChange={(e) => handleStageFilterChange(e.target.value)}
            disabled={loading}
          >
            {stageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 日付フィルター */}
        <div className="filter-group">
          <label className="filter-label">
            <Calendar size={16} />
            提出日
          </label>
          <select
            className="filter-select"
            value={filters.dateFilter}
            onChange={(e) => handleDateFilterChange(e.target.value)}
            disabled={loading}
          >
            {dateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* フィルターアクション */}
      <div className="filter-actions">
        {activeFilterCount > 0 && (
          <div className="active-filters-indicator">
            <span className="filter-count">{activeFilterCount}個のフィルタを適用中</span>
          </div>
        )}
        
        <div className="filter-buttons">
          <button
            className="filter-btn clear"
            onClick={handleClearFilters}
            disabled={loading || activeFilterCount === 0}
            type="button"
          >
            <X size={16} />
            クリア
          </button>
        </div>
      </div>

      <style jsx>{`
        .filter-section {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          border: 1px solid #e0e0e0;
        }

        .filter-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: flex-end;
          margin-bottom: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 200px;
          flex: 1;
        }

        .filter-label {
          font-size: 14px;
          font-weight: 700;
          color: #666;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .filter-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          transition: all 0.3s ease;
          padding-right: 40px;
        }

        .filter-input:focus {
          outline: none;
          border-color: #673AB7;
          box-shadow: 0 0 0 3px rgba(103, 58, 183, 0.1);
        }

        .filter-input.loading {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .filter-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .clear-search-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .clear-search-btn:hover {
          background: #f0f0f0;
          color: #666;
        }

        .filter-select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #673AB7;
          box-shadow: 0 0 0 3px rgba(103, 58, 183, 0.1);
        }

        .filter-select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .filter-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }

        .active-filters-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-count {
          background: #673AB7;
          color: white;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .filter-btn.clear {
          background: #6c757d;
          color: white;
        }

        .filter-btn.clear:hover:not(:disabled) {
          background: #5a6268;
          transform: translateY(-1px);
        }

        .filter-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .filter-section {
            padding: 16px;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            min-width: unset;
          }

          .filter-actions {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .filter-buttons {
            justify-content: center;
          }

          .active-filters-indicator {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .filter-controls {
            gap: 12px;
          }

          .filter-input,
          .filter-select {
            padding: 10px 12px;
            font-size: 16px; /* iOSのズーム防止 */
          }

          .filter-btn {
            padding: 12px 16px;
            font-size: 14px;
          }
        }

        /* フォーカス時のアニメーション */
        .filter-input:focus,
        .filter-select:focus {
          transform: translateY(-1px);
        }

        /* 読み込み中のアニメーション */
        .filter-input.loading::after {
          content: '';
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          border: 2px solid #673AB7;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }

        /* アクセシビリティ改善 */
        .filter-btn:focus,
        .clear-search-btn:focus {
          outline: 2px solid #673AB7;
          outline-offset: 2px;
        }

        /* ダークモード対応（将来の拡張用） */
        @media (prefers-color-scheme: dark) {
          .filter-section {
            background: #2a2a2a;
            border-color: #444;
          }

          .filter-input,
          .filter-select {
            background: #333;
            border-color: #555;
            color: white;
          }

          .filter-label {
            color: #ccc;
          }

          .clear-search-btn:hover {
            background: #444;
          }
        }
      `}</style>
    </div>
  )
}
