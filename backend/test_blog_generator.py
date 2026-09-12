from blog_generator import generate_blog

transcript = """
It's so cold today. Yes, it's a bit chilly. It's 25 degrees. What would that be in England? Oh, minus something. But how did I was English? Well, I could tell by your accent. Oh.
"""

print("Generating blog...")

blog = generate_blog(transcript)

print("\nBLOG:")
print(blog)