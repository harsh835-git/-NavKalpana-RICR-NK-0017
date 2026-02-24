import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/Sidebar';
import { useToast } from '../hooks/useToast';

const suggestedPrompts = [
  "Why am I not losing weight?",
  "Should I increase my protein intake?",
  "How many rest days do I need?",
  "Why am I feeling fatigued?",
  "How can I break through a plateau?",
  "Is my calorie target correct?"
];

const AICoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const messagesEndRef = useRef();
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    axios.get('/api/chat/history')
      .then(res => setMessages(res.data.messages || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat/message', { message: text });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch (err) {
      const isQuota = err.response?.status === 429;
      const errorMsg = isQuota
        ? 'API quota limit reached for today. Please try again tomorrow or add a new API key.'
        : (err.response?.data?.message || 'AI service error');
      showToast(errorMsg, 'error');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isQuota
          ? 'I\'m temporarily unavailable — the AI quota for today has been reached. Please try again tomorrow.'
          : 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {ToastComponent}
      <div className="aicoach-page">

        {/* Page header */}
        <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)', marginBottom: 0, flexShrink: 0 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 2 }}>AI Coach</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Your personal fitness intelligence</p>
        </div>

        {/* Messages — open, no box */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 0 120px' }}>
          {historyLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '64px 0 48px' }}>
                  <h2 style={{
                    fontSize: 38,
                    fontWeight: 800,
                    marginBottom: 16,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.2
                  }}>
                    Hi {user?.name?.split(' ')[0]}!<br />I'm your AI Coach
                  </h2>
                  <p style={{ color: 'var(--text2)', maxWidth: 440, margin: '0 auto 44px', fontSize: 15, lineHeight: 1.75 }}>
                    I have access to your progress data, habit scores, and fitness metrics. Ask me anything about your journey.
                  </p>

                  <p style={{ color: 'var(--text3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                    Suggested questions
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 580, margin: '0 auto' }}>
                    {suggestedPrompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(p)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: 24,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 500,
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          color: 'var(--text2)',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--accent)';
                          e.currentTarget.style.color = 'var(--accent)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.color = 'var(--text2)';
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className="fade-in" style={{
                  display: 'flex',
                  gap: 12,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  marginBottom: 24,
                  alignItems: 'flex-start',
                  maxWidth: 760,
                  margin: '0 auto 24px'
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: msg.role === 'assistant'
                      ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                      : 'var(--surface)',
                    border: msg.role === 'user' ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800,
                    color: msg.role === 'assistant' ? '#000' : 'var(--text)'
                  }}>
                    {msg.role === 'assistant' ? 'AI' : user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={{
                    maxWidth: 'min(75%, 560px)',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'rgba(0,232,122,0.08)'
                      : 'var(--surface)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(0,232,122,0.15)' : 'var(--border)'}`,
                    fontSize: 14, lineHeight: 1.75,
                    color: 'var(--text)'
                  }}>
                    {msg.role === 'assistant' ? (
                      <div className="md-message">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                    )}
                    {msg.timestamp && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                        {new Date(msg.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', maxWidth: 760, margin: '0 auto 24px' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#000', flexShrink: 0
                  }}>AI</div>
                  <div style={{
                    padding: '13px 18px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px 16px 16px 4px',
                    display: 'flex', gap: 6, alignItems: 'center'
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--accent)',
                        animation: 'pulse 1.2s infinite',
                        animationDelay: `${i * 0.2}s`
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Floating input bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 0 8px',
          background: 'linear-gradient(to top, var(--bg) 70%, transparent)',
        }}>
          <div style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            maxWidth: 760,
            margin: '0 auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: '8px 8px 8px 18px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
          }}>
            <input
              className="input-field"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                padding: 0,
                color: 'var(--text)',
                boxShadow: 'none'
              }}
              placeholder="Ask your AI coach anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              disabled={loading}
            />
            <button
              className="btn-primary"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                borderRadius: 12,
                width: 40,
                height: 40,
                fontSize: 17,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {loading ? <div className="spinner" /> : '→'}
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AICoach;
