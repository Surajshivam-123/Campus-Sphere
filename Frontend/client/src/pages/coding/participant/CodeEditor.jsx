import API_URL from "../../../config/api";
import { useState, useEffect } from "react";
import { FaPlay, FaCheckCircle, FaTimesCircle, FaSpinner, FaClock } from "react-icons/fa";
import fetchWithAuth from "../../../config/fetchWithAuth";

const LANGUAGE_LABELS = {
  cpp: "C++", c: "C", python: "Python 3", java: "Java", javascript: "JavaScript",
};

const BOILERPLATE = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // your code here
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    // your code here
    return 0;
}`,
  python: `import sys
input = sys.stdin.readline

def main():
    # your code here
    pass

main()`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // your code here
    }
}`,
  javascript: `const lines = require('fs').readFileSync('/dev/stdin','utf8').split('\\n');
// your code here
`,
};

const STATUS_META = {
  accepted:              { label: "Accepted",            color: "var(--color-success)", icon: FaCheckCircle },
  wrong_answer:          { label: "Wrong Answer",        color: "var(--color-error)",   icon: FaTimesCircle },
  time_limit_exceeded:   { label: "Time Limit Exceeded", color: "var(--color-warning)", icon: FaClock },
  memory_limit_exceeded: { label: "Memory Limit",        color: "var(--color-warning)", icon: FaClock },
  runtime_error:         { label: "Runtime Error",       color: "var(--color-error)",   icon: FaTimesCircle },
  compilation_error:     { label: "Compilation Error",   color: "var(--color-error)",   icon: FaTimesCircle },
  running:               { label: "Judging…",            color: "var(--color-text-muted)", icon: FaSpinner },
  pending:               { label: "Pending",             color: "var(--color-text-muted)", icon: FaSpinner },
};

export default function CodeEditor({ problem, eventId, contest, mySubmissions, onSubmitSuccess, disabled }) {
  const [language, setLanguage] = useState(contest?.allowedLanguages?.[0] || "cpp");
  const [code, setCode] = useState(BOILERPLATE[language] || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    setCode(BOILERPLATE[language] || "");
  }, [language]);

  // Poll until judging completes
  useEffect(() => {
    if (!pendingId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/cpsh/coding/submissions/${pendingId}`);
        const data = await res.json();
        if (data?.data && !["pending", "running"].includes(data.data.status)) {
          onSubmitSuccess(data.data);
          setPendingId(null);
          setSubmitting(false);
          clearInterval(interval);
        }
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [pendingId]);

  const handleSubmit = async () => {
    if (!code.trim()) return setError("Write some code first.");
    setError(""); setSubmitting(true);
    try {
      const res = await fetchWithAuth(
        `${API_URL}/api/cpsh/coding/submissions/event/${eventId}/problem/${problem._id}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language }) }
      );
      const data = await res.json();
      if (data?.success) {
        setPendingId(data.data.submissionId);
        setActiveTab("submissions");
      } else {
        setError(data?.message || "Submission failed.");
        setSubmitting(false);
      }
    } catch {
      setError("Error submitting code.");
      setSubmitting(false);
    }
  };

  const allowedLangs = contest?.allowedLanguages || Object.keys(LANGUAGE_LABELS);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-3 py-2 border-b shrink-0"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {["editor", "submissions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 rounded text-xs font-medium capitalize transition"
            style={activeTab === tab
              ? { backgroundColor: "var(--color-navy)", color: "#fff" }
              : { color: "var(--color-text-muted)" }}
          >
            {tab}
            {tab === "submissions" && mySubmissions.length > 0 && (
              <span className="ml-1.5 opacity-70">({mySubmissions.length})</span>
            )}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs px-2 py-1.5 rounded border"
            style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            {allowedLangs.map((l) => <option key={l} value={l}>{LANGUAGE_LABELS[l] || l}</option>)}
          </select>

          {!disabled && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition disabled:opacity-60"
              style={{ backgroundColor: "var(--color-success)" }}
            >
              {submitting ? <FaSpinner className="animate-spin" size={10} /> : <FaPlay size={10} />}
              {submitting ? "Judging…" : "Submit"}
            </button>
          )}
        </div>
      </div>

      {/* Editor — kept mounted so code isn't lost when switching tabs */}
      <div className={`flex-1 flex-col overflow-hidden ${activeTab === "editor" ? "flex" : "hidden"}`}>
        {error && (
          <div className="px-3 py-2 text-xs" style={{ color: "var(--color-error)", backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)" }}>
            {error}
          </div>
        )}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none"
          style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-primary)", lineHeight: 1.6, tabSize: 2 }}
          placeholder="Write your solution here…"
        />
      </div>

      {/* Submissions panel */}
      <div
        className={`flex-1 overflow-y-auto p-3 ${activeTab === "submissions" ? "block" : "hidden"}`}
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        {mySubmissions.length === 0 ? (
          <p className="text-sm text-center py-12" style={{ color: "var(--color-text-muted)" }}>No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {mySubmissions.map((sub, i) => {
              const meta = STATUS_META[sub.status] || STATUS_META.pending;
              const Icon = meta.icon;
              const isRunning = ["pending", "running"].includes(sub.status);
              return (
                <div key={sub._id || i} className="rounded-lg px-4 py-3 border"
                  style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={13} className={isRunning ? "animate-spin" : ""} style={{ color: meta.color }} />
                      <span className="text-sm font-medium" style={{ color: meta.color }}>{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {sub.score > 0 && <span className="font-semibold" style={{ color: "var(--color-gold)" }}>+{sub.score} pts</span>}
                      {!isRunning && <span>{sub.passedCount}/{sub.totalCount} tests</span>}
                      <span>{LANGUAGE_LABELS[sub.language] || sub.language}</span>
                    </div>
                  </div>

                  {!isRunning && sub.testResults?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sub.testResults.map((tc, j) => (
                        <span key={j} className="w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold"
                          title={`Test ${j + 1}: ${tc.status}`}
                          style={{
                            backgroundColor: tc.status === "accepted"
                              ? "color-mix(in srgb, var(--color-success) 20%, transparent)"
                              : "color-mix(in srgb, var(--color-error) 20%, transparent)",
                            color: tc.status === "accepted" ? "var(--color-success)" : "var(--color-error)",
                          }}>
                          {tc.status === "accepted" ? "✓" : "✗"}
                        </span>
                      ))}
                    </div>
                  )}

                  {sub.errorMessage && (
                    <pre className="mt-2 text-xs p-2 rounded overflow-x-auto"
                      style={{ backgroundColor: "color-mix(in srgb, var(--color-error) 8%, transparent)", color: "var(--color-error)" }}>
                      {sub.errorMessage.slice(0, 300)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
