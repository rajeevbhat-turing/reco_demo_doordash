import { NextRequest, NextResponse } from 'next/server';
import { dbPOC } from '@/lib/database-poc';
import flowVerifiers from '@/config/flow-verifiers.json';

interface CartState {
  items: any[];
  currentStore: any;
  searchResults: any[];
  lastSearchInfo: any;
  lastClearInfo: any;
  lastRemovalInfo: any;
  currentCategory: string;
  verifierConsumed: boolean;
  searchVerifierConsumed: boolean;
  removalVerifierConsumed: boolean;
  quantityVerifierConsumed: boolean;
  orderVerifierConsumed: boolean;
  lastQuantityChangeInfo: any;
  lastOrderInfo: any;
}

interface VerificationResult {
  prompt_id: string;
  result: string | undefined;
}

// GET /api/v1/run/verify - Verify a task using database data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('run_id');
    const prompt_id = searchParams.get('prompt_id');

    if (!runId) {
      return NextResponse.json({ error: 'run_id is required' }, { status: 400 });
    }

    if (!prompt_id) {
      return NextResponse.json({ error: 'prompt_id is required' }, { status: 400 });
    }

    const flow = flowVerifiers.flows[prompt_id as keyof typeof flowVerifiers.flows];

    if (!flow) {
      return NextResponse.json({ error: `Prompt '${prompt_id}' not found` }, { status: 404 });
    }

    // Get stored data from database for this run
    const storedData = await dbPOC.bulkGet(runId, ['multicategory-cart']);

    if (!storedData.items || storedData.items.length === 0) {
      return NextResponse.json({ error: 'No data found for this run' }, { status: 404 });
    }

    // Find the cart data in stored items
    const cartData = storedData.items.find(
      (item: { key: string; value: any }) => item.key === 'multicategory-cart'
    );

    if (!cartData) {
      return NextResponse.json({ error: 'Cart data not found for this run' }, { status: 404 });
    }

    const startTime = performance.now();

    // Parse the stored cart data
    let finalCartState: CartState;
    try {
      const parsedData = JSON.parse(cartData.v);
      finalCartState = parsedData.state || parsedData;
    } catch (e) {
      finalCartState = getDefaultCartState();
    }

    const mockLocalStorage = {
      getItem: (key: string) => {
        if (key === 'multicategory-cart') {
          // Return the complete stored data as JSON string
          return JSON.stringify(cartData.value);
        }
        // Check other stored keys
        const otherData = storedData.items.find(
          (item: { key: string; value: any }) => item.key === key
        );
        return otherData ? otherData.value : null;
      },
      setItem: (key: string, value: string) => {
        // Mock setItem - no-op for database verification
      },
    };

    // Create a mock console for capturing output
    const consoleOutput: string[] = [];
    const mockConsole = {
      log: (...args: any[]) => {
        consoleOutput.push(`[LOG] ${args.join(' ')}`);
      },
      error: (...args: any[]) => {
        consoleOutput.push(`[ERROR] ${args.join(' ')}`);
      },
    };

    // Create execution context with mocks
    const context = {
      localStorage: mockLocalStorage,
      console: mockConsole,
      window: {
        useCartStore: {
          getState: () => ({
            markSearchVerifierConsumed: () => {
              console.log('[MOCK] markSearchVerifierConsumed called');
            },
            markVerifierConsumed: () => {
              console.log('[MOCK] markVerifierConsumed called');
            },
            markRemovalVerifierConsumed: () => {
              console.log('[MOCK] markRemovalVerifierConsumed called');
            },
            markQuantityVerifierConsumed: () => {
              console.log('[MOCK] markQuantityVerifierConsumed called');
            },
            markOrderVerifierConsumed: () => {
              console.log('[MOCK] markOrderVerifierConsumed called');
            },
          }),
        },
      },
    };

    // Execute the verifier code with the mock context
    let verificationResult: boolean | undefined;
    try {
      const verifierFunction = new Function(
        'localStorage',
        'console',
        'window',
        `return (function() { ${flow.verifier} })()`
      );
      verificationResult = verifierFunction(context.localStorage, context.console, context.window);
    } catch (execError) {
      const errorMessage = execError instanceof Error ? execError.message : 'Unknown error';

      const result: VerificationResult = {
        prompt_id,
        result: 'failed',
      };

      return NextResponse.json(result);
    }

    const result: VerificationResult = {
      prompt_id,
      result: verificationResult ? 'passed' : 'failed',
    };

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        error: `API request failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getDefaultCartState(): CartState {
  return {
    items: [],
    currentStore: null,
    searchResults: [],
    lastSearchInfo: null,
    lastClearInfo: null,
    lastRemovalInfo: null,
    currentCategory: 'restaurant',
    verifierConsumed: false,
    searchVerifierConsumed: false,
    removalVerifierConsumed: false,
    quantityVerifierConsumed: false,
    orderVerifierConsumed: false,
    lastQuantityChangeInfo: null,
    lastOrderInfo: null,
  };
}

function extractExpectedItems(description: string): string[] {
  const items: string[] = [];

  // Extract common patterns from descriptions
  const patterns = [
    /sweet pretzel/i,
    /coffee/i,
    /latte/i,
    /croissant/i,
    /cooler bag/i,
    /mint mojito/i,
    /ham, egg and cheese/i,
  ];

  patterns.forEach(pattern => {
    const match = description.match(pattern);
    if (match) {
      items.push(match[0]);
    }
  });

  return items;
}
