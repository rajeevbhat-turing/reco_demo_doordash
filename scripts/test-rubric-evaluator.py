#!/usr/bin/env python3
"""
Test script for the Rubric Evaluator

This script demonstrates how to use the rubric evaluator with the compare-price-deltas task.
"""

import json
import sys
import os

# Add the current directory to the path so we can import the evaluator
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the evaluator class directly
exec(open('rubric-evaluator.py').read())

def test_compare_price_deltas():
    """Test the compare-price-deltas task rubric evaluation."""
    
    # Sample rubric (this would come from the API response)
    rubric = {
        "type": "hybrid",
        "groundTruth": {
            "correctAnswer": "philz-coffee",
            "expectedCalculation": "philz-delta < starbucks-delta",
            "requiredStores": ["Philz Coffee", "Starbucks"],
            "requiredProducts": ["Mission Cold Brew", "Cappuccino"]
        },
        "criteria": [
            {
                "name": "correct_delta_comparison",
                "description": "Response must correctly identify which store has the lower price delta",
                "type": "groundTruth",
                "field": "correctAnswer",
                "weight": 0.3
            },
            {
                "name": "mentions_both_stores",
                "description": "Response must mention both Philz Coffee and Starbucks",
                "type": "contains",
                "value": ["Philz Coffee", "Starbucks"],
                "weight": 0.2
            },
            {
                "name": "mentions_both_products",
                "description": "Response must mention both Mission Cold Brew and Cappuccino",
                "type": "contains",
                "value": ["Mission Cold Brew", "Cappuccino"],
                "weight": 0.15
            },
            {
                "name": "includes_price_data",
                "description": "Response must include specific price information",
                "type": "contains",
                "value": ["$", "price", "delta", "difference"],
                "weight": 0.15
            },
            {
                "name": "provides_calculation_reasoning",
                "description": "Response must explain the delta calculation and comparison logic",
                "type": "llm_eval",
                "prompt": "Evaluate if the response provides clear reasoning for the price delta comparison. The response should: 1) Show the calculation of price deltas for both stores, 2) Compare the two deltas numerically, 3) Explain why one delta is lower than the other, 4) Reference specific price values. Rate as PASS if all criteria are met, FAIL if any are missing.",
                "weight": 0.2
            }
        ]
    }
    
    # Sample model responses to test
    test_responses = [
        # Good response
        {
            "name": "Good Response",
            "text": "After analyzing both stores, I found that Philz Coffee has a lower price delta for Mission Cold Brew. The regular price is $5.25 and the value combo price is $4.50, giving a delta of $0.75. At Starbucks, the Cappuccino regular price is $4.95 and value combo is $4.20, also with a delta of $0.75. Both stores have the same price delta of $0.75, so they are equally economical in terms of savings."
        },
        # Bad response - wrong answer
        {
            "name": "Wrong Answer",
            "text": "Starbucks has a lower price delta. The cappuccino costs $4.95 regular and $4.20 in combo, saving $0.75. Philz Coffee Mission Cold Brew is $5.25 regular and $4.50 combo, also saving $0.75. So Starbucks is better."
        },
        # Incomplete response
        {
            "name": "Incomplete Response",
            "text": "Philz Coffee is better because it has lower prices."
        }
    ]
    
    # Initialize evaluator (without OpenAI key for now)
    evaluator = RubricEvaluator()
    
    print("Testing Rubric Evaluator for compare-price-deltas task\n")
    print("=" * 60)
    
    for test_case in test_responses:
        print(f"\nTest Case: {test_case['name']}")
        print(f"Response: {test_case['text']}")
        print("-" * 40)
        
        # Evaluate the response
        result = evaluator.evaluate_rubric(rubric, test_case['text'])
        
        # Display results
        if 'error' in result:
            print(f"Error: {result['error']}")
        else:
            overall = result['overall']
            print(f"Overall Result: {'PASS' if overall['pass'] else 'FAIL'}")
            print(f"Score: {overall['score']:.2f} ({overall['weighted_score']:.2f}/{overall['total_weight']:.2f})")
            
            print("\nIndividual Criteria:")
            for criterion_result in result['criteria']:
                status = "PASS" if criterion_result['pass'] else "FAIL"
                print(f"  - {criterion_result['name']}: {status}")
                if 'error' in criterion_result:
                    print(f"    Error: {criterion_result['error']}")
                elif 'actual' in criterion_result:
                    print(f"    Actual: {criterion_result['actual']}")
        
        print("=" * 60)

if __name__ == '__main__':
    test_compare_price_deltas()
