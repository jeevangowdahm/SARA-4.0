import React, { useState, useEffect, useRef } from 'react';
import { SaraApiClient } from '../../lib/sara/api/client';
import { SaraSpeechSynthesisService } from '../../lib/sara/speechProvider';
import { SupportedLanguage } from '../../lib/sara/types';

interface DocumentChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: SupportedLanguage;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'sara';
  text: string;
  sources?: string[];
  provider?: string;
  timestamp: string;
}

export const DocumentChatbotModal: React.FC<DocumentChatbotModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'sara',
      text:
        selectedLanguage === 'kn'
          ? 'ನಮಸ್ಕಾರ! ನಾನು SARA ಡಾಕ್ಯುಮೆಂಟ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್. ನಿಮ್ಮ ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಅಂಕಪಟ್ಟಿ, ಕಾಲೇಜು ದಾಖಲೆಗಳು ಅಥವಾ ಪ್ರೊಫೈಲ್ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.'
          : 'Hello! I am your SARA Document Intelligence Assistant. Ask me anything about your uploaded marks cards, certificates, or verified profile.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Voice speech synthesis
  const handleSpeakAnswer = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      SaraSpeechSynthesisService.stop();
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(msg.id);
    const langLocale = selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';

    SaraSpeechSynthesisService.speak(msg.text, {
      lang: langLocale,
      rate: selectedLanguage === 'kn' ? 0.95 : 1.0,
      onEnd: () => setSpeakingMessageId(null),
    });
  };

  // Voice speech recognition
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported on this browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = selectedLanguage === 'kn' ? 'kn-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputText(transcript);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    rec.start();
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText.trim();
    if (!textToSend || isLoading) return;

    setInputText('');
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await SaraApiClient.chatWithDocumentAssistant(textToSend, selectedLanguage);

      const saraMsg: ChatMessage = {
        id: `sara_${Date.now()}`,
        sender: 'sara',
        text: res.answer,
        sources: res.sources,
        provider: res.provider,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, saraMsg]);

      // Automatically speak the answer aloud for seamless accessibility
      handleSpeakAnswer(saraMsg);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'sara',
        text:
          selectedLanguage === 'kn'
            ? 'ಕ್ಷಮಿಸಿ, ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸುವಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
            : 'Could not query document intelligence. Please ensure you are signed in and have uploaded documents to your vault.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant/40 rounded-3xl shadow-2xl flex flex-col h-[580px] overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center border border-secondary/30">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-primary-container font-headline-sm">
                  Document Intelligence Assistant
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/20 text-secondary border border-secondary/30">
                  Groq Live
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Direct AI question-answering over your private marks cards & certificates
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              SaraSpeechSynthesisService.stop();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Quick Demo Prompts */}
        <div className="px-6 py-2 bg-surface-container-lowest border-b border-outline-variant/20 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant flex-shrink-0">Quick ask:</span>
          <button
            onClick={() => handleSendMessage('What is my USN, enrolled institution, and CGPA in my uploaded documents?')}
            className="px-2.5 py-1 rounded-full bg-secondary/10 hover:bg-secondary/20 text-secondary font-medium text-[11px] border border-secondary/30 flex-shrink-0 transition-colors"
          >
            🎓 What is my USN & CGPA?
          </button>
          <button
            onClick={() => handleSendMessage('ನನ್ನ ಅಂಕಪಟ್ಟಿಯ ಪ್ರಕಾರ ನನ್ನ ಯುಎಸ್ಎನ್ ಮತ್ತು ಸಿಜಿಪಿಎ ಎಷ್ಟು?')}
            className="px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary-container font-medium text-[11px] border border-primary/30 flex-shrink-0 transition-colors"
          >
            🌟 ಕನ್ನಡ: ನನ್ನ ವಿವರಗಳೇನು?
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed transition-all ${
                  msg.sender === 'user'
                    ? 'bg-secondary text-on-secondary rounded-br-none shadow-md font-medium'
                    : 'bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-bl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-outline-variant/30 text-[10px] text-on-surface-variant flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-[13px] text-secondary">verified</span>
                    <span>Sources: {msg.sources.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[10px] text-on-surface-variant font-mono">{msg.timestamp}</span>
                {msg.sender === 'sara' && (
                  <button
                    onClick={() => handleSpeakAnswer(msg)}
                    className="text-secondary hover:text-secondary/80 flex items-center gap-1 text-[10px] font-medium"
                    title="Speak answer"
                  >
                    {speakingMessageId === msg.id ? (
                      <>
                        <div className="flex items-center gap-0.5 h-3">
                          <span className="w-0.5 h-2.5 bg-secondary rounded-full animate-wave-bar-1" />
                          <span className="w-0.5 h-3.5 bg-secondary rounded-full animate-wave-bar-2" />
                          <span className="w-0.5 h-2 bg-secondary rounded-full animate-wave-bar-3" />
                        </div>
                        <span className="material-symbols-outlined text-[14px]">stop_circle</span>
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">volume_up</span>
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/10 border border-secondary/20 text-xs text-secondary animate-pulse">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-secondary rounded-full animate-wave-bar-1" />
                <span className="w-1.5 h-6 bg-secondary rounded-full animate-wave-bar-2" />
                <span className="w-1.5 h-3 bg-secondary rounded-full animate-wave-bar-3" />
                <span className="w-1.5 h-5 bg-secondary rounded-full animate-wave-bar-4" />
              </div>
              <span className="font-medium">
                {selectedLanguage === 'kn'
                  ? 'SARA ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು Groq LLaMA 3.3 ಮೂಲಕ ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...'
                  : 'SARA is analyzing your uploaded documents with Groq AI...'}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 px-6 border-t border-outline-variant/30 bg-surface-container-lowest">
          <div className="flex items-center gap-2 bg-surface border border-outline-variant/60 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-secondary/50">
            <button
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-error text-white animate-pulse'
                  : 'bg-secondary/15 text-secondary hover:bg-secondary/25'
              }`}
              title="Speak your question"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isListening ? 'mic_off' : 'mic'}
              </span>
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                selectedLanguage === 'kn'
                  ? 'ನಿಮ್ಮ ಅಂಕಪಟ್ಟಿ ಅಥವಾ ಪ್ರೊಫೈಲ್ ಕುರಿತು ಪ್ರಶ್ನೆ ಕೇಳಿ...'
                  : 'Ask about your marks cards, USN, CGPA, or profile...'
              }
              className="flex-1 bg-transparent border-none outline-none text-xs text-on-surface placeholder:text-on-surface-variant/60 py-1.5"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="p-2 rounded-xl bg-secondary text-on-secondary hover:bg-secondary/90 disabled:opacity-40 transition-all flex items-center justify-center shadow-sm"
              title="Send question"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
