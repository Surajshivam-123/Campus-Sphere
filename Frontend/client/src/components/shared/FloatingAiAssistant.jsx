import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  X,
  Maximize2,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import aiService from "../../services/ai.service";
import { useAuth } from "../../hooks/useAuth";

const STORAGE_KEY = "campus_sphere_ai_chat";

export default function FloatingAiAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedRefs, setExpandedRefs] = useState({});
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore storage errors
    }
  }, [messages]);

  // Load suggestions on open or mount
  useEffect(() => {
    let isMounted = true;
    aiService
      .getSuggestions()
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (data?.suggestions) {
          setSuggestions(data.suggestions);
        }
      })
      .catch(() => {});

    if (isAuthenticated) {
      aiService
        .getMySummary()
        .then((res) => {
          if (!isMounted) return;
          const data = res?.data || res;
          if (data?.stats) {
            setUserStats(data.stats);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // focus input when opened
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setError(null);
    setInput("");

    // Add user message to stream
    const userMsg = {
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      // Build conversation history format for API
      const apiHistory = newHistory.slice(-8).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));

      const res = await aiService.chat(query, apiHistory.slice(0, -1));
      const payload = res?.data || res;

      const aiMsg = {
        role: "assistant",
        content: payload.answer || "No response received.",
        references: payload.references || [],
        timestamp: new Date().toISOString(),
      };

      if (payload.suggestions?.length) {
        setSuggestions(payload.suggestions);
      }
      if (payload.userStats) {
        setUserStats(payload.userStats);
      }

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("[FloatingAiAssistant] Chat error:", err);
      setError(err.message || "Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleRefs = (idx) => {
    setExpandedRefs((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // If already on the full assistant page, hide floating widget to prevent redundancy
  if (location.pathname === "/assistant") {
    return null;
  }

  return (
    <>
      {/* Floating launcher trigger (bottom-left) */}
      <div className="fixed bottom-6 left-6 z-[9990]">
        <motion.button
          id="btn-campus-sphere-ai"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative group flex items-center gap-2.5 px-4 py-3.5 rounded-full shadow-2xl text-white font-medium text-sm transition-all border border-white/20"
          style={{
            background: "linear-gradient(135deg, #0a2540 0%, #1e3a8a 50%, #f59e0b 100%)",
          }}
          title="Campus Sphere AI Assistant"
          aria-label="Toggle Campus Sphere AI Assistant"
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
            </span>
          </div>
          <span className="hidden sm:inline font-semibold tracking-wide">
            Campus Sphere AI
          </span>
        </motion.button>
      </div>

      {/* Floating Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-20 left-4 sm:left-6 z-[9995] w-[calc(100vw-2rem)] sm:w-[440px] h-[580px] max-h-[82vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-base bg-surface text-primary backdrop-blur-lg"
          >
            {/* Header */}
            <div
              className="px-4 py-3.5 flex items-center justify-between border-b border-white/10 text-white"
              style={{
                background: "linear-gradient(135deg, #0a2540 0%, #132f54 100%)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-400/20 border border-amber-300/30 text-amber-300">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-sm tracking-wide">
                      Campus Sphere AI
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    {isAuthenticated && user
                      ? `Personalized for @${user.username}`
                      : "Public Guest Guide"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Maximize to full assistant page */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/assistant");
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Open Full Page Assistant"
                  aria-label="Open Full Page Assistant"
                >
                  <Maximize2 size={16} />
                </button>

                {/* Clear chat */}
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-white/10 transition-colors"
                    title="Clear Conversation"
                    aria-label="Clear Conversation"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close Assistant"
                  aria-label="Close Assistant"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Authenticated user mini stats bar */}
            {isAuthenticated && userStats && (
              <div className="px-4 py-2 bg-surface-2 border-b border-base flex items-center justify-between text-xs text-secondary overflow-x-auto whitespace-nowrap gap-3">
                <span className="flex items-center gap-1 font-medium">
                  🏆 Participated: <strong className="text-navy">{userStats.participatedCount || 0}</strong>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  📅 Hosted: <strong className="text-navy">{userStats.organizedCount || 0}</strong>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  👥 Clubs: <strong className="text-navy">{userStats.clubsCount || 0}</strong>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  ⚔️ Teams: <strong className="text-navy">{userStats.teamsCount || 0}</strong>
                </span>
              </div>
            )}

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-page">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center p-4">
                  <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-300/30 text-amber-500 mb-3 shadow-inner">
                    <Bot size={28} />
                  </div>
                  <h4 className="font-heading font-bold text-base text-navy mb-1">
                    Welcome to Campus Sphere AI!
                  </h4>
                  <p className="text-xs text-secondary max-w-xs mb-5 leading-relaxed">
                    Ask anything about event codes, cricket scoring, coding contests, clubs, or your account activities.
                  </p>

                  {/* Suggestion prompt chips */}
                  {suggestions.length > 0 && (
                    <div className="w-full space-y-2">
                      <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                        Suggested Inquiries:
                      </p>
                      <div className="flex flex-col gap-1.5 text-left">
                        {suggestions.slice(0, 3).map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(sug)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-surface hover:bg-surface-2 border border-base text-navy hover:border-gold transition-all text-left flex items-center justify-between group shadow-xs"
                          >
                            <span className="truncate">{sug}</span>
                            <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-muted">
                        {isUser ? (
                          <>
                            <span>You</span>
                            <User size={12} />
                          </>
                        ) : (
                          <>
                            <Bot size={12} className="text-gold" />
                            <span className="font-medium text-navy">Campus Sphere AI</span>
                          </>
                        )}
                      </div>

                      <div
                        className={`max-w-[88%] p-3.5 rounded-2xl shadow-xs leading-relaxed ${
                          isUser
                            ? "bg-navy text-white rounded-br-none"
                            : "bg-surface border border-base text-primary rounded-bl-none"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown
                              components={{
                                p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({ ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                li: ({ ...props }) => <li className="text-xs leading-relaxed" {...props} />,
                                strong: ({ ...props }) => <strong className="font-semibold text-navy" {...props} />,
                                code: ({ ...props }) => (
                                  <code
                                    className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-surface-2 text-amber-600 dark:text-amber-400 border border-base"
                                    {...props}
                                  />
                                ),
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>

                            {/* Source References Pill Dropdown */}
                            {msg.references && msg.references.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-base">
                                <button
                                  onClick={() => toggleRefs(idx)}
                                  className="flex items-center gap-1 text-[11px] text-secondary hover:text-gold transition-colors font-medium"
                                >
                                  <HelpCircle size={12} />
                                  <span>
                                    {msg.references.length} Knowledge Sources Referenced
                                  </span>
                                  {expandedRefs[idx] ? (
                                    <ChevronUp size={12} />
                                  ) : (
                                    <ChevronDown size={12} />
                                  )}
                                </button>
                                {expandedRefs[idx] && (
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {msg.references.map((ref, rIdx) => (
                                      <span
                                        key={rIdx}
                                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface-2 border border-base text-secondary font-medium"
                                      >
                                        📄 {ref.title}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Copy button */}
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => handleCopy(msg.content, idx)}
                                className="text-[11px] flex items-center gap-1 text-muted hover:text-gold transition-colors"
                                title="Copy response"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check size={12} className="text-emerald-500" />
                                    <span className="text-emerald-500">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Thinking loader */}
              {loading && (
                <div className="flex flex-col items-start space-y-1">
                  <div className="flex items-center gap-1 px-1 text-[11px] text-muted">
                    <Bot size={12} className="text-gold" />
                    <span>Campus Sphere AI</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-surface border border-base shadow-xs flex items-center gap-2 text-xs text-secondary">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-gold animate-bounce"></span>
                      <span className="h-2 w-2 rounded-full bg-navy animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span>Consulting knowledge base & verifying context...</span>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Request Failed</p>
                    <p className="text-[11px]">{error}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions below messages if conversation has started */}
            {messages.length > 0 && suggestions.length > 0 && !loading && (
              <div className="px-3 py-1.5 bg-surface-2 border-t border-base overflow-x-auto flex gap-1.5 no-scrollbar whitespace-nowrap">
                {suggestions.slice(0, 3).map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-surface border border-base text-secondary hover:text-navy hover:border-gold transition-colors shrink-0"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-surface border-t border-base">
              <div className="relative flex items-center">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about events, cricket, coding, or clubs..."
                  disabled={loading}
                  className="w-full resize-none py-2.5 pl-3 pr-10 rounded-xl bg-page border border-base text-xs focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-primary disabled:opacity-50"
                  style={{ maxHeight: "90px" }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2 rounded-lg bg-navy text-white hover:bg-gold transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-muted px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={10} className="text-emerald-500" />
                  Strict User Privacy Guardrails
                </span>
                <span>Enter ↵ to send</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
