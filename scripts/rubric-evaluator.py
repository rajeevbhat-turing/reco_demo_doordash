#!/usr/bin/env python3
"""
RL-GYM Rubric Evaluator

This script evaluates model responses against rubric criteria for response-dependent tasks.
It supports both objective evaluation (groundTruth, contains, length) and LLM-based evaluation.
"""

import json
import sys
import argparse
from typing import Dict, Any, List, Union
import re

# Optional import for OpenAI
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

class RubricEvaluator:
    def __init__(self, openai_api_key: str = None):
        """Initialize the evaluator with OpenAI API key."""
        if openai_api_key and OPENAI_AVAILABLE:
            openai.api_key = openai_api_key
            self.client = openai.OpenAI(api_key=openai_api_key)
        else:
            self.client = None

    def evaluate_criterion(self, criterion: Dict[str, Any], model_response: str, ground_truth: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Evaluate a single criterion against the model response.
        
        Args:
            criterion: The criterion definition from the rubric
            model_response: The model's response text
            ground_truth: Ground truth data for objective evaluation
            
        Returns:
            Dictionary with pass/fail result and details
        """
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
                return self._evaluate_llm(criterion, model_response)
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

    def _evaluate_ground_truth(self, criterion: Dict[str, Any], model_response: str, ground_truth: Dict[str, Any]) -> Dict[str, Any]:
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
        
        # Extract the actual value mentioned in the response
        actual_value = 'Not found in response'
        
        # For store names, check for partial matches and extract what was actually said
        if field == 'correctAnswer' and isinstance(expected_value, str):
            if 'philz' in expected_lower:
                if 'philz coffee' in response_lower:
                    actual_value = 'Philz Coffee'
                    pass_check = True
                elif 'philz' in response_lower:
                    actual_value = 'Philz'
                    pass_check = True
                elif 'starbucks' in response_lower:
                    actual_value = 'Starbucks'
                    pass_check = False
                else:
                    pass_check = False
            elif 'starbucks' in expected_lower:
                if 'starbucks' in response_lower:
                    actual_value = 'Starbucks'
                    pass_check = True
                elif 'philz' in response_lower:
                    actual_value = 'Philz'
                    pass_check = False
                else:
                    pass_check = False
            else:
                if expected_lower in response_lower:
                    actual_value = expected_value
                    pass_check = True
                else:
                    pass_check = False
        else:
            if expected_lower in response_lower:
                actual_value = expected_value
                pass_check = True
            else:
                pass_check = False
        
        return {
            'name': criterion.get('name'),
            'expected': expected_value,
            'actual': actual_value,
            'result': 'pass' if pass_check else 'fail'
        }

    def _evaluate_contains(self, criterion: Dict[str, Any], model_response: str) -> Dict[str, Any]:
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
            'expected': values,
            'actual': {
                'found': found_values,
                'missing': missing_values
            },
            'result': 'pass' if pass_check else 'fail'
        }

    def _evaluate_length(self, criterion: Dict[str, Any], model_response: str) -> Dict[str, Any]:
        """Evaluate length criterion."""
        min_length = criterion.get('minLength', 0)
        max_length = criterion.get('maxLength', float('inf'))
        
        actual_length = len(model_response)
        pass_check = min_length <= actual_length <= max_length
        
        return {
            'name': criterion.get('name'),
            'expected': f'{min_length}-{max_length} characters',
            'actual': f'{actual_length} characters',
            'result': 'pass' if pass_check else 'fail'
        }

    def _evaluate_llm(self, criterion: Dict[str, Any], model_response: str) -> Dict[str, Any]:
        """Evaluate using LLM."""
        if not OPENAI_AVAILABLE:
            return {
                'name': criterion.get('name'),
                'expected': 'LLM evaluation result',
                'actual': 'OpenAI module not installed',
                'result': 'fail',
                'error': 'OpenAI module not installed. Install with: pip install openai'
            }
        
        if not self.client:
            return {
                'name': criterion.get('name'),
                'expected': 'LLM evaluation result',
                'actual': 'No API key provided',
                'result': 'fail',
                'error': 'OpenAI API key not provided for LLM evaluation'
            }
        
        prompt = criterion.get('prompt', '')
        if not prompt:
            return {
                'name': criterion.get('name'),
                'expected': 'LLM evaluation result',
                'actual': 'No prompt provided',
                'result': 'fail',
                'error': 'No prompt provided for LLM evaluation'
            }
        
        try:
            # Create the evaluation prompt
            evaluation_prompt = f"""
{prompt}

Model Response to Evaluate:
"{model_response}"

Please respond with only "PASS" or "FAIL" based on your evaluation.
"""
            
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Using gpt-4o instead of gpt-5 as requested
                messages=[
                    {"role": "system", "content": "You are an objective evaluator. Respond only with PASS or FAIL."},
                    {"role": "user", "content": evaluation_prompt}
                ],
                max_tokens=10,
                temperature=0
            )
            
            result = response.choices[0].message.content.strip().upper()
            pass_check = result == "PASS"
            
            return {
                'name': criterion.get('name'),
                'expected': 'PASS',
                'actual': result,
                'result': 'pass' if pass_check else 'fail',
                'llm_reasoning': response.choices[0].message.content
            }
            
        except Exception as e:
            return {
                'name': criterion.get('name'),
                'expected': 'LLM evaluation result',
                'actual': f'Evaluation failed: {str(e)}',
                'result': 'fail',
                'error': f'LLM evaluation failed: {str(e)}'
            }

    def evaluate_rubric(self, rubric: Dict[str, Any], model_response: str) -> Dict[str, Any]:
        """
        Evaluate the entire rubric against the model response.
        
        Args:
            rubric: The rubric definition
            model_response: The model's response text
            
        Returns:
            Dictionary with overall results and individual criterion results
        """
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
            
            if result.get('result') == 'pass':
                weighted_score += weight
        
        # Calculate overall score and summary
        overall_score = weighted_score / total_weight if total_weight > 0 else 0
        overall_pass = overall_score >= 0.5  # Pass if at least 50% of weighted criteria pass
        
        # Count pass/fail
        total_tests = len(results)
        passed_tests = sum(1 for r in results if r.get('result') == 'pass')
        failed_tests = total_tests - passed_tests
        
        return {
            'overall': {
                'result': 'pass' if overall_pass else 'fail',
                'score': overall_score,
                'total_tests': total_tests,
                'passed_tests': passed_tests,
                'failed_tests': failed_tests,
                'total_weight': total_weight,
                'weighted_score': weighted_score
            },
            'criteria': results,
            'ground_truth': ground_truth
        }

def main():
    parser = argparse.ArgumentParser(description='Evaluate model response against rubric criteria')
    parser.add_argument('--rubric', required=True, help='Rubric JSON file or JSON string')
    parser.add_argument('--model-response', required=True, help='Model response text')
    parser.add_argument('--openai-key', help='OpenAI API key for LLM evaluation')
    parser.add_argument('--output', help='Output file (default: stdout)')
    
    args = parser.parse_args()
    
    # Parse rubric
    try:
        if args.rubric.startswith('{'):
            rubric = json.loads(args.rubric)
        else:
            with open(args.rubric, 'r') as f:
                rubric = json.load(f)
    except Exception as e:
        print(f"Error parsing rubric: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Initialize evaluator
    evaluator = RubricEvaluator(args.openai_key)
    
    # Evaluate
    result = evaluator.evaluate_rubric(rubric, args.model_response)
    
    # Output results
    output = json.dumps(result, indent=2)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(output)
    else:
        print(output)

if __name__ == '__main__':
    main()
