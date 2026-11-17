import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { messages, message } = await req.json() as {
      messages?: Array<{ role: 'user' | 'model'; text: string }>
      message: string
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const chat = model.startChat({
      history: messages?.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      })) ?? [],
    })

    const result = await chat.sendMessage(message)
    const text = result.response.text()

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
