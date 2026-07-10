import pytest
from app.core.translation import translation_service

@pytest.mark.asyncio
async def test_translation_scaffold():
    text = "Hello stadium fan"
    translated = await translation_service.translate_text(text, "es")
    assert translated == text
