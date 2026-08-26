import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  PhoneCall, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function SiteVisitModal({ 
  plot, 
  township, 
  onClose, 
  onSuccess 
}) {
  const [name, setName] = useState('Vikramaditya Sharma');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [pickupAddress, setPickupAddress] = useState('Indiranagar, 100 Feet Road, Bengaluru');
  const [visitDate, setVisitDate] = useState('2026-08-29');
  const [visitSlot, setVisitSlot] = useState('11:00 AM - 01:00 PM (Morning Slot)');
  const [cabPreference, setCabPreference] = useState('Free AC Cab Pickup & Drop (Complimentary)');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (onSuccess) {
      onSuccess({
        buyerName: name,
        phone,
        townshipName: township?.name,
        interestedPlot: plot ? `${plot.number} (${plot.sizeSqFt} sq.ft)` : 'General Township Tour',
        visitDate: `${visitDate} (${visitSlot})`,
        status: 'Site Visit Scheduled'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Car className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Book Free Cab Site Visit</h3>
              <p className="text-xs text-slate-400">
                {plot ? `Plot ${plot.number} • ` : ''}{township?.name}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="bg-indigo-950/20 border border-indigo-500/30 p-3 rounded-xl flex items-center space-x-3 text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Complimentary door-to-door AC Chauffeur Cab & Dedicated Real Estate Legal Advisor included.</span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Time Window</label>
                <select
                  value={visitSlot}
                  onChange={(e) => setVisitSlot(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="09:00 AM - 11:00 AM (Early Morning)">09:00 AM - 11:00 AM (Early Morning)</option>
                  <option value="11:00 AM - 01:00 PM (Morning Slot)">11:00 AM - 01:00 PM (Morning Slot)</option>
                  <option value="02:30 PM - 04:30 PM (Afternoon)">02:30 PM - 04:30 PM (Afternoon)</option>
                  <option value="04:30 PM - 06:30 PM (Sunset Golden Hour)">04:30 PM - 06:30 PM (Sunset Golden Hour)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Cab Pickup Location (Home or Office)</label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Indiranagar, Bengaluru"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 mt-2"
              >
                <Car className="w-4 h-4" />
                <span>Confirm Free Cab & Site Experience</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">Chauffeur Cab Confirmed!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Your VIP site visit for <strong className="text-white">{township?.name}</strong> has been scheduled for <strong className="text-emerald-400">{visitDate}</strong>.
                </p>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pickup Location:</span>
                  <span className="text-slate-200">{pickupAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Driver & Concierge:</span>
                  <span className="text-emerald-400 font-semibold">Driver details sent via WhatsApp</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
