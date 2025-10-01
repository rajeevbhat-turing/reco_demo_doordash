'use client';

import { usePersistedState, usePersistedStates } from '@/lib/hooks/usePersistedState';
import { useState } from 'react';

export default function TestPersistedStatePage() {
  const [runId, setRunId] = useState('test-run-' + Date.now());
  
  // Test single persisted state
  const [userName, setUserName] = usePersistedState('test.user.name', 'Initial User', { runId });
  const [userEmail, setUserEmail] = usePersistedState('test.user.email', 'user@example.com', { runId });
  const [cartItems, setCartItems] = usePersistedState('test.cart', [], { runId });
  
  // Test multiple persisted states
  const [settings, setSettings] = usePersistedStates(
    ['test.settings.theme', 'test.settings.language', 'test.settings.notifications'],
    {
      'test.settings.theme': 'light',
      'test.settings.language': 'en',
      'test.settings.notifications': true
    },
    { runId }
  );

  const addToCart = () => {
    const newItem = `Item ${cartItems.length + 1}`;
    setCartItems([...cartItems, newItem]);
  };

  const removeFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(key, value);
  };

  const createNewRun = () => {
    setRunId('test-run-' + Date.now());
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Persisted State Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Run ID: {runId}</h2>
        <button 
          onClick={createNewRun}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Run
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info Section */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
          <div className="space-y-2">
            <button
              onClick={addToCart}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Item to Cart
            </button>
            <div className="space-y-1">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{item}</span>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="border rounded p-4 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Theme:</label>
              <select
                value={settings['test.settings.theme']}
                onChange={(e) => updateSetting('test.settings.theme', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language:</label>
              <select
                value={settings['test.settings.language']}
                onChange={(e) => updateSetting('test.settings.language', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notifications:</label>
              <input
                type="checkbox"
                checked={settings['test.settings.notifications']}
                onChange={(e) => updateSetting('test.settings.notifications', e.target.checked)}
                className="mr-2"
              />
              <span>Enable notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
        <div className="text-sm space-y-1">
          <div><strong>User Name:</strong> {userName}</div>
          <div><strong>User Email:</strong> {userEmail}</div>
          <div><strong>Cart Items:</strong> {cartItems.length} items</div>
          <div><strong>Theme:</strong> {settings['test.settings.theme']}</div>
          <div><strong>Language:</strong> {settings['test.settings.language']}</div>
          <div><strong>Notifications:</strong> {settings['test.settings.notifications'] ? 'Enabled' : 'Disabled'}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Test Instructions</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Make changes to any field above</li>
          <li>Refresh the page - your changes should persist</li>
          <li>Create a new run ID to test isolation</li>
          <li>Open in another browser/tab with the same run ID to test cross-session sync</li>
          <li>Check the server logs to see debounced updates</li>
        </ul>
      </div>
    </div>
  );
}
