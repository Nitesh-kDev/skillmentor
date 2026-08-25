import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, AlertCircle, Wifi, Lock } from 'lucide-react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { api } from '../services/api';

export default function LiveChatModal({ isOpen, onClose, session, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [connectionState, setConnectionState] = useState('connecting'); // 'live' | 'connecting' | 'offline'
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  const stompClientRef = useRef(null);
  const chatBottomRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const currentUserId = currentUser?.id || currentUser?.userId;

  useEffect(() => {
    if (isOpen && session) {
      setError('');
      loadHistory();
      connectWebSocket();

      // Active 3-second polling fallback to guarantee real-time sync across both users
      pollIntervalRef.current = setInterval(() => {
        loadHistory();
      }, 3000);
    }

    return () => {
      disconnectWebSocket();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isOpen, session]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    if (!session) return;
    try {
      const history = await api.getChatHistory(session.id);
      if (history && Array.isArray(history)) {
        setMessages(history);
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('authorized')) {
        setError('You are not authorized to view chat logs for this session.');
      }
    }
  };

  const connectWebSocket = () => {
    setConnectionState('connecting');
    try {
      const wsHost = window.location.hostname || 'localhost';
      const socket = new SockJS(`http://${wsHost}:8080/ws`);
      const stompClient = Stomp.over(socket);
      stompClient.debug = null; // Suppress debug logs

      stompClient.connect(
        {},
        () => {
          setConnectionState('live');
          stompClientRef.current = stompClient;

          // Subscribe to real-time session channel
          stompClient.subscribe(`/topic/session/${session.id}`, (msg) => {
            if (msg && msg.body) {
              try {
                const newMsg = JSON.parse(msg.body);
                setMessages((prev) => {
                  if (prev.some((m) => m.id === newMsg.id && newMsg.id != null)) return prev;
                  return [...prev, newMsg];
                });
              } catch (e) {
                loadHistory();
              }
            }
          });
        },
        (error) => {
          setConnectionState('offline');
        }
      );
    } catch (err) {
      setConnectionState('offline');
    }
  };

  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      try {
        stompClientRef.current.disconnect();
      } catch (e) {}
      stompClientRef.current = null;
    }
    setConnectionState('offline');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputMsg.trim();
    if (!text || !currentUser || !session) return;

    if (text.length > 2000) {
      setError('Message exceeds 2000 character limit.');
      return;
    }

    const resolvedUserId = currentUser.id || currentUser.userId;
    if (!resolvedUserId) {
      setError('User session expired. Please re-login.');
      return;
    }

    setInputMsg('');
    setSending(true);
    setError('');

    const chatDto = {
      sessionId: session.id,
      senderId: resolvedUserId,
      senderName: currentUser.name || 'User',
      content: text
    };

    // Optimistic local render for instant UI responsiveness
    const tempId = Date.now();
    const tempMsg = { ...chatDto, id: tempId, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const savedMsg = await api.sendChatMessage(chatDto);
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        if (withoutTemp.some((m) => m.id === savedMsg.id)) return withoutTemp;
        return [...withoutTemp, savedMsg];
      });
    } catch (err) {
      setError(err.message || 'Failed to send chat message');
      loadHistory();
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !session) return null;

  // Participant Name & Dynamic Role Resolution (PHASE 2 & PHASE 10 & PHASE 15)
  const studentName = session.studentName || 'Student';
  const mentorName = session.mentorName || 'Mentor';
  const mentorRoleLabel = session.mentorRole === 'MENTOR' ? 'Mentor' : (session.mentorRole === 'ALUMNI' ? 'Alumni' : 'Student');

  const isSessionDisabled = session.status === 'CANCELLED' || session.status === 'REJECTED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px]">
        
        {/* Chat Room Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                  {session.title || `Session #${session.id}`}
                </h3>
                
                {/* User-Friendly Status Indicator (PHASE 10) */}
                {connectionState === 'live' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Live</span>
                  </span>
                )}
                {connectionState === 'connecting' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Connecting...</span>
                  </span>
                )}
                {connectionState === 'offline' && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>Offline</span>
                  </span>
                )}
              </div>

              {/* Exact Participant Roles Display (PHASE 2 & 10 & 15) */}
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Session #{session.id} • <strong className="text-slate-800">{studentName} • Student</strong> & <strong className="text-slate-800">{mentorName} • {mentorRoleLabel}</strong>
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Disabled Session Notification Banner */}
        {error && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {isSessionDisabled && (
          <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 text-slate-700 text-xs flex items-center gap-2 font-bold">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Live Chat is disabled for {session.status.toLowerCase()} sessions.</span>
          </div>
        )}

        {/* Chat Messages Log Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-extrabold text-slate-600">No messages yet in this session room.</p>
              <p className="text-[11px] text-slate-400 mt-1">Type your message below to start real-time chat!</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = currentUser && (
                (currentUserId != null && m.senderId === currentUserId) ||
                (m.senderName && m.senderName === currentUser.name)
              );

              return (
                <div key={m.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">{m.senderName}</span>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none font-medium'
                  }`}>
                    {m.content}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Message Input Footer */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            disabled={isSessionDisabled}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={isSessionDisabled ? 'Chat unavailable' : 'Type a real-time message...'}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim() || sending || isSessionDisabled}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>

      </div>
    </div>
  );
}
