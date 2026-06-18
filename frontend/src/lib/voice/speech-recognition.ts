type SpeechCallback = {
  onResult: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
};

export function createSpeechRecognizer(callbacks: SpeechCallback) {
  if (typeof window === "undefined") {
    callbacks.onError?.("Speech recognition not supported");
    return null;
  }

  const SpeechRecognitionAPI =
    (window as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
    (window as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    callbacks.onError?.("Speech recognition not supported");
    return null;
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const results = event.results;
    let transcript = "";
    for (let i = 0; i < results.length; i++) {
      transcript += results[i][0].transcript;
    }
    callbacks.onResult(transcript);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    callbacks.onError?.(event.error);
  };

  recognition.onend = () => {
    callbacks.onEnd?.();
  };

  return recognition;
}
