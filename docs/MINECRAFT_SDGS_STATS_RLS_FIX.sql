-- ==========================================
-- マイクラSDGs統計テーブル RLSポリシー設定
-- ==========================================
-- 問題: 承認時に minecraft_sdgs_stats テーブルの更新でRLSエラーが発生
-- 原因: 管理者が minecraft_sdgs_stats テーブルを更新する権限がない
-- 解決: 管理者用のRLSポリシーを追加

-- 既存のポリシーを確認（任意）
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('minecraft_sdgs_stats', 'minecraft_sdgs_progress')
ORDER BY tablename, policyname;

-- ==========================================
-- minecraft_sdgs_stats テーブル用RLSポリシー
-- ==========================================

-- 管理者による統計データの読み取り許可
CREATE POLICY IF NOT EXISTS "管理者は全ユーザーの統計を読み取れる"
ON minecraft_sdgs_stats FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 管理者による統計データの更新許可（重要！）
CREATE POLICY IF NOT EXISTS "管理者は全ユーザーの統計を更新できる"
ON minecraft_sdgs_stats FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- 管理者による統計データの作成許可
CREATE POLICY IF NOT EXISTS "管理者は統計レコードを作成できる"
ON minecraft_sdgs_stats FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
    AND admin_users.is_active = true
  )
);

-- ==========================================
-- ユーザー本人のアクセス許可（既に設定済みの可能性あり）
-- ==========================================

-- ユーザーは自分の統計を読み取れる
CREATE POLICY IF NOT EXISTS "ユーザーは自分の統計を読み取れる"
ON minecraft_sdgs_stats FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ユーザーは自分の統計を更新できる
CREATE POLICY IF NOT EXISTS "ユーザーは自分の統計を更新できる"
ON minecraft_sdgs_stats FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の統計を作成できる
CREATE POLICY IF NOT EXISTS "ユーザーは自分の統計を作成できる"
ON minecraft_sdgs_stats FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 確認クエリ
-- ==========================================

-- 設定されたポリシーを確認
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'minecraft_sdgs_stats'
ORDER BY cmd, policyname;

