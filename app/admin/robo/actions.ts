'use server'

import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  roboThemeFormSchema,
  roboQuestionFormSchema,
  type RoboThemeFormValues,
  type RoboQuestionFormValues,
  type RoboTheme,
  type RoboQuestion,
  type RoboThemeWithQuestions,
  type RoboQuizAnswer,
  type RoboOpenAnswer,
  type RoboFeedback,
  type RoboThemeCsvRow,
  type RoboQuestionCsvRow,
  type CsvImportPreview,
} from '@/types/robo'
import { buildThemeKey, validateRoboThemeCsv, validateRoboQuestionCsv } from '@/lib/robo/csvImport'

// =====================================================
// ユーティリティ
// =====================================================

function isRedirectError(e: unknown): e is Error & { digest: string } {
  return e instanceof Error && 'digest' in e && typeof (e as { digest?: unknown }).digest === 'string' && (e as { digest: string }).digest.startsWith('NEXT_REDIRECT')
}

function rethrowIfRedirect(e: unknown): void {
  if (isRedirectError(e)) throw e
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback
}

async function getAdminSupabase() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/unauthorized')
  }

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (adminError || !adminUser) {
    redirect('/unauthorized')
  }

  return { supabase, adminUserId: user.id }
}

// =====================================================
// テーマ CRUD
// =====================================================

export async function getRoboThemes(): Promise<{ data: RoboTheme[]; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()
    const { data, error } = await supabase
      .from('robo_themes')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('getRoboThemes error:', e)
    return { data: [], error: errorMessage(e, 'テーマ一覧の取得に失敗しました') }
  }
}

export async function getRoboThemeWithQuestions(
  themeId: string
): Promise<{ data: RoboThemeWithQuestions | null; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()

    const { data: theme, error: themeError } = await supabase
      .from('robo_themes')
      .select('*')
      .eq('id', themeId)
      .single()

    if (themeError || !theme) throw themeError ?? new Error('テーマが見つかりません')

    const { data: questions, error: questionsError } = await supabase
      .from('robo_questions')
      .select('*')
      .eq('theme_id', themeId)
      .order('display_order', { ascending: true })

    if (questionsError) throw questionsError

    return { data: { ...theme, robo_questions: questions ?? [] }, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('getRoboThemeWithQuestions error:', e)
    return { data: null, error: errorMessage(e, 'テーマの取得に失敗しました') }
  }
}

export async function createRoboTheme(
  values: RoboThemeFormValues
): Promise<{ data: RoboTheme | null; error: string | null }> {
  try {
    const parsed = roboThemeFormSchema.parse(values)
    const { supabase } = await getAdminSupabase()

    const { data, error } = await supabase.from('robo_themes').insert(parsed).select().single()
    if (error) throw error

    revalidatePath('/admin/robo')
    return { data, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('createRoboTheme error:', e)
    return { data: null, error: errorMessage(e, 'テーマの作成に失敗しました') }
  }
}

export async function updateRoboTheme(
  themeId: string,
  values: Partial<RoboThemeFormValues>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()
    const { error } = await supabase.from('robo_themes').update(values).eq('id', themeId)
    if (error) throw error

    revalidatePath('/admin/robo')
    revalidatePath(`/admin/robo/${themeId}`)
    revalidatePath('/robo')
    return { success: true, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('updateRoboTheme error:', e)
    return { success: false, error: errorMessage(e, 'テーマの更新に失敗しました') }
  }
}

export async function deleteRoboTheme(themeId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()
    const { error } = await supabase.from('robo_themes').delete().eq('id', themeId)
    if (error) throw error

    revalidatePath('/admin/robo')
    revalidatePath('/robo')
    return { success: true, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('deleteRoboTheme error:', e)
    return { success: false, error: errorMessage(e, 'テーマの削除に失敗しました') }
  }
}

// =====================================================
// 設問 CRUD
// =====================================================

export async function createRoboQuestion(
  themeId: string,
  values: RoboQuestionFormValues
): Promise<{ data: RoboQuestion | null; error: string | null }> {
  try {
    const parsed = roboQuestionFormSchema.parse(values)
    const { supabase } = await getAdminSupabase()

    const { data, error } = await supabase
      .from('robo_questions')
      .insert({ ...parsed, theme_id: themeId })
      .select()
      .single()
    if (error) throw error

    revalidatePath(`/admin/robo/${themeId}`)
    return { data, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('createRoboQuestion error:', e)
    return { data: null, error: errorMessage(e, '設問の作成に失敗しました') }
  }
}

export async function updateRoboQuestion(
  themeId: string,
  questionId: string,
  values: Partial<RoboQuestionFormValues>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()
    const { error } = await supabase.from('robo_questions').update(values).eq('id', questionId)
    if (error) throw error

    revalidatePath(`/admin/robo/${themeId}`)
    return { success: true, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('updateRoboQuestion error:', e)
    return { success: false, error: errorMessage(e, '設問の更新に失敗しました') }
  }
}

export async function deleteRoboQuestion(
  themeId: string,
  questionId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()
    const { error } = await supabase.from('robo_questions').delete().eq('id', questionId)
    if (error) throw error

    revalidatePath(`/admin/robo/${themeId}`)
    return { success: true, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('deleteRoboQuestion error:', e)
    return { success: false, error: errorMessage(e, '設問の削除に失敗しました') }
  }
}

// =====================================================
// 回答閲覧
// =====================================================

interface MiniProfile {
  id: string
  nickname: string | null
  email: string
}

export interface RoboThemeAnswersRow {
  userId: string
  nickname: string
  email: string
  quizResults: { questionId: string; body: string; selectedIndex: number; isCorrect: boolean }[]
  openAnswer: { id: string; body: string; isVisible: boolean; createdAt: string } | null
  feedback: { body: string; createdAt: string } | null
}

export async function getRoboThemeAnswers(
  themeId: string
): Promise<{ data: RoboThemeAnswersRow[]; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()

    const [{ data: quizAnswers, error: qaErr }, { data: openAnswers, error: oaErr }, { data: feedbacks, error: fbErr }, { data: questions, error: qErr }] =
      await Promise.all([
        supabase.from('robo_quiz_answers').select('*').eq('theme_id', themeId).order('answered_at', { ascending: false }),
        supabase.from('robo_open_answers').select('*').eq('theme_id', themeId).order('created_at', { ascending: false }),
        supabase.from('robo_feedbacks').select('*').eq('theme_id', themeId).order('created_at', { ascending: false }),
        supabase.from('robo_questions').select('id, body').eq('theme_id', themeId),
      ])

    if (qaErr) throw qaErr
    if (oaErr) throw oaErr
    if (fbErr) throw fbErr
    if (qErr) throw qErr

    const quizRows: RoboQuizAnswer[] = quizAnswers ?? []
    const openRows: RoboOpenAnswer[] = openAnswers ?? []
    const feedbackRows: RoboFeedback[] = feedbacks ?? []

    const questionMap = new Map((questions ?? []).map((q: { id: string; body: string }) => [q.id, q.body]))

    const userIds = Array.from(
      new Set([
        ...quizRows.map((r) => r.user_id),
        ...openRows.map((r) => r.user_id),
        ...feedbackRows.map((r) => r.user_id),
      ])
    )

    let profiles: MiniProfile[] = []
    if (userIds.length > 0) {
      const { data } = await supabase.from('users_profile').select('id, nickname, email').in('id', userIds)
      profiles = data ?? []
    }

    const rows: RoboThemeAnswersRow[] = userIds.map((userId) => {
      const profile = profiles.find((p) => p.id === userId)
      const myQuiz = quizRows.filter((r) => r.user_id === userId)
      const myOpen = openRows.find((r) => r.user_id === userId) // 最新順ソート済みなので先頭が最新
      const myFeedback = feedbackRows.find((r) => r.user_id === userId)

      return {
        userId,
        nickname: profile?.nickname || 'ニックネーム未設定',
        email: profile?.email || '',
        quizResults: myQuiz.map((r) => ({
          questionId: r.question_id,
          body: questionMap.get(r.question_id) || '(削除された設問)',
          selectedIndex: r.selected_index,
          isCorrect: r.is_correct,
        })),
        openAnswer: myOpen
          ? { id: myOpen.id, body: myOpen.body, isVisible: myOpen.is_visible, createdAt: myOpen.created_at }
          : null,
        feedback: myFeedback ? { body: myFeedback.body, createdAt: myFeedback.created_at } : null,
      }
    })

    return { data: rows, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('getRoboThemeAnswers error:', e)
    return { data: [], error: errorMessage(e, '回答一覧の取得に失敗しました') }
  }
}

export async function setRoboOpenAnswerVisibility(
  themeId: string,
  answerId: string,
  isVisible: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()
    const { error } = await supabase.from('robo_open_answers').update({ is_visible: isVisible }).eq('id', answerId)
    if (error) throw error

    revalidatePath(`/admin/robo/${themeId}/answers`)
    return { success: true, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('setRoboOpenAnswerVisibility error:', e)
    return { success: false, error: errorMessage(e, '表示設定の更新に失敗しました') }
  }
}

// =====================================================
// A4印刷ビュー用データ
// =====================================================

export interface RoboPrintReport {
  themeTitle: string
  level: number
  themeNumber: number
  caseStudyMd: string
  caseImageUrl: string | null
  nickname: string
  quizResults: { body: string; choices: string[]; selectedIndex: number; correctIndex: number; isCorrect: boolean }[]
  myOpenAnswer: string | null
  classExcerpts: { nickname: string; body: string }[]
}

export async function getRoboPrintReport(
  themeId: string,
  userId: string
): Promise<{ data: RoboPrintReport | null; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()

    const { data: theme, error: themeErr } = await supabase
      .from('robo_themes')
      .select('*')
      .eq('id', themeId)
      .single()
    if (themeErr || !theme) throw themeErr ?? new Error('テーマが見つかりません')

    const { data: questions, error: qErr } = await supabase
      .from('robo_questions')
      .select('*')
      .eq('theme_id', themeId)
      .order('display_order', { ascending: true })
    if (qErr) throw qErr

    const { data: quizAnswers, error: qaErr } = await supabase
      .from('robo_quiz_answers')
      .select('*')
      .eq('theme_id', themeId)
      .eq('user_id', userId)
    if (qaErr) throw qaErr

    const { data: myOpenAnswers, error: oaErr } = await supabase
      .from('robo_open_answers')
      .select('*')
      .eq('theme_id', themeId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
    if (oaErr) throw oaErr

    const { data: classAnswers, error: caErr } = await supabase
      .from('robo_open_answers')
      .select('*')
      .eq('theme_id', themeId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(20)
    if (caErr) throw caErr

    const { data: profile } = await supabase.from('users_profile').select('nickname').eq('id', userId).single()

    const questionRows: RoboQuestion[] = questions ?? []
    const quizAnswerRows: RoboQuizAnswer[] = quizAnswers ?? []
    const classAnswerRows: RoboOpenAnswer[] = classAnswers ?? []

    // クラスの回答（自分以外・ユーザーごとに最新のみ）を最大5件抜粋
    const latestByUser = new Map<string, RoboOpenAnswer>()
    for (const row of classAnswerRows) {
      if (row.user_id === userId) continue
      if (!latestByUser.has(row.user_id)) latestByUser.set(row.user_id, row)
    }
    const excerptRows = Array.from(latestByUser.values()).slice(0, 5)
    const excerptUserIds = excerptRows.map((r) => r.user_id)
    let excerptProfiles: MiniProfile[] = []
    if (excerptUserIds.length > 0) {
      const { data } = await supabase.from('users_profile').select('id, nickname, email').in('id', excerptUserIds)
      excerptProfiles = data ?? []
    }

    const quizResults = questionRows.map((q) => {
      const answer = quizAnswerRows.find((a) => a.question_id === q.id)
      return {
        body: q.body,
        choices: [q.choice_1, q.choice_2, q.choice_3],
        selectedIndex: answer ? answer.selected_index : -1,
        correctIndex: q.correct_index,
        isCorrect: answer ? answer.is_correct : false,
      }
    })

    return {
      data: {
        themeTitle: theme.title,
        level: theme.level,
        themeNumber: theme.theme_number,
        caseStudyMd: theme.case_study_md,
        caseImageUrl: theme.case_image_url,
        nickname: profile?.nickname || 'ニックネーム未設定',
        quizResults,
        myOpenAnswer: myOpenAnswers?.[0]?.body ?? null,
        classExcerpts: excerptRows.map((r) => ({
          nickname: excerptProfiles.find((p) => p.id === r.user_id)?.nickname || '冒険者',
          body: r.body,
        })),
      },
      error: null,
    }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('getRoboPrintReport error:', e)
    return { data: null, error: errorMessage(e, '印刷データの取得に失敗しました') }
  }
}

// =====================================================
// CSVインポート（テーマ・設問の一括反映）
// =====================================================

export interface RoboCsvPreviewResult {
  themePreview: CsvImportPreview<RoboThemeCsvRow> | null
  questionPreview: CsvImportPreview<RoboQuestionCsvRow> | null
  error: string | null
}

/**
 * アップロードされたCSVテキストを検証し、新規/更新の判定とエラーを付けたプレビューを返す。
 * この時点ではDBへの書き込みは一切行わない。
 */
export async function previewRoboCsvImport(
  themeCsvText: string | null,
  questionCsvText: string | null
): Promise<RoboCsvPreviewResult> {
  try {
    const { supabase } = await getAdminSupabase()

    const { data: existingThemes, error: themesErr } = await supabase
      .from('robo_themes')
      .select('id, level, theme_number')
    if (themesErr) throw themesErr

    const themeRows = existingThemes ?? []
    const existingThemeKeys = new Set(themeRows.map((t) => buildThemeKey(t.level, t.theme_number)))

    let themePreview: CsvImportPreview<RoboThemeCsvRow> | null = null
    if (themeCsvText) {
      themePreview = validateRoboThemeCsv(themeCsvText, existingThemeKeys)
    }

    let questionPreview: CsvImportPreview<RoboQuestionCsvRow> | null = null
    if (questionCsvText) {
      // 有効なテーマキー = 既存DB＋今回同時アップロードしたテーマCSV（エラーなし行）
      const validThemeKeys = new Set(existingThemeKeys)
      if (themePreview) {
        themePreview.rows.forEach((r) => {
          if (r.errors.length === 0) validThemeKeys.add(buildThemeKey(r.data.level, r.data.theme_number))
        })
      }

      const { data: existingQuestions, error: qErr } = await supabase
        .from('robo_questions')
        .select('theme_id, display_order')
      if (qErr) throw qErr

      const themeIdToKey = new Map(themeRows.map((t) => [t.id, buildThemeKey(t.level, t.theme_number)]))
      const existingQuestionKeys = new Set(
        (existingQuestions ?? [])
          .map((q) => {
            const key = themeIdToKey.get(q.theme_id)
            return key ? `${key}|${q.display_order}` : null
          })
          .filter((k): k is string => k !== null)
      )

      questionPreview = validateRoboQuestionCsv(questionCsvText, existingQuestionKeys, validThemeKeys)
    }

    return { themePreview, questionPreview, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('previewRoboCsvImport error:', e)
    return { themePreview: null, questionPreview: null, error: errorMessage(e, 'CSVの検証に失敗しました') }
  }
}

/**
 * プレビューで確定した行データをDBへupsertする。
 * CSVインポートでは削除は行わない（CSVにない既存行はそのまま残す）。
 */
export async function applyRoboCsvImport(
  themeRows: RoboThemeCsvRow[],
  questionRows: RoboQuestionCsvRow[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { supabase } = await getAdminSupabase()

    // 防御的な再検証（プレビューを経ずに不正なペイロードが来た場合の保険）
    for (const r of themeRows) {
      if (!r.title.trim() || !r.question_prompt.trim()) {
        throw new Error('テーマデータが不正です（title・問いが空の行があります）')
      }
    }
    for (const r of questionRows) {
      if (!r.body.trim() || !r.choice_1.trim() || !r.choice_2.trim() || !r.choice_3.trim()) {
        throw new Error('設問データが不正です（必須項目が空の行があります）')
      }
      if (r.correct_index < 0 || r.correct_index > 2) {
        throw new Error('設問データが不正です（正解の範囲が不正です）')
      }
    }

    if (themeRows.length > 0) {
      const { error } = await supabase
        .from('robo_themes')
        .upsert(
          themeRows.map((r) => ({
            level: r.level,
            theme_number: r.theme_number,
            title: r.title,
            question_prompt: r.question_prompt,
            question_image_url: r.question_image_url,
            case_study_md: r.case_study_md,
            case_image_url: r.case_image_url,
            icon_url: r.icon_url,
            icon_emoji: r.icon_emoji,
            is_published: r.is_published,
            display_order: r.display_order,
          })),
          { onConflict: 'level,theme_number' }
        )
      if (error) throw error
    }

    if (questionRows.length > 0) {
      const { data: themes, error: themesErr } = await supabase.from('robo_themes').select('id, level, theme_number')
      if (themesErr) throw themesErr

      const keyToId = new Map((themes ?? []).map((t) => [buildThemeKey(t.level, t.theme_number), t.id]))

      const payload = questionRows.map((r) => {
        const themeId = keyToId.get(r.themeKey)
        if (!themeId) throw new Error(`テーマ "${r.themeKey}" が見つかりません`)
        return {
          theme_id: themeId,
          display_order: r.display_order,
          body: r.body,
          choice_1: r.choice_1,
          choice_2: r.choice_2,
          choice_3: r.choice_3,
          correct_index: r.correct_index,
          explanation: r.explanation,
          image_url: r.image_url,
          video_url: r.video_url,
          reference_note: r.reference_note,
        }
      })

      const { error } = await supabase
        .from('robo_questions')
        .upsert(payload, { onConflict: 'theme_id,display_order' })
      if (error) throw error
    }

    revalidatePath('/admin/robo')
    revalidatePath('/robo')

    return { success: true, error: null }
  } catch (e) {
    rethrowIfRedirect(e)
    console.error('applyRoboCsvImport error:', e)
    return { success: false, error: errorMessage(e, 'インポートの反映に失敗しました') }
  }
}
