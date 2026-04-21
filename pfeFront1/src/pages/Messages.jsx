import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ProfileAvatar from '../components/ProfileAvatar';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(() => {
    const c = searchParams.get('c');
    return c ? Number(c) : null;
  });
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const loadInbox = useCallback(async () => {
    try {
      const { data } = await api.get('/conversations');
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      toast.error('تعذر تحميل المحادثات');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const loadMessages = useCallback(async (id) => {
    if (!id) return;
    setLoadingMsg(true);
    try {
      const { data } = await api.get(`/conversations/${id}/messages`);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      toast.error('تعذر تحميل الرسائل');
    } finally {
      setLoadingMsg(false);
    }
  }, []);

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
      setSearchParams({ c: String(activeId) }, { replace: true });
    }
  }, [activeId, loadMessages, setSearchParams]);

  const selectConversation = (id) => {
    setActiveId(id);
  };

  const send = async (e) => {
    e.preventDefault();
    if (!activeId || !body.trim()) return;
    try {
      const { data } = await api.post(`/conversations/${activeId}/messages`, {
        body: body.trim(),
      });
      setMessages((prev) => [...prev, data]);
      setBody('');
      loadInbox();
    } catch {
      toast.error('فشل الإرسال');
    }
  };

  const active = conversations.find((c) => c.conversationId === activeId);

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 min-h-[70vh] bg-white rounded-xl shadow overflow-hidden">
      <aside className="w-full md:w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b font-semibold text-gray-800">الرسائل الخاصة</div>
        <div className="overflow-y-auto flex-1 max-h-[70vh]">
          {loadingList ? (
            <p className="p-4 text-gray-500 text-sm">جاري التحميل…</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-gray-500 text-sm">لا توجد محادثات بعد.</p>
          ) : (
            conversations.map((row) => {
              const o = row.otherUser;
              const sel = row.conversationId === activeId;
              return (
                <button
                  key={row.conversationId}
                  type="button"
                  onClick={() => selectConversation(row.conversationId)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 ${
                    sel ? 'bg-blue-50' : ''
                  }`}
                >
                  <ProfileAvatar
                    icon={o?.profileAvatarIcon}
                    color={o?.profileAvatarColor}
                    size={40}
                    initial={o?.username}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{o?.username}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {row.lastMessagePreview || '—'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-h-[400px]">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            اختر محادثة
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <ProfileAvatar
                icon={active?.otherUser?.profileAvatarIcon}
                color={active?.otherUser?.profileAvatarColor}
                size={44}
                initial={active?.otherUser?.username}
              />
              <span className="font-semibold">{active?.otherUser?.username}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 min-h-[280px]">
              {loadingMsg ? (
                <p className="text-sm text-gray-500">جاري التحميل…</p>
              ) : (
                messages.map((m) => {
                  const mine = user?.username && m.sender?.username === user.username;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow border ${
                          mine
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-white text-gray-800 border-gray-200'
                        }`}
                      >
                        {!mine && (
                          <p className="text-xs opacity-80 mb-1">{m.sender?.username}</p>
                        )}
                        <p className="whitespace-pre-wrap">{m.body}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={send} className="p-3 border-t flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="اكتب رسالة…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                إرسال
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};

export default Messages;
