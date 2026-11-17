'use server'

import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  studentFormSchema,
  monthlyReportFormSchema,
  monthlyReportContentSchema,
  DEFAULT_REPORT_CONTENT,
  type StudentFormValues,
  type MonthlyReportFormValues,
  type Student,
  type MonthlyReport,
  type StudentWithReports,
  type MonthlyReportContent,
} from '@/types/student'

// =====================================================
// ユーティリティ: Next.js の redirect() が投げる特殊エラーは
// try-catch で握りつぶさず必ず再スローする
// =====================================================

function rethrowIfRedirect(e: unknown): void {
  if (
    e instanceof Error &&
    'digest' in e &&
    typeof (e as any).digest === 'string' &&
    (e as any).digest.startsWith('NEXT_REDIRECT')
  ) {
    throw e
  }
}

// =====================================================
// 管理者認証ヘルパー
// =====================================================

async function getAdminSupabase() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // getSession() はローカルデコードのみで未検証。
  // getUser() はSupabaseサーバーでJWTを検証するため、より安全。
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/unauthorized')
  }

  // NOTE: admin_users テーブルに SELECT RLS が無い場合、このクエリは空を返す。
  // その場合は Supabase ダッシュボードで下記 SQL を実行して RLS を修正してください:
  //   supabase/migrations/20260318_fix_admin_users_rls.sql
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (adminError || !adminUser) {
    redirect('/unauthorized')
  }

  return supabase
}

// =====================================================
// 生徒 CRUD
// =====================================================

export async function getStudents(): Promise<{ data: Student[]; error: string | null }> {
  try {
    const supabase = await getAdminSupabase()
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (e: any) {
    rethrowIfRedirect(e)
    console.error('getStudents error:', e)
    return { data: [], error: e.message ?? '生徒一覧の取得に失敗しました' }
  }
}

export async function getStudentWithReports(
  studentId: string
): Promise<{ data: StudentWithReports | null; error: string | null }> {
  try {
    const supabase = await getAdminSupabase()

    const { data: student, error: sErr } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single()

    if (sErr || !student) throw sErr ?? new Error('生徒が見つかりません')

    const { data: reports, error: rErr } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('student_id', studentId)
      .order('month', { ascending: false })

    if (rErr) throw rErr

    const parsedReports: MonthlyReport[] = (reports ?? []).map((r: any) => ({
      ...r,
      content: parseReportContent(r.content),
    }))

    return {
      data: { ...student, monthly_reports: parsedReports },
      error: null,
    }
  } catch (e: any) {
    rethrowIfRedirect(e)
    console.error('getStudentWithReports error:', e)
    return { data: null, error: e.message ?? '生徒情報の取得に失敗しました' }
  }
}

export async function createStudent(
  values: StudentFormValues
): Promise<{ data: Student | null; error: string | null }> {
  try {
    const parsed = studentFormSchema.parse(values)
    const supabase = await getAdminSupabase()

    const { data, error } = await supabase
      .from('students')
      .insert(parsed)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/students')
    return { data, error: null }
  } catch (e: any) {
    rethrowIfRedirect(e)
    console.error('createStudent error:', e)
    return { data: null, error: e.message ?? '生徒の作成に失敗しました' }
  }
}

export async function updateStudent(
  studentId: string,
  values: Partial<StudentFormValues>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getAdminSupabase()

    const { error } = await supabase
      .from('students')
      .update(values)
      .eq('id', studentId)

    if (error) throw error

    revalidatePath('/admin/students')
    revalidatePath(`/admin/students/${studentId}`)
    return { success: true, error: null }
  } catch (e: any) {
    rethrowIfRedirect(e)
    console.error('updateStudent error:', e)
    return { success: false, error: e.message ?? '生徒情報の更新に失敗しました' }
  }
}

export async function deleteStudent(
  studentId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getAdminSupabase()

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId)

    if (error) throw error

    revalidatePath('/admin/students')
    return { success: true, error: null }
  } catch (e: any) {
    rethrowIfRedirect(e)
    console.error('deleteStudent error:', e)
    return { success: false, error: e.message ?? '生徒の削除に失敗しました' }
  }
}

// =====================================================
// 月別レポート CRUD
// =====================================================

export async function getCurrentMonthReportStatus(
  studentIds: string[]
): Promise<{ data: Record<string, boolean>; error: string | null }> {
  try {
    const supabase = await getAdminSupabase()
    const currentMonth = new Date().toISOString().slice(0, 7)

    const { data, error } = await supabase
      .from('monthly_reports')
      .select('student_id')
      .eq('month', currentMonth)
      .in('student_id', studentIds)

    if (error) throw error

    const existsMap: Record<string, boolean> = {}
    for (const id of studentIds) {
      existsMap[id] = (data ?? []).some((r: any) => r.student_id === id)
    }
    return { data: existsMap, error: null }
  } catch (e: any) {
    rethrowIfRedirect(e)
    console.error('getCurrentMonthReportStatus error:', e)
    return { data: {}, error: e.message ?? 'レポート状況の取得に失敗しました' }
  }
}

export async function createMonthlyReport(
  studentId: string,
  values: MonthlyReportFormValues
): Promise<{ data: MonthlyReport | null; error: string | null }> {
  try {
    const parsed = monthlyReportFormSchema.parse(values)
    const supabase = await getAdminSupabase()

    const { data, error } = await supabase
      .from('monthly_reports')
      .insert({
        student_id: studentId,
        month: parsed.month,
        goal: parsed.goal,
        content: parsed.content,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('この月のレポートは既に存在します')
      }
      throw error
    }

    revalidatePath(`/admin/students/${studentId}`)
    revalidatePath('/admin/students')
    return {
      data: { ...data, content: parseReportContent(data.content) },
      error: null,
    }
  } catch (e: any) {
    rethrowIfRedirect(e)
    console.error('createMonthlyReport error:', e)
    return { data: null, error: e.message ?? 'レポートの作成に失敗しました' }
  }
}

export async function updateMonthlyReport(
  reportId: string,
  studentId: string,
  values: Partial<MonthlyReportFormValues>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getAdminSupabase()

    const updateData: Record<string, any> = {}
    if (values.goal !== undefined) updateData.goal = values.goal
    if (values.content !== undefined) updateData.content = values.content

    const { error } = await supabase
      .from('monthly_reports')
      .update(updateData)
      .eq('id', reportId)

    if (error) throw error

    revalidatePath(`/admin/students/${studentId}`)
    return { success: true, error: null }
  } catch (e: any) {
    rethrowIfRedirect(e)
    console.error('updateMonthlyReport error:', e)
    return { success: false, error: e.message ?? 'レポートの更新に失敗しました' }
  }
}

export async function deleteMonthlyReport(
  reportId: string,
  studentId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await getAdminSupabase()

    const { error } = await supabase
      .from('monthly_reports')
      .delete()
      .eq('id', reportId)

    if (error) throw error

    revalidatePath(`/admin/students/${studentId}`)
    revalidatePath('/admin/students')
    return { success: true, error: null }
  } catch (e: any) {
    rethrowIfRedirect(e)
    console.error('deleteMonthlyReport error:', e)
    return { success: false, error: e.message ?? 'レポートの削除に失敗しました' }
  }
}

// =====================================================
// ユーティリティ
// =====================================================

function parseReportContent(raw: any): MonthlyReportContent {
  try {
    const parsed = monthlyReportContentSchema.safeParse(raw)
    return parsed.success ? parsed.data : { ...DEFAULT_REPORT_CONTENT }
  } catch {
    return { ...DEFAULT_REPORT_CONTENT }
  }
}
