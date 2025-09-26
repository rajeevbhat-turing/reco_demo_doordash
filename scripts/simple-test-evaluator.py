#!/usr/bin/env python3
"""
Simple test for the Rubric Evaluator (without OpenAI dependency)

This script tests the objective evaluation functions without requiring OpenAI API.
"""

import json
import sys
import os

# Simple evaluator class without OpenAI dependency
class SimpleRubricEvaluator:
    def __init__(self):
        pass

    def evaluate_criterion(self, criterion, model_response, ground_truth=None):
        """Evaluate a single criterion against the model response."""
        criterion_type = criterion.get('type')
        criterion_name = criterion.get('name', 'unknown')
        
        try:
            if criterion_type == 'groundTruth':
                return self._evaluate_ground_truth(criterion, model_response, ground_truth)
            elif criterion_type == 'contains':
                return self._evaluate_contains(criterion, model_response)
            elif criterion_type == 'length':
                return self._evaluate_length(criterion, model_response)
            elif criterion_type == 'llm_eval':
                return {
                    'name': criterion_name,
                    'pass': False,
                    'error': 'LLM evaluation requires OpenAI API key'
                }
            else:
                return {
                    'name': criterion_name,
                    'pass': False,
                    'error': f'Unknown criterion type: {criterion_type}'
                }
        except Exception as e:
            return {
                'name': criterion_name,
                'pass': False,
                'error': f'Evaluation error: {str(e)}'
            }

    def _evaluate_ground_truth(self, criterion, model_response, ground_truth):
        """Evaluate ground truth criterion."""
        field = criterion.get('field')
        if not field or not ground_truth:
            return {
                'name': criterion.get('name'),
                'pass': False,
                'error': 'Missing field or ground truth data'
            }
        
        expected_value = ground_truth.get(field)
        if expected_value is None:
            return {
                'name': criterion.get('name'),
                'pass': False,
                'error': f'Ground truth field "{field}" not found'
            }
        
        # Check if the expected value appears in the model response
        response_lower = model_response.lower()
        expected_lower = str(expected_value).lower()
        
        # For store names, check for partial matches
        if field == 'correctAnswer' and isinstance(expected_value, str):
            if 'philz' in expected_lower:
                # Check that Philz is mentioned AND Starbucks is not claimed as the answer
                pass_check = 'philz' in response_lower and not ('starbucks' in response_lower and ('better' in response_lower or 'lower' in response_lower))
            elif 'starbucks' in expected_lower:
                pass_check = 'starbucks' in response_lower
            else:
                pass_check = expected_lower in response_lower
        else:
            pass_check = expected_lower in response_lower
        
        return {
            'name': criterion.get('name'),
            'pass': pass_check,
            'expected': expected_value,
            'actual': 'Found in response' if pass_check else 'Not found in response'
        }

    def _evaluate_contains(self, criterion, model_response):
        """Evaluate contains criterion."""
        values = criterion.get('value', [])
        if not values:
            return {
                'name': criterion.get('name'),
                'pass': False,
                'error': 'No values specified for contains check'
            }
        
        response_lower = model_response.lower()
        found_values = []
        missing_values = []
        
        for value in values:
            if str(value).lower() in response_lower:
                found_values.append(value)
            else:
                missing_values.append(value)
        
        # Pass if all required values are found
        pass_check = len(missing_values) == 0
        
        return {
            'name': criterion.get('name'),
            'pass': pass_check,
            'expected': values,
            'actual': {
                'found': found_values,
                'missing': missing_values
            }
        }

    def _evaluate_length(self, criterion, model_response):
        """Evaluate length criterion."""
        min_length = criterion.get('minLength', 0)
        max_length = criterion.get('maxLength', float('inf'))
        
        actual_length = len(model_response)
        pass_check = min_length <= actual_length <= max_length
        
        return {
            'name': criterion.get('name'),
            'pass': pass_check,
            'expected': f'{min_length}-{max_length} characters',
            'actual': f'{actual_length} characters'
        }

    def evaluate_rubric(self, rubric, model_response):
        """Evaluate the entire rubric against the model response."""
        if not rubric:
            return {'error': 'No rubric provided'}
        
        ground_truth = rubric.get('groundTruth', {})
        criteria = rubric.get('criteria', [])
        
        if not criteria:
            return {'error': 'No criteria found in rubric'}
        
        results = []
        total_weight = 0
        weighted_score = 0
        
        for criterion in criteria:
            result = self.evaluate_criterion(criterion, model_response, ground_truth)
            results.append(result)
            
            weight = criterion.get('weight', 0)
            total_weight += weight
            
            if result.get('pass', False):
                weighted_score += weight
        
        # Calculate overall score
        overall_score = weighted_score / total_weight if total_weight > 0 else 0
        overall_pass = overall_score >= 0.5  # Pass if at least 50% of weighted criteria pass
        
        return {
            'overall': {
                'pass': overall_pass,
                'score': overall_score,
                'total_weight': total_weight,
                'weighted_score': weighted_score
            },
            'criteria': results,
            'ground_truth': ground_truth
        }

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
                "prompt": "Evaluate if the response provides clear reasoning for the price delta comparison...",
                "weight": 0.2
            }
        ]
    }
    
    # Sample model responses to test
    test_responses = [
        {
            "name": "Good Response",
            "text": "After analyzing both stores, I found that Philz Coffee has a lower price delta for Mission Cold Brew. The regular price is $5.25 and the value combo price is $4.50, giving a delta of $0.75. At Starbucks, the Cappuccino regular price is $4.95 and value combo is $4.20, also with a delta of $0.75. Both stores have the same price delta of $0.75, so they are equally economical in terms of savings."
        },
        {
            "name": "Wrong Answer",
            "text": "Starbucks has a lower price delta. The cappuccino costs $4.95 regular and $4.20 in combo, saving $0.75. Philz Coffee Mission Cold Brew is $5.25 regular and $4.50 combo, also saving $0.75. So Starbucks is better."
        },
        {
            "name": "Incomplete Response",
            "text": "Philz Coffee is better because it has lower prices."
        }
    ]
    
    # Initialize evaluator
    evaluator = SimpleRubricEvaluator()
    
    print("Testing Simple Rubric Evaluator for compare-price-deltas task\n")
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
