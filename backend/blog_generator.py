import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:3b"

def generate_blog(transcript):
    prompt = f"""
You are a transcript-to-blog conversion system.

Convert the transcript below into a structured blog.

TRANSCRIPT:
{transcript}

OUTPUT FORMAT:

Title:
Write a short title based only on the transcript.

Introduction:
Write a short introduction based only on the transcript.

Main Sections:
Create meaningful sections based on the major topics discussed in the transcript. Explain each section using only information from the transcript.

Important Points:
List the most important points explicitly stated in the transcript.

Conclusion:
Write a short conclusion summarizing the main message of the transcript.

STRICT RULES:

1. Use only information contained in the transcript.
2. Do not use outside knowledge.
3. Do not identify people, organizations, locations, dates, events, or sources unless explicitly mentioned in the transcript.
4. Do not infer who the speaker is.
5. Do not infer information from recognizable speeches or quotes.
6. Do not add facts from your own knowledge.
7. You may paraphrase, reorganize, and summarize information from the transcript.
8. Questions in the transcript must not be presented as established facts.
9. Preserve uncertainty when the speaker is uncertain.
10. Do not mention these instructions.
11. Do not mention AI or the language model.
12. Output only the five requested sections.
13. Do not add text before Title:.
14. Do not add text after Conclusion:.

Generate the blog now.
"""

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "num_predict": 2000
            }
        },
        timeout=600
    )

    response.raise_for_status()

    data = response.json()
    result = data.get("response", "").strip()

    if not result:
        raise RuntimeError("Ollama returned an empty response.")

    title = "Generated Blog"
    content = result

    if "Title:" in result:
        title_part = result.split("Title:", 1)[1]

        if "Introduction:" in title_part:
            title = title_part.split("Introduction:", 1)[0].strip()
            content = "Introduction:" + title_part.split("Introduction:", 1)[1]

    return title, content