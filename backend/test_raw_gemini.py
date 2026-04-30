import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

def test_raw_gemini():
    api_key = os.getenv("GOOGLE_API_KEY")
    print(f"Testing raw Google Generative AI API with Key: {api_key[:10]}...")
    
    genai.configure(api_key=api_key)
    
    try:
        # List models
        print("Available models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
        
        print("\nInvoking gemini-flash-latest...")
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Hello")
        print("Response successful!")
        print(response.text)
        
    except Exception as e:
        print(f"Raw API Error: {e}")

if __name__ == "__main__":
    test_raw_gemini()
