"""
Tests for translation service — including fallback behaviour.
"""
import pytest
from app.core.translation import translation_service, TranslationService
from app.config import settings


@pytest.mark.asyncio
async def test_translate_english_returns_unchanged():
    """English input with English target must be returned verbatim — no API call."""
    text = "Proceed to Gate A via the North Entrance."
    result = await translation_service.translate_text(text, "en")
    assert result == text


@pytest.mark.asyncio
async def test_translate_mock_mode_returns_original():
    """In mock mode (USE_MOCKS=True), translation must return the original text gracefully."""
    assert settings.USE_MOCKS is True, "This test requires USE_MOCKS=true"
    text = "Continue through Zone 2."
    result = await translation_service.translate_text(text, "es")
    assert result == text  # mock falls back to English


@pytest.mark.asyncio
async def test_translate_list_english_unchanged():
    steps = ["Step one.", "Step two.", "Step three."]
    result = await translation_service.translate_list(steps, "en")
    assert result == steps


@pytest.mark.asyncio
async def test_translate_fallback_on_api_failure():
    """
    Simulate a failure by using a patched client that raises.
    The service must return the original English text without crashing.
    """
    svc = TranslationService.__new__(TranslationService)
    svc._client = None  # No client means it will fall back to original

    # Manually set USE_MOCKS to False to test the real fallback branch
    import app.config as cfg
    original = cfg.settings.USE_MOCKS
    cfg.settings.USE_MOCKS = False

    try:
        text = "Follow the green signs to your gate."
        result = await svc.translate_text(text, "fr")
        assert result == text, "Must degrade to English, not crash"
    finally:
        cfg.settings.USE_MOCKS = original


@pytest.mark.asyncio
async def test_translate_list_fallback_on_api_failure():
    """Translation list must fall back individually per item without crashing."""
    svc = TranslationService.__new__(TranslationService)
    svc._client = None

    import app.config as cfg
    original = cfg.settings.USE_MOCKS
    cfg.settings.USE_MOCKS = False

    try:
        steps = ["Go north.", "Enter concourse.", "Find Gate C."]
        result = await svc.translate_list(steps, "de")
        assert result == steps
    finally:
        cfg.settings.USE_MOCKS = original
