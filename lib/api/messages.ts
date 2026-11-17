import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { MessageRecord, MessageStatus, MessageContextType } from '@/types/message'

export interface ListMessagesParams {
	userId: string
	status?: MessageStatus | 'all'
	context?: { type: MessageContextType; id?: string }
}

export async function listMessages({ userId, status = 'all', context }: ListMessagesParams): Promise<MessageRecord[]> {
	const supabase = createBrowserSupabaseClient()
	let query = supabase.from('messages').select('*').eq('user_id', userId).order('created_at', { ascending: false })
	if (status !== 'all') query = query.eq('status', status)
	if (context?.type) query = query.eq('context_type', context.type)
	if (context?.id) query = query.eq('context_id', context.id)
	const { data } = await query
	return data || []
}

export async function createMessage(msg: Omit<MessageRecord, 'id' | 'created_at' | 'status'> & { status?: MessageStatus }): Promise<{ success: boolean; error?: string }> {
	const supabase = createBrowserSupabaseClient()
	const payload = { ...msg, status: msg.status || 'unread' }
	const { error } = await supabase.from('messages').insert(payload)
	return { success: !error, error: error?.message }
}

export async function markMessageRead(id: string): Promise<{ success: boolean; error?: string }> {
	const supabase = createBrowserSupabaseClient()
	const { error } = await supabase.from('messages').update({ status: 'read' }).eq('id', id)
	return { success: !error, error: error?.message }
}


