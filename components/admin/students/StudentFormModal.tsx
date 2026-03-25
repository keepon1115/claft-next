'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import {
  studentFormSchema,
  type StudentFormValues,
  type Student,
  GRADE_OPTIONS,
  COURSE_OPTIONS,
  SCHEDULE_OPTIONS,
} from '@/types/student'
import { createStudent } from '@/app/admin/students/actions'

interface Props {
  onClose: () => void
  onCreated: (student: Student) => void
}

export default function StudentFormModal({ onClose, onCreated }: Props) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      grade: '',
      course: '',
      schedule: '',
      interests: '',
    },
  })

  const onSubmit = async (values: StudentFormValues) => {
    setServerError(null)
    const result = await createStudent(values)
    if (result.error) {
      setServerError(result.error)
      return
    }
    if (result.data) {
      onCreated(result.data)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">新規生徒登録</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className="w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="山田 太郎"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
              <select
                {...register('grade')}
                className="w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">コース</label>
              <select
                {...register('course')}
                className="w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {COURSE_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">通塾曜日</label>
            <select
              {...register('schedule')}
              className="w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {SCHEDULE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">興味・関心</label>
            <textarea
              {...register('interests')}
              rows={3}
              className="w-full border rounded-lg px-3 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="マイクラ、ゲーム制作..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
