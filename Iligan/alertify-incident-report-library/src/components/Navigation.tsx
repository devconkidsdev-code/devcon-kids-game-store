import React, { useState } from 'react';
import { Layers, ShieldAlert, Map as MapIcon, Info, Menu, X, Plus } from 'lucide-react';

interface NavigationProps {
  activeTab: 'dashboard' | 'incidents' | 'map' | 'about';
  onTabChange: (tab: 'dashboard' | 'incidents' | 'map' | 'about') => void;
  onNewReport: () => void;
  totalActiveCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onNewReport,
  totalActiveCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: 'dashboard' | 'incidents' | 'map' | 'about'; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'map', label: 'Map' },
    { id: 'about', label: 'About' }
  ];

  return (
    <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-40">
      {/* Left side brand and nav links */}
      <div className="flex items-center gap-6 sm:gap-10">
        <div 
          onClick={() => onTabChange('dashboard')} 
          className="flex items-center gap-2 cursor-pointer select-none"
          id="nav-brand-logo"
        >
          <span className="text-lg sm:text-xl font-bold tracking-tight bg-[#12304A] text-white px-2.5 py-0.5 rounded">
            Alertify
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#168AAD] font-semibold'
                    : 'text-slate-500 hover:text-[#12304A]'
                }`}
              >
                {item.label}
                {item.id === 'incidents' && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[11px] font-mono font-normal">
                    {totalActiveCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right side CTA & mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          id="new-report-button"
          type="button"
          onClick={onNewReport}
          className="bg-[#12304A] hover:bg-[#168AAD] text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Report</span>
        </button>

        {/* Mobile menu toggle button */}
        <button
          id="mobile-menu-toggle"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-[#12304A] hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 border-b border-slate-200 bg-white px-6 py-3 space-y-2 shadow-md">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-link-${item.id}`}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between py-2 text-sm font-medium ${
                  isActive ? 'text-[#168AAD] font-semibold' : 'text-slate-600'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'incidents' && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                    {totalActiveCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
