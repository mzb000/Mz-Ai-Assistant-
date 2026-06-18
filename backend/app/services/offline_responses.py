import re
from typing import Optional


def get_offline_response(message: str) -> Optional[str]:
    msg = message.strip().lower()

    # Greetings
    if re.search(r"\b(salam|assalamo|assalam|slam)\b", msg):
        return "Wa alaikum assalam! How can I help you today?"

    if re.search(r"\b(hi|hello|hey|greetings)\b", msg):
        return "Hello! How can I assist you?"

    if re.search(r"\b(good morning|good evening|good afternoon)\b", msg):
        return "Good day to you too! What can I do for you?"

    # How are you
    if re.search(r"\b(how are you|how do you do|how's it going)\b", msg):
        return "I'm doing great, thank you for asking! How can I help you?"

    # Thanks
    if re.search(r"\b(thank|thanks|shukria|shukran)\b", msg):
        return "You're welcome! Let me know if you need anything else."

    # Identity
    if re.search(r"\b(who are you|your name|tell me about yourself)\b", msg):
        return "I'm Zabi, your AI assistant! I can chat, answer questions, process documents, and help with various tasks. To use my full capabilities, add an API key in Settings."

    if re.search(r"\b(what can you do|capabilities|features)\b", msg):
        return "I can help with:\n- Chat and conversation\n- Document upload and analysis (PDF, DOCX, TXT, images)\n- Voice input and output\n- Answer questions using your documents\n\nAdd an API key in Settings to unlock AI-powered responses!"

    # Goodbye
    if re.search(r"\b(bye|goodbye|allah hafiz|khuda hafiz)\b", msg):
        return "Allah Hafiz! Take care and feel free to come back anytime."

    # Help
    if re.search(r"\b(help|madad)\b", msg):
        return "Here's what I can do:\n- Ask me anything\n- Upload documents (click the paperclip button)\n- Use voice input (click the mic button)\n- Configure AI provider in Settings\n\nTo get started, add your API key in Settings!"

    return None
