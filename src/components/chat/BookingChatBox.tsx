'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ChatMessage } from '@/types/notifications';

interface BookingChatBoxProps {
  bookingId: string;
  currentUserId: string;
  counterpartName: string;
  counterpartRole?: string;
  serviceTitle?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function BookingChatBox({
  bookingId,
  currentUserId,
  counterpartName,
  counterpartRole = 'Mentor',
  serviceTitle = 'Session Chat',
  isOpen = true,
  onClose,
}: BookingChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch message history
  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/v1/bookings/${bookingId}/messages?limit=50`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load messages');
        }
        const data = await res.json();
        if (isMounted) {
          setMessages(data.messages || []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err: any) {
        if (isMounted) setErrorMsg(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (bookingId) {
      loadHistory();
    }

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  // 2. Realtime WebSocket subscription
  useEffect(() => {
    if (!bookingId) return;

    const supabase = createClient();
    const channelName = `booking-chat-${bookingId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          // Avoid duplicate insertion if optimistically added
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(scrollToBottom, 50);

          // If the message came from counterpart, mark it read
          if (newMsg.sender_id !== currentUserId) {
            supabase
              .from('messages')
              .update({ is_read: true, read_at: new Date().toISOString() })
              .eq('id', newMsg.id)
              .then();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setWsStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setWsStatus('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 3. Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputText.trim();
    if (!content || isSending) return;

    if (content.length > 2000) {
      setErrorMsg('Message cannot exceed 2,000 characters.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      booking_id: bookingId,
      sender_id: currentUserId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch(`/api/v1/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send message');
      }

      const data = await res.json();
      // Replace optimistic message with actual persisted message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? data.message : m))
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message');
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-[520px] max-h-[80vh] w-full max-w-[500px] bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-surface-container border-b border-surface-container-high shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
              {counterpartName ? counterpartName[0].toUpperCase() : 'M'}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${
                wsStatus === 'connected' ? 'bg-emerald-500' : wsStatus === 'connecting' ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              title={`Realtime Status: ${wsStatus}`}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-title-md text-title-md font-bold text-on-surface leading-tight">
                {counterpartName}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold uppercase">
                {counterpartRole}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-tertiary truncate max-w-[220px]">
              {serviceTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-tertiary'
              }`}
            />
            <span className="uppercase text-[10px] font-bold">
              {wsStatus === 'connected' ? 'LIVE' : wsStatus}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
              title="Close chat"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="flex items-center justify-between px-4 py-2 bg-error-container text-on-error-container text-body-sm font-body-sm shrink-0">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="hover:underline font-bold text-xs ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Message History Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-tertiary">
            <span className="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
            <span className="text-body-sm font-body-sm">Loading encrypted chat history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-6 text-on-surface-variant">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-1">
              <span className="material-symbols-outlined text-[26px]">chat</span>
            </div>
            <p className="font-title-md text-title-md font-semibold text-on-surface">No messages yet</p>
            <p className="font-body-sm text-body-sm text-tertiary max-w-[260px]">
              Direct session channel open. Send a message to coordinate your agenda, files, or questions.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const timeStr = new Date(msg.created_at).toLocaleTimeString('en-IN', {
              timeZone: 'Asia/Kolkata',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-body-md shadow-sm break-words whitespace-pre-wrap ${
                    isMe
                      ? 'bg-primary text-on-primary rounded-tr-xs'
                      : 'bg-surface-container-lowest text-on-surface border border-surface-container rounded-tl-xs'
                  }`}
                >
                  {msg.content}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 font-label-sm text-label-sm text-tertiary">
                  <span>{timeStr}</span>
                  {isMe && (
                    <span className="material-symbols-outlined text-[13px] text-tertiary">
                      {msg.is_read ? 'done_all' : 'done'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-surface-container-lowest border-t border-surface-container shrink-0 flex flex-col gap-2"
      >
        <div className="relative flex items-end gap-2 bg-surface-container-low rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${counterpartName}... (Enter to send)`}
            rows={2}
            maxLength={2000}
            className="w-full bg-transparent resize-none border-none focus:outline-none p-2 font-body-sm text-body-sm text-on-surface placeholder:text-outline max-h-28"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className={`p-2.5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
              inputText.trim() && !isSending
                ? 'bg-primary text-on-primary hover:bg-primary-container shadow-sm cursor-pointer'
                : 'bg-surface-container text-outline cursor-not-allowed'
            }`}
            title="Send Message"
          >
            {isSending ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">send</span>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between px-1 text-[11px] text-tertiary font-label-sm">
          <span>End-to-end encrypted participant channel</span>
          <span>{inputText.length} / 2,000</span>
        </div>
      </form>
    </div>
  );
}
