import React, { useState, useRef, useEffect } from "react";

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi 👋 I'm your AI Career Advisor. I can help you with career roadmap, resume, skills, and job guidance."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // ── ORIGINAL LOGIC UNTOUCHED ──────────────────────────────────────────────

  const suggestedQuestions = [
    "Give me a roadmap to become a Full Stack Developer",
    "What skills should I learn for AI/ML?",
    "How can I improve my resume for tech jobs?",
    "Suggest career options based on my skills"
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: messageToSend }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend })
      });
      const data = await res.json();
      console.log("AI RESPONSE:", data);
      setMessages(prev => [...prev, {
        role: "ai",
        text: data.reply || data.response || data.message || "No response from AI"
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "ai", text: "AI Assistant is not responding right now." }]);
    } finally {
      setLoading(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        .ai-fab {
          position:fixed; bottom:24px; right:24px; z-index:9999;
          width:56px; height:56px; border-radius:16px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#63ebda,#2dd4bf);
          display:flex; align-items:center; justify-content:center; font-size:22px;
          box-shadow:0 8px 28px rgba(99,235,218,0.4);
          transition:all 0.3s ease;
          animation:glowPulse 3s ease-in-out infinite;
        }
        .ai-fab:hover { transform:scale(1.1); box-shadow:0 12px 36px rgba(99,235,218,0.55); }
        @keyframes glowPulse {
          0%,100%{box-shadow:0 8px 28px rgba(99,235,218,0.4);}
          50%{box-shadow:0 8px 40px rgba(99,235,218,0.65),0 0 60px rgba(99,235,218,0.15);}
        }
        .ai-panel {
          position:fixed; bottom:92px; right:24px; z-index:9999;
          width:360px; border-radius:24px; overflow:hidden;
          background:#0d1117;
          border:1px solid rgba(99,235,218,0.2);
          box-shadow:0 24px 80px rgba(0,0,0,0.6),0 0 40px rgba(99,235,218,0.08);
          display:flex; flex-direction:column;
          font-family:'DM Sans',sans-serif;
          animation:slideUp 0.25s ease both;
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .ai-header {
          display:flex; align-items:center; gap:12px; padding:16px 18px;
          background:linear-gradient(135deg,rgba(99,235,218,0.08) 0%,transparent 100%);
          border-bottom:1px solid rgba(255,255,255,0.05);
        }
        .ai-avatar {
          width:36px; height:36px; border-radius:11px;
          background:linear-gradient(135deg,#63ebda,#2dd4bf);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; flex-shrink:0;
          box-shadow:0 0 16px rgba(99,235,218,0.3);
        }
        .ai-header-info { flex:1; }
        .ai-header-name { font-family:'Syne',sans-serif; font-weight:700; font-size:14px; color:#fff; }
        .ai-header-status { display:flex; align-items:center; gap:5px; }
        .ai-status-dot { width:6px; height:6px; border-radius:50%; background:#34d399; animation:pulse 2s infinite; }
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .ai-status-text { font-size:11px; color:#34d399; }
        .ai-close { background:none; border:none; cursor:pointer; color:#484f58; padding:4px; border-radius:6px; transition:color 0.2s; }
        .ai-close:hover { color:#fff; }
        .ai-messages { height:280px; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
        .ai-messages::-webkit-scrollbar { width:3px; }
        .ai-messages::-webkit-scrollbar-track { background:transparent; }
        .ai-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:999px; }
        .ai-msg { display:flex; }
        .ai-msg.user { justify-content:flex-end; }
        .ai-msg.ai { justify-content:flex-start; }
        .ai-bubble {
          max-width:82%; padding:10px 14px; border-radius:16px;
          font-size:13px; line-height:1.55;
        }
        .ai-bubble.user {
          background:#63ebda; color:#080c10; font-weight:500;
          border-bottom-right-radius:4px;
        }
        .ai-bubble.ai {
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          color:#f0f6fc; border-bottom-left-radius:4px;
        }
        .ai-typing { display:flex; align-items:center; gap:4px; padding:10px 14px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); border-radius:16px; border-bottom-left-radius:4px; width:fit-content; }
        .ai-dot { width:6px; height:6px; border-radius:50%; background:#63ebda; animation:bounce 1.2s ease-in-out infinite; }
        .ai-dot:nth-child(2){animation-delay:0.2s}
        .ai-dot:nth-child(3){animation-delay:0.4s}
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        .ai-suggestions { padding:0 16px 10px; display:flex; flex-wrap:wrap; gap:6px; }
        .ai-suggestion-label { width:100%; font-size:11px; color:#484f58; margin-bottom:2px; }
        .ai-suggestion-btn {
          padding:6px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.03); color:#8b949e; font-size:11px;
          cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif;
          text-align:left;
        }
        .ai-suggestion-btn:hover { border-color:rgba(99,235,218,0.3); color:#63ebda; background:rgba(99,235,218,0.05); }
        .ai-input-row {
          display:flex; align-items:center; gap:8px; padding:12px 14px;
          border-top:1px solid rgba(255,255,255,0.05);
          background:rgba(255,255,255,0.01);
        }
        .ai-input-wrap {
          flex:1; display:flex; align-items:center;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; padding:0 12px; gap:8px;
          transition:border-color 0.2s;
        }
        .ai-input-wrap:focus-within { border-color:rgba(99,235,218,0.4); }
        .ai-input {
          flex:1; background:transparent; border:none; outline:none;
          padding:10px 0; font-size:13px; color:#f0f6fc;
          font-family:'DM Sans',sans-serif;
        }
        .ai-input::placeholder { color:#484f58; }
        .ai-send {
          width:30px; height:30px; border-radius:9px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#63ebda,#2dd4bf);
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0; transition:all 0.2s;
        }
        .ai-send:hover:not(:disabled) { transform:scale(1.08); box-shadow:0 4px 14px rgba(99,235,218,0.35); }
        .ai-send:disabled { opacity:0.35; cursor:not-allowed; }
      `}</style>

      {/* Chat Panel */}
      {isOpen && (
        <div className="ai-panel">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-avatar">🤖</div>
            <div className="ai-header-info">
              <div className="ai-header-name">AI Career Advisor</div>
              <div className="ai-header-status">
                <div className="ai-status-dot"/>
                <span className="ai-status-text">Online</span>
              </div>
            </div>
            <button className="ai-close" onClick={() => setIsOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-msg ${msg.role}`}>
                <div className={`ai-bubble ${msg.role}`}>{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg ai">
                <div className="ai-typing">
                  <div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="ai-suggestions">
              <span className="ai-suggestion-label">Try asking:</span>
              {suggestedQuestions.map((q, i) => (
                <button key={i} className="ai-suggestion-btn" onClick={() => sendMessage(q)}>
                  💬 {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ai-input-row">
            <div className="ai-input-wrap">
              <input
                className="ai-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about career, skills, roadmap..."
              />
            </div>
            <button className="ai-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 6.5H12M7 1.5L12 6.5L7 11.5" stroke="#080c10" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="ai-fab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen
          ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2L14 14M14 2L2 14" stroke="#080c10" strokeWidth="2" strokeLinecap="round"/></svg>
          : '🤖'
        }
      </button>
    </>
  );
};

export default AIAssistant;