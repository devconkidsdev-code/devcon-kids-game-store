import React, { useState } from 'react';
import { UserProfile } from '../types';
import { BARANGAYS, PUROKS } from '../data';
import { Save } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
}

export function SettingsView({ profile, onSave }: SettingsViewProps) {
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const availablePuroks = PUROKS[formData.barangay] || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Alert Configuration</h3>
        <p className="text-xs text-slate-500 mt-1">Configure your location to receive specific warnings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number</label>
          <input
            type="tel"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.mobile}
            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Barangay</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={formData.barangay}
            onChange={e => {
              const newBrgy = e.target.value;
              setFormData({ ...formData, barangay: newBrgy, purok: PUROKS[newBrgy]?.[0] || '' });
            }}
          >
            {BARANGAYS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Purok</label>
          <select
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={formData.purok}
            onChange={e => setFormData({ ...formData, purok: e.target.value })}
            disabled={availablePuroks.length === 0}
          >
            {availablePuroks.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </form>
    </div>
  );
}
