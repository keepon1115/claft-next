-- =====================================================
-- ロボクエスト（ロボットコース振り返り機能）テーブル作成
--
-- テーマ（robo_themes）配下に設問（robo_questions）がぶら下がり、
-- 生徒はクイズ回答（robo_quiz_answers）→ 問いへの回答（robo_open_answers）
-- →感想（robo_feedbacks）を提出し、テーマクリア（robo_theme_clears）が記録される。
--
-- 既存の students テーブル（スクール生CRM）とは無関係の別概念。
-- ロボットコース在籍の判定は行わない（既存の quest / minecraft-sdgs と同様、
-- ログイン済みユーザーは誰でも挑戦できる方針に合わせる）。
-- =====================================================

-- ─── 前提関数（他マイグレーションで作成済みの場合も idempotent） ───────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- ─── テーマ ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS robo_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL,
  theme_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  question_prompt TEXT NOT NULL DEFAULT '',
  case_study_md TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_robo_themes_display_order ON robo_themes(display_order);

CREATE TRIGGER robo_themes_updated_at
  BEFORE UPDATE ON robo_themes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── 設問（3択） ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS robo_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES robo_themes(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  choice_1 TEXT NOT NULL,
  choice_2 TEXT NOT NULL,
  choice_3 TEXT NOT NULL,
  correct_index SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 2),
  explanation TEXT,
  image_url TEXT,
  reference_note TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_robo_questions_theme_id ON robo_questions(theme_id, display_order);

CREATE TRIGGER robo_questions_updated_at
  BEFORE UPDATE ON robo_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── クイズ回答ログ ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS robo_quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES robo_questions(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES robo_themes(id) ON DELETE CASCADE,
  selected_index SMALLINT NOT NULL CHECK (selected_index BETWEEN 0 AND 2),
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_robo_quiz_answers_user_theme ON robo_quiz_answers(user_id, theme_id);
CREATE INDEX IF NOT EXISTS idx_robo_quiz_answers_question ON robo_quiz_answers(question_id);

-- ─── 問いへの回答（自由記述・履歴保持） ────────────────────────────────────
CREATE TABLE IF NOT EXISTS robo_open_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES robo_themes(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_robo_open_answers_theme_created ON robo_open_answers(theme_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_robo_open_answers_user_theme ON robo_open_answers(user_id, theme_id, created_at DESC);

-- ─── 感想（自由記述・履歴保持） ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS robo_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES robo_themes(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_robo_feedbacks_user_theme ON robo_feedbacks(user_id, theme_id, created_at DESC);

-- ─── クリア記録（テーマごとに1件、再挑戦でも上書き） ─────────────────────
CREATE TABLE IF NOT EXISTS robo_theme_clears (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id UUID NOT NULL REFERENCES robo_themes(id) ON DELETE CASCADE,
  cleared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_robo_theme_clears_user ON robo_theme_clears(user_id);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE robo_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE robo_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE robo_quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE robo_open_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE robo_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE robo_theme_clears ENABLE ROW LEVEL SECURITY;

-- robo_themes: ログイン済みなら誰でも閲覧可（ステージマップの動的描画・未公開テーマのロック表示に必要）。
-- 実際のクイズ内容（robo_questions）は下記ポリシーで is_published のときのみ閲覧可とし、
-- 未公開テーマは「存在は見えるがクイズには入れない」状態にする。
DROP POLICY IF EXISTS "robo_themes select published or admin" ON robo_themes;
DROP POLICY IF EXISTS "robo_themes select authenticated or admin" ON robo_themes;
CREATE POLICY "robo_themes select authenticated or admin"
  ON robo_themes FOR SELECT
  USING (auth.uid() IS NOT NULL OR is_admin());

DROP POLICY IF EXISTS "robo_themes admin write" ON robo_themes;
CREATE POLICY "robo_themes admin write"
  ON robo_themes FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- robo_questions: 公開テーマの設問は誰でも閲覧、管理者は全件フルアクセス
DROP POLICY IF EXISTS "robo_questions select published or admin" ON robo_questions;
CREATE POLICY "robo_questions select published or admin"
  ON robo_questions FOR SELECT
  USING (
    is_admin() OR (
      auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM robo_themes
        WHERE robo_themes.id = robo_questions.theme_id
          AND robo_themes.is_published = true
      )
    )
  );

DROP POLICY IF EXISTS "robo_questions admin write" ON robo_questions;
CREATE POLICY "robo_questions admin write"
  ON robo_questions FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- robo_quiz_answers: 生徒は自分の回答の読み書きのみ、管理者は閲覧のみ
DROP POLICY IF EXISTS "robo_quiz_answers select own or admin" ON robo_quiz_answers;
CREATE POLICY "robo_quiz_answers select own or admin"
  ON robo_quiz_answers FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "robo_quiz_answers insert own" ON robo_quiz_answers;
CREATE POLICY "robo_quiz_answers insert own"
  ON robo_quiz_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- robo_open_answers: 生徒は自分の回答の読み書き＋表示フラグONの他者回答の読み取り。管理者はフルアクセス（非表示化用）
-- 完全な未ログイン（anonキーのみ）からの閲覧は防ぎつつ、ログイン済みなら
-- 自分の回答＋表示フラグONの他者回答を読めるようにする。
DROP POLICY IF EXISTS "robo_open_answers select own visible or admin" ON robo_open_answers;
CREATE POLICY "robo_open_answers select own visible or admin"
  ON robo_open_answers FOR SELECT
  USING (user_id = auth.uid() OR (is_visible = true AND auth.uid() IS NOT NULL) OR is_admin());

DROP POLICY IF EXISTS "robo_open_answers insert own" ON robo_open_answers;
CREATE POLICY "robo_open_answers insert own"
  ON robo_open_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "robo_open_answers admin update" ON robo_open_answers;
CREATE POLICY "robo_open_answers admin update"
  ON robo_open_answers FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- robo_feedbacks: 生徒は自分の回答の読み書きのみ、管理者は閲覧のみ
DROP POLICY IF EXISTS "robo_feedbacks select own or admin" ON robo_feedbacks;
CREATE POLICY "robo_feedbacks select own or admin"
  ON robo_feedbacks FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "robo_feedbacks insert own" ON robo_feedbacks;
CREATE POLICY "robo_feedbacks insert own"
  ON robo_feedbacks FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- robo_theme_clears: 生徒は自分のクリア記録の読み書き（再挑戦時のupsert含む）、管理者は閲覧のみ
DROP POLICY IF EXISTS "robo_theme_clears select own or admin" ON robo_theme_clears;
CREATE POLICY "robo_theme_clears select own or admin"
  ON robo_theme_clears FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "robo_theme_clears insert own" ON robo_theme_clears;
CREATE POLICY "robo_theme_clears insert own"
  ON robo_theme_clears FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "robo_theme_clears update own" ON robo_theme_clears;
CREATE POLICY "robo_theme_clears update own"
  ON robo_theme_clears FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
