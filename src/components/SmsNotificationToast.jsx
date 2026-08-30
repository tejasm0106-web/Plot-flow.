import React, { useState, useEffect } from 'react';
import { MessageSquare, Smartphone, X, Copy, CheckCircle2, KeyRound } from 'lucide-react';

export default function SmsNotificationToast() {
  const [activeSms, setActiveSms] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleSmsDispatched = (event) => {
      const detail = event.detail;
      if (detail) {
        setActiveSms({
          ...detail,
          receivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        setCopied(false);
      }
    };

    window.addEventListener('plotflow_sms_dispatched', handleSmsDispatched);
    return () => {
      window.removeEventListener('plotflow_sms_dispatched', handleSmsDispatched);
    };
  }, []);

  if (!activeSms) return null;

  const handleCopyCode = () => {
    if (activeSms.otpCode) {
      navigator.clipboard.writeText(activeSms.otpCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full animate-bounce-in font-sans">
      <div className="bg-slate-900/95 border-2 border-emerald-500/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-emerald-950/60 text-white relative overflow-hidden">
        {/* Animated Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">SMS Received</span>
                <span className="text-[10px] text-slate-400">• {activeSms.receivedAt}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-300 truncate max-w-[180px]">
                To: <span className="text-white font-mono">{activeSms.phone}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveSms(null)}
            className="w-6 h-6 rounded-md hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message Content */}
        <div className="space-y-2.5">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {activeSms.message}
          </p>

          {/* OTP Box & Action */}
          {activeSms.otpCode && (
            <div className="flex items-center justify-between bg-slate-950/80 border border-emerald-500/30 rounded-xl p-2.5">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Verification OTP:</span>
                <span className="font-mono text-base font-black text-emerald-300 tracking-wider">
                  {activeSms.otpCode}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black transition flex items-center space-x-1 shadow"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
