import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Model from './Jersey';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ProfileAvatar from './ProfileAvatar';
import { useAuth } from '../context/AuthContext';

export default function CardTShirt({
  tshirt,
  showLike = false,
  onTshirtUpdate,
  variant = 'profile',
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dashboard = variant === 'dashboard';

  const [liked, setLiked] = useState(Boolean(tshirt.likedByCurrentUser));
  const [likes, setLikes] = useState(tshirt.likesCount ?? 0);
  const [busy, setBusy] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerBusy, setOfferBusy] = useState(false);
  const [myTshirts, setMyTshirts] = useState([]);
  const [barterIds, setBarterIds] = useState([]);

  const menuRef = useRef(null);

  useEffect(() => {
    setLiked(Boolean(tshirt.likedByCurrentUser));
    setLikes(tshirt.likesCount ?? 0);
  }, [tshirt.id, tshirt.likedByCurrentUser, tshirt.likesCount]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const owner = tshirt.owner;
  const isOwn =
    owner &&
    user &&
    (owner.id === user.id || owner.username === user.username);

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const { data } = await api.get(`/tshirts/${tshirt.id}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      toast.error('تعذر تحميل التعليقات');
    } finally {
      setLoadingComments(false);
    }
  }, [tshirt.id]);

  useEffect(() => {
    if (commentOpen) loadComments();
  }, [commentOpen, loadComments]);

  useEffect(() => {
    if (!offerOpen || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/tshirts/my');
        if (!cancelled) {
          setMyTshirts(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          toast.error('تعذر تحميل قمصانك لعرض المقايضة');
          setMyTshirts([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [offerOpen, user]);

  const toggleLike = async () => {
    if (!showLike || busy || !dashboard) return;
    setBusy(true);
    try {
      const { data } = liked
        ? await api.delete(`/tshirts/${tshirt.id}/like`)
        : await api.post(`/tshirts/${tshirt.id}/like`);
      const nextLiked = Boolean(data.likedByCurrentUser);
      const nextCount = data.likesCount ?? 0;
      setLiked(nextLiked);
      setLikes(nextCount);
      onTshirtUpdate?.({ ...tshirt, ...data, likedByCurrentUser: nextLiked, likesCount: nextCount });
    } catch (e) {
      const msg = e.response?.data;
      toast.error(typeof msg === 'string' ? msg : 'تعذر تحديث الإعجاب');
    } finally {
      setBusy(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tshirts/${tshirt.id}/comments`, { content: newComment.trim() });
      setNewComment('');
      await loadComments();
      toast.success('تم إضافة التعليق');
    } catch {
      toast.error('سجّل الدخول أو حاول مجدداً');
    }
  };

  const toggleBarter = (id) => {
    setBarterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    let cash = null;
    if (offerPrice.trim()) {
      const n = parseFloat(offerPrice.replace(',', '.'));
      if (Number.isNaN(n) || n < 0) {
        toast.error('سعر غير صالح');
        return;
      }
      if (n > 0) {
        cash = n;
      }
    }
    const hasCash = cash != null && cash > 0;
    const hasBarter = barterIds.length > 0;
    if (!hasCash && !hasBarter) {
      toast.error('أضف مبلغاً أو اختر قميصاً للمقايضة (أو الاثنين)');
      return;
    }

    const payload = {
      message: offerMessage.trim() || undefined,
    };
    if (hasCash) {
      payload.proposedPrice = cash;
    }
    if (hasBarter) {
      payload.barterTshirtIds = barterIds;
    }

    setOfferBusy(true);
    try {
      await toast.promise(api.post(`/tshirts/${tshirt.id}/offers`, payload), {
        loading: 'جاري إرسال العرض…',
        success: 'تم إرسال العرض — سيتم إشعار البائع',
        error: (err) =>
          typeof err.response?.data === 'string'
            ? err.response.data
            : 'تعذر إرسال العرض',
      });
      setOfferOpen(false);
      setOfferPrice('');
      setOfferMessage('');
      setBarterIds([]);
    } finally {
      setOfferBusy(false);
    }
  };

  const openPrivateChat = async () => {
    if (!owner?.id) {
      toast.error('لا يمكن تحديد صاحب القميص');
      return;
    }
    try {
      const { data } = await api.post('/conversations', { targetUserId: owner.id });
      const cid = data.conversationId;
      navigate(`/messages?c=${cid}`);
    } catch {
      toast.error('تعذر فتح المحادثة');
    }
    setMenuOpen(false);
  };

  const openOfferFromMenu = () => {
    setMenuOpen(false);
    setOfferOpen(true);
  };

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden bg-[#111] shadow-lg"
      style={{ width: 350, minHeight: 280 }}
    >
      <div className="relative flex-1 min-h-[240px]">
        <Model {...tshirt} />
      </div>

      {dashboard && owner && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-white/10 bg-black/40">
          <ProfileAvatar
            icon={owner.profileAvatarIcon}
            color={owner.profileAvatarColor}
            size={36}
            initial={owner.username}
            className="ring-1 ring-white/20"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{owner.username}</p>
            <p className="text-xs text-gray-400 truncate">صاحب التصميم</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-white/10">
        <div className="min-w-0 flex-1">
          {!dashboard && owner?.username && (
            <p className="text-xs text-gray-400 truncate mb-0.5">@{owner.username}</p>
          )}
          <p className="text-sm text-gray-300 truncate">
            {tshirt.name || tshirt.number || 'T-Shirt'}
            {likes > 0 && (
              <span className="text-gray-500 ml-1">· {likes} إعجاب</span>
            )}
          </p>
        </div>

        {dashboard && (
          <div className="flex items-center gap-1 shrink-0">
            {showLike && (
              <button
                type="button"
                onClick={toggleLike}
                disabled={busy}
                className={`rounded-full px-2.5 py-1.5 text-xs font-medium ${
                  liked
                    ? 'bg-rose-600 text-white'
                    : 'bg-white/10 text-gray-200 hover:bg-white/20'
                } disabled:opacity-50`}
              >
                {liked ? '♥' : '♡'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setCommentOpen(true)}
              className="rounded-full px-2.5 py-1.5 text-xs font-medium bg-white/10 text-gray-200 hover:bg-white/20"
            >
              تعليق
            </button>
            {!isOwn && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((o) => !o);
                  }}
                  className="rounded-full px-2.5 py-1.5 text-xs font-medium bg-white/10 text-gray-200 hover:bg-white/20"
                  aria-label="المزيد"
                >
                  ···
                </button>
                {menuOpen && (
                  <div className="absolute bottom-full right-0 mb-1 w-52 rounded-lg bg-gray-900 border border-white/10 shadow-xl z-20 py-1 text-right">
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-xs text-gray-100 hover:bg-white/10"
                      onClick={openOfferFromMenu}
                    >
                      تقديم عرض شراء أولي
                    </button>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-xs text-gray-100 hover:bg-white/10"
                      onClick={openPrivateChat}
                    >
                      التواصل في الخاص
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {commentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">التعليقات</h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-800"
                onClick={() => setCommentOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingComments ? (
                <p className="text-sm text-gray-500">جاري التحميل…</p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500">لا توجد تعليقات بعد.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <ProfileAvatar
                        icon={c.author?.profileAvatarIcon}
                        color={c.author?.profileAvatarColor}
                        size={28}
                        initial={c.author?.username}
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {c.author?.username}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={submitComment} className="p-4 border-t flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="اكتب تعليقاً…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                إرسال
              </button>
            </form>
          </div>
        </div>
      )}

      {offerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl text-right">
            <h3 className="font-semibold text-gray-900 mb-2">عرض شراء أو مقايضة</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              يجب تحديد مبلغ على المحفظة، أو قميص واحد أو أكثر من ملكك للمقايضة، أو الجمع بينهما.
            </p>
            <form onSubmit={submitOffer} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  المبلغ من المحفظة (اختياري)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="مثال: 99.50 د.م."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  مقايضة بقمائصك (اختياري)
                </label>
                <div className="border rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-100 bg-gray-50">
                  {myTshirts.filter((t) => t.id !== tshirt.id).length === 0 ? (
                    <p className="text-xs text-gray-500 p-3">لا توجد قمصان أخرى في حسابك للمقايضة.</p>
                  ) : (
                    myTshirts
                      .filter((t) => t.id !== tshirt.id)
                      .map((t) => (
                        <label
                          key={t.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-white"
                        >
                          <input
                            type="checkbox"
                            checked={barterIds.includes(t.id)}
                            onChange={() => toggleBarter(t.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="truncate">
                            #{t.id}
                            {(t.name || t.number) && (
                              <span className="text-gray-600">
                                {' '}
                                · {t.name || t.number}
                              </span>
                            )}
                          </span>
                        </label>
                      ))
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">رسالة (اختياري)</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="ملاحظات للبائع…"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-gray-600"
                  onClick={() => {
                    setOfferOpen(false);
                    setBarterIds([]);
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={offerBusy}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  إرسال العرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
