/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardHeader } from './components/DashboardHeader';
import { FilterBar } from './components/FilterBar';
import { IncidentLibrary } from './components/IncidentLibrary';
import { IncidentMap } from './components/IncidentMap';
import { IncidentDetail } from './components/IncidentDetail';
import { IncidentDetailAside } from './components/IncidentDetailAside';
import { NewReportModal } from './components/NewReportModal';
import { AboutModal } from './components/AboutModal';
import { INITIAL_INCIDENTS } from './data/mockIncidents';
import { Incident, FilterCategory, SortOption, IncidentStatus } from './types';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [viewMode, setViewMode] = useState<'library' | 'map'>('library');
  const [activeNavTab, setActiveNavTab] = useState<'dashboard' | 'incidents' | 'map' | 'about'>('dashboard');

  // Currently selected incident for Clean Minimalism side panel inspector
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(INITIAL_INCIDENTS[0]);
  // Incident for full modal inspector (optional deep inspect)
  const [detailModalIncident, setDetailModalIncident] = useState<Incident | null>(null);

  // Modals state
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Dynamic filter counts
  const filterCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      All: incidents.length,
      'High Severity': incidents.filter((i) => i.severity === 'HIGH').length,
      Medium: incidents.filter((i) => i.severity === 'MEDIUM').length,
      Low: incidents.filter((i) => i.severity === 'LOW').length,
      Active: incidents.filter((i) => i.status !== 'Resolved').length,
      'Needs Review': incidents.filter((i) => i.status === 'Reported' || i.status === 'Under Review').length,
      Resolved: incidents.filter((i) => i.status === 'Resolved').length
    };
    return counts;
  }, [incidents]);

  const urgentCount = useMemo(() => {
    return incidents.filter((i) => i.urgency === 'URGENT' && i.status !== 'Resolved').length;
  }, [incidents]);

  // Filtered & Sorted Incidents
  const displayedIncidents = useMemo(() => {
    return incidents
      .filter((incident) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = incident.title.toLowerCase().includes(q);
          const matchLocation = incident.location.barangay.toLowerCase().includes(q) || 
                                incident.location.name.toLowerCase().includes(q) || 
                                incident.location.city.toLowerCase().includes(q);
          const matchSummary = incident.summary.toLowerCase().includes(q);
          const matchType = incident.type.toLowerCase().includes(q);
          const matchCode = incident.reportCode.toLowerCase().includes(q);
          if (!matchTitle && !matchLocation && !matchSummary && !matchType && !matchCode) {
            return false;
          }
        }

        // Category filter
        switch (activeFilter) {
          case 'High Severity':
            return incident.severity === 'HIGH';
          case 'Medium':
            return incident.severity === 'MEDIUM';
          case 'Low':
            return incident.severity === 'LOW';
          case 'Active':
            return incident.status !== 'Resolved';
          case 'Needs Review':
            return incident.status === 'Reported' || incident.status === 'Under Review';
          case 'Resolved':
            return incident.status === 'Resolved';
          case 'All':
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (sortBy === 'priority') {
          // Priority ranking: URGENT (1) -> NEEDS_ATTENTION (2) -> MONITOR (3) -> RESOLVED (4)
          const urgencyWeight: Record<string, number> = {
            URGENT: 1,
            NEEDS_ATTENTION: 2,
            MONITOR: 3,
            RESOLVED: 4
          };
          const weightDiff = (urgencyWeight[a.urgency] || 5) - (urgencyWeight[b.urgency] || 5);
          if (weightDiff !== 0) return weightDiff;
          return b.reportedTimestamp - a.reportedTimestamp;
        }

        if (sortBy === 'severity') {
          const severityWeight: Record<string, number> = {
            HIGH: 1,
            MEDIUM: 2,
            LOW: 3
          };
          const sevDiff = (severityWeight[a.severity] || 4) - (severityWeight[b.severity] || 4);
          if (sevDiff !== 0) return sevDiff;
          return b.reportedTimestamp - a.reportedTimestamp;
        }

        if (sortBy === 'recent') {
          return b.reportedTimestamp - a.reportedTimestamp;
        }

        if (sortBy === 'location') {
          return a.location.barangay.localeCompare(b.location.barangay);
        }

        return 0;
      });
  }, [incidents, searchQuery, activeFilter, sortBy]);

  // Operational Action Handlers
  const handleUpdateStatus = (incidentId: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const newUrgency = newStatus === 'Resolved' ? 'RESOLVED' : inc.urgency;
          const updatedTimeline = [
            ...inc.timeline,
            {
              id: `t-${Date.now()}`,
              time: 'Just now',
              title: `Status Changed to ${newStatus}`,
              description: `Incident status updated to ${newStatus}.`,
              author: 'Dispatcher Alpha',
              type: newStatus === 'Resolved' ? ('resolved' as const) : ('status_change' as const)
            }
          ];

          const updated = {
            ...inc,
            status: newStatus,
            urgency: newUrgency,
            timeline: updatedTimeline
          };

          if (selectedIncident?.id === incidentId) {
            setSelectedIncident(updated);
          }
          if (detailModalIncident?.id === incidentId) {
            setDetailModalIncident(updated);
          }
          return updated;
        }
        return inc;
      })
    );
  };

  const handleAssignUnit = (incidentId: string, unitName: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const assignedUnit = {
            id: `unit-${Date.now()}`,
            name: unitName,
            agency: 'Municipal Response Division',
            contact: '(063) 221-4444',
            status: 'En Route' as const,
            eta: '8 mins'
          };
          const updated = {
            ...inc,
            status: inc.status === 'Reported' ? ('Responding' as IncidentStatus) : inc.status,
            assignedUnit,
            timeline: [
              ...inc.timeline,
              {
                id: `t-${Date.now()}`,
                time: 'Just now',
                title: 'Team Assigned',
                description: `Dispatched ${unitName}.`,
                author: 'Dispatch Center',
                type: 'unit_assigned' as const
              }
            ]
          };
          if (selectedIncident?.id === incidentId) setSelectedIncident(updated);
          if (detailModalIncident?.id === incidentId) setDetailModalIncident(updated);
          return updated;
        }
        return inc;
      })
    );
  };

  const handleVerifyIncident = (incidentId: string) => {
    handleUpdateStatus(incidentId, 'Verified');
  };

  const handleAddNote = (incidentId: string, note: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const updated = {
            ...inc,
            timeline: [
              ...inc.timeline,
              {
                id: `t-${Date.now()}`,
                time: 'Just now',
                title: 'Responder Log',
                description: note,
                author: 'Responder Field Note',
                type: 'status_change' as const
              }
            ]
          };
          if (selectedIncident?.id === incidentId) setSelectedIncident(updated);
          if (detailModalIncident?.id === incidentId) setDetailModalIncident(updated);
          return updated;
        }
        return inc;
      })
    );
  };

  const handleNewReportSubmit = (newIncident: Incident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    setIsNewReportOpen(false);
    setSelectedIncident(newIncident);
  };

  const handleNavTabChange = (tab: 'dashboard' | 'incidents' | 'map' | 'about') => {
    setActiveNavTab(tab);
    if (tab === 'map') {
      setViewMode('map');
    } else if (tab === 'about') {
      setIsAboutOpen(true);
    } else {
      setViewMode('library');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#12304A] flex flex-col antialiased">
      {/* Clean Minimalism Navigation Bar */}
      <Navigation
        activeTab={activeNavTab}
        onTabChange={handleNavTabChange}
        onNewReport={() => setIsNewReportOpen(true)}
        totalActiveCount={filterCounts['Active']}
      />

      {/* Header with Search & Filters */}
      <header className="px-4 sm:px-8 py-6 shrink-0 max-w-[1600px] w-full mx-auto space-y-4">
        {/* Dashboard Title & View Mode Switch */}
        <DashboardHeader
          totalCount={incidents.length}
          urgentCount={urgentCount}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode);
            setActiveNavTab(mode === 'map' ? 'map' : 'dashboard');
          }}
        />

        {/* Search & Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterCounts={filterCounts}
        />
      </header>

      {/* Main Content Area: Side-by-Side Clean Minimalism Grid or Map */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 px-4 sm:px-8 pb-8 min-h-0 max-w-[1600px] w-full mx-auto">
        {viewMode === 'library' ? (
          <>
            {/* Left/Main: Responsive Incident Cards Grid */}
            <div className="flex-1 min-w-0">
              <IncidentLibrary
                incidents={displayedIncidents}
                onSelectIncident={(incident) => setSelectedIncident(incident)}
                selectedIncidentId={selectedIncident?.id}
                hasSidePanel={Boolean(selectedIncident)}
                onResetFilters={() => {
                  setSearchQuery('');
                  setActiveFilter('All');
                }}
              />
            </div>

            {/* Right: Clean Minimalism Incident Detail Aside View */}
            {selectedIncident && (
              <IncidentDetailAside
                incident={selectedIncident}
                onClose={() => setSelectedIncident(null)}
                onUpdateStatus={handleUpdateStatus}
                onAssignUnit={handleAssignUnit}
                onVerifyIncident={handleVerifyIncident}
                onViewOnMap={(incident) => {
                  setSelectedIncident(incident);
                  setViewMode('map');
                  setActiveNavTab('map');
                }}
              />
            )}
          </>
        ) : (
          /* Map View */
          <div className="flex-1 w-full min-w-0">
            <IncidentMap
              incidents={displayedIncidents}
              selectedIncident={selectedIncident}
              onSelectIncident={(incident) => setSelectedIncident(incident)}
              onOpenDetail={(incident) => setSelectedIncident(incident)}
            />
          </div>
        )}
      </main>

      {/* Modal Inspector (if explicitly triggered) */}
      {detailModalIncident && (
        <IncidentDetail
          incident={detailModalIncident}
          onClose={() => setDetailModalIncident(null)}
          onUpdateStatus={handleUpdateStatus}
          onAssignUnit={handleAssignUnit}
          onVerifyIncident={handleVerifyIncident}
          onViewOnMap={(incident) => {
            setSelectedIncident(incident);
            setViewMode('map');
            setActiveNavTab('map');
          }}
          onAddNote={handleAddNote}
        />
      )}

      {/* New Report Modal */}
      {isNewReportOpen && (
        <NewReportModal
          onClose={() => setIsNewReportOpen(false)}
          onSubmit={handleNewReportSubmit}
        />
      )}

      {/* About Platform Modal */}
      {isAboutOpen && (
        <AboutModal
          onClose={() => setIsAboutOpen(false)}
        />
      )}
    </div>
  );
}
