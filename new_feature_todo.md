1. Create a response dependent task which uses a mix of standard assertions \+ rubric. Task should not be a very simple one.  
   1. Rubric should contain both standard assertions plus atleast 1 LLM eval. For LLM eval the prompt should be very objective  
2. Write a verifier with subchecks as specified in verify\_raw specs.  
3. For LLM rubric, define an atomic rubric with 3-5 evaluation criteria and weights  
4. Update the verify raw to also accept “model\_response” as a parameter as optional if the task is response dependent.  
5. Write a python script that takes an LLM api key like open AI   
   1. It uses gpt-5 as the model.  
   2. When model response is provided, this script/function is called that takes the model response and the rubric defined  
      1. For the rubric evals that are easily gradeable objectively we just need to write python code e-g model response should contain something. These functions should be generic so that any other task that uses the same operator e-g “contains” gets passed another model\_response, we are able to use the same function.  
      2.  For the rubric evals that are LLM based, using the LLM API key we need to run the “prompt” defined in the rubric and judge the output very objectively for correctness.  
6. Lastly on the “verify\_raw” show me a “raw\_json” before running any verifier and then post-running the verifier i should be able to see the final json with the “actual” plus “pass/fail” for the evaluation. 