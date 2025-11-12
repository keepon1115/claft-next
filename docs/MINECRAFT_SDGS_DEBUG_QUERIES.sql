-- ==========================================
-- マイクラSDGs 診断・デバッグ用クエリ
-- ==========================================

-- 1. RLSポリシーの確認（minecraft_sdgs_stats）
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN '読取'
    WHEN cmd = 'INSERT' THEN '作成'
    WHEN cmd = 'UPDATE' THEN '更新'
    WHEN cmd = 'DELETE' THEN '削除'
  END as operation_jp
FROM pg_policies 
WHERE tablename IN ('minecraft_sdgs_stats', 'minecraft_sdgs_progress', 'notifications')
ORDER BY tablename, cmd;

-- 2. RLSが有効かどうか確認
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('minecraft_sdgs_stats', 'minecraft_sdgs_progress', 'notifications', 'admin_users');

-- 3. 自分が管理者として登録されているか確認
SELECT 
  user_id, 
  is_active, 
  created_at,
  updated_at
FROM admin_users
WHERE is_active = true;

-- 4. minecraft_sdgs_stats テーブルの構造確認
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'minecraft_sdgs_stats'
ORDER BY ordinal_position;

-- 5. トリガーの確認（自動更新の仕組みを確認）
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table IN ('minecraft_sdgs_progress', 'minecraft_sdgs_stats')
ORDER BY event_object_table, trigger_name;

-- 6. 関数の確認（SECURITY DEFINERかどうか）
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%minecraft%' OR routine_name LIKE '%sdgs%')
ORDER BY routine_name;

