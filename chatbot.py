import asyncio
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted


api_keys: list = [
    "AIzaSyBioTyqNBHEyLTGvOwAXPMeoPnCf_S_4Nw",
    "AIzaSyCUhoq4WVnUDrp4EhoHQalhGp8EHFwmRTM",
    "AIzaSyAORdEoRqAtfw2A_RoM-by6zV6FvTRwp00",  # c48484...
    "AIzaSyAAsg8IUNOMk839reJR-dWHvOqXme0Tn2Q",  # 12trading....
    "AIzaSyCq03gbKI7yNplxQFjNb9g4omgdxqfQ0PE",  # c87497...
    "AIzaSyAeNgRbc4hcO6B-CbtgJ_82Yd2a6boj1BM",
    "AIzaSyCpcd0bJmb2z0T0BUx-iIjdbdUWf0RNkIA",
    "AIzaSyDeONRRzq8rorsIoPEElUdCvnmHtyinfOk",
]

personality: str = """From now on, always respond in the same language in which the question is asked. Act like a professional algorithmic trader with extensive experience in developing, analyzing, and optimizing automated trading strategies. Explain your answers with technical precision, using clear but professional language. If programming topics are mentioned, provide examples in MQL5, PineScript v6, Python, or Rust, or whichever language best answers the question. If opinions are requested, base your answers on logic, statistics, or risk management, avoiding generic or vague phrases. At all times, maintain an expert, analytical, and results-oriented tone. Present the information in clearly separated and ordered paragraphs, maintaining a fluid and professional reading experience, DO NOT use bullet points or bold text. Only programming code should be presented with additional spacing or line breaks (code blocks or formatting) . Avoid saying “As a professional in...” or “I understand the importance of...”. Be direct and skip that unnecessary introduction; respond directly to the user's query.
"""


async def google_prompt_async(
    prompt: str,
    api_key: str,
    model_name: str = "gemini-2.0-flash-lite",  # "gemini-2.5-pro"
) -> str:
    """Sends a prompt to the Gemini model asynchronously using the provided API key."""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    response = await model.generate_content_async(prompt)
    return response.text


async def receive_response(prompt: str):
    result = None
    prompt = personality + "\n\n" + prompt
    for key in api_keys:
        try:
            result = await google_prompt_async(prompt, key)
            if len(result) > 0:
                break  # we stop the loop if it worked
        # if the key is exhausted (exceeded the usage limit), we try with the next one
        except ResourceExhausted as e:
            print(f"Key exhausted: {key[:10]}... Trying next key...")
            # try with the following key
        except Exception as e:
            print(f"Error with key {key[:10]}...: {e}")
            # try with the following key

    if result:
        return result
    else:
        return "Server is busy, please try again later."


def get_response(message: str):
    """chat with AI"""
    response = asyncio.run(receive_response(message))
    return response


if __name__ == "__main__":
    txt = "como puedo aprender el lenguaje de programación de meta trader 5? dame una guia paso a paso"
    msg = get_response(message=txt)
    print(msg)
