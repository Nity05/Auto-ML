import os
import json
import time
from dotenv import load_dotenv
from google import genai
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize client
client = genai.Client()

def is_rate_limit_error(exception):
    """Check if the error is a rate limit (429) error"""
    error_str = str(exception).lower()
    return "429" in error_str or "resource_exhausted" in error_str

@retry(
    stop=stop_after_attempt(8),
    wait=wait_exponential(multiplier=2, min=4, max=60), # More aggressive wait for free tier
    retry=retry_if_exception_type(Exception),
    before_sleep=lambda retry_state: print(f"Gemini API Rate Limit hit. Retrying in {retry_state.next_action.sleep}s... (Attempt {retry_state.attempt_number})")
)
def generate_code(prompt: str) -> str:
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        if is_rate_limit_error(e):
            raise e # Let tenacity retry
        else:
            raise RuntimeError(f"Gemini Generation Error: {str(e)}")

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=2, min=4, max=60),
    retry=retry_if_exception_type(Exception)
)
def analyze_results(metrics_json: dict, task: str) -> str:
    prompt = f"""
    You are an AI ML Expert. Analyze the following {task} training results and provide:
    1. A professional summary of the model performance.
    2. Identification of any strengths or weaknesses.
    3. Actionable suggestions to improve the model.
    
    Results (JSON):
    {json.dumps(metrics_json, indent=2)}
    
    Format the output in clean Markdown with professional headings. Use bullet points for suggestions.
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        if is_rate_limit_error(e):
            raise e
        else:
            raise RuntimeError(f"Gemini Analysis Error: {str(e)}")
