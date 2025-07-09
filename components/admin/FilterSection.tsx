'use client'

import { useState, useEffect, useCallback, memo, useRef } from 'react'
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
// メモ化されたフィルターグループコンポーネント
// =====================================================

const FilterGroup = memo(({ 
  label, 
  icon: Icon, 
  children 
}: { 
  label: string
  icon: any
  children: React.ReactNode 
}) => (
  <div className="flex flex-col gap-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <Icon size={16} />
      {label}
    </label>
    {children}
  </div>
))

FilterGroup.displayName = 'FilterGroup'

// =====================================================
// メモ化されたフィルターバッジコンポーネント
// =====================================================

const FilterBadge = memo(({ 
  count 
}: { 
  count: number 
}) => (
  count > 0 ? (
    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-purple-600 rounded-full">
      {count}
    </span>
  ) : null
))

FilterBadge.displayName = 'FilterBadge'

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
  // onFilterChangeの安定した参照を保持
  const onFilterChangeRef = useRef(onFilterChange)
  
  // refを更新
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange
  }, [onFilterChange])

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
    onFilterChangeRef.current?.(debouncedFilters)
  }, [debouncedUserSearch, filters.stageFilter, filters.dateFilter])

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
    onFilterChangeRef.current?.(clearedFilters)
    onReset?.()
  }, [onReset])

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Enterキーで即座にフィルターを適用（デバウンスをスキップ）
      const immediateFilters = {
        ...filters,
        userSearch: (e.target as HTMLInputElement).value
      }
      onFilterChangeRef.current?.(immediateFilters)
    }
  }, [filters])

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
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Filter size={20} />
          フィルター
          <FilterBadge count={activeFilterCount} />
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X size={14} />
            クリア
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ユーザー検索 */}
        <FilterGroup label="ユーザー検索" icon={Search}>
          <div className="relative">
            <input
              type="text"
              className={`w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              value={filters.userSearch}
              onChange={(e) => handleUserSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ユーザー名またはメールで検索"
              disabled={loading}
            />
            {filters.userSearch && (
              <button
                onClick={() => handleUserSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
                aria-label="検索をクリア"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </FilterGroup>

        {/* ステージフィルター */}
        <FilterGroup label="ステージ" icon={Filter}>
          <select
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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
        </FilterGroup>

        {/* 日付フィルター */}
        <FilterGroup label="期間" icon={Calendar}>
          <select
            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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
        </FilterGroup>
      </div>
    </div>
  )
}
