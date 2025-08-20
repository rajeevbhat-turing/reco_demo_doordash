import { NextRequest, NextResponse } from 'next/server'

// POST method - accepts localStorage data and returns JSON
export async function POST(
  request: NextRequest,
  { params }: { params: { taskid: string } }
) {
  const taskId = params.taskid

  if (!taskId) {
    return NextResponse.json({ 
      'task-id': taskId || 'unknown', 
      result: 'failed'
    })
  }

  try {
    const body = await request.json()
    const { localStorage: browserLocalStorage } = body

    // Forward to the existing /api/verify/run endpoint
    const runResponse = await fetch(`${request.nextUrl.origin}/api/verify/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flowId: taskId,
        localStorage: browserLocalStorage
      })
    })

    const result = await runResponse.json()
    
    // Return simple format
    return NextResponse.json({
      'task-id': taskId,
      result: result.passed ? 'passed' : 'failed'
    })

  } catch (error) {
    return NextResponse.json({
      'task-id': taskId,
      result: 'failed'
    })
  }
}

// GET method - returns JavaScript to auto-collect localStorage and POST it back
export async function GET(
  request: NextRequest,
  { params }: { params: { taskid: string } }
) {
  const taskId = params.taskid

  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Verifier</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; background: black; color: white; font-family: monospace; padding: 20px; }
        pre { font-size: 16px; line-height: 1.5; }
    </style>
</head>
<body>
    <pre id="result">Loading...</pre>
    <script>
        (async function() {
            try {
                // Collect localStorage data (same as browser-verifier.js)
                const localStorageData = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    localStorageData[key] = localStorage.getItem(key);
                }
                
                // POST to this same endpoint
                const response = await fetch('/api/verify/${taskId}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        localStorage: localStorageData
                    })
                });
                
                const result = await response.json();
                document.getElementById('result').textContent = JSON.stringify(result, null, 2);
                
            } catch (error) {
                document.getElementById('result').textContent = JSON.stringify({
                    "task-id": "${taskId}",
                    "result": "failed"
                }, null, 2);
            }
        })();
    </script>
</body>
</html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
