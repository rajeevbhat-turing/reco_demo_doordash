import { NextRequest, NextResponse } from 'next/server'
import flowVerifiers from '@/config/flow-verifiers.json'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const flowId = searchParams.get('flowId')
  const action = searchParams.get('action') // 'get' or 'execute'

  if (!flowId) {
    return NextResponse.json({ error: 'flowId parameter is required' }, { status: 400 })
  }

  const flow = flowVerifiers.flows[flowId as keyof typeof flowVerifiers.flows]
  
  if (!flow) {
    return NextResponse.json({ error: `Flow '${flowId}' not found` }, { status: 404 })
  }

  if (action === 'get') {
    // Return flow information for confirmation
    return NextResponse.json({
      flowId,
      description: flow.description,
      category: flow.category,
      verifier: flow.verifier
    })
  }

  if (action === 'execute') {
    // Return verifier code for client-side execution
    return NextResponse.json({
      flowId,
      verifierCode: flow.verifier,
      description: flow.description
    })
  }

  // Default: return flow info
  return NextResponse.json({
    flowId,
    description: flow.description,
    category: flow.category
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { flowId, result, error } = body

  // Log verification result (you could store this in a database)
  console.log(`Verification Result for ${flowId}:`, {
    passed: result,
    error: error || null,
    timestamp: new Date().toISOString()
  })

  return NextResponse.json({
    logged: true,
    flowId,
    result
  })
} 