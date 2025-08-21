# API-Based Verifier System

This document describes the API-based verifier system for the Turing DashDoor clone, which allows external verification of tasks using localStorage data.

## Overview

The API-based verifier system provides a way to verify task completion by sending a POST request with a task ID and localStorage data. This enables external tools, scripts, or other applications to verify task completion without direct browser access.

## API Endpoints

### 1. localStorage Download Endpoint

**URL:** `https://turing-dashdoor-clone.vercel.app/api/localStorage`

**Method:** GET

**Description:** Opens a page that automatically downloads the browser's localStorage data as a JSON file.

**Usage:**
- Open this URL in a browser to trigger an immediate download of `localStorage.json`
- The downloaded file contains all localStorage data in JSON format

### 2. Task Verification Endpoint

**URL:** `https://turing-dashdoor-clone.vercel.app/api/verify`

**Method:** POST

**Content-Type:** `multipart/form-data`

**Parameters:**
- `taskId` (string, required): The identifier of the task to verify
- `localStorageData` (file, required): A JSON file containing localStorage data

**Response:**
```json
{
  "taskId": "clear-cart",
  "passed": true,
  "error": null,
  "executionTime": 15.23,
  "consoleOutput": ["[VERIFIER clear-cart] Checking clear cart verifier..."],
  "description": "Add 3 Items and Clear the Cart",
  "category": "cart"
}
```

## Usage Examples

### cURL Example

```bash
curl -X POST https://turing-dashdoor-clone.vercel.app/api/verify \
  -F "taskId=clear-cart" \
  -F "localStorageData=@/path/to/localStorage.json"
```

### JavaScript Example

```javascript
import { verifyTaskWithFile, downloadLocalStorage } from '@/utils/api-verifier'

// Download localStorage data
downloadLocalStorage()

// Verify a task with a file
const formData = new FormData()
formData.append('taskId', 'clear-cart')
formData.append('localStorageData', localStorageFile)

const response = await fetch('/api/verify', {
  method: 'POST',
  body: formData
})

const result = await response.json()
console.log('Verification result:', result)
```

### Python Example

```python
import requests

def verify_task(task_id, localStorage_file_path):
    url = "https://turing-dashdoor-clone.vercel.app/api/verify"
    
    with open(localStorage_file_path, 'rb') as f:
        files = {
            'taskId': (None, task_id),
            'localStorageData': ('localStorage.json', f, 'application/json')
        }
        
        response = requests.post(url, files=files)
        return response.json()

# Usage
result = verify_task('clear-cart', '/path/to/localStorage.json')
print(f"Task passed: {result['passed']}")
```

## Available Tasks

The following tasks are available for verification:

| Task ID | Description | Category |
|---------|-------------|----------|
| `clear-cart` | Add 3 Items and Clear the Cart | cart |
| `order-7eleven-with-tip` | Order 2 Lays Crisps, 1 fruit punch and 1 red bull from 7-Eleven, and add a $5 tip. Close the popup | convenience-cart |
| `add-fruits` | Go to Gus's Community Market and shop for fruits: 3 kiwis, 1 avocado, 1 bunch of strawberries | grocery-cart |
| `add-milk-from-safeway` | Search for Safeway in the Grocery section and add a gallon of milk to the cart | grocery-cart |
| `add-organic-eggs` | Navigate to Sprouts Farmers Market and add 2 Vital Farms Organic Pasture Raised Eggs to the cart | grocery-cart |
| `add-pet-items` | Search for a dog poop bag and a cat shampoo on PetSmart and add it to the cart | pets-cart |
| `buy-dog-cupcake` | Buy a cupcake for my dog | pets-cart |
| `add-cooler-bag` | Navigate to Boichik Bagels and add a Blue Cooler Bag to the cart | restaurant-cart |
| `add-customized-croissant` | Navigate to Gateway Croissant and add a Ham, Egg and Cheese Croissant with Large size, Light Salad, Fruit Portion, Juice, and Low Sugar | restaurant-cart |
| `add-most-ordered` | Navigate to Philz Coffee and add 'Mint Mojito Iced Coffee' from the Most Ordered section | restaurant-cart |
| `add-sweet-pretzel` | Add a sweet pretzel from Jamba Juice to the cart | restaurant-cart |
| `add-two-custom-lattes` | Add 2 Caffè Latte from Starbucks: one vegan medium size and one low sugar small size | restaurant-cart |
| `add-airpods` | Search for Best Buy in the Retail section and add a pair of AirPods Pro 2 to the cart | retail-cart |
| `add-gift-from-michaels` | Navigate to Michaels and add a $2.99 gift item to the cart | retail-cart |
| `sequential-starbucks-bagel` | order for me a starbucks latte and a bagel from a highly rated restaurant. | multi-order |
| `reorder-pet-treats` | Around end of Feb i made an order of fish treats for my pets. Check that order and order the same items in same quantity from another store as the original store has closed now | exact-reorder |

## localStorage Data Format

The localStorage data should be a JSON file containing all localStorage key-value pairs. Example:

```json
{
  "multicategory-cart": "{\"state\":{\"items\":[],\"currentStore\":null,\"searchResults\":[],\"lastSearchInfo\":null,\"lastClearInfo\":null,\"lastRemovalInfo\":null,\"currentCategory\":null,\"verifierConsumed\":false,\"searchVerifierConsumed\":false,\"removalVerifierConsumed\":false}}",
  "orders-store": "{\"state\":{\"orders\":[]}}",
  "other-key": "other-value"
}
```

## Error Responses

The API may return the following error responses:

- `400 Bad Request`: Missing required parameters or invalid JSON
- `404 Not Found`: Task ID not found
- `500 Internal Server Error`: Server-side error during verification

Error response format:
```json
{
  "error": "Error description"
}
```

## Testing

You can test the API-based verifier system using the test page:

**URL:** `https://turing-dashdoor-clone.vercel.app/api-verifier-test`

This page provides:
- A list of all available tasks
- Tools to download localStorage data
- File upload functionality for verification
- Real-time verification results
- cURL command generation

## Integration

The API-based verifier can be integrated into:
- Automated testing frameworks
- CI/CD pipelines
- External monitoring systems
- Custom verification tools
- Browser extensions

## Security Considerations

- The API accepts any localStorage data, so ensure the data comes from a trusted source
- The verification runs in a sandboxed environment
- No sensitive data is logged or stored
- Rate limiting may be applied to prevent abuse

## Troubleshooting

### Common Issues

1. **Invalid JSON**: Ensure the localStorage file contains valid JSON
2. **Missing taskId**: Verify the task ID exists in the available tasks list
3. **File upload errors**: Check file size and format
4. **Network errors**: Verify the API endpoint is accessible

### Debug Information

The API response includes:
- `consoleOutput`: Debug logs from the verifier execution
- `executionTime`: Time taken to execute the verifier
- `error`: Detailed error messages if verification fails

## Support

For issues or questions about the API-based verifier system, please refer to the project documentation or create an issue in the repository.
