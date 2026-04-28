import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const statusLabel = (s) => {
  const m = {
    PENDING: 'قيد الانتظار',
    SELLER_COUNTERED: 'عرض بائع — قرارك',
    ACCEPTED: 'مقبول',
    REJECTED: 'مرفوض',
    WITHDRAWN: 'ملغى',
  };
  return m[s] || s;
};

const Offers = () => {
  const { updateUser } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterPrice, setCounterPrice] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        api.get('/offers/incoming'),
        api.get('/offers/outgoing'),
      ]);
      setIncoming(inc.data || []);
      setOutgoing(out.data || []);
      try {
        const { data } = await api.get('/wallet/balance');
        if (data?.balance != null) {
          updateUser({ balance: data.balance });
        }
      } catch {
        /* ignore */
      }
    } catch {
      toast.error('تعذر تحميل العروض');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    load();
  }, [load]);

  const parseApiError = (e) => {
    if (!e.response) {
      if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') {
        return 'تعذر الاتصال بالخادم. تأكد أن الخادم يعمل (مثلاً المنفذ 8080).';
      }
      return typeof e.message === 'string' ? e.message : null;
    }
    const data = e.response.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string') return data.message;
      if (typeof data.error === 'string') return data.error;
      if (typeof data.detail === 'string') return data.detail;
    }
    return null;
  };

  const act = async (path, { successMsg, loadingMsg = 'جاري التنفيذ…' }) => {
    await toast.promise(
      (async () => {
        await api.post(path);
        await load();
      })(),
      {
        loading: loadingMsg,
        success: successMsg,
        error: (e) => parseApiError(e) || 'فشلت العملية',
      }
    );
  };

  const submitCounter = async (offerId) => {
    const raw = counterPrice[offerId];
    if (!raw || String(raw).trim() === '') {
      toast.error('أدخل السعر المضاد');
      return;
    }
    const n = parseFloat(String(raw).replace(',', '.'));
    if (Number.isNaN(n) || n <= 0) {
      toast.error('سعر غير صالح');
      return;
    }
    await toast.promise(
      (async () => {
        await api.post(
          `/offers/${offerId}/counter-price`,
          { amount: n },
          { headers: { 'Content-Type': 'application/json' } }
        );
        setCounterPrice((p) => ({ ...p, [offerId]: '' }));
        await load();
      })(),
      {
        loading: 'جاري إرسال السعر للمشتري…',
        success: 'تم إرسال السعر الأعلى للمشتري',
        error: (e) => parseApiError(e) || 'فشل إرسال السعر المضاد',
      }
    );
  };

  const fmtBarter = (o) => {
    const labels = o.barterTshirtSummaries;
    if (Array.isArray(labels) && labels.length > 0) {
      return labels.join('، ');
    }
    const ids = o.barterTshirtIds;
    if (Array.isArray(ids) && ids.length > 0) {
      return ids.map((id) => `#${id}`).join('، ');
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-600">جاري التحميل…</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">عروض الشراء</h1>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">واردة (أنا البائع)</h2>
        {incoming.length === 0 ? (
          <p className="text-gray-500 text-sm">لا توجد عروض واردة.</p>
        ) : (
          <ul className="space-y-3">
            {incoming.map((o) => {
              const barterLine = fmtBarter(o);
              return (
              <li
                key={o.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span>
                    قميص #{o.tshirtId} {o.tshirtName || o.tshirtNumber || ''}
                  </span>
                  <span className="text-gray-500">{statusLabel(o.status)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  المشتري: <strong>{o.buyer?.username}</strong>
                </p>
                <p className="text-sm mt-1">
                  المبلغ المقترح:{' '}
                  <strong>
                    {o.proposedPrice != null && Number(o.proposedPrice) > 0
                      ? `${o.proposedPrice} د.م.`
                      : 'بدون مبلغ'}
                  </strong>
                </p>
                {barterLine && (
                  <p className="text-sm text-emerald-800 mt-1">
                    مقايضة (قمائص يعرضها المشتري):{' '}
                    <strong>{barterLine}</strong>
                  </p>
                )}
                {o.sellerCounterPrice != null && (
                  <p className="text-sm text-blue-700 mt-1">
                    سعرك المقترح للمشتري: <strong>{o.sellerCounterPrice} د.م.</strong>
                  </p>
                )}

                {o.status === 'PENDING' && (
                  <div className="mt-3 flex flex-wrap gap-2 items-end">
                    <button
                      type="button"
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm"
                      onClick={() =>
                        act(`/offers/${o.id}/seller-accept`, {
                          successMsg: 'تم قبول العرض — اكتملت التحويلات (القميص والمقايضة إن وُجدت)',
                          loadingMsg: 'جاري قبول العرض وإتمام البيع…',
                        })
                      }
                    >
                      قبول عرض المشتري
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 px-3 py-1.5 rounded text-sm"
                      onClick={() =>
                        act(`/offers/${o.id}/seller-reject`, {
                          successMsg: 'تم رفض العرض',
                          loadingMsg: 'جاري رفض العرض…',
                        })
                      }
                    >
                      رفض
                    </button>
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        placeholder="سعر أعلى للمشتري"
                        className="border rounded px-2 py-1 text-sm w-36"
                        value={counterPrice[o.id] ?? ''}
                        onChange={(e) =>
                          setCounterPrice((p) => ({ ...p, [o.id]: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
                        onClick={() => submitCounter(o.id)}
                      >
                        إرسال للمشتري
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">صادرة (أنا المشتري)</h2>
        {outgoing.length === 0 ? (
          <p className="text-gray-500 text-sm">لا توجد عروض صادرة.</p>
        ) : (
          <ul className="space-y-3">
            {outgoing.map((o) => {
              const barterLine = fmtBarter(o);
              return (
              <li
                key={o.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span>
                    قميص #{o.tshirtId} {o.tshirtName || ''}
                  </span>
                  <span className="text-gray-500">{statusLabel(o.status)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  البائع: <strong>{o.sellerUsername || '—'}</strong>
                </p>
                <p className="text-sm mt-1">
                  مبلغك المقترح:{' '}
                  <strong>
                    {o.proposedPrice != null && Number(o.proposedPrice) > 0
                      ? `${o.proposedPrice} د.م.`
                      : 'بدون مبلغ'}
                  </strong>
                </p>
                {barterLine && (
                  <p className="text-sm text-emerald-800 mt-1">
                    مقايضة معروضة: <strong>{barterLine}</strong>
                  </p>
                )}
                {o.sellerCounterPrice != null && (
                  <p className="text-sm text-amber-700 mt-1">
                    سعر البائع المضاد: <strong>{o.sellerCounterPrice} د.م.</strong>
                  </p>
                )}

                {o.status === 'SELLER_COUNTERED' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm"
                      onClick={() =>
                        act(`/offers/${o.id}/buyer-accept-counter`, {
                          successMsg: 'تم قبول السعر المضاد — القميص والمقايضة بحوزتك الآن',
                          loadingMsg: 'جاري الدفع وإتمام الصفقة…',
                        })
                      }
                    >
                      قبول سعر البائع
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 px-3 py-1.5 rounded text-sm"
                      onClick={() =>
                        act(`/offers/${o.id}/buyer-reject-counter`, {
                          successMsg: 'تم رفض السعر المضاد',
                          loadingMsg: 'جاري الرفض…',
                        })
                      }
                    >
                      رفض
                    </button>
                  </div>
                )}

                {o.status === 'PENDING' && (
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-600 underline"
                    onClick={() =>
                      act(`/offers/${o.id}/withdraw`, {
                        successMsg: 'تم سحب العرض',
                        loadingMsg: 'جاري سحب العرض…',
                      })
                    }
                  >
                    سحب العرض
                  </button>
                )}
              </li>
            );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Offers;
