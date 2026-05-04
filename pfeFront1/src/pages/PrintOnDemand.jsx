import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Model from '../components/Jersey';
import catalogJson from '../components/tshirt.json';
import { PATTERNS, FONTS, BRANDS } from '../components/patterns';
import { POD_LOGO_FALLBACK_FILES, logoUrl } from '../constants/podLogos';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/** رقم دعم افتراضي يظهر عند الشكوى */
const DEFAULT_SUPPORT_PHONE = '+212661889900';

const CUSTOM_UNIT_PRICE = 189;

const brandOptions = Object.values(BRANDS);

const patternOptions = [
  { label: 'سادة', value: PATTERNS.PLAIN },
  { label: 'نسيم (split)', value: PATTERNS.SPLIT },
  { label: 'مخطط', value: PATTERNS.STRIPES },
  { label: 'تدرج', value: PATTERNS.GRADIENT_V },
  { label: 'شريط مائل', value: PATTERNS.SASH },
  { label: 'خط وسط', value: PATTERNS.CENTER_STRIPE },
  { label: 'خطّان وسط', value: PATTERNS.DOUBLE_CENTER_STRIPES },
];

const logoPositionOptions = [
  { label: 'وسط القميص', value: 'center' },
  { label: 'جانب', value: 'side' },
];

const initialCustom = {
  mainColor: '#1d4ed8',
  secondColor: '#ffffff',
  collarColor: '#93c5fd',
  insideColor: '#1d4ed8',
  pattern: PATTERNS.SPLIT,
  number: '7',
  name: 'CUSTOM',
  name_number_color: '#ffffff',
  textFont: 'Arial',
  sponsor: 'SPONSOR',
  sponsorColor: '#ffffff',
  sponsorFont: 'Arial',
  brand: 'adidas',
  logo: logoUrl('city.png'),
  logoPosition: 'center',
};

function newLineId() {
  return globalThis.crypto?.randomUUID?.() ?? `pod-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function orderStatusLine(o) {
  if (o.status === 'FULFILLED') return 'تم استلام القميص';
  if (o.complaintText && o.adminResponse) {
    return 'قيد التوصيل — تم الرد على شكواك (يمكنك تأكيد الاستلام عند الوصول)';
  }
  if (o.complaintText) {
    return 'قيد التوصيل — شكوى مسجلة';
  }
  return 'قيد التوصيل';
}

function buildDesignPayload(custom) {
  return {
    mainColor: custom.mainColor,
    secondColor: custom.secondColor,
    collarColor: custom.collarColor,
    insideColor: custom.insideColor,
    pattern: custom.pattern,
    number: custom.number,
    name: custom.name,
    name_number_color: custom.name_number_color,
    textFont: custom.textFont,
    sponsor: custom.sponsor,
    sponsorColor: custom.sponsorColor,
    sponsorFont: custom.sponsorFont,
    brand: custom.brand,
    logo: custom.logo,
    logoPosition: custom.logoPosition,
  };
}

export default function PrintOnDemand() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('custom');
  const [custom, setCustom] = useState(initialCustom);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [logoFileNames, setLogoFileNames] = useState(POD_LOGO_FALLBACK_FILES);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const [complaintFor, setComplaintFor] = useState(null);
  const [complaintText, setComplaintText] = useState('');
  const [complaintPhone, setComplaintPhone] = useState(DEFAULT_SUPPORT_PHONE);
  const [complaintBusy, setComplaintBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/logos/manifest.json');
        if (!res.ok) throw new Error('no manifest');
        const data = await res.json();
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        const names = data.filter((x) => typeof x === 'string' && /\.(png|jpe?g|webp|svg)$/i.test(x));
        if (names.length) setLogoFileNames(names);
      } catch {
        if (!cancelled) setLogoFileNames(POD_LOGO_FALLBACK_FILES);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((s, l) => s + Number(l.unitPrice || 0), 0),
    [cart]
  );

  const balanceNum = user?.balance != null ? Number(user.balance) : null;

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const { data } = await api.get('/pod/orders/mine');
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error('تعذر تحميل الطلبات');
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const addCustomToCart = () => {
    const design = buildDesignPayload(custom);
    setCart((prev) => [
      ...prev,
      {
        lineId: newLineId(),
        sourceType: 'CUSTOM',
        design,
        title: `تصميم مخصص — ${custom.name || 'بدون اسم'}`,
        unitPrice: CUSTOM_UNIT_PRICE,
      },
    ]);
    toast.success('أُضيف التصميم إلى السلة');
    setCartOpen(true);
  };

  const addCatalogToCart = (item) => {
    setCart((prev) => [
      ...prev,
      {
        lineId: newLineId(),
        sourceType: 'CATALOG',
        catalogItemId: item.id,
        title: item.clubName || `قميص كتالوج #${item.id}`,
        unitPrice: Number(item.price),
      },
    ]);
    toast.success('أُضيف القميص إلى السلة');
    setCartOpen(true);
  };

  const removeLine = (lineId) => {
    setCart((prev) => prev.filter((l) => l.lineId !== lineId));
  };

  const runCheckout = async () => {
    if (cart.length === 0) return;
    if (balanceNum != null && balanceNum < cartTotal) {
      toast.error('الرصيد غير كافٍ لإتمام الطلب');
      return;
    }
    setCheckoutBusy(true);
    try {
      const items = cart.map((l) =>
        l.sourceType === 'CATALOG'
          ? { sourceType: 'CATALOG', catalogItemId: l.catalogItemId }
          : { sourceType: 'CUSTOM', design: l.design }
      );
      const { data } = await api.post('/pod/orders/checkout', { items });
      if (data?.newBalance != null) {
        updateUser({ balance: data.newBalance });
      }
      toast.success(
        `تم تأكيد الشراء — ${data?.orders?.length ?? items.length} طلباً بمجموع ${Number(data?.totalPaid ?? cartTotal).toFixed(2)} د.م.`
      );
      setCart([]);
      setCheckoutOpen(false);
      setCartOpen(false);
      await loadOrders();
    } catch (err) {
      const m = err.response?.data;
      toast.error(typeof m === 'string' ? m : 'تعذر إتمام الدفع');
    } finally {
      setCheckoutBusy(false);
    }
  };

  const markReceived = async (orderId) => {
    try {
      await api.post(`/pod/orders/${orderId}/received`);
      toast.success('تم تسجيل الاستلام — أضيف القميص إلى حسابك');
      await loadOrders();
      try {
        const { data } = await api.get('/wallet/balance');
        if (data?.balance != null) updateUser({ balance: data.balance });
      } catch {
        /* ignore */
      }
    } catch (err) {
      const m = err.response?.data;
      toast.error(typeof m === 'string' ? m : 'تعذر التحديث');
    }
  };

  const sendComplaint = async (e) => {
    e.preventDefault();
    if (!complaintFor) return;
    if (!complaintText.trim()) {
      toast.error('اكتب نص الشكوى');
      return;
    }
    setComplaintBusy(true);
    try {
      await api.post(`/pod/orders/${complaintFor}/complaint`, {
        message: complaintText.trim(),
        phone: complaintPhone.trim() || undefined,
      });
      toast.success('تم إرسال الشكوى — لا يزال بإمكانك تأكيد الاستلام عند وصول القميص');
      setComplaintFor(null);
      setComplaintText('');
      setComplaintPhone(DEFAULT_SUPPORT_PHONE);
      await loadOrders();
    } catch (err) {
      const m = err.response?.data;
      toast.error(typeof m === 'string' ? m : 'تعذر الإرسال');
    } finally {
      setComplaintBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">طباعة عند الطلب</h1>
        <p className="text-gray-600 mb-6">سجّل الدخول لطلب قميص مخصص أو شراء تصاميم الأندية.</p>
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">طباعة عند الطلب</h1>
          <p className="text-gray-600 mt-2 leading-relaxed max-w-3xl">
            تعامل مباشر مع الشركة: صمّم قميصك أو اختر من الأندية (البيانات من <code className="text-sm bg-gray-100 px-1 rounded">tshirt.json</code>
            ). أضف المنتجات إلى <strong>سلة مخصصة لهذه الصفحة فقط</strong> ثم أكمل الدفع دفعة واحدة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="relative shrink-0 inline-flex items-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-xl font-medium shadow-md hover:bg-slate-900 transition-colors"
        >
          <span className="text-lg leading-none">🛒</span>
          السلة
          {cart.length > 0 && (
            <span className="absolute -top-1 -left-1 min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-rose-500 text-white text-xs font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-1">
        <button
          type="button"
          onClick={() => setTab('custom')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            tab === 'custom' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          تصميم مخصص
        </button>
        <button
          type="button"
          onClick={() => setTab('catalog')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
            tab === 'catalog' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          قمصان أندية جاهزة
        </button>
      </div>

      {tab === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[420px] rounded-xl overflow-hidden bg-black ring-1 ring-gray-200">
            <Model {...buildDesignPayload(custom)} />
          </div>

          <div className="space-y-4 bg-white rounded-xl shadow p-6 ring-1 ring-gray-100">
            <h2 className="font-semibold text-gray-900">خيارات التصميم</h2>
            <p className="text-sm text-gray-500">
              سعر الوحدة: <span className="font-bold text-amber-700">{CUSTOM_UNIT_PRICE.toFixed(2)} د.م.</span> — يُخصم عند إتمام الشراء من السلة
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="space-y-1">
                <span className="text-gray-600">اللون الأساسي</span>
                <input
                  type="color"
                  className="w-full h-10 rounded border"
                  value={custom.mainColor.startsWith('#') ? custom.mainColor : '#000000'}
                  onChange={(e) => setCustom((c) => ({ ...c, mainColor: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-gray-600">اللون الثانوي</span>
                <input
                  type="color"
                  className="w-full h-10 rounded border"
                  value={custom.secondColor.startsWith('#') ? custom.secondColor : '#ffffff'}
                  onChange={(e) => setCustom((c) => ({ ...c, secondColor: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-gray-600">الطوق</span>
                <input
                  type="color"
                  className="w-full h-10 rounded border"
                  value={custom.collarColor.startsWith('#') ? custom.collarColor : '#000000'}
                  onChange={(e) => setCustom((c) => ({ ...c, collarColor: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-gray-600">الداخل</span>
                <input
                  type="color"
                  className="w-full h-10 rounded border"
                  value={custom.insideColor.startsWith('#') ? custom.insideColor : '#000000'}
                  onChange={(e) => setCustom((c) => ({ ...c, insideColor: e.target.value }))}
                />
              </label>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-gray-600">النمط</span>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={custom.pattern}
                onChange={(e) => setCustom((c) => ({ ...c, pattern: e.target.value }))}
              >
                {patternOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-gray-600">الاسم</span>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={custom.name}
                  onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-gray-600">الرقم</span>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={custom.number}
                  onChange={(e) => setCustom((c) => ({ ...c, number: e.target.value }))}
                />
              </label>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-gray-600">لون الاسم والرقم</span>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="white أو #hex"
                value={custom.name_number_color}
                onChange={(e) => setCustom((c) => ({ ...c, name_number_color: e.target.value }))}
              />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="text-gray-600">خط النص</span>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={custom.textFont}
                onChange={(e) => setCustom((c) => ({ ...c, textFont: e.target.value }))}
              >
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-gray-600">الراعي</span>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={custom.sponsor}
                  onChange={(e) => setCustom((c) => ({ ...c, sponsor: e.target.value }))}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-gray-600">لون الراعي</span>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={custom.sponsorColor}
                  onChange={(e) => setCustom((c) => ({ ...c, sponsorColor: e.target.value }))}
                />
              </label>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="text-gray-600">العلامة (موديل القميص)</span>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={custom.brand}
                onChange={(e) => setCustom((c) => ({ ...c, brand: e.target.value }))}
              >
                {brandOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50/80">
              <p className="text-xs font-semibold text-gray-700">الشعار</p>
              <label className="block space-y-1 text-sm">
                <span className="text-gray-600">اختر صورة من مجلد public/logos</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {logoFileNames.map((file) => {
                    const path = logoUrl(file);
                    const selected = custom.logo === path;
                    return (
                      <button
                        key={file}
                        type="button"
                        onClick={() => setCustom((c) => ({ ...c, logo: path }))}
                        className={`rounded-lg border-2 p-1 flex flex-col items-center gap-1 transition-colors ${
                          selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={path} alt="" className="h-10 w-10 object-contain mx-auto" />
                        <span className="text-[10px] text-gray-500 truncate w-full text-center">{file}</span>
                      </button>
                    );
                  })}
                </div>
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-gray-600">موضع الشعار على القميص</span>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                  value={custom.logoPosition}
                  onChange={(e) => setCustom((c) => ({ ...c, logoPosition: e.target.value }))}
                >
                  {logoPositionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={addCustomToCart}
              className="w-full bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl shadow"
            >
              إضافة التصميم إلى السلة
            </button>
          </div>
        </div>
      )}

      {tab === 'catalog' && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            الأسعار من ملف JSON المحلي — يتطابق الخادم مع <code className="text-xs bg-gray-100 px-1">pod-catalog.json</code>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {catalogJson.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col ring-1 ring-gray-100">
                <div className="h-[320px] bg-black">
                  <Model
                    mainColor={item.mainColor}
                    secondColor={item.secondColor}
                    collarColor={item.collarColor}
                    insideColor={item.insideColor}
                    pattern={item.pattern}
                    number={item.number}
                    name={item.name}
                    name_number_color={item.name_number_color}
                    textFont={item.textFont}
                    sponsor={item.sponsor}
                    sponsorColor={item.sponsorColor}
                    sponsorFont={item.sponsorFont}
                    brand={item.brand}
                    logo={item.logo}
                    logoPosition={item.logoPosition}
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900">{item.clubName || `قميص #${item.id}`}</h3>
                  <p className="text-amber-700 font-semibold mt-1">{Number(item.price).toFixed(2)} د.م.</p>
                  <button
                    type="button"
                    onClick={() => addCatalogToCart(item)}
                    className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl"
                  >
                    إضافة إلى السلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="bg-white rounded-xl shadow p-6 ring-1 ring-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">طلباتي وإجراءات التوصيل</h2>
        {loadingOrders ? (
          <p className="text-gray-500">جاري التحميل…</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">لا توجد طلبات بعد.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li
                key={o.id}
                className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                <div>
                  <p className="font-mono text-sm text-gray-500">طلب #{o.id}</p>
                  <p className="font-medium">
                    {o.sourceType === 'CATALOG' ? 'تصميم نادي (من الكتالوج)' : 'تصميم مخصص'}
                    {o.catalogItemId != null && (
                      <span className="text-gray-500 text-sm mr-2">· معرف الكتالوج: {o.catalogItemId}</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{orderStatusLine(o)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    المدفوع: {Number(o.pricePaid).toFixed(2)} د.م. — {new Date(o.createdAt).toLocaleString('ar')}
                  </p>
                  {o.createdTshirtId && (
                    <p className="text-sm text-green-700 mt-2">القميص في حسابك (#{o.createdTshirtId})</p>
                  )}
                  {o.complaintText && (
                    <div className="mt-2 text-sm bg-amber-50 border border-amber-100 rounded p-2">
                      <p>
                        <span className="font-semibold">شكواك:</span> {o.complaintText}
                      </p>
                      {o.complaintPhone && (
                        <p className="text-xs text-gray-600 mt-1">الهاتف المُرسل: {o.complaintPhone}</p>
                      )}
                      {o.adminResponse && (
                        <p className="mt-2 text-gray-800">
                          <span className="font-semibold text-blue-800">رد الإدارة:</span> {o.adminResponse}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {o.status !== 'FULFILLED' && (
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => markReceived(o.id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg"
                    >
                      لقد وصلني القميص
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComplaintFor(o.id);
                        setComplaintPhone(DEFAULT_SUPPORT_PHONE);
                        setComplaintText('');
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-sm px-4 py-2 rounded-lg"
                    >
                      إبلاغ عن مشكلة / شكوى
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="إغلاق"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">سلة الطباعة عند الطلب</h2>
              <button type="button" className="text-gray-500 hover:text-gray-800 p-2" onClick={() => setCartOpen(false)}>
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-sm">السلة فارغة — أضف تصميماً أو قميصاً من الكتالوج.</p>
              ) : (
                cart.map((line) => (
                  <div
                    key={line.lineId}
                    className="flex justify-between gap-2 border border-gray-100 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{line.title}</p>
                      <p className="text-amber-800 text-sm font-semibold mt-1">
                        {Number(line.unitPrice).toFixed(2)} د.م.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-red-600 text-sm shrink-0 self-start"
                      onClick={() => removeLine(line.lineId)}
                    >
                      حذف
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t space-y-3 bg-gray-50">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">المجموع</span>
                <span className="font-bold text-lg text-gray-900 tabular-nums">{cartTotal.toFixed(2)} د.م.</span>
              </div>
              {balanceNum != null && (
                <p className="text-xs text-gray-500">
                  رصيدك الحالي: <span className="font-mono font-semibold text-amber-800">{balanceNum.toFixed(2)} د.م.</span>
                </p>
              )}
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={() => setCheckoutOpen(true)}
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl disabled:opacity-40"
              >
                متابعة الدفع
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">تأكيد الطلب</h3>
            <p className="text-sm text-gray-600">
              سيتم إنشاء <strong>{cart.length}</strong> طلباً منفصلاً، والخصم دفعة واحدة بقيمة{' '}
              <strong className="text-amber-800">{cartTotal.toFixed(2)} د.م.</strong>
            </p>
            <ul className="text-sm text-gray-700 space-y-1 max-h-36 overflow-y-auto border rounded-lg p-2 bg-gray-50">
              {cart.map((l) => (
                <li key={l.lineId} className="flex justify-between gap-2">
                  <span className="truncate">{l.title}</span>
                  <span className="tabular-nums shrink-0">{Number(l.unitPrice).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="px-4 py-2 text-gray-600" onClick={() => setCheckoutOpen(false)}>
                رجوع
              </button>
              <button
                type="button"
                disabled={checkoutBusy}
                onClick={runCheckout}
                className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {checkoutBusy ? 'جاري الدفع…' : 'تأكيد ودفع'}
              </button>
            </div>
          </div>
        </div>
      )}

      {complaintFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h3 className="font-bold text-lg text-gray-900 mb-2">تقديم شكوى</h3>
            <p className="text-sm text-gray-600 mb-4">
              يمكنك الاتصال بالدعم مباشرة:{' '}
              <a href={`tel:${DEFAULT_SUPPORT_PHONE.replace(/\s/g, '')}`} className="font-mono text-blue-700 font-semibold">
                {DEFAULT_SUPPORT_PHONE}
              </a>
            </p>
            <form onSubmit={sendComplaint} className="space-y-3">
              <label className="block space-y-1 text-sm">
                <span className="text-gray-700">نص الشكوى</span>
                <textarea
                  required
                  className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="صف المشكلة (تأخر، خطأ في الطباعة، …)"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-gray-700">رقم للتواصل (يُرسل للإدارة)</span>
                <input
                  type="tel"
                  className="w-full border rounded-lg px-3 py-2 font-mono"
                  value={complaintPhone}
                  onChange={(e) => setComplaintPhone(e.target.value)}
                />
              </label>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-600"
                  onClick={() => setComplaintFor(null)}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={complaintBusy}
                  className="bg-rose-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {complaintBusy ? '…' : 'إرسال الشكوى'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
