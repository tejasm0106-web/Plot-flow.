import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  QrCode, 
  ArrowRight,
  FileText
} from 'lucide-react';

export default function BookingModal({ 
  plot, 
  township, 
  onClose, 
  onSuccess 
}) {
  const [step, setStep] = useState(1); // 1: Buyer Info & Review, 2: Token Payment, 3: Confirmed Receipt
  const [buyerName, setBuyerName] = useState('Vikramaditya Sharma');
  const [buyerPhone, setBuyerPhone] = useState('+91 98450 12345');
  const [buyerEmail, setBuyerEmail] = useState('vikram.sharma@techcorp.com');
  const [buyerPan, setBuyerPan] = useState('ABCDE1234F');
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'NetBanking' | 'Card'
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      if (onSuccess) onSuccess(plot.id);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Lock Plot Reservation</h3>
              <p className="text-xs text-slate-400">{plot?.number} • {township?.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex border-b border-slate-800 bg-slate-900/30 px-6 py-3 text-xs font-semibold">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
            <span>Buyer KYC</span>
          </div>
          <span className="text-slate-600 mx-3">/</span>
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
            <span>Token (₹25k)</span>
          </div>
          <span className="text-slate-600 mx-3">/</span>
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
            <span>Receipt</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block">Unit Reserved:</span>
                  <span className="text-white font-bold text-sm">{plot?.number} ({plot?.sizeSqFt} sq.ft, {plot?.facing})</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Token Amount:</span>
                  <span className="text-emerald-400 font-bold text-sm">₹25,000</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Full Legal Name (as per Aadhaar/PAN)</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      value={buyerPan}
                      onChange={(e) => setBuyerPan(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl text-[11px] text-emerald-300 flex items-center space-x-2.5">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span>100% Refundable Token Advance if site visit or legal title review is declined within 7 days.</span>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <span>Proceed to Escrow Token Payment (₹25,000)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <span className="text-xs text-slate-400">Escrow Account Payment</span>
                <h4 className="text-2xl font-black text-white mt-1">₹25,000.00</h4>
                <p className="text-[11px] text-emerald-400 mt-0.5">PlotFlow Secure Escrow Settlement</p>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'NetBanking', 'Card'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                      paymentMethod === method
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* UPI QR Code Preview */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
                <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow">
                  <QrCode className="w-28 h-28 text-slate-900" />
                </div>
                <div className="text-center text-xs">
                  <span className="text-slate-400 block">Scan via GPay, PhonePe, Paytm, or BHIM</span>
                  <span className="text-indigo-400 font-mono text-[11px]">UPI ID: plotflow.escrow@icici</span>
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={handleProcessPayment}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Confirming Real-Time Escrow Token...</span>
                  </span>
                ) : (
                  <span>Simulate Instant Token Confirmation</span>
                )}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-white">Plot {plot?.number} Locked Successfully!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Token advance of ₹25,000 received in verified escrow. Plot status has been updated to <strong className="text-amber-400">Reserved</strong>.
                </p>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-mono text-slate-200">TXN-PF-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Buyer Name:</span>
                  <span className="text-white font-semibold">{buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Township & Unit:</span>
                  <span className="text-white font-semibold">{township?.name} ({plot?.number})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reservation Validity:</span>
                  <span className="text-emerald-400 font-semibold">7 Days (Full Escrow Protection)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                Back to Dashboard & Layout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
