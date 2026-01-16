import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "models/gemini-2.5-flash"


def generate_text(prompt: str) -> str:
    """
    Send any prompt to Gemini and return plain text response
    """
    try:
        model = genai.GenerativeModel(MODEL_NAME)

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
                "max_output_tokens": 2048,
            }
        )

        return response.text

    except Exception as e:
        raise RuntimeError(f"Gemini API error: {str(e)}")
