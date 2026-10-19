import React, { useState } from 'react';
import { Listing, PropertyRequestType } from '../types';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  DollarSign,
  Phone,
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';

interface BookingModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, submitPropertyRequest, showToast } = useApp();

  const [requestType, setRequestType] = useState<PropertyRequestType>('booking_intent');
  const [requestedDurationHours, setRequestedDurationHours] = useState<number>(48);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [offeredPrice, setOfferedPrice] = useState<string>('');
  const [seekerPhone, setSeekerPhone] = useState<string>(currentUser.phone || '');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isReserved = Boolean(listing.isReserved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentUser.role === 'visitor') {
      showToast('يجب تسجيل الدخول أو تأكيد رقم هاتفك أولاً لتقديم الطلب', 'warning');
      return;
    }

    if (listing.advertiser.id === currentUser.id) {
      setErrorMsg('لا يمكنك تقديم طلب حجز على إعلانك الخاص');
      return;
    }

    if (!seekerPhone.trim()) {
      setErrorMsg('رقم الهاتف للتواصل مطلوب');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitPropertyRequest({
        listingId: listing.id,
        requestType,
        notes: notes.trim(),
        offeredPrice: offeredPrice ? Number(offeredPrice) : undefined,
        preferredDate: preferredDate || undefined,
        requestedDurationHours,
        seekerPhone: seekerPhone.trim()
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPrice = () => {
    if (listing.currency === 'USD') return `$${listing.price.toLocaleString()}`;
    if (listing.currency === 'SAR') return `${listing.price.toLocaleString()} ر.س`;
    return `${listing.price.toLocaleString()} ر.ي`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#16324F] to-[#1a3d61] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#12A889]/20 flex items-center justify-center border border-[#12A889]/30 text-[#12A889]">
              <Calendar className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg">تقديم طلب / حجز مؤقت</h3>
              <p className="text-xs text-slate-300">طلب رسمي موثق لدى منصة دلنّي العقارية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs md:text-sm">
          {/* Target Listing Summary Card */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3.5">
            <img
              src={listing.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80'}
              alt={listing.title}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {listing.listingNumber}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {listing.purpose === 'sale' ? 'للبيع' : 'للإيجار'}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs md:text-sm truncate" title={listing.title}>
                {listing.title}
              </h4>
              <p className="text-emerald-700 font-extrabold text-xs md:text-sm mt-0.5">
                {formattedPrice()}
              </p>
            </div>
          </div>

          {/* Reserved Status Alert if currently held */}
          {isReserved && (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">هذا العقار محجوز مؤقتاً حالياً</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  يوجد حجز مؤقت جارٍ على هذا العقار. بإمكانك إرسال طلبك للانضمام إلى قائمة الانتظار، وسيتمكن المعلن من مراجعته فور انتهاء الحجز أو إلغائه.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Request Type Selector */}
            <div>
              <label className="block font-bold text-slate-800 mb-2">نوع الطلب:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestType('booking_intent')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    requestType === 'booking_intent'
                      ? 'border-[#12A889] bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">حجز مؤقت جاد</span>
                    <Lock className={`w-3.5 h-3.5 ${requestType === 'booking_intent' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">قفل تعاملي لفحص البصيرة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('visit_inquiry')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    requestType === 'visit_inquiry'
                      ? 'border-[#12A889] bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">معاينة ميدانية</span>
                    <Calendar className={`w-3.5 h-3.5 ${requestType === 'visit_inquiry' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">تحديد موعد لزيارة العقار</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('price_offer')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    requestType === 'price_offer'
                      ? 'border-[#12A889] bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">تقديم عرض سعر</span>
                    <DollarSign className={`w-3.5 h-3.5 ${requestType === 'price_offer' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">اقتراح سعر تفاوضي</span>
                </button>
              </div>
            </div>

            {/* 2. Duration Selector (Requirement 4: default 48h and customizable) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#12A889]" />
                  <span>مدة الحجز المؤقت المطلوبة:</span>
                </label>
                <span className="text-[11px] text-slate-500">قابلة للتعديل من المعلن</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { hours: 24, label: '24 ساعة' },
                  { hours: 48, label: '48 ساعة (الموصى بها)' },
                  { hours: 72, label: '72 ساعة' },
                  { hours: 120, label: '5 أيام' },
                  { hours: 168, label: '7 أيام (الحد الأقصى)' }
                ].map(item => (
                  <button
                    key={item.hours}
                    type="button"
                    onClick={() => setRequestedDurationHours(item.hours)}
                    className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold transition-all ${
                      requestedDurationHours === item.hours
                        ? 'border-[#12A889] bg-[#12A889] text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Optional Fields: Date & Offer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  الموعد المفضل للمعاينة / الاتفاق:
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#12A889] outline-none"
                />
              </div>

              {requestType === 'price_offer' && (
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    السعر المقترح ({listing.currency}):
                  </label>
                  <input
                    type="number"
                    value={offeredPrice}
                    onChange={e => setOfferedPrice(e.target.value)}
                    placeholder={`مثال: ${listing.price * 0.9}`}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#12A889] outline-none"
                  />
                </div>
              )}

              <div className={requestType === 'price_offer' ? 'sm:col-span-2' : ''}>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  رقم الهاتف المعتمد للتواصل:
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={seekerPhone}
                    onChange={e => setSeekerPhone(e.target.value)}
                    placeholder="770000000"
                    dir="ltr"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#12A889] outline-none text-right font-mono"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* 4. Notes / Message */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                ملاحظات أو استفسارات موجهة للمعلن:
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="أرغب بفحص البصيرة الشرعية مع المالك غداً، أو لدي استفسار حول تفاصيل الدفع والضمان..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#12A889] outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Platform Trust & Policy Box */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-[11px] text-emerald-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ضمانات الحجز المؤقت في دلنّي:</span>
              </div>
              <p>• عند قبول الطلب، يتم قفل العقار مؤقتاً ومنع تأكيد أي حجوزات متعارضة طوال مدة الحجز المعتمدة.</p>
              <p>• الحجز مخصص لمعاينة العقار ومطابقة البصيرة الشرعية لدى الأمين الشرعي دون أي رسوم إضافية.</p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#12A889] hover:bg-[#0f8e74] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد وإرسال الطلب</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
