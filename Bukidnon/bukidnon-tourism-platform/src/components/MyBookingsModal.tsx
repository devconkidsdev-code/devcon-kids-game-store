import React, { useState } from 'react';
import { Booking } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  QrCode, 
  Download, 
  Trash2,
  MapPin,
  Sparkles
} from 'lucide-react';

interface MyBookingsModalProps {
  bookings: Booking[];
  onClose: () => void;
  onCancelBooking: (bookingId: string) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  bookings,
  onClose,
  onCancelBooking
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'history'>('all');
  const [selectedQRBooking, setSelectedQRBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'approved') return b.status === 'approved';
    if (filter === 'history') return b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[11px] font-bold uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Approved / Confirmed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/50 text-[11px] font-bold uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Pending Owner Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-950 text-red-300 border border-red-500/50 text-[11px] font-bold uppercase flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-400" />
            <span>Rejected</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-bold uppercase">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-500/50 text-[11px] font-bold uppercase">
            Completed
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">My Tourist Bookings & Passes</h2>
              <p className="text-xs text-emerald-300/80">Track live reservation status, tickets, and entry vouchers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Approved ({bookings.filter((b) => b.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'pending' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Pending ({bookings.filter((b) => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('history')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filter === 'history' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            History / Other
          </button>
        </div>

        {/* Bookings List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-200">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No bookings found in this category.</p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={b.spotImage}
                    alt={b.spotName}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{b.spotName}</h4>
                      {getStatusBadge(b.status)}
                    </div>
                    <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 font-mono text-emerald-400">
                        <strong>Code:</strong> {b.bookingCode}
                      </span>
                      <span>📅 {b.visitDate}</span>
                      <span>⏰ {b.timeSlot}</span>
                      <span>👥 {b.visitorsCount} Pax</span>
                    </div>

                    {b.selectedActivities.length > 0 && (
                      <div className="text-[11px] text-slate-400">
                        <strong>Activities:</strong> {b.selectedActivities.join(', ')}
                      </div>
                    )}

                    {b.rejectionReason && (
                      <div className="p-2 rounded bg-red-950/60 border border-red-500/40 text-red-300 text-xs mt-1">
                        <strong>Owner Note:</strong> {b.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 shrink-0 gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Total Fee</span>
                    <span className="text-base font-black text-emerald-400">₱{b.totalAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {b.status === 'approved' && (
                      <button
                        onClick={() => setSelectedQRBooking(b)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Ticket</span>
                      </button>
                    )}

                    {b.status === 'pending' && (
                      <button
                        onClick={() => onCancelBooking(b.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 text-xs border border-slate-700 hover:border-red-500/40 transition flex items-center gap-1"
                        title="Cancel reservation request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* QR Code Inspection Modal if opened */}
        {selectedQRBooking && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
              <button
                onClick={() => setSelectedQRBooking(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Bukidnon Verified Entry Pass
                </span>
                <h3 className="text-base font-bold text-white">{selectedQRBooking.spotName}</h3>
                <p className="text-xs text-slate-400">{selectedQRBooking.visitDate} • {selectedQRBooking.timeSlot}</p>
              </div>

              <div className="bg-white p-3 rounded-2xl max-w-[200px] mx-auto shadow-xl">
                <img
                  src={selectedQRBooking.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedQRBooking.bookingCode}`}
                  alt="Entry QR"
                  className="w-full h-auto"
                />
              </div>

              <div className="font-mono text-sm font-bold text-emerald-300">
                {selectedQRBooking.bookingCode}
              </div>

              <p className="text-[11px] text-slate-400">
                Present this QR voucher at the tourist gate entrance for contactless scanning and admittance.
              </p>

              <button
                onClick={() => setSelectedQRBooking(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Close Voucher
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
