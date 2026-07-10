"""
Cloud Text-to-Speech integration.

Generates spoken audio for fans who need accessibility support (visual impairment,
limited literacy). Audio files are stored in Cloud Storage and the URL returned
in the NavigationResponse.
"""
import logging
import hashlib
from typing import Optional
from app.config import settings
from app.models.schemas import MobilityNeeds

logger = logging.getLogger(__name__)

# Mobility needs that trigger TTS generation
TTS_REQUIRED_NEEDS = {MobilityNeeds.WHEELCHAIR, MobilityNeeds.SENSORY_SENSITIVE}

# Mapping from ISO language code to BCP-47 / Cloud TTS voice codes
LANGUAGE_TO_VOICE: dict = {
    "en": {"language_code": "en-US", "name": "en-US-Standard-C"},
    "es": {"language_code": "es-US", "name": "es-US-Standard-B"},
    "fr": {"language_code": "fr-FR", "name": "fr-FR-Standard-A"},
    "de": {"language_code": "de-DE", "name": "de-DE-Standard-A"},
    "pt": {"language_code": "pt-BR", "name": "pt-BR-Standard-A"},
    "ar": {"language_code": "ar-XA", "name": "ar-XA-Standard-A"},
    "zh": {"language_code": "cmn-CN", "name": "cmn-CN-Standard-A"},
    "ja": {"language_code": "ja-JP", "name": "ja-JP-Standard-A"},
}
DEFAULT_VOICE = {"language_code": "en-US", "name": "en-US-Standard-C"}


def requires_tts(mobility_needs: MobilityNeeds) -> bool:
    """Return True if this fan's accessibility profile should receive audio output."""
    return mobility_needs in TTS_REQUIRED_NEEDS


class TTSService:
    def __init__(self):
        self._tts_client = None
        self._gcs_client = None
        self._bucket_name = f"{settings.PROJECT_ID}-tts-audio"
        if not settings.USE_MOCKS:
            self._init_clients()

    def _init_clients(self):
        try:
            from google.cloud import texttospeech
            from google.cloud import storage
            self._tts_client = texttospeech.TextToSpeechClient()
            self._gcs_client = storage.Client(project=settings.PROJECT_ID)
        except Exception as e:
            logger.error(f"Failed to initialise TTS/Storage clients: {e}")

    async def generate_speech(
        self,
        text: str,
        preferred_language: str,
        mobility_needs: MobilityNeeds,
    ) -> Optional[str]:
        """
        Generates TTS audio for the given text if the fan's mobility needs require it.

        Returns:
            URL string of the audio file in Cloud Storage, or None if not applicable/fails.
        """
        if not requires_tts(mobility_needs):
            return None

        if settings.USE_MOCKS or self._tts_client is None:
            logger.debug(f"Mock TTS: would generate audio for language={preferred_language}")
            return None  # graceful non-crash fallback in mock mode

        try:
            return await self._synthesize_and_upload(text, preferred_language)
        except Exception as e:
            logger.warning(f"TTS generation failed: {e} — skipping audio output.")
            return None

    async def _synthesize_and_upload(self, text: str, language: str) -> Optional[str]:
        """Synthesize speech via Cloud TTS and upload to GCS."""
        from google.cloud import texttospeech

        voice_config = LANGUAGE_TO_VOICE.get(language, DEFAULT_VOICE)

        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code=voice_config["language_code"],
            name=voice_config["name"],
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = self._tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        # Generate a stable filename from the text content
        content_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
        filename = f"audio/{language}/{content_hash}.mp3"

        bucket = self._gcs_client.bucket(self._bucket_name)
        blob = bucket.blob(filename)
        blob.upload_from_string(response.audio_content, content_type="audio/mpeg")
        blob.make_public()

        return blob.public_url


tts_service = TTSService()
