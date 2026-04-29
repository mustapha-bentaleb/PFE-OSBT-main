import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ProfileAvatar from '../components/ProfileAvatar';
import { useAuth } from '../context/AuthContext';

const backendOrigin =
  typeof api.defaults.baseURL === 'string'
    ? api.defaults.baseURL.replace(/\/api\/?$/i, '')
    : '';

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
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);

  const imgInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordChunksRef = useRef([]);
  const lastMessagesRef = useRef([]);

  const emojis = ['😀','😂','😍','🥳','😎','😢','😡','👍','🙏','🔥','❤️','✨'];

  const mediaUrl = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const base = backendOrigin || 'http://localhost:8080';
    return `${base}${path}`;
  };

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') mr.stop();
  }, []);

  useEffect(() => {
    return () => {
      const s = mediaStreamRef.current;
      if (s) s.getTracks().forEach(t => t.stop());
    };
  }, []);

  const loadInbox = useCallback(async () => {
    try {
      const { data } = await api.get('/conversations');
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur conversations');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadMessages = useCallback(async (id) => {
    setLoadingMsg(true);
    try {
      const { data } = await api.get(`/conversations/${id}/messages`);
      const msgs = Array.isArray(data) ? data : [];
      setMessages(msgs);
      lastMessagesRef.current = msgs;
    } catch {
      toast.error('Erreur messages');
    } finally {
      setLoadingMsg(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    setSearchParams({ c: String(activeId) }, { replace: true });
  }, [activeId]);

  // SMART POLLING (optimized)
  useEffect(() => {
    if (!activeId) return;

    let stop = false;

    const loop = async () => {
      if (stop || document.hidden) return;

      try {
        const { data } = await api.get(`/conversations/${activeId}/messages`);
        const msgs = Array.isArray(data) ? data : [];

        const lastOld = lastMessagesRef.current.at(-1)?.id;
        const lastNew = msgs.at(-1)?.id;

        if (lastOld !== lastNew) {
          lastMessagesRef.current = msgs;
          setMessages(msgs);
        }
      } catch {}

      setTimeout(loop, 4000);
    };

    loop();

    return () => {
      stop = true;
    };
  }, [activeId]);

  const uploadMultipart = async (file, type, caption) => {
    if (!activeId || !file) return;
    setUploading(true);

    try {
      const fd = new FormData();
      if (caption?.trim()) fd.append('body', caption.trim());
      fd.append('type', type);
      fd.append('file', file);

      const { data } = await api.post(`/conversations/${activeId}/messages`, fd);

      setMessages(prev => {
        const updated = [...prev, data];
        lastMessagesRef.current = updated;
        return updated;
      });

      setBody('');
      setEmojiOpen(false);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setRecording(false);
    }
  };

  const handleImagePick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || uploading) return;
    await uploadMultipart(f, 'IMAGE', body);
  };

  const toggleRecording = async () => {
    if (recording) return stopRecording();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mr = new MediaRecorder(stream);
      recordChunksRef.current = [];

      mr.ondataavailable = e => {
        if (e.data?.size) recordChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(recordChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'voice.webm', { type: 'audio/webm' });

        stream.getTracks().forEach(t => t.stop());
        await uploadMultipart(file, 'AUDIO', body);
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      toast.error('Mic error');
    }
  };

  const sendText = async (e) => {
    e.preventDefault();
    if (!activeId || uploading) return;

    const text = body.trim();
    if (!text) return;

    try {
      const { data } = await api.post(`/conversations/${activeId}/messages`, { body: text });

      setMessages(prev => {
        const updated = [...prev, data];
        lastMessagesRef.current = updated;
        return updated;
      });

      setBody('');
      setEmojiOpen(false);
    } catch {
      toast.error('Send failed');
    }
  };

  const active = conversations.find(c => c.conversationId === activeId);

  return (
    <div className="max-w-6xl mx-auto flex min-h-[70vh] bg-white rounded-xl shadow overflow-hidden">

      {/* LEFT */}
      <aside className="w-80 border-r flex flex-col">
        <div className="p-4 font-semibold">Messages</div>

        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <p className="p-4">Loading...</p>
          ) : (
            conversations.map(c => (
              <button
                key={c.conversationId}
                onClick={() => setActiveId(c.conversationId)}
                className={`w-full flex gap-3 p-3 hover:bg-gray-50 ${c.conversationId === activeId ? 'bg-blue-50' : ''}`}
              >
                <ProfileAvatar
                  icon={c.otherUser?.profileAvatarIcon}
                  color={c.otherUser?.profileAvatarColor}
                  size={40}
                  initial={c.otherUser?.username}
                />
                <div>
                  <p>{c.otherUser?.username}</p>
                  <p className="text-xs text-gray-500 truncate">{c.lastMessagePreview}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* CHAT */}
      <section className="flex-1 flex flex-col">

        {!activeId ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select conversation
          </div>
        ) : (
          <>

            <div className="p-4 border-b flex gap-3 items-center">
              <ProfileAvatar
                icon={active?.otherUser?.profileAvatarIcon}
                color={active?.otherUser?.profileAvatarColor}
                size={44}
                initial={active?.otherUser?.username}
              />
              <span>{active?.otherUser?.username}</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2">
              {loadingMsg ? (
                <p>Loading...</p>
              ) : (
                messages.map(m => {
                  const mine = m.sender?.username === user?.username;

                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-3 py-2 rounded max-w-[80%] ${mine ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                        {m.body && <p>{m.body}</p>}
                        {m.attachmentType === 'IMAGE' && <img src={mediaUrl(m.attachmentUrl)} />}
                        {m.attachmentType === 'AUDIO' && <audio controls src={mediaUrl(m.attachmentUrl)} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* INPUT (ALL BUTTONS RESTORED) */}
            <form onSubmit={sendText} className="p-3 border-t space-y-2">

              {emojiOpen && (
                <div className="flex gap-2 flex-wrap">
                  {emojis.map(e => (
                    <button key={e} type="button" onClick={() => setBody(p => p + e)}>
                      {e}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-center">

                <button type="button" onClick={() => setEmojiOpen(v => !v)}>🙂</button>

                <button type="button" onClick={() => imgInputRef.current?.click()}>🖼️</button>

                <button type="button" onClick={toggleRecording}>
                  {recording ? '⏹️' : '🎙️'}
                </button>

                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImagePick}
                />

                <input
                  className="flex-1 border px-3 py-2 rounded"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                />

                <button type="submit">Send</button>
              </div>

            </form>

          </>
        )}

      </section>
    </div>
  );
};

export default Messages;