"use client";

import { useEffect, useState } from "react";
import { DEFAULT_MODEL_BY_PROVIDER, type AiProvider } from "@/lib/ai/config";
import type { ClientAiConfig } from "@/lib/client/aiConfig";

type AiSettingsModalProps = {
  aiConfig: ClientAiConfig;
  onProviderChange: (provider: AiProvider) => void;
  disabled?: boolean;
};

export function AiSettingsModal({ aiConfig, onProviderChange, disabled = false }: AiSettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (!isOpen) return;

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="ai-gear-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI settings"
        title="AI settings"
        disabled={disabled}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .33-1.82 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.82.33h.08a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.08a1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.33 1.82v.08a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
        </svg>
      </button>

      {isOpen && (
        <div className="ai-modal-overlay" onClick={() => setIsOpen(false)} role="presentation">
          <div className="ai-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="AI settings modal">
            <div className="ai-modal-header">
              <h2 className="ai-modal-title">AI settings</h2>
              <button type="button" className="ai-close-btn" onClick={() => setIsOpen(false)} aria-label="Close AI settings">
                ×
              </button>
            </div>

            <label className="ai-field">
              <span className="ai-label">Model provider</span>
              <select
                className="ai-select"
                value={aiConfig.provider}
                onChange={(event) => onProviderChange(event.target.value as AiProvider)}
                disabled={disabled}
              >
                <option value="anthropic">Claude (Anthropic)</option>
                <option value="openai">ChatGPT (OpenAI)</option>
                <option value="google">Gemini (Google)</option>
              </select>
            </label>

            <p className="ai-helper">
              API keys are loaded from <code>.env.local</code> for the selected provider.
            </p>
            <p className="ai-helper">
              Selected model: <code>{DEFAULT_MODEL_BY_PROVIDER[aiConfig.provider]}</code>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
