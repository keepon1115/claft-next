export type MessageStatus = 'unread' | 'read'

export type MessageContextType = 'media' | 'lesson' | 'quest' | 'other'

export interface MessageRecord {
	id: string
	user_id: string
	context_type: MessageContextType
	context_id: string
	title: string
	body: string
	status: MessageStatus
	created_at: string
	sent_by?: string | null
}


