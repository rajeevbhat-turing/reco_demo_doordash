/**
 * API-based verifier utilities for the Turing DashDoor clone
 */

export interface VerificationResult {
  taskId: string;
  passed: boolean | undefined;
  error: string | null;
  executionTime: number;
  consoleOutput: string[];
  description: string;
  category: string;
}

/**
 * Download localStorage data as a JSON file
 */
export function downloadLocalStorage(): void {
  try {
    // Collect all localStorage data
    const localStorageData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageData[key] = localStorage.getItem(key) || '';
      }
    }
    
    // Create and download the file
    const dataStr = JSON.stringify(localStorageData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'localStorage.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ localStorage.json downloaded successfully!');
  } catch (error) {
    console.error('❌ Error downloading localStorage:', error);
    throw error;
  }
}

/**
 * Verify a task using the API with localStorage file upload
 */
export async function verifyTaskWithFile(
  taskId: string, 
  localStorageFile: File
): Promise<VerificationResult> {
  try {
    const formData = new FormData();
    formData.append('taskId', taskId);
    formData.append('localStorageData', localStorageFile);
    
    const response = await fetch('/api/verify', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

/**
 * Verify a task using the API with localStorage data object
 */
export async function verifyTaskWithData(
  taskId: string, 
  localStorageData: Record<string, string>
): Promise<VerificationResult> {
  try {
    // Convert localStorage data to a File object
    const dataStr = JSON.stringify(localStorageData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const file = new File([dataBlob], 'localStorage.json', { type: 'application/json' });
    
    return await verifyTaskWithFile(taskId, file);
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

/**
 * Verify a task using current browser localStorage
 */
export async function verifyCurrentTask(taskId: string): Promise<VerificationResult> {
  try {
    // Collect current localStorage data
    const localStorageData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageData[key] = localStorage.getItem(key) || '';
      }
    }
    
    return await verifyTaskWithData(taskId, localStorageData);
  } catch (error) {
    console.error('Verification failed:', error);
    throw error;
  }
}

/**
 * Get all available tasks
 */
export async function getAvailableTasks(): Promise<Array<{
  flowId: string;
  description: string;
  category: string;
}>> {
  try {
    const response = await fetch('/api/verify?action=getAll');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.flows || [];
  } catch (error) {
    console.error('Failed to get available tasks:', error);
    throw error;
  }
}

/**
 * Open the localStorage download page in a new tab
 */
export function openLocalStorageDownload(): void {
  window.open('/localStorage', '_blank');
}

/**
 * Example usage with cURL equivalent
 */
export function getCurlCommand(taskId: string, localStorageFilePath: string): string {
  return `curl -X POST ${window.location.origin}/api/verify \\
  -F "taskId=${taskId}" \\
  -F "localStorageData=@${localStorageFilePath}`;
}
