import os
import asyncio
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from typing import List

# Load env
load_dotenv()

class ICDClassification(BaseModel):
    icd_code: str
    official_description: str
    chapter_prefix: str
    confidence_score: float
    clinical_rationale: str
    triage_urgency: str # CRITICAL | URGENT | STABLE

async def test_icd_yellow():
    api_key = os.getenv("GOOGLE_API_KEY")
    print(f"Testing Gemini ICD with symptom: yellowish body")
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            temperature=0,
            api_key=api_key
        )
        
        icd_engine = llm.with_structured_output(ICDClassification)
        
        system_prompt = (
            "## ROLE: Phrelis OS Clinical Intelligence Core (ICD-10-CM 2026)\n"
            "## TASK: Map unstructured patient data to structured ICD-10 codes for triage.\n\n"
            "Respond ONLY with JSON strictly following the ICDClassification schema."
        )
        
        user_input = "Primary Complaint: yellowish body. Supporting Symptoms: []"
        
        print("Invoking Gemini...")
        response = await icd_engine.ainvoke([
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ])
        print("Gemini Response Successful!")
        print(response)
    except Exception as e:
        print(f"Gemini API Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_icd_yellow())
