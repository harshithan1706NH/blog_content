import sys
import logging

import nemo.collections.asr as nemo_asr

MODEL_NAME = "nvidia/parakeet-tdt-0.6b-v2"


def transcribe_audio(audio_path):
    logging.disable(logging.CRITICAL)

    model = nemo_asr.models.ASRModel.from_pretrained(MODEL_NAME)
    output = model.transcribe([audio_path])

    return output[0].text.strip()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(1)

    transcript = transcribe_audio(sys.argv[1])
    print(transcript)