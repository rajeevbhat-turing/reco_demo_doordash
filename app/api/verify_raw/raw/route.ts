import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, localStorage, model_response } = body

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    if (!localStorage) {
      return NextResponse.json({ error: 'localStorage data is required' }, { status: 400 })
    }

    // Get the declarative verifier definition for this task
    const verifierDefinition = getVerifierDefinition(taskId)
    
    if (!verifierDefinition) {
      return NextResponse.json({ error: `Verifier '${taskId}' not found` }, { status: 404 })
    }

    const response: any = {
      taskId,
      description: verifierDefinition.description,
      assertions: verifierDefinition.assertions.map((assertion: any) => {
        // For EXISTS/NOT_EXISTS operators, we can't show expected value in "before" JSON
        // since we don't know what the actual value will be yet
        let expectedValue = assertion.expectation
        if (assertion.operator === 'EXISTS' || assertion.operator === 'NOT_EXISTS') {
          expectedValue = 'TBD' // To Be Determined - will be set after evaluation
        }

        return {
          operator: assertion.operator,
          path: assertion.path || assertion.paths,
          expected: expectedValue,
          options: assertion.options || {}
        }
      })
    }

    // Add type field if it exists
    if (verifierDefinition.type) {
      response.type = verifierDefinition.type
    }

    // Add rubric if it exists
    if (verifierDefinition.rubric) {
      response.rubric = verifierDefinition.rubric
      
      // For "before" JSON, add placeholder fields to show the structure
      if (response.rubric.criteria) {
        response.rubric.criteria.forEach((criterion: any) => {
          criterion.expected = 'TBD' // To Be Determined - will be set after evaluation
          criterion.actual = 'TBD'   // To Be Determined - will be set after evaluation
          criterion.result = 'TBD'   // To Be Determined - will be set after evaluation
        })
      }
    }

    // Add model_response if provided
    if (model_response) {
      response.model_response = model_response
    }

    // Note: This endpoint only returns the raw structure without evaluation results
    // Evaluation results are added by the main /api/verify_raw endpoint

    return NextResponse.json(response)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({
      error: `Failed to get raw JSON: ${errorMessage}`
    }, { status: 500 })
  }
}

// Helper function to get verifier definitions (same as in main route)
function getVerifierDefinition(taskId: string) {
  const definitions: Record<string, any> = {
    'add-cooler-bag': {
      description: 'Navigate to Boichik Bagels and add a Blue Cooler Bag to the cart',
      assertions: [
        {
          operator: 'STRING_MATCH',
          path: 'multicategory-cart.state.currentStore.name',
          expectation: 'Boichik Bagels'
        },
        {
          operator: 'ARRAY_LENGTH',
          path: 'multicategory-cart.state.items',
          expectation: 1
        },
        {
          operator: 'ARRAY_CONTAINS',
          path: 'multicategory-cart.state.items',
          expectation: { itemName: 'Blue Cooler Bag' }
        }
      ]
    },
    'clear-cart': {
      description: 'Add 3 Items and Clear the Cart',
      assertions: [
        {
          operator: 'NOT_EXISTS',
          path: 'multicategory-cart.state.verifierConsumed'
        },
        {
          operator: 'EXISTS',
          path: 'multicategory-cart.state.lastClearInfo'
        },
        {
          operator: 'COMPARE',
          path: 'multicategory-cart.state.lastClearInfo.itemsBeforeClear',
          expectation: 3,
          options: { op: '==', type: 'number' }
        },
        {
          operator: 'ARRAY_LENGTH',
          path: 'multicategory-cart.state.items',
          expectation: 0
        }
      ]
    },
    'compare-price-deltas': {
      description: 'Compare the price delta between regular and value combo for Mission Cold Brew at Philz Coffee vs Cappuccino at Starbucks',
      type: 'response-dependent',
      assertions: [
        {
          operator: 'EXISTS',
          path: 'philz-coffee.mission-cold-brew.regular-price'
        },
        {
          operator: 'EXISTS',
          path: 'philz-coffee.mission-cold-brew.value-combo-price'
        },
        {
          operator: 'EXISTS',
          path: 'starbucks.cappuccino.regular-price'
        },
        {
          operator: 'EXISTS',
          path: 'starbucks.cappuccino.value-combo-price'
        },
        {
          operator: 'EXISTS',
          path: 'philz-coffee.mission-cold-brew.price-delta'
        },
        {
          operator: 'EXISTS',
          path: 'starbucks.cappuccino.price-delta'
        }
      ],
      rubric: {
        type: 'hybrid',
        groundTruth: {
          correctAnswer: 'philz-coffee',
          expectedCalculation: 'philz-delta < starbucks-delta',
          requiredStores: ['Philz Coffee', 'Starbucks'],
          requiredProducts: ['Mission Cold Brew', 'Cappuccino']
        },
        criteria: [
          {
            name: 'correct_delta_comparison',
            description: 'Response must correctly identify which store has the lower price delta',
            type: 'groundTruth',
            field: 'correctAnswer',
            weight: 0.3
          },
          {
            name: 'mentions_both_stores',
            description: 'Response must mention both Philz Coffee and Starbucks',
            type: 'contains',
            value: ['Philz Coffee', 'Starbucks'],
            weight: 0.2
          },
          {
            name: 'mentions_both_products',
            description: 'Response must mention both Mission Cold Brew and Cappuccino',
            type: 'contains',
            value: ['Mission Cold Brew', 'Cappuccino'],
            weight: 0.15
          },
          {
            name: 'includes_price_data',
            description: 'Response must include specific price information',
            type: 'contains',
            value: ['$', 'price', 'delta', 'difference'],
            weight: 0.15
          },
          {
            name: 'provides_calculation_reasoning',
            description: 'Response must explain the delta calculation and comparison logic',
            type: 'llm_eval',
            prompt: 'Evaluate if the response provides clear reasoning for the price delta comparison. The response should: 1) Show the calculation of price deltas for both stores, 2) Compare the two deltas numerically, 3) Explain why one delta is lower than the other, 4) Reference specific price values. Rate as PASS if all criteria are met, FAIL if any are missing.',
            weight: 0.2
          }
        ]
      }
    }
  }

  return definitions[taskId] || null
}
