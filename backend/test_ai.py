import os
import google.generativeai as genai

api_key = "AIzaSyD_FTKhEfmeicIg9lFdQJF2VHin1_I5pHw"
genai.configure(api_key=api_key)

SYSTEM_INSTRUCTION = "You are a helpful assistant."

try:
    print("Initializing model...")
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_INSTRUCTION
    )
    print("Generating content...")
    response = model.generate_content("Hello")
    print("Response:")
    print(response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
