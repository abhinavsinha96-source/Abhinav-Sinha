import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Zap,
  BrainCircuit,
  MapPin,
  RefreshCw,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { ChatMessage, ChatRolePreset, GeminiModelId, GroundedPlace } from '../types';
import { sendChatMessage, queryMapsGrounding } from '../services/aiService';

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIntoStory?: (text: string) => void;
}

const ROLE_PRESETS: ChatRolePreset[] = [
  {
    id: 'story_companion',
    name: 'Story Companion',
    description: 'Mindful writing mentor for evocative memoirs & sensory storytelling.',
    model: 'gemini-3.5-flash',
    systemInstruction: `You are Haven's Story Companion. You help users reflect on their memories, explore vivid sensory details (sounds, aromas, textures), and structure meaningful personal memoirs. Be empathetic, warm, evocative, and encouraging. Ask gentle open questions to draw out deeper emotions.`,
    avatarIcon: 'Sparkles',
    badge: 'General Companion'
  },
  {
    id: 'philosophical_thinker',
    name: 'Deep Life Reflection',
    description: 'Complex existential insights & personal philosophy exploration.',
    model: 'gemini-3.1-pro-preview',
    systemInstruction: `You are Haven's Deep Reflection Partner powered by gemini-3.1-pro-preview. You specialize in complex life themes: resilience, identity, grief, purpose, relationship transitions, and philosophical dilemmas. Provide thoughtful, multi-dimensional perspectives while honoring the user's authentic voice.`,
    avatarIcon: 'BrainCircuit',
    badge: 'Complex Reasoning'
  },
  {
    id: 'quick_scribe',
    name: 'Quick Story Scribe',
    description: 'Ultra-fast copy polish, title ideas & emotional tightening.',
    model: 'gemini-3.1-flash-lite',
    systemInstruction: `You are Haven's Quick Story Scribe powered by gemini-3.1-flash-lite. Deliver immediate, concise, polished draft improvements, catchy story titles, and punchy captions. Be direct, clear, and fast without unnecessary fluff.`,
    avatarIcon: 'Zap',
    badge: 'Ultra Fast'
  },
  {
    id: 'story_spots',
    name: 'Maps & Story Spots',
    description: 'Ground stories in real places, landmarks & meetup spots.',
    model: 'gemini-3.5-flash',
    systemInstruction: `You are Haven's Story Spot Explorer. Help users ground their stories and memoirs in real-world geographic places, historical landmarks, quiet cafes, and scenic viewpoints using Google Maps data. Always describe the atmosphere of the places and highlight why they make great settings.`,
    avatarIcon: 'MapPin',
    badge: 'Maps Grounded'
  }
];

export default function GeminiChatbotModal({ isOpen, onClose, onInsertIntoStory }: GeminiChatbotModalProps) {
  const [selectedRole, setSelectedRole] = useState<ChatRolePreset>(ROLE_PRESETS[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your Haven Story Companion. What personal memory or story idea are you exploring today? I can help you shape it, find the right sensory details, or reflect on its deeper meaning.",
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      if (selectedRole.id === 'story_spots') {
        // Use Maps Grounding
        const res = await queryMapsGrounding(userText);
        const botMessage: ChatMessage = {
          id: 'bot_' + Date.now(),
          role: 'model',
          text: res.text,
          groundedPlaces: res.places,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.5-flash'
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Multi-turn chat with conversation history
        const apiMessages = updatedHistory.map(m => ({
          role: m.role,
          text: m.text
        }));

        const reply = await sendChatMessage(
          apiMessages,
          selectedRole.systemInstruction,
          selectedRole.model
        );

        const botMessage: ChatMessage = {
          id: 'bot_' + Date.now(),
          role: 'model',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedRole.model
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'model',
        text: `Error: ${error.message || 'Failed to reach Haven AI. Please verify your connection.'}`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'reset_' + Date.now(),
        role: 'model',
        text: `Switched context to ${selectedRole.name}. How can I assist you with your stories?`,
        timestamp: 'Just now',
        modelUsed: selectedRole.model
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-3xl h-[90vh] max-h-[780px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-lg">
                  Haven Gemini Companion
                </h3>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {selectedRole.model}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Multi-turn creative confidant & story archiver
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              title="Clear conversation history"
              className="p-2 rounded-xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Presets Bar */}
        <div className="px-4 py-2.5 bg-stone-100/70 dark:bg-stone-950/60 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 shrink-0 mr-1">
            Persona:
          </span>
          {ROLE_PRESETS.map((preset) => {
            const isSelected = selectedRole.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedRole(preset);
                  setMessages(prev => [
                    ...prev,
                    {
                      id: 'switch_' + Date.now(),
                      role: 'model',
                      text: `Switched to **${preset.name}** (${preset.model}). ${preset.description}`,
                      timestamp: 'Just now',
                      modelUsed: preset.model
                    }
                  ]);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
                }`}
              >
                {preset.id === 'story_companion' && <Sparkles className="w-3.5 h-3.5" />}
                {preset.id === 'philosophical_thinker' && <BrainCircuit className="w-3.5 h-3.5" />}
                {preset.id === 'quick_scribe' && <Zap className="w-3.5 h-3.5" />}
                {preset.id === 'story_spots' && <MapPin className="w-3.5 h-3.5" />}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-amber-600/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[84%] sm:max-w-[76%] space-y-2`}>
                  <div
                    className={`p-4 rounded-3xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-amber-700 text-white rounded-br-none shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800/90 text-stone-800 dark:text-stone-100 rounded-bl-none border border-stone-200/70 dark:border-stone-700/60'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Maps Grounding Places Links if available */}
                    {msg.groundedPlaces && msg.groundedPlaces.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Google Maps Grounded Locations ({msg.groundedPlaces.length}):</span>
                        </div>
                        <div className="grid gap-2">
                          {msg.groundedPlaces.map((place, idx) => (
                            <a
                              key={idx}
                              href={place.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 flex items-center justify-between text-xs transition-colors group"
                            >
                              <div className="truncate mr-2">
                                <span className="font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                  {place.title}
                                </span>
                                {place.snippet && (
                                  <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                                    {place.snippet}
                                  </p>
                                )}
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Metadata & Quick Actions */}
                  <div className={`flex items-center gap-2 text-[11px] text-stone-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && !isUser && (
                      <span>• {msg.modelUsed}</span>
                    )}

                    {!isUser && (
                      <>
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="hover:text-stone-600 dark:hover:text-stone-200 flex items-center gap-1 ml-1"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        {onInsertIntoStory && (
                          <button
                            onClick={() => {
                              onInsertIntoStory(msg.text);
                              onClose();
                            }}
                            className="text-amber-600 dark:text-amber-400 hover:underline font-medium ml-1"
                          >
                            Insert into story
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0 mt-1">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-amber-600/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs flex items-center gap-2 border border-stone-200 dark:border-stone-700">
                <div className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                <span>Haven Companion is contemplating with {selectedRole.model}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${selectedRole.name}...`}
              className="flex-1 px-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-2xl bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-medium transition-all shrink-0 flex items-center justify-center shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
