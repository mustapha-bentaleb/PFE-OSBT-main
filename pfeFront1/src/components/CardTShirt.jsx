import { useState, useEffect } from 'react';
import Model from './Jersey';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CardTShirt({ tshirt, showLike = false, onTshirtUpdate }) {
  const [liked, setLiked] = useState(Boolean(tshirt.likedByCurrentUser));
  const [likes, setLikes] = useState(tshirt.likesCount ?? 0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(Boolean(tshirt.likedByCurrentUser));
    setLikes(tshirt.likesCount ?? 0);
  }, [tshirt.id, tshirt.likedByCurrentUser, tshirt.likesCount]);

  const toggleLike = async () => {
    if (!showLike || busy) return;
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
      toast.error(typeof msg === 'string' ? msg : 'Could not update like');
    } finally {
      setBusy(false);
    }
  };

  const ownerLabel = tshirt.owner?.username ? `@${tshirt.owner.username}` : '';

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden bg-[#111] shadow-lg"
      style={{ width: 350, minHeight: 350 }}
    >
      <div className="relative flex-1 min-h-[280px]">
        <Model {...tshirt} />
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-white/10">
        <div className="min-w-0">
          {ownerLabel && (
            <p className="text-xs text-gray-400 truncate">{ownerLabel}</p>
          )}
          <p className="text-sm text-gray-300 truncate">
            {tshirt.name || tshirt.number || 'T-Shirt'}
            {likes > 0 && (
              <span className="text-gray-500 ml-1">· {likes} likes</span>
            )}
          </p>
        </div>

        {showLike ? (
          <button
            type="button"
            onClick={toggleLike}
            disabled={busy}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              liked
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-white/10 text-gray-200 hover:bg-white/20'
            } disabled:opacity-50`}
          >
            {liked ? '♥ Liked' : '♡ Like'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
