"""
Cloud Translation API integration.

Degrades gracefully to the original English text if translation fails.
"""
import logging
from typing import List
from app.config import settings

logger = logging.getLogger(__name__)


class TranslationService:
    def __init__(self):
        self._client = None
        if not settings.USE_MOCKS:
            self._init_client()

    def _init_client(self):
        try:
            from google.cloud import translate_v2 as translate
            self._client = translate.Client()
        except Exception as e:
            logger.error(f"Failed to initialise Translation client: {e}")
            self._client = None

    async def translate_text(self, text: str, target_lang: str) -> str:
        """
        Translates text to the target ISO 639-1 language code.
        Falls back to the original English text on any error.
        """
        if target_lang == "en":
            return text

        if settings.USE_MOCKS or self._client is None:
            logger.debug(f"Mock translate: '{text[:30]}...' → {target_lang}")
            return text  # graceful fallback in mock/unavailable mode

        try:
            result = self._client.translate(text, target_language=target_lang)
            return result["translatedText"]
        except Exception as e:
            logger.warning(f"Translation failed (target={target_lang}): {e} — falling back to English.")
            return text  # graceful English fallback

    async def translate_list(self, texts: List[str], target_lang: str) -> List[str]:
        """
        Translates a list of strings. Falls back individually on any error.
        """
        if target_lang == "en":
            return texts

        results = []
        for text in texts:
            translated = await self.translate_text(text, target_lang)
            results.append(translated)
        return results


translation_service = TranslationService()
