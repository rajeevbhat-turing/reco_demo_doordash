import { NextRequest, NextResponse } from 'next/server'
import { AssertionEngine } from '@/lib/assertion-engine'
import { spawn } from 'child_process'
import path from 'path'

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

    // Create assertion engine
    const engine = new AssertionEngine()
    
    // Execute all assertions
    const results = verifierDefinition.assertions.map((assertion: any) => {
      try {
        const result = engine.execute(assertion, localStorage)
        // For EXISTS/NOT_EXISTS operators, the expected value is the actual value found
        // For other operators, use the expectation from the assertion definition
        let expectedValue = assertion.expectation
        if (assertion.operator === 'EXISTS' || assertion.operator === 'NOT_EXISTS') {
          expectedValue = result.actual
        }

        return {
          operator: assertion.operator,
          path: assertion.path || assertion.paths,
          expected: expectedValue,
          actual: result.actual,
          result: result.result === 'match' ? 'pass' : 'fail',
          error: result.error || null
        }
      } catch (error) {
        // For EXISTS/NOT_EXISTS operators, expected value would be null on error
        // For other operators, use the expectation from the assertion definition
        let expectedValue = assertion.expectation
        if (assertion.operator === 'EXISTS' || assertion.operator === 'NOT_EXISTS') {
          expectedValue = null
        }

        return {
          operator: assertion.operator,
          path: assertion.path || assertion.paths,
          expected: expectedValue,
          actual: null,
          result: 'fail',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    // Calculate assertion summary
    const totalAssertions = results.length
    const passedAssertions = results.filter((r: any) => r.result === 'pass').length
    const failedAssertions = totalAssertions - passedAssertions

    const response: any = {
      taskId,
      description: verifierDefinition.description,
      assertions: results,
      overall: {
        result: failedAssertions === 0 ? 'pass' : 'fail',
        total_tests: totalAssertions,
        passed_tests: passedAssertions,
        failed_tests: failedAssertions
      }
    }

    // Add type field if it exists
    if (verifierDefinition.type) {
      response.type = verifierDefinition.type
    }

    // Add rubric if it exists
    if (verifierDefinition.rubric) {
      response.rubric = verifierDefinition.rubric
    }

    // Add model_response if provided
    if (model_response) {
      response.model_response = model_response
    }

    // If this is a response-dependent task with rubric and model_response, run rubric evaluation
    if (verifierDefinition.type === 'response-dependent' && 
        verifierDefinition.rubric && 
        model_response) {
      
      try {
        const rubricResult = await evaluateRubric(verifierDefinition.rubric, model_response)
        
        // Enhance the existing rubric criteria with evaluation results
        if (response.rubric && rubricResult && !rubricResult.error) {
          // Add overall results
          response.rubric.overall = rubricResult.overall
          
          // Enhance each criterion with its evaluation results
          if (response.rubric.criteria && rubricResult.criteria) {
            response.rubric.criteria.forEach((criterion: any, index: number) => {
              const evaluationResult = rubricResult.criteria[index]
              if (evaluationResult) {
                criterion.expected = evaluationResult.expected
                criterion.actual = evaluationResult.actual
                criterion.result = evaluationResult.result
                if (evaluationResult.error) {
                  criterion.error = evaluationResult.error
                }
              }
            })
          }
        } else if (rubricResult && rubricResult.error) {
          response.rubric.evaluation_error = rubricResult.error
        }
      } catch (error) {
        if (response.rubric) {
          response.rubric.evaluation_error = `Rubric evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({
      error: `Verification failed: ${errorMessage}`
    }, { status: 500 })
  }
}

// Mock function to get verifier definitions - you'll replace this with your actual data source
function getVerifierDefinition(taskId: string) {
  // For now, return a sample definition
  // You'll replace this with your actual verifier definitions
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
          expectation: { itemName: 'Blue Cooler Bag' },
          options: { mode: 'some', matchBy: 'key', key: 'itemName' }
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

// Function to evaluate rubric using Python script
async function evaluateRubric(rubric: any, modelResponse: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'rubric-evaluator.py')
    
    // Prepare the rubric as JSON string
    const rubricJson = JSON.stringify(rubric)
    
    // Spawn the Python process
    const pythonProcess = spawn('python3', [
      scriptPath,
      '--rubric', rubricJson,
      '--model-response', modelResponse
    ])
    
    let stdout = ''
    let stderr = ''
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout)
          resolve(result)
        } catch (parseError) {
          reject(new Error(`Failed to parse Python script output: ${parseError}`))
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`))
      }
    })
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python script: ${error.message}`))
    })
  })
}
