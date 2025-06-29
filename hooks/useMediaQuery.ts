'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================
// 型定義
// ============================================

export interface MediaQueryBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  smallScreen: string;
}

export interface DeviceType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallScreen: boolean;
  screenWidth: number;
  screenHeight: number;
}

export interface MediaQueryHookReturn extends DeviceType {
  matches: (query: string) => boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  isTouch: boolean;
  prefersReducedMotion: boolean;
  prefersDarkMode: boolean;
}

// ============================================
// ブレークポイント定義（globals.cssと整合性を保つ）
// ============================================

const DEFAULT_BREAKPOINTS: MediaQueryBreakpoints = {
  smallScreen: '(max-width: 480px)',
  mobile: '(min-width: 481px) and (max-width: 768px)',
  tablet: '(min-width: 769px) and (max-width: 1199px)',
  desktop: '(min-width: 1200px)',
};

// 追加のメディアクエリ定義
const ADDITIONAL_QUERIES = {
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  touch: '(pointer: coarse)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
};

// ============================================
// ユーティリティ関数
// ============================================

/**
 * SSR環境での安全なwindowアクセス
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * MediaQueryListをサポートしているかチェック
 */
const supportsMatchMedia = (): boolean => {
  return isBrowser() && typeof window.matchMedia === 'function';
};

/**
 * 初期値を安全に取得
 */
const getInitialMatches = (query: string): boolean => {
  if (!supportsMatchMedia()) {
    return false; // SSR時はfalseを返す
  }
  return window.matchMedia(query).matches;
};

/**
 * 画面サイズから対象デバイスタイプを判定
 */
const getDeviceTypeFromWidth = (width: number): Partial<DeviceType> => {
  return {
    isSmallScreen: width <= 480,
    isMobile: width >= 481 && width <= 768,
    isTablet: width >= 769 && width <= 1199,
    isDesktop: width >= 1200,
  };
};

// ============================================
// メインフック: useMediaQuery
// ============================================

/**
 * 単一のメディアクエリを監視するフック
 * 
 * @param query - メディアクエリ文字列
 * @param defaultValue - SSR時のデフォルト値
 * @returns メディアクエリの現在の状態
 * 
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersMotion = useMediaQuery('(prefers-reduced-motion: no-preference)', true);
 * ```
 */
export const useMediaQuery = (
  query: string,
  defaultValue: boolean = false
): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (!supportsMatchMedia()) {
      return defaultValue;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (!supportsMatchMedia()) {
      return;
    }

    const mediaQueryList = window.matchMedia(query);
    
    // 初期値を設定（ハイドレーション時の調整）
    setMatches(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // イベントリスナーを追加
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // 古いブラウザ対応
      mediaQueryList.addListener(handleChange);
    }

    // クリーンアップ
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
};

// ============================================
// 拡張フック: useResponsive
// ============================================

/**
 * レスポンシブデザイン用の包括的なメディアクエリフック
 * 
 * @param customBreakpoints - カスタムブレークポイント（オプション）
 * @returns デバイス情報とユーティリティ関数
 * 
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, matches } = useResponsive();
 * 
 * if (isMobile) {
 *   return <MobileComponent />;
 * }
 * 
 * const isLargeScreen = matches('(min-width: 1400px)');
 * ```
 */
export const useResponsive = (
  customBreakpoints?: Partial<MediaQueryBreakpoints>
): MediaQueryHookReturn => {
  const breakpoints = { ...DEFAULT_BREAKPOINTS, ...customBreakpoints };

  // 画面サイズの監視
  const [screenSize, setScreenSize] = useState(() => {
    if (!isBrowser()) {
      return { width: 1200, height: 800 }; // SSR時のデフォルト値（デスクトップサイズ）
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  // 各ブレークポイントの監視
  const isSmallScreen = useMediaQuery(breakpoints.smallScreen);
  const isMobile = useMediaQuery(breakpoints.mobile);
  const isTablet = useMediaQuery(breakpoints.tablet);
  const isDesktop = useMediaQuery(breakpoints.desktop);

  // 追加のメディアクエリ監視
  const isPortrait = useMediaQuery(ADDITIONAL_QUERIES.portrait);
  const isLandscape = useMediaQuery(ADDITIONAL_QUERIES.landscape, true); // デフォルトは横向き
  const isTouch = useMediaQuery(ADDITIONAL_QUERIES.touch);
  const prefersReducedMotion = useMediaQuery(ADDITIONAL_QUERIES.reducedMotion);
  const prefersDarkMode = useMediaQuery(ADDITIONAL_QUERIES.darkMode);

  // 画面サイズ変更の監視
  useEffect(() => {
    if (!isBrowser()) return;

    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 任意のメディアクエリをチェックする関数
  const matches = useCallback((query: string): boolean => {
    if (!supportsMatchMedia()) {
      return false;
    }
    return window.matchMedia(query).matches;
  }, []);

  return {
    // デバイスタイプ
    isSmallScreen,
    isMobile,
    isTablet,
    isDesktop,

    // 画面サイズ
    screenWidth: screenSize.width,
    screenHeight: screenSize.height,

    // 向き
    isPortrait,
    isLandscape,

    // 入力方式とユーザー設定
    isTouch,
    prefersReducedMotion,
    prefersDarkMode,

    // ユーティリティ関数
    matches,
  };
};

// ============================================
// 便利なカスタムフック
// ============================================

/**
 * モバイルファーストのレスポンシブフック
 * 
 * @returns モバイル、タブレット以上、デスクトップ以上の判定
 * 
 * @example
 * ```tsx
 * const { isMobile, isTabletUp, isDesktopUp } = useMobileFirst();
 * ```
 */
export const useMobileFirst = () => {
  const isMobile = useMediaQuery('(max-width: 768px)', true); // モバイルファーストなのでデフォルトtrue
  const isTabletUp = useMediaQuery('(min-width: 769px)');
  const isDesktopUp = useMediaQuery('(min-width: 1200px)');

  return {
    isMobile,
    isTabletUp,
    isDesktopUp,
  };
};

/**
 * ダークモード対応フック
 * 
 * @returns ダークモードの状態と切り替え関数
 * 
 * @example
 * ```tsx
 * const { isDarkMode, isSystemDark, toggleDarkMode } = useDarkMode();
 * ```
 */
export const useDarkMode = () => {
  const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isBrowser()) return;

    const stored = localStorage.getItem('darkMode');
    if (stored) {
      setIsDarkMode(JSON.parse(stored));
    } else {
      setIsDarkMode(isSystemDark);
    }
  }, [isSystemDark]);

  const toggleDarkMode = useCallback(() => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    if (isBrowser()) {
      localStorage.setItem('darkMode', JSON.stringify(newValue));
    }
  }, [isDarkMode]);

  return {
    isDarkMode: isDarkMode ?? isSystemDark,
    isSystemDark,
    toggleDarkMode,
  };
};

/**
 * タッチデバイス判定フック
 * 
 * @returns タッチデバイスかどうかの判定
 * 
 * @example
 * ```tsx
 * const isTouch = useTouchDevice();
 * ```
 */
export const useTouchDevice = (): boolean => {
  return useMediaQuery('(pointer: coarse)');
};

/**
 * 縦向き判定フック
 * 
 * @returns 縦向きかどうかの判定
 * 
 * @example
 * ```tsx
 * const isPortrait = useOrientation();
 * ```
 */
export const useOrientation = (): boolean => {
  return useMediaQuery('(orientation: portrait)', true); // モバイルファーストで縦向きをデフォルト
};

// ============================================
// エクスポート
// ============================================

export default useResponsive; 