'use client';

import { usePersistedCartStore } from '@/store/persisted-cart-store';
import { useState } from 'react';

export default function TestPersistedCartPage() {
  const [runId, setRunId] = useState('cart-test-run-' + Date.now());
  const cart = usePersistedCartStore(runId);

  // Sample products for testing
  const sampleProducts = [
    { id: 1, name: 'Apple', price: 1.99, image: '/placeholder.jpg' },
    { id: 2, name: 'Banana', price: 0.99, image: '/placeholder.jpg' },
    { id: 3, name: 'Orange', price: 2.49, image: '/placeholder.jpg' },
    { id: 4, name: 'Milk', price: 3.99, image: '/placeholder.jpg' },
    { id: 5, name: 'Bread', price: 2.99, image: '/placeholder.jpg' },
  ];

  const addProduct = (product: typeof sampleProducts[0]) => {
    cart.addItem({
      id: product.id,
      itemName: product.name,
      price: product.price,
      image: product.image,
      storeId: 'test-store-123',
    }, 'grocery', 'Test Grocery Store');
  };

  const createNewRun = () => {
    setRunId('cart-test-run-' + Date.now());
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Persisted Cart Integration Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Run ID: {runId}</h2>
        <button 
          onClick={createNewRun}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create New Run
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products Section */}
        <div className="border rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <div className="space-y-3">
            {sampleProducts.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-gray-600">${product.price}</div>
                </div>
                <button
                  onClick={() => addProduct(product)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="border rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Shopping Cart</h2>
          
          {cart.items.length === 0 ? (
            <p className="text-gray-500">Your cart is empty</p>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{item.itemName}</div>
                    <div className="text-sm text-gray-600">
                      ${typeof item.price === 'number' ? item.price : parseFloat(item.price.toString())} × {item.quantity}
                    </div>
                    <div className="text-xs text-gray-500">{item.storeName}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      +
                    </button>
                    <button
                      onClick={() => cart.removeItem(item.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.items.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{cart.getTotalItems()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${cart.getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee:</span>
                  <span>${cart.getServiceFee().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>${cart.getDeliveryFee().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${cart.getTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-4 space-x-2">
                <button
                  onClick={cart.clearCart}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Clear Cart
                </button>
                <button
                  onClick={cart.updateTotalCartValue}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Total
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
        <div className="text-sm space-y-1">
          <div><strong>Run ID:</strong> {runId}</div>
          <div><strong>Category:</strong> {cart.currentCategory}</div>
          <div><strong>Store ID:</strong> {cart.currentStoreId || 'None'}</div>
          <div><strong>Restaurant ID:</strong> {cart.currentRestaurantId || 'None'}</div>
          <div><strong>Total Items:</strong> {cart.getTotalItems()}</div>
          <div><strong>Total Value:</strong> ${cart.totalCartValue.toFixed(2)}</div>
          <div><strong>Cart Items:</strong> {cart.items.length} items</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Test Instructions</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Add products to your cart</li>
          <li>Modify quantities using +/- buttons</li>
          <li>Remove items from cart</li>
          <li>Refresh the page - your cart should persist</li>
          <li>Create a new run ID to test isolation</li>
          <li>Open in another browser/tab with the same run ID to test cross-session sync</li>
          <li>Check the server logs to see debounced updates</li>
        </ul>
      </div>
    </div>
  );
}
