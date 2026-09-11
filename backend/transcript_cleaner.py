import re

FILLERS = [
    "um",
    "uh",
    "hmm",
    "you know",
    "i mean"
]

CONTEXTUAL_FILLERS = [
    "like",
    "actually",
    "basically"
]


def remove_fillers(text):
    fillers_sorted = sorted(FILLERS, key=len, reverse=True)

    for filler in fillers_sorted:
        pattern = r"\b" + re.escape(filler) + r"\b\s*,"
        text = re.sub(
            pattern,
            "",
            text,
            flags=re.IGNORECASE
        )

        pattern = r"\b" + re.escape(filler) + r"\b"
        text = re.sub(
            pattern,
            "",
            text,
            flags=re.IGNORECASE
        )

    return text


def remove_contextual_fillers(text):
    text = re.sub(
        r",\s*\blike\b\s*,",
        " ",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"^\s*\blike\b\s*,\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"(^|[.!?]\s*)\bactually\b\s*,\s*",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r",\s*\bactually\b\s*,",
        " ",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"(^|[.!?]\s*)\bbasically\b\s*,\s*",
        r"\1",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r",\s*\bbasically\b\s*,",
        " ",
        text,
        flags=re.IGNORECASE
    )

    return text


def remove_repeated_words(text):
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
    if not transcript or not transcript.strip():
        return ""

    processed = remove_fillers(transcript)
    processed = remove_contextual_fillers(processed)
    processed = remove_repeated_words(processed)

    processed = re.sub(
        r"\s+([,.!?;:])",
        r"\1",
        processed
    )

    processed = re.sub(
        r",\s*,+",
        ",",
        processed
    )

    processed = re.sub(
        r"(^|[.!?])\s*,+",
        r"\1 ",
        processed
    )

    processed = re.sub(
        r"\s+",
        " ",
        processed
    )

    return processed.strip()