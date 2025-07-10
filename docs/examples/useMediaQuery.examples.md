# useMediaQuery フック使用例

画面サイズの監視、デバイス判定、SSR対応を含む包括的なメディアクエリフックの使用例とドキュメントです。

## 📖 目次

1. [基本的な使用方法](#基本的な使用方法)
2. [レスポンシブコンポーネント](#レスポンシブコンポーネント)
3. [コンポーネント別の実装例](#コンポーネント別の実装例)
4. [カスタムブレークポイント](#カスタムブレークポイント)
5. [ダークモード対応](#ダークモード対応)
6. [パフォーマンス最適化](#パフォーマンス最適化)
7. [TypeScript型安全性](#typescript型安全性)

## 基本的な使用方法

### 1. 単一メディアクエリの監視

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

const MobileComponent = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div>
      {isMobile ? '📱 モバイル表示' : '🖥️ デスクトップ表示'}
    </div>
  );
};
```

### 2. 包括的なレスポンシブフック

```tsx
import { useResponsive } from '@/hooks/useMediaQuery';

const ResponsiveComponent = () => {
  const { 
    isMobile, 
    isTablet, 
    isDesktop,
    isSmallScreen,
    screenWidth,
    isPortrait,
    isTouch 
  } = useResponsive();
  
  return (
    <div>
      <h1>デバイス情報</h1>
      <p>画面幅: {screenWidth}px</p>
      <p>デバイス: {
        isSmallScreen ? '小画面' :
        isMobile ? 'モバイル' :
        isTablet ? 'タブレット' : 'デスクトップ'
      }</p>
      <p>向き: {isPortrait ? '縦向き' : '横向き'}</p>
      <p>操作: {isTouch ? 'タッチ' : 'マウス'}</p>
    </div>
  );
};
```

### 3. モバイルファースト対応

```tsx
import { useMobileFirst } from '@/hooks/useMediaQuery';

const MobileFirstComponent = () => {
  const { isMobile, isTabletUp, isDesktopUp } = useMobileFirst();
  
  if (isMobile) {
    return <MobileLayout />;
  }
  
  if (isTabletUp) {
    return <TabletLayout />;
  }
  
  return <DesktopLayout />;
};
```

## レスポンシブコンポーネント

### ナビゲーションコンポーネント

```tsx
import React from 'react';
import { useResponsive } from '@/hooks/useMediaQuery';
import { HamburgerMenu } from '@/components/common/HamburgerMenu';
import { Sidebar } from '@/components/common/Sidebar';

const ResponsiveNavigation = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  if (isMobile) {
    return (
      <>
        <HamburgerMenu />
        <Sidebar />
      </>
    );
  }
  
  if (isTablet) {
    return (
      <nav className="tablet-nav">
        <HamburgerMenu />
        <div className="nav-items">
          <a href="/mirai">未来</a>
          <a href="/yononaka">世の中</a>
          <a href="/quest">クエスト</a>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="desktop-nav">
      <div className="nav-brand">CLAFT</div>
      <div className="nav-links">
        <a href="/mirai">未来設計</a>
        <a href="/yononaka">世の中発見</a>
        <a href="/quest">クエスト</a>
        <a href="/profile">プロフィール</a>
      </div>
    </nav>
  );
};
```

### グリッドレイアウト

```tsx
import { useResponsive } from '@/hooks/useMediaQuery';

const ResponsiveGrid = ({ children }: { children: React.ReactNode }) => {
  const { isSmallScreen, isMobile, isTablet, isDesktop } = useResponsive();
  
  const getGridCols = () => {
    if (isSmallScreen) return 1;
    if (isMobile) return 2;
    if (isTablet) return 3;
    if (isDesktop) return 4;
    return 4;
  };
  
  return (
    <div 
      className="grid gap-4"
      style={{ 
        gridTemplateColumns: `repeat(${getGridCols()}, 1fr)` 
      }}
    >
      {children}
    </div>
  );
};

// 使用例
const CardGrid = () => {
  const cards = Array.from({ length: 12 }, (_, i) => (
    <div key={i} className="card p-4 bg-white rounded-lg shadow">
      カード {i + 1}
    </div>
  ));
  
  return (
    <ResponsiveGrid>
      {cards}
    </ResponsiveGrid>
  );
};
```

## コンポーネント別の実装例

### 1. ヘッダーコンポーネント

```tsx
import { useResponsive } from '@/hooks/useMediaQuery';

const Header = () => {
  const { isMobile, isTablet, screenWidth, isPortrait } = useResponsive();
  
  // モバイル縦向きでは高さを調整
  const headerHeight = isMobile && isPortrait ? '60px' : '80px';
  
  return (
    <header 
      className="bg-white shadow-md"
      style={{ height: headerHeight }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* ロゴ */}
        <div className="font-bold text-xl">
          {screenWidth < 480 ? 'C' : 'CLAFT'}
        </div>
        
        {/* ナビゲーション */}
        {isMobile ? (
          <HamburgerMenuButton />
        ) : (
          <nav className="flex space-x-6">
            <a href="/mirai">未来設計</a>
            <a href="/yononaka">世の中発見</a>
            <a href="/quest">クエスト</a>
          </nav>
        )}
        
        {/* ユーザーアクション */}
        <div className="flex items-center space-x-4">
          {isTablet && <NotificationIcon />}
          <UserAvatar size={isMobile ? 'sm' : 'md'} />
        </div>
      </div>
    </header>
  );
};
```

### 2. カードコンポーネント

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CardProps {
  title: string;
  content: string;
  image?: string;
}

const ResponsiveCard = ({ title, content, image }: CardProps) => {
  const isSmallScreen = useMediaQuery('(max-width: 480px)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className={`
      card rounded-lg shadow-md overflow-hidden
      ${isSmallScreen ? 'p-3' : isMobile ? 'p-4' : 'p-6'}
    `}>
      {image && (
        <img 
          src={image} 
          alt={title}
          className={`
            w-full object-cover rounded
            ${isSmallScreen ? 'h-32' : isMobile ? 'h-40' : 'h-48'}
          `}
        />
      )}
      
      <div className={image ? 'mt-4' : ''}>
        <h3 className={`
          font-bold
          ${isSmallScreen ? 'text-lg' : isMobile ? 'text-xl' : 'text-2xl'}
        `}>
          {title}
        </h3>
        
        <p className={`
          text-gray-600 mt-2
          ${isSmallScreen ? 'text-sm' : 'text-base'}
          ${isMobile ? 'line-clamp-3' : 'line-clamp-4'}
        `}>
          {content}
        </p>
      </div>
    </div>
  );
};
```

### 3. モーダルコンポーネント

```tsx
import { useResponsive, useTouchDevice } from '@/hooks/useMediaQuery';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ResponsiveModal = ({ isOpen, onClose, children }: ModalProps) => {
  const { isMobile, isSmallScreen, screenHeight } = useResponsive();
  const isTouch = useTouchDevice();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className={`
        relative bg-white rounded-lg shadow-xl max-w-full max-h-full overflow-auto
        ${isSmallScreen ? 'm-4 p-4' : isMobile ? 'm-6 p-6' : 'm-8 p-8'}
        ${isMobile ? 'w-full' : 'w-auto'}
        ${screenHeight < 600 ? 'max-h-screen' : 'max-h-[90vh]'}
        ${isTouch ? 'touch-pan-y' : ''}
      `}>
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className={`
            absolute top-4 right-4 text-gray-500 hover:text-gray-700
            ${isTouch ? 'text-2xl p-2' : 'text-xl p-1'}
          `}
        >
          ✕
        </button>
        
        {/* コンテンツ */}
        <div className={isTouch ? 'pr-12' : 'pr-8'}>
          {children}
        </div>
      </div>
    </div>
  );
};
```

## カスタムブレークポイント

```tsx
import { useResponsive } from '@/hooks/useMediaQuery';

// カスタムブレークポイントを定義
const customBreakpoints = {
  smallScreen: '(max-width: 320px)',
  mobile: '(min-width: 321px) and (max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
};

const CustomResponsiveComponent = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive(customBreakpoints);
  
  return (
    <div>
      <h1>カスタムブレークポイント</h1>
      <p>
        現在のデバイス: {
          isMobile ? 'カスタムモバイル (321-640px)' :
          isTablet ? 'カスタムタブレット (641-1024px)' :
          isDesktop ? 'カスタムデスクトップ (1025px+)' :
          '超小画面 (320px以下)'
        }
      </p>
    </div>
  );
};
```

## ダークモード対応

```tsx
import { useDarkMode, useResponsive } from '@/hooks/useMediaQuery';

const ThemeAwareComponent = () => {
  const { isDarkMode, isSystemDark, toggleDarkMode } = useDarkMode();
  const { isMobile } = useResponsive();
  
  return (
    <div className={`
      min-h-screen transition-colors duration-300
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
    `}>
      <header className={`
        p-4 border-b
        ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">CLAFT</h1>
          
          <button
            onClick={toggleDarkMode}
            className={`
              px-4 py-2 rounded-lg transition-colors
              ${isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
              }
              ${isMobile ? 'text-sm' : 'text-base'}
            `}
          >
            {isDarkMode ? '🌞' : '🌙'}
            {!isMobile && ` ${isDarkMode ? 'ライト' : 'ダーク'}モード`}
          </button>
        </div>
      </header>
      
      <main className="p-4">
        <p>システム設定: {isSystemDark ? 'ダーク' : 'ライト'}</p>
        <p>現在のテーマ: {isDarkMode ? 'ダーク' : 'ライト'}</p>
      </main>
    </div>
  );
};
```

## パフォーマンス最適化

### 1. メモ化とコンディショナルレンダリング

```tsx
import React, { memo } from 'react';
import { useResponsive } from '@/hooks/useMediaQuery';

// 重いコンポーネントをメモ化
const ExpensiveDesktopComponent = memo(() => {
  // 重い処理...
  return <div>デスクトップ専用の重いコンポーネント</div>;
});

const ExpensiveMobileComponent = memo(() => {
  // 重い処理...
  return <div>モバイル専用の重いコンポーネント</div>;
});

const OptimizedComponent = () => {
  const { isMobile, isDesktop } = useResponsive();
  
  return (
    <div>
      {/* 条件に応じてコンポーネントを切り替え */}
      {isMobile && <ExpensiveMobileComponent />}
      {isDesktop && <ExpensiveDesktopComponent />}
      
      {/* 共通コンポーネント */}
      <SharedComponent />
    </div>
  );
};
```

### 2. 遅延ローディング

```tsx
import React, { Suspense, lazy } from 'react';
import { useResponsive } from '@/hooks/useMediaQuery';

// 動的インポート
const DesktopDashboard = lazy(() => import('./DesktopDashboard'));
const MobileDashboard = lazy(() => import('./MobileDashboard'));
const TabletDashboard = lazy(() => import('./TabletDashboard'));

const LazyResponsiveComponent = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const getComponent = () => {
    if (isMobile) return <MobileDashboard />;
    if (isTablet) return <TabletDashboard />;
    if (isDesktop) return <DesktopDashboard />;
    return null;
  };
  
  return (
    <Suspense fallback={<div className="spinner">読み込み中...</div>}>
      {getComponent()}
    </Suspense>
  );
};
```

## TypeScript型安全性

### 1. 型安全なプロップス

```tsx
import { useResponsive, MediaQueryHookReturn } from '@/hooks/useMediaQuery';

interface ResponsiveProps {
  renderMobile?: (device: MediaQueryHookReturn) => React.ReactNode;
  renderTablet?: (device: MediaQueryHookReturn) => React.ReactNode;
  renderDesktop?: (device: MediaQueryHookReturn) => React.ReactNode;
  fallback?: React.ReactNode;
}

const TypeSafeResponsiveRenderer = ({
  renderMobile,
  renderTablet,
  renderDesktop,
  fallback
}: ResponsiveProps) => {
  const device = useResponsive();
  
  if (device.isMobile && renderMobile) {
    return <>{renderMobile(device)}</>;
  }
  
  if (device.isTablet && renderTablet) {
    return <>{renderTablet(device)}</>;
  }
  
  if (device.isDesktop && renderDesktop) {
    return <>{renderDesktop(device)}</>;
  }
  
  return <>{fallback}</>;
};

// 使用例
const App = () => (
  <TypeSafeResponsiveRenderer
    renderMobile={(device) => (
      <div>モバイル表示 (幅: {device.screenWidth}px)</div>
    )}
    renderTablet={(device) => (
      <div>タブレット表示 (幅: {device.screenWidth}px)</div>
    )}
    renderDesktop={(device) => (
      <div>デスクトップ表示 (幅: {device.screenWidth}px)</div>
    )}
    fallback={<div>読み込み中...</div>}
  />
);
```

### 2. カスタムフックの型定義

```tsx
import { useResponsive } from '@/hooks/useMediaQuery';

// 特定のデバイス情報のみを返すカスタムフック
export const useDeviceInfo = () => {
  const { isMobile, isTablet, isDesktop, screenWidth } = useResponsive();
  
  type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';
  
  const deviceType: DeviceType = 
    isMobile ? 'mobile' :
    isTablet ? 'tablet' :
    isDesktop ? 'desktop' : 'unknown';
  
  return {
    deviceType,
    screenWidth,
    isTouchDevice: isMobile || isTablet,
  } as const; // as const で読み取り専用にする
};

// 使用例
const DeviceInfoComponent = () => {
  const { deviceType, screenWidth, isTouchDevice } = useDeviceInfo();
  
  return (
    <div>
      <p>デバイス: {deviceType}</p>
      <p>画面幅: {screenWidth}px</p>
      <p>タッチデバイス: {isTouchDevice ? 'はい' : 'いいえ'}</p>
    </div>
  );
};
```

## 実装時の注意点

### 1. SSR対応
- 初期値は適切に設定する
- ハイドレーション後に正しい値に更新される
- サーバーとクライアントで一貫性を保つ

### 2. パフォーマンス
- 不要な再レンダリングを避ける
- 条件付きレンダリングを活用
- 重いコンポーネントはメモ化する

### 3. アクセシビリティ
- タッチデバイスでは十分なタップエリアを確保
- キーボードナビゲーションに対応
- スクリーンリーダーを考慮

### 4. テスト
- 各ブレークポイントでのテストを実施
- モバイル実機での検証
- パフォーマンス測定を定期的に実行

これらの例を参考に、CLAFTプロジェクトでレスポンシブデザインを実装してください！ 