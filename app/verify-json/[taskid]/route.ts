import { NextRequest, NextResponse } from 'next/server'
import flowVerifiers from '@/config/flow-verifiers.json'

export async function GET(
  request: NextRequest,
  { params }: { params: { taskid: string } }
) {
  const taskId = params.taskid

  if (!taskId) {
    const errorHtml = createHtmlResponse({
      'task-id': taskId || 'unknown',
      result: 'failed'
    })
    return new Response(errorHtml, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Find the flow verifier by taskId
  const flow = flowVerifiers.flows[taskId as keyof typeof flowVerifiers.flows]
  
  if (!flow) {
    const errorHtml = createHtmlResponse({
      'task-id': taskId,
      result: 'failed'
    })
    return new Response(errorHtml, {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Return HTML that executes the verifier client-side with real localStorage
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Verifier Result</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body { 
            background-color: black; 
            color: white; 
            font-family: monospace; 
            padding: 20px;
            overflow: hidden;
        }
        pre {
            font-size: 16px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <pre id="result">Loading...</pre>
    
    <script>
        (async function() {
            try {
                // Get verifier code from the API (same as working UI)
                const response = await fetch('/api/verify?flowId=${encodeURIComponent(taskId)}&action=execute');
                const data = await response.json();

                if (!response.ok) {
                    document.getElementById('result').textContent = JSON.stringify({
                        "task-id": "${taskId}",
                        "result": "failed"
                    }, null, 2);
                    return;
                }

                // Execute the verifier with actual browser localStorage
                const verifierFunction = new Function(data.verifierCode);
                const verifierResult = verifierFunction();
                
                const result = {
                    "task-id": "${taskId}",
                    "result": verifierResult ? "passed" : "failed"
                };
                
                document.getElementById('result').textContent = JSON.stringify(result, null, 2);
                
                // Log to console for debugging
                console.log('Verifier executed:', { taskId: "${taskId}", result: verifierResult });
                
            } catch (error) {
                console.error('Verifier execution error:', error);
                document.getElementById('result').textContent = JSON.stringify({
                    "task-id": "${taskId}",
                    "result": "failed"
                }, null, 2);
            }
        })();
    </script>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}

function createHtmlResponse(result: { 'task-id': string; result: string }) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Verifier Result</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; }
        body { 
            background-color: black; 
            color: white; 
            font-family: monospace; 
            padding: 20px;
            overflow: hidden;
        }
        pre {
            font-size: 16px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <pre>${JSON.stringify(result, null, 2)}</pre>
</body>
</html>`
}
