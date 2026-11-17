-- =====================================================
-- ロボクエスト v2: CSV運用化・メディア対応のための列追加
--
-- 【注意】20260707_create_robo_tables.sql / 20260707_seed_robo_lv1_1.sql は
-- 本番DBに適用済みのため絶対に編集しないこと。変更はこの新規ファイルで行う。
-- =====================================================

-- ─── robo_themes: アイコン・問い画像・事例解説画像 ─────────────────────────
ALTER TABLE robo_themes ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE robo_themes ADD COLUMN IF NOT EXISTS icon_emoji TEXT NOT NULL DEFAULT '🤖';
ALTER TABLE robo_themes ADD COLUMN IF NOT EXISTS question_image_url TEXT;
ALTER TABLE robo_themes ADD COLUMN IF NOT EXISTS case_image_url TEXT;

-- ─── robo_questions: 動画URL ─────────────────────────────────────────────
ALTER TABLE robo_questions ADD COLUMN IF NOT EXISTS video_url TEXT;

-- ─── CSVインポートのupsertキーとなるユニーク制約 ────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'robo_themes_level_theme_number_key'
  ) THEN
    ALTER TABLE robo_themes
      ADD CONSTRAINT robo_themes_level_theme_number_key UNIQUE (level, theme_number);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'robo_questions_theme_id_display_order_key'
  ) THEN
    ALTER TABLE robo_questions
      ADD CONSTRAINT robo_questions_theme_id_display_order_key UNIQUE (theme_id, display_order);
  END IF;
END $$;

-- ─── 既存seed（lv1-1）のアイコンを信号機の絵文字に更新 ───────────────────────
UPDATE robo_themes SET icon_emoji = '🚦' WHERE level = 1 AND theme_number = 1;
