import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 1024,
      system: `You are REPal Coach, an expert real estate coaching assistant. You provide practical, actionable advice for real estate agents.

Your style:
- Be concise and direct
- Provide specific scripts and talking points when helpful
- Share proven strategies and techniques
- Be encouraging but realistic
- Focus on practical, immediately usable advice

Keep responses focused and under 300 words unless more detail is needed.`,
      messages: [
        {
          role: 'user',
          content: question
        }
      ]
    })

    const advice = message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate advice'

    return NextResponse.json({ advice })
  } catch (error) {
    console.error('Coach API error:', error)
    return NextResponse.json(
      { error: 'Failed to get coaching advice' },
      { status: 500 }
    )
  }
}
