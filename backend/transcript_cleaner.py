import re


# Filler words and phrases that can be safely removed
FILLERS = [
    "um",
    "uh",
    "hmm",
    "you know",
    "i mean"
]


# Words that can be fillers depending on their context
CONTEXTUAL_FILLERS = [
    "like",
    "actually",
    "basically"
]


def remove_fillers(text):
    """
    Remove predefined filler words and phrases.
    Matching is case-insensitive.
    """

    fillers_sorted = sorted(FILLERS, key=len, reverse=True)

    for filler in fillers_sorted:

        # Filler followed by a comma
        # Example: "Um, today..."
        pattern = r"\b" + re.escape(filler) + r"\b\s*,"
        text = re.sub(
            pattern,
            "",
            text,
            flags=re.IGNORECASE
        )

        # Filler without a comma
        # Example: "going to uh discuss"
        pattern = r"\b" + re.escape(filler) + r"\b"
        text = re.sub(
            pattern,
            "",
            text,
            flags=re.IGNORECASE
        )

    return text


def remove_contextual_fillers(text):
    """
    Remove contextual filler words only when they are being
    used as discourse fillers.

    Words such as 'like', 'actually', and 'basically' can also
    carry legitimate meaning, so they are not removed blindly.
    """

    # ---------------------------------------------------------
    # LIKE
    # ---------------------------------------------------------
    # Remove "like" when it is surrounded by commas.
    #
    # Example:
    # "I was, like, explaining the concept."
    # ->
    # "I was explaining the concept."
    #
    # But:
    # "I like machine learning."
    # remains unchanged.
    text = re.sub(
        r",\s*\blike\b\s*,",
        " ",
        text,
        flags=re.IGNORECASE
    )

    # Remove "like" when it appears as a sentence-start filler.
    #
    # Example:
    # "Like, machine learning is useful."
    # ->
    # "machine learning is useful."
    text = re.sub(
        r"^\s*\blike\b\s*,\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    # ---------------------------------------------------------
    # ACTUALLY
    # ---------------------------------------------------------
    # Remove when used as a discourse filler at the beginning
    # of a sentence.
    #
    # Example:
    # "Actually, the model works."
    # ->
    # "the model works."
    text = re.sub(
        r"(^|[.!?]\s*)\bactually\b\s*,\s*",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    # Remove when surrounded by commas.
    #
    # Example:
    # "The model is, actually, very useful."
    # ->
    # "The model is very useful."
    text = re.sub(
        r",\s*\bactually\b\s*,",
        " ",
        text,
        flags=re.IGNORECASE
    )

    # ---------------------------------------------------------
    # BASICALLY
    # ---------------------------------------------------------
    # Remove when used as a discourse filler at the beginning
    # of a sentence.
    #
    # Example:
    # "Basically, the model learns patterns."
    # ->
    # "the model learns patterns."
    text = re.sub(
        r"(^|[.!?]\s*)\bbasically\b\s*,\s*",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    # Remove when surrounded by commas.
    #
    # Example:
    # "The model is, basically, learning from data."
    # ->
    # "The model is learning from data."
    text = re.sub(
        r",\s*\bbasically\b\s*,",
        " ",
        text,
        flags=re.IGNORECASE
    )

    return text


def remove_repeated_words(text):
    """
    Remove consecutively repeated words.

    Matching is case-insensitive.

    Examples:
        "Machine learning is is useful"
        -> "Machine learning is useful"

        "The Model model works"
        -> "The Model works"
    """

    words = text.split()

    if not words:
        return ""

    cleaned_words = [words[0]]

    for word in words[1:]:

        previous_word = re.sub(
            r"[^\w]",
            "",
            cleaned_words[-1]
        ).lower()

        current_word = re.sub(
            r"[^\w]",
            "",
            word
        ).lower()

        if current_word == previous_word:
            continue

        cleaned_words.append(word)

    return " ".join(cleaned_words)


def clean_transcript(transcript):
    """
    Process a raw Parakeet transcript.

    Processing steps:
    1. Remove predefined filler words and phrases.
    2. Remove contextual fillers when their usage indicates
       that they are acting as fillers.
    3. Remove consecutively repeated words.
    4. Clean unnecessary punctuation and spaces.
    5. Preserve the original order of the remaining content.
    """

    if not transcript or not transcript.strip():
        return ""

    # Step 1: Remove obvious fillers
    processed = remove_fillers(transcript)

    # Step 2: Remove contextual fillers
    processed = remove_contextual_fillers(processed)

    # Step 3: Remove consecutive repeated words
    processed = remove_repeated_words(processed)

    # Step 4: Remove spaces before punctuation
    processed = re.sub(
        r"\s+([,.!?;:])",
        r"\1",
        processed
    )

    # Step 5: Remove duplicate commas
    processed = re.sub(
        r",\s*,+",
        ",",
        processed
    )

    # Step 6: Remove commas at the beginning of sentences
    processed = re.sub(
        r"(^|[.!?])\s*,+",
        r"\1 ",
        processed
    )

    # Step 7: Normalize multiple spaces
    processed = re.sub(
        r"\s+",
        " ",
        processed
    )

    return processed.strip()


if __name__ == "__main__":

    raw_transcript = """
    Um, today we are going to uh discuss machine learning.
    Machine learning is is a method for learning from data.
    You know, it can be used for, like, prediction and classification.
    Basically, the model learns learns patterns from the data.
    I mean, these patterns are useful for making predictions.

    UM, THIS IS A TEST.
    UH, THE MODEL MODEL WORKS WELL.
    LIKE, MACHINE LEARNING IS USEFUL.
    ACTUALLY, THE MODEL WORKS.
    BASICALLY, THIS IS AN EXAMPLE.

    I like machine learning.
    Machine learning is actually useful.
    This is basically a comparison.
    """

    print("RAW PARAKEET TRANSCRIPT")
    print("-----------------------")
    print(raw_transcript)

    processed_transcript = clean_transcript(raw_transcript)

    print("\nPROCESSED TRANSCRIPT")
    print("--------------------")
    print(processed_transcript)