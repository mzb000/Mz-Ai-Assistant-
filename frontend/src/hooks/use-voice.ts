"use client";

import { useState, useRef, useCallback } from "react";
import { createSpeechRecognizer } from "@/lib/voice/speech-recognition";

interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    setTranscript("");

    const recognition = createSpeechRecognizer({
      onResult: (text) => setTranscript(text),
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });

    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, startListening, stopListening };
}
