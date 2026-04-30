import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from typing import List

# Load env
load_dotenv()

class TriageDecision(BaseModel):
    esi_level: int = Field(..., description="ESI Level 1-5")
    justification: str = Field(..., description="Rationale")
    bed_type: str = Field(..., description="Location")

def test_gemini():
    api_key = os.getenv("GOOGLE_API_KEY")
    print(f"Testing Gemini API with Key: {api_key[:10]}...")
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0,
            api_key=api_key
        )
        
        structured_llm = llm.with_structured_output(TriageDecision)
        
        print("Invoking Gemini...")
        response = structured_llm.invoke("Patient has severe chest pain and dizziness.")
        print("Gemini Response Successful!")
        print(response)
    except Exception as e:
        print(f"Gemini API Error: {e}")

if __name__ == "__main__":
    test_gemini()
