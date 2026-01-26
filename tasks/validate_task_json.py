import csv
import json
import sys

def validate_csv_json(csv_path):
    """
    Load the CSV line by line, parse the JSON in the second column,
    and report any malformed JSON entries.
    """
    errors = []
    valid_count = 0
    
    with open(csv_path, 'r', encoding='utf-8', newline='') as f:
        reader = csv.reader(f)
        header = next(reader)  # Skip header row
        
        print(f"CSV Header: {header}")
        print(f"Validating JSON in column: '{header[1]}'\n")
        
        for row_num, row in enumerate(reader, start=2):  # Start at 2 (1-indexed, after header)
            task_id = row[0]
            json_str = row[1]
            
            try:
                # Attempt to parse the JSON
                parsed = json.loads(json_str)
                valid_count += 1
                
                # Optionally validate expected fields exist
                required_fields = ['start_url', 'task_statement', 'task_id', 'simulator_config', 'grader_config']
                missing_fields = [f for f in required_fields if f not in parsed]
                
                if missing_fields:
                    errors.append({
                        'row': row_num,
                        'task_id': task_id,
                        'error': f"Missing required fields: {missing_fields}",
                        'type': 'missing_fields'
                    })
                    
            except json.JSONDecodeError as e:
                errors.append({
                    'row': row_num,
                    'task_id': task_id,
                    'error': str(e),
                    'type': 'json_error',
                    'position': e.pos,
                    'line': e.lineno,
                    'col': e.colno
                })
                
                # Show context around the error
                if e.pos is not None and len(json_str) > 0:
                    start = max(0, e.pos - 50)
                    end = min(len(json_str), e.pos + 50)
                    context = json_str[start:end]
                    errors[-1]['context'] = f"...{context}..."
    
    # Print results
    print("=" * 60)
    print("VALIDATION RESULTS")
    print("=" * 60)
    print(f"\nTotal rows processed: {valid_count + len([e for e in errors if e['type'] == 'json_error'])}")
    print(f"Valid JSON entries: {valid_count}")
    print(f"JSON parse errors: {len([e for e in errors if e['type'] == 'json_error'])}")
    print(f"Missing field warnings: {len([e for e in errors if e['type'] == 'missing_fields'])}")
    
    if errors:
        print("\n" + "=" * 60)
        print("ERRORS AND WARNINGS")
        print("=" * 60)
        
        json_errors = [e for e in errors if e['type'] == 'json_error']
        if json_errors:
            print(f"\n### JSON Parse Errors ({len(json_errors)}):\n")
            for err in json_errors:
                print(f"Row {err['row']}: {err['task_id']}")
                print(f"  Error: {err['error']}")
                if 'context' in err:
                    print(f"  Context: {err['context']}")
                print()
        
        missing_errors = [e for e in errors if e['type'] == 'missing_fields']
        if missing_errors:
            print(f"\n### Missing Fields Warnings ({len(missing_errors)}):\n")
            for err in missing_errors:
                print(f"Row {err['row']}: {err['task_id']}")
                print(f"  {err['error']}")
                print()
    else:
        print("\n[OK] All JSON entries are valid and contain required fields!")
    
    return len([e for e in errors if e['type'] == 'json_error']) == 0

if __name__ == '__main__':
    csv_path = 'd:/Work/Turing/rlgym/doordash-1/tasks/dashdoor.csv'
    
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
    
    print(f"Validating: {csv_path}\n")
    
    success = validate_csv_json(csv_path)
    sys.exit(0 if success else 1)
