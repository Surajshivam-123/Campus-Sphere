import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft, FaPaperPlane, FaTrash, FaChevronDown,
  FaCrown,
} from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import socket from "../../config/socket";
import API_URL from "../../config/api";
import fetchWithAuth from "../../config/fetchWithAuth";

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 7 }) {
  const initials = (user?.fullname || user?.username || "?").charAt(0).toUpperCase();
  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={initials}
      className={`w-${size} h-${size} rounded-full object-cover shrink-0`}
    />
  ) : (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0`}
      style={{ backgroundColor: "var(--color-navy)" }}
    >
      {initials}
    </div>
  );
}

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg, currentUserId, isCaptain, onDelete }) {
  const isOwn = msg.sender?._id === currentUserId;
  const [hover, setHover] = useState(false);

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex gap-2.5 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isOwn && <Avatar user={msg.sender} size={7} />}

      <div className={`flex flex-col max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <span
            className="text-xs font-medium mb-0.5 px-1 flex items-center gap-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {msg.sender?.fullname || msg.sender?.username}
            {/* Show crown only if the sender IS the captain */}
            {msg.sender?._id && isCaptain && msg.sender._id === currentUserId && (
              <FaCrown size={9} style={{ color: "#b8860b" }} title="Captain" />
            )}
          </span>
        )}

        <div className="flex items-end gap-1.5">
          {isOwn && hover && !msg.deleted && (
            <button
              onClick={() => onDelete(msg._id)}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity mb-1"
              style={{ color: "var(--color-error)" }}
              title="Delete message"
            >
              <FaTrash size={10} />
            </button>
          )}

          <div
            className="px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
            style={
              msg.deleted
                ? {
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-muted)",
                    border: "1px solid var(--color-border)",
                    fontStyle: "italic",
                  }
                : isOwn
                ? {
                    backgroundColor: "#b8860b",
                    color: "#fff",
                    borderBottomRightRadius: "4px",
                  }
                : {
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                    border: "1px solid var(--color-border)",
                    borderBottomLeftRadius: "4px",
                  }
            }
          >
            {msg.text}
          </div>

          {/* Moderator delete on other's message */}
          {!isOwn && isCaptain && hover && !msg.deleted && (
            <button
              onClick={() => onDelete(msg._id)}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity mb-1"
              style={{ color: "var(--color-error)" }}
              title="Delete message"
            >
              <FaTrash size={10} />
            </button>
          )}
        </div>

        <span className="text-xs mt-0.5 px-1" style={{ color: "var(--color-text-muted)" }}>
          {time}
        </span>
      </div>
    </div>
  );
}

// ── Date separator ────────────────────────────────────────────────────────────
function DateSeparator({ date }) {
  const label = (() => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
  })();

  return (
    <div className="flex items-center gap-3 my-3">
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
      <span className="text-xs px-2" style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-border)" }} />
    </div>
  );
}

// ── Main TeamChat ─────────────────────────────────────────────────────────────
export default function TeamChat() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [teamName, setTeamName] = useState("");
  const [isCaptain, setIsCaptain] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [captainOnly, setCaptainOnly] = useState(false);
  const [text, setText] = useState("");
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const bottomRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // ── Load initial message history ─────────────────────────────────────────
  const loadHistory = useCallback(
    async (page = 1) => {
      const url = `${API_URL}/api/cpsh/team-messages/${teamId}?page=${page}&limit=50`;
      const res = await fetchWithAuth(url);
      const data = await res.json();

      if (res.status === 403) {
        setAccessDenied(true);
        setLoadingHistory(false);
        return null;
      }
      if (!data) {
        setLoadingHistory(false);
        return null;
      }
      return data;
    },
    [teamId]
  );

  useEffect(() => {
    setLoadingHistory(true);
    loadHistory(1).then((data) => {
      if (!data) return;
      setMessages(data.messages || []);
      setHasMore(data.totalPages > 1);
      setTeamName(data.teamName || "Team Chat");
      setIsCaptain(!!data.isCaptain);
      setLoadingHistory(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 50);
    });
  }, [loadHistory]);

  // ── Load older messages ──────────────────────────────────────────────────
  const loadMore = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    const currentPage = Math.ceil(messages.length / 50) + 1;
    const data = await loadHistory(currentPage);
    if (data?.messages) {
      setMessages((prev) => [...data.messages.reverse(), ...prev]);
      setHasMore(data.totalPages > currentPage);
    }
    setLoadingMore(false);
  };

  // ── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    if (!socket.connected) socket.connect();

    socket.emit("join:user", user._id);
    socket.emit("join:team:chat", { teamId, userId: user._id });

    socket.off("team:chat:message");
    socket.off("team:chat:deleted");
    socket.off("team:chat:error");

    const onMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (listRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollHeight - scrollTop - clientHeight < 120) {
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
        }
      }
    };

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, deleted: true, text: "This message was deleted." } : m
        )
      );
    };

    const onError = ({ message: errMsg }) => {
      if (errMsg?.toLowerCase().includes("captain")) setCaptainOnly(true);
      console.error("[team chat error]", errMsg);
    };

    socket.on("team:chat:message", onMessage);
    socket.on("team:chat:deleted", onDeleted);
    socket.on("team:chat:error", onError);

    return () => {
      socket.emit("leave:team:chat", teamId);
      socket.off("team:chat:message", onMessage);
      socket.off("team:chat:deleted", onDeleted);
      socket.off("team:chat:error", onError);
    };
  }, [user, teamId]);

  // ── Scroll button visibility ─────────────────────────────────────────────
  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
  };

  // ── Send message (all team members) ────────────────────────────────────────
  const sendMessage = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    setText("");

    socket.emit("team:chat:send", {
      teamId,
      text: trimmed,
      senderId: user._id,
      senderName: user.fullname || user.username,
      senderAvatar: user.avatar || null,
      tempId,
    });

    inputRef.current?.focus();
  };

  // ── Delete message ───────────────────────────────────────────────────────
  const handleDelete = (messageId) => {
    socket.emit("team:chat:delete", {
      teamId,
      messageId,
      requesterId: user._id,
    });
  };

  // ── Group messages by date ───────────────────────────────────────────────
  const grouped = (() => {
    const result = [];
    let lastDate = null;
    for (const msg of messages) {
      const d = new Date(msg.createdAt).toDateString();
      if (d !== lastDate) {
        result.push({ type: "separator", date: msg.createdAt, key: `sep-${msg.createdAt}` });
        lastDate = d;
      }
      result.push({ type: "message", msg, key: msg._id });
    }
    return result;
  })();

  // ── Render ───────────────────────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--color-error)" }}>
          You must be a member of this team to access this chat.
        </p>
        <button onClick={() => navigate(-1)} className="btn-secondary px-4 py-2 text-sm">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100dvh - 6rem)", backgroundColor: "var(--color-bg)" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Go back"
        >
          <FaArrowLeft size={14} />
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: "#b8860b" }}
        >
          <FaCrown size={13} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold truncate" style={{ color: "#b8860b" }}>
            {teamName}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
            Team chat
          </p>
        </div>

        {isCaptain ? (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0"
            style={{ backgroundColor: "#fdf6e3", color: "#b8860b", borderColor: "#b8860b40" }}
          >
            <FaCrown size={9} /> Captain
          </span>
        ) : (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text-muted)",
              borderColor: "var(--color-border)",
            }}
          >
            Member
          </span>
        )}
      </div>

      {/* no banner needed — all members can send */}

      {/* ── Message list ── */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        onScroll={handleScroll}
        style={{ overscrollBehavior: "contain" }}
      >
        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-xs font-medium underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              {loadingMore ? "Loading…" : "Load older messages"}
            </button>
          </div>
        )}

        {loadingHistory ? (
          <p className="text-sm text-center py-12" style={{ color: "var(--color-text-muted)" }}>
            Loading messages…
          </p>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <FaCrown size={28} style={{ color: "#b8860b60" }} />
            <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
              No messages yet
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Be the first to say something!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map((item) =>
              item.type === "separator" ? (
                <DateSeparator key={item.key} date={item.date} />
              ) : (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <MessageBubble
                    msg={item.msg}
                    currentUserId={user?._id}
                    isCaptain={isCaptain}
                    onDelete={handleDelete}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="absolute bottom-20 right-5 w-9 h-9 rounded-full shadow-lg flex items-center justify-center"
            style={{ backgroundColor: "#b8860b", color: "#fff" }}
            aria-label="Scroll to bottom"
          >
            <FaChevronDown size={13} />
          </motion.button>
        )}
      </AnimatePresence>

      <div
        className="shrink-0 px-4 py-3 border-t"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <form onSubmit={sendMessage} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Message your team… (Enter to send)"
            rows={1}
            className="input-base flex-1 resize-none py-2.5 text-sm"
            style={{ minHeight: "42px", maxHeight: "120px", overflowY: "auto" }}
          />
          <motion.button
            type="submit"
            disabled={!text.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "#b8860b", color: "#fff" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Send message"
          >
            <FaPaperPlane size={14} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
