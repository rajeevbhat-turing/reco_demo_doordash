import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Create a simple HTML page that will trigger localStorage download
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Download localStorage</title>
    <script>
        function downloadLocalStorage() {
            try {
                // Collect all localStorage data
                const localStorageData = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                        localStorageData[key] = localStorage.getItem(key);
                    }
                }
                
                // Create and download the file
                const dataStr = JSON.stringify(localStorageData, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = 'localStorage.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                document.getElementById('status').textContent = '✅ localStorage.json downloaded successfully!';
            } catch (error) {
                document.getElementById('status').textContent = '❌ Error downloading localStorage: ' + error.message;
            }
        }
        
        // Auto-download when page loads
        window.onload = function() {
            downloadLocalStorage();
        };
    </script>
</head>
<body>
    <h1>localStorage Download</h1>
    <p id="status">Downloading localStorage...</p>
    <button onclick="downloadLocalStorage()">Download Again</button>
    <p><small>This page automatically downloads your browser's localStorage data as a JSON file.</small></p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate localStorage download page' }, { status: 500 });
  }
}
