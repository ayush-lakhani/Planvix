"""
Direct test of the StrategyInput model from main.py
"""
import sys
sys.path.insert(0, 'backend')

from pydantic import ValidationError

# Import the model directly from main.py
import importlib.util
spec = importlib.util.spec_from_file_location("main", "backend/main.py")
main_module = importlib.util.module_from_spec(spec)

try:
    spec.loader.exec_module(main_module)
    StrategyInput = main_module.StrategyInput
    
    print("="*80)
    print("TESTING StrategyInput MODEL DIRECTLY")
    print("="*80)
    
    # Test data from screenshot
    test_data = {
        "goal": "coffee selling",
        "audience": "collage student",
        "industry": "Coffee & Tea",
        "platform": "Instagram",
        "contentType": "Stories",
        "experience": "beginner"
    }
    
    print("\nTest Data:")
    for key, value in test_data.items():
        print(f"  {key:15} = '{value}' (len: {len(value)})")
    
    print("\nAttempting to create StrategyInput instance...")
    try:
        strategy_input = StrategyInput(**test_data)
        print("\n✓ SUCCESS! Model validation passed")
        print(f"\nCreated instance:")
        print(f"  {strategy_input}")
        
    except ValidationError as e:
        print("\n✗ VALIDATION ERROR!")
        print("="*80)
        for error in e.errors():
            print(f"\nField: {' -> '.join(str(x) for x in error['loc'])}")
            print(f"Error: {error['msg']}")
            print(f"Type:  {error['type']}")
            if 'input' in error:
                print(f"Input: {error['input']}")
                
except Exception as e:
    print(f"\n✗ Failed to load module: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*80)
