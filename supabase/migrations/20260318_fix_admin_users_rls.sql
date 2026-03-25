-- =====================================================
-- admin_users RLS 修正 & students/monthly_reports RLS 強化
--
-- 【問題】
--   students / monthly_reports の RLS ポリシーが
--   admin_users テーブルへのサブクエリで管理者チェックをしている。
--   しかし admin_users 自体に RLS が有効で SELECT ポリシーが無い場合、
--   サブクエリも遮断 → EXISTS が常に false → 管理者でもデータが取れない。
--
-- 【解決策】
--   1. is_admin() SECURITY DEFINER 関数を作成する。
--      SECURITY DEFINER で実行されるためRLSをバイパスして admin_users を読める。
--   2. students / monthly_reports の RLS ポリシーをこの関数に差し替える。
--   3. admin_users に「自分自身のレコードを SELECT できる」ポリシーを追加する
--      （Server Action 内の直接クエリ用）。
-- =====================================================

-- ─── 1. SECURITY DEFINER 関数（RLS 連鎖を回避） ───────────
CREATE OR REPLACE FUNCTION is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users
    WHERE user_id = uid
      AND is_active = true
  );
$$;

-- ─── 2. admin_users: 自己 SELECT を許可 ─────────────────────
--   Server Action が createServerSupabaseClient（ユーザートークン）で
--   admin_users を直接クエリする際に必要。
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own admin status" ON admin_users;
CREATE POLICY "Users can read own admin status"
  ON admin_users FOR SELECT
  USING (user_id = auth.uid());

-- ─── 3. students RLS を is_admin() に差し替え ───────────────
DROP POLICY IF EXISTS "Admin full access on students" ON students;
CREATE POLICY "Admin full access on students"
  ON students FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── 4. monthly_reports RLS を is_admin() に差し替え ────────
DROP POLICY IF EXISTS "Admin full access on monthly_reports" ON monthly_reports;
CREATE POLICY "Admin full access on monthly_reports"
  ON monthly_reports FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
