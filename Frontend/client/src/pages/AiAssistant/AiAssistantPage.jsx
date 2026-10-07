import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  Send,
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
  Trophy,
  Calendar,
  Users,
  Code2,
  Lock,
  ArrowRight,
  Flame,
} from "lucide-react";
import aiService from "../../services/ai.service";
import { useAuth } from "../../hooks/useAuth";

const STORAGE_KEY = "campus_sphere_ai_chat";

export default function AiAssistantPage() {
  const { user, isAuthenticated } = useAuth();

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
  const textareaRef = useRef(null);

  // Sync with sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Load initial suggestions and user stats
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setError(null);
    setInput("");

    const userMsg = {
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
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
      console.error("[AiAssistantPage] Chat error:", err);
      setError(err.message || "Failed to generate AI response. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
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

  const quickCategories = [
    {
      title: "Events & Codes",
      icon: Calendar,
      questions: [
        "What is the difference between participant code and member code?",
        "Where do I find my hosted event invite codes?",
        "How do I join an event using a participant code?",
      ],
    },
    {
      title: "Cricket Platform",
      icon: Trophy,
      questions: [
        "How does ball-by-ball live scoring work in cricket matches?",
        "How can an organizer assign a member as the scorer updater?",
        "What are my cricket tournament player stats?",
      ],
    },
    {
      title: "Coding Contests",
      icon: Code2,
      questions: [
        "How do coding contests work with Judge0 remote execution?",
        "What is the difference between binary and partial scoring?",
        "Show my recent coding contest submissions and scores.",
      ],
    },
    {
      title: "Campus Clubs",
      icon: Users,
      questions: [
        "How do I create and manage a campus club?",
        "How do club join requests and club chat work?",
        "Which clubs do I currently belong to?",
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-base pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-navy">
                  Campus Sphere AI Assistant
                </h1>
                <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                  RAG Assistant
                </span>
              </div>
              <p className="text-sm text-secondary">
                Your intelligent guide for campus events, live cricket scoring, coding contests, clubs, and personalized activity stats.
              </p>
            </div>
          </div>
        </div>

        {/* Clear Conversation & Privacy badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 border border-base text-xs text-secondary">
            <Lock size={14} className="text-emerald-500" />
            <span>Strict User Privacy Isolation</span>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-base text-xs text-secondary hover:text-amber-500 hover:border-gold transition-colors"
            >
              <RotateCcw size={14} />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Sidebar + Chat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Category Shortcuts (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-5">
          {/* User Status Card */}
          <div className="card p-5 bg-surface border-base rounded-2xl shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold">
                {user?.fullname ? user.fullname[0].toUpperCase() : <Bot size={20} />}
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm text-navy">
                  {isAuthenticated && user ? user.fullname : "Guest Explorer"}
                </h3>
                <p className="text-xs text-muted">
                  {isAuthenticated && user ? `@${user.username}` : "Unauthenticated Session"}
                </p>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="mt-3 pt-3 border-t border-base space-y-2">
                <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  Your Activity Snapshot
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-base">
                    <span className="text-muted block text-[11px]">Participated</span>
                    <strong className="text-sm text-navy">{userStats?.participatedCount ?? "—"}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-base">
                    <span className="text-muted block text-[11px]">Hosted Events</span>
                    <strong className="text-sm text-navy">{userStats?.organizedCount ?? "—"}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-base">
                    <span className="text-muted block text-[11px]">Clubs Joined</span>
                    <strong className="text-sm text-navy">{userStats?.clubsCount ?? "—"}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2 border border-base">
                    <span className="text-muted block text-[11px]">Teams Owned</span>
                    <strong className="text-sm text-navy">{userStats?.teamsCount ?? "—"}</strong>
                  </div>
                </div>
                <button
                  onClick={() => handleSend("Give me a comprehensive summary of my registered events, hosted events, and cricket stats")}
                  className="w-full mt-2 py-2 px-3 text-xs rounded-xl bg-navy/5 hover:bg-navy/10 text-navy font-medium transition-colors text-center"
                >
                  Ask for My Account Summary 📊
                </button>
              </div>
            ) : (
              <div className="mt-2 text-xs text-secondary leading-relaxed">
                Log in to Campus Sphere to unlock personalized queries about your registered events, team codes, cricket performance, and coding submissions.
              </div>
            )}
          </div>

          {/* Quick Categories & Prompt Starters */}
          <div className="card p-5 bg-surface border-base rounded-2xl shadow-xs space-y-4">
            <h3 className="font-heading font-semibold text-sm text-navy flex items-center gap-1.5">
              <Flame size={16} className="text-gold" />
              <span>Explore Platform Guides</span>
            </h3>

            <div className="space-y-3">
              {quickCategories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                      <Icon size={14} className="text-navy" />
                      <span>{cat.title}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {cat.questions.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => handleSend(q)}
                          className="text-left text-xs p-2 rounded-lg bg-surface-2 hover:bg-page text-secondary hover:text-navy hover:border-gold border border-transparent transition-all truncate"
                          title={q}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Window (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col h-[750px] max-h-[85vh] card bg-surface border-base rounded-2xl shadow-sm overflow-hidden">
          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-page">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 max-w-lg mx-auto">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-500 mb-4 border border-amber-400/30">
                  <Sparkles size={36} />
                </div>
                <h3 className="font-heading font-bold text-xl text-navy mb-2">
                  How can I help you today?
                </h3>
                <p className="text-xs sm:text-sm text-secondary leading-relaxed mb-6">
                  Campus Sphere AI combines platform documentation with strictly isolated account access to provide real-time guidance, tournament rules, and activity reviews.
                </p>

                {/* Initial suggestion chips */}
                {suggestions.length > 0 && (
                  <div className="w-full space-y-2">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wider text-left">
                      Suggested Questions:
                    </p>
                    <div className="flex flex-col gap-2">
                      {suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sug)}
                          className="w-full p-3 rounded-xl bg-surface border border-base hover:border-gold text-xs sm:text-sm text-navy hover:bg-surface-2 transition-all text-left flex items-center justify-between group shadow-2xs"
                        >
                          <span>{sug}</span>
                          <ArrowRight
                            size={16}
                            className="text-gold opacity-0 group-hover:opacity-100 transition-opacity"
                          />
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
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-muted">
                      {isUser ? (
                        <>
                          <span>You</span>
                          <User size={12} />
                        </>
                      ) : (
                        <>
                          <Bot size={14} className="text-gold" />
                          <span className="font-medium text-navy">Campus Sphere AI</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] p-4 rounded-2xl shadow-xs leading-relaxed text-sm ${
                        isUser
                          ? "bg-navy text-white rounded-br-none"
                          : "bg-surface border border-base text-primary rounded-bl-none"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div>
                          <ReactMarkdown
                            components={{
                              p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                              h1: ({ ...props }) => <h1 className="text-base font-bold text-navy mb-2" {...props} />,
                              h2: ({ ...props }) => <h2 className="text-sm font-bold text-navy mb-2" {...props} />,
                              h3: ({ ...props }) => <h3 className="text-xs font-bold text-navy mb-1" {...props} />,
                              ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                              ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                              li: ({ ...props }) => <li className="text-xs sm:text-sm leading-relaxed" {...props} />,
                              strong: ({ ...props }) => <strong className="font-semibold text-navy" {...props} />,
                              code: ({ ...props }) => (
                                <code
                                  className="px-1.5 py-0.5 rounded text-xs font-mono bg-surface-2 text-amber-600 dark:text-amber-400 border border-base"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>

                          {/* Knowledge references pill drawer */}
                          {msg.references && msg.references.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-base">
                              <button
                                onClick={() => toggleRefs(idx)}
                                className="flex items-center gap-1.5 text-xs text-secondary hover:text-gold transition-colors font-medium"
                              >
                                <HelpCircle size={14} />
                                <span>{msg.references.length} Knowledge Sources Referenced</span>
                                {expandedRefs[idx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                              {expandedRefs[idx] && (
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                  {msg.references.map((ref, rIdx) => (
                                    <span
                                      key={rIdx}
                                      className="text-xs px-2.5 py-1 rounded-md bg-surface-2 border border-base text-secondary font-medium"
                                    >
                                      📄 {ref.title} ({ref.category})
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Copy button */}
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => handleCopy(msg.content, idx)}
                              className="text-xs flex items-center gap-1 text-muted hover:text-gold transition-colors"
                              title="Copy response"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check size={14} className="text-emerald-500" />
                                  <span className="text-emerald-500 font-medium">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
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
                <div className="flex items-center gap-1 px-1 text-xs text-muted">
                  <Bot size={14} className="text-gold" />
                  <span>Campus Sphere AI</span>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-base shadow-xs flex items-center gap-3 text-xs sm:text-sm text-secondary">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-gold animate-bounce"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-navy animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Consulting knowledge base & generating response...</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Generation Failed</p>
                  <p className="text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Follow-up suggestions */}
          {messages.length > 0 && suggestions.length > 0 && !loading && (
            <div className="px-4 py-2 bg-surface-2 border-t border-base overflow-x-auto flex gap-2 whitespace-nowrap">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug)}
                  className="text-xs px-3 py-1.5 rounded-full bg-surface border border-base text-secondary hover:text-navy hover:border-gold transition-colors shrink-0"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-surface border-t border-base">
            <div className="relative flex items-center">
              <textarea
                ref={textareaRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question about Campus Sphere (events, cricket, coding, clubs)..."
                disabled={loading}
                className="w-full resize-none py-3 pl-4 pr-12 rounded-xl bg-page border border-base text-xs sm:text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-primary disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="absolute right-3 p-2.5 rounded-xl bg-navy text-white hover:bg-gold transition-colors disabled:opacity-30 disabled:pointer-events-none"
                title="Send message"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted px-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-500" />
                Strict User Privacy Mandate: Only you can view your private account data
              </span>
              <span className="hidden sm:inline">Press Enter ↵ to send • Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
