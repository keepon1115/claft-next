-- =====================================================
-- 非認知能力レポート(PDF)用 Storageバケット作成
-- フェーズ2: 自分を理解する(/myself/report)
-- =====================================================

-- バケット本体(非公開)
INSERT INTO storage.buckets (id, name, public)
VALUES ('non-cognitive-reports', 'non-cognitive-reports', false)
ON CONFLICT (id) DO NOTHING;

-- 本人のみ自分のレポートPDFを読める(パス: {user_id}/report.pdf)
DROP POLICY IF EXISTS "Users can read own report" ON storage.objects;
CREATE POLICY "Users can read own report" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'non-cognitive-reports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- アップロードはSupabaseダッシュボードから管理者が直接行う運用のため、
-- クライアントからのINSERT/UPDATE/DELETEポリシーは設けない
