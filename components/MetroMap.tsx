import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getStationById, availableNetworks, MetroStation, MetroLine, metroNetworks } from '../lib/metroData';
import { calculateRoute, MetroRoute } from '../lib/routeCalculator';
import { useTranslation } from '../lib/translations';

interface MetroMapProps {
  language: 'en' | 'hi';
}

// Schematic 0°, 45°, 90° Layout Coordinates for All Stations
const schematicCoordinates: Record<string, { x: number; y: number }> = {
  // RED LINE
  'DLI_RED_RITHALA': { x: 80, y: 200 },
  'DLI_RED_ROHINI_W': { x: 130, y: 200 },
  'DLI_RED_ROHINI_E': { x: 180, y: 200 },
  'DLI_RED_PITAMPURA': { x: 230, y: 200 },
  'DLI_RED_KOHAT': { x: 280, y: 200 },
  'DLI_INTER_NSP': { x: 330, y: 200 }, // NSP (Interchange Pink)
  'DLI_RED_KESHAV': { x: 380, y: 200 },
  'DLI_INTER_INDERLOK': { x: 430, y: 200 }, // Inderlok (Interchange Green)
  'DLI_RED_SHASTRI': { x: 470, y: 200 },
  'DLI_RED_PRATAP': { x: 510, y: 200 },
  'DLI_RED_TIS_HAZARI': { x: 550, y: 200 },
  'DLI_INTER_KASHMERE': { x: 600, y: 200 }, // Kashmere Gate (Interchange Yellow, Violet)
  'DLI_RED_SHASTRI_PARK': { x: 660, y: 200 },
  'DLI_RED_SEELAMPUR': { x: 720, y: 200 },
  'DLI_INTER_WELCOME': { x: 780, y: 200 }, // Welcome (Interchange Pink)
  'DLI_RED_SHAHDARA': { x: 840, y: 200 },
  'DLI_RED_MANSAROVAR': { x: 900, y: 200 },
  'DLI_RED_JHILMIL': { x: 960, y: 200 },
  'DLI_RED_DILSHAD': { x: 1020, y: 200 },
  'DLI_RED_SHAHEED_NAGAR': { x: 1080, y: 200 },
  'DLI_RED_RAJ_BAGH': { x: 1140, y: 200 },
  'DLI_RED_MOHIT': { x: 1200, y: 200 },
  'DLI_RED_SHAHEED': { x: 1260, y: 200 },

  // YELLOW LINE
  'DLI_YEL_SAMAYPUR': { x: 600, y: 60 },
  'DLI_YEL_ROHINI18': { x: 600, y: 100 },
  'DLI_YEL_HAIDERPUR': { x: 600, y: 130 },
  'DLI_YEL_JAHANGIRPURI': { x: 600, y: 155 },
  'DLI_YEL_ADARSH': { x: 600, y: 175 },
  'DLI_INTER_AZADPUR': { x: 600, y: 185 },
  'DLI_YEL_MODEL_TOWN': { x: 600, y: 192 },
  'DLI_YEL_VISHWA': { x: 600, y: 196 },
  'DLI_YEL_GTB': { x: 600, y: 198 },
  'DLI_YEL_VISHWAVIDYALAYA': { x: 600, y: 199 },
  'DLI_YEL_CIVIL_LINES': { x: 600, y: 200 },
  'DLI_YEL_CHANDNI': { x: 600, y: 260 },
  'DLI_YEL_CHAWRI': { x: 600, y: 300 },
  'DLI_INTER_NEW_DELHI': { x: 600, y: 340 },
  'DLI_INTER_RAJIV_CHOWK': { x: 600, y: 400 }, // Rajiv Chowk (Interchange Blue)
  'DLI_YEL_PATEL': { x: 600, y: 440 },
  'DLI_INTER_CENTRAL_SEC': { x: 600, y: 480 }, // Central Secretariat (Interchange Violet)
  'DLI_YEL_UDYOG': { x: 600, y: 520 },
  'DLI_YEL_LOK_KALYAN': { x: 600, y: 550 },
  'DLI_YEL_JOR_BAGH': { x: 600, y: 580 },
  'DLI_INTER_INA': { x: 600, y: 620 }, // INA (Interchange Pink)
  'DLI_YEL_AIIMS': { x: 600, y: 660 },
  'DLI_YEL_GREEN_PARK': { x: 600, y: 700 },
  'DLI_INTER_HAUZ_KHAS': { x: 600, y: 740 }, // Hauz Khas (Interchange Magenta)
  'DLI_YEL_MALVIYA': { x: 600, y: 780 },
  'DLI_YEL_SAKET': { x: 600, y: 820 },
  'DLI_YEL_QUTAB': { x: 600, y: 860 },
  'DLI_YEL_CHHATARPUR': { x: 600, y: 900 },
  'DLI_YEL_SULTANPUR': { x: 600, y: 940 },
  'DLI_YEL_GHITORNI': { x: 600, y: 980 },
  'DLI_YEL_ARJAN': { x: 600, y: 1020 },
  'DLI_YEL_GURU_DRON': { x: 600, y: 1060 },
  'DLI_YEL_SIKANDERPUR': { x: 600, y: 1100 },
  'DLI_YEL_MG_ROAD': { x: 600, y: 1140 },
  'DLI_YEL_IFFCO': { x: 600, y: 1180 },
  'DLI_YEL_MILLENNIUM': { x: 600, y: 1220 },

  // BLUE LINE
  'DLI_BLU_DWARKA21': { x: 80, y: 400 },
  'DLI_BLU_DWARKA8': { x: 120, y: 400 },
  'DLI_BLU_DWARKA9': { x: 160, y: 400 },
  'DLI_BLU_DWARKA10': { x: 200, y: 400 },
  'DLI_BLU_DWARKA11': { x: 240, y: 400 },
  'DLI_BLU_DWARKA12': { x: 280, y: 400 },
  'DLI_BLU_DWARKA13': { x: 320, y: 400 },
  'DLI_BLU_DWARKA14': { x: 360, y: 400 },
  'DLI_BLU_DWARKA': { x: 400, y: 400 },
  'DLI_INTER_JANAKPURI_W': { x: 440, y: 400 }, // Janakpuri W (Interchange Magenta)
  'DLI_BLU_UTTAM_W': { x: 470, y: 400 },
  'DLI_BLU_UTTAM_E': { x: 500, y: 400 },
  'DLI_BLU_TILAK': { x: 530, y: 400 },
  'DLI_BLU_SUBHASH': { x: 560, y: 400 },
  'DLI_INTER_RAMAKRISHNA': { x: 580, y: 400 },
  'DLI_BLU_SHIVAJI': { x: 590, y: 400 },
  'DLI_INTER_MANDI_HOUSE': { x: 680, y: 400 }, // Mandi House (Interchange Violet)
  'DLI_BLU_SUPREME': { x: 730, y: 400 },
  'DLI_BLU_INDRAPRASTHA': { x: 780, y: 400 },
  'DLI_INTER_YAMUNA_BANK': { x: 830, y: 400 },
  'DLI_BLU_AKSHARDHAM': { x: 880, y: 400 },
  'DLI_INTER_MAYUR_VIHAR1': { x: 930, y: 400 }, // Mayur Vihar-1 (Interchange Pink)
  'DLI_BLU_MAYUR_EXT': { x: 970, y: 400 },
  'DLI_BLU_NEW_ASHOK': { x: 1010, y: 400 },
  'DLI_BLU_NOIDA15': { x: 1050, y: 400 },
  'DLI_BLU_NOIDA16': { x: 1090, y: 400 },
  'DLI_BLU_NOIDA18': { x: 1130, y: 400 },
  'DLI_INTER_BOTANICAL': { x: 1170, y: 400 }, // Botanical Garden (Interchange Magenta)
  'DLI_BLU_GOLF': { x: 1210, y: 400 },
  'DLI_BLU_NOIDA_CC': { x: 1250, y: 400 },
  'DLI_BLU_NOIDA34': { x: 1290, y: 400 },
  'DLI_INTER_NOIDA52': { x: 1330, y: 400 }, // Sec 52 (Interchange Aqua Sec 51)
  'DLI_BLU_NOIDA61': { x: 1370, y: 400 },
  'DLI_BLU_NOIDA59': { x: 1410, y: 400 },
  'DLI_BLU_NOIDA62': { x: 1450, y: 400 },
  'DLI_BLU_NOIDA_E_CITY': { x: 1490, y: 400 },

  // NOIDA METRO AQUA LINE
  'NMRC_AQ_N51': { x: 1330, y: 470 }, // Sec 51 (Walking Transfer DMRC Sec 52)
  'NMRC_AQ_N50': { x: 1330, y: 510 },
  'NMRC_AQ_N76': { x: 1330, y: 550 },
  'NMRC_AQ_N101': { x: 1330, y: 590 },
  'NMRC_AQ_N81': { x: 1330, y: 630 },
  'NMRC_AQ_NSEZ': { x: 1330, y: 670 },
  'NMRC_AQ_N83': { x: 1330, y: 710 },
  'NMRC_AQ_N137': { x: 1330, y: 750 },
  'NMRC_AQ_N142': { x: 1330, y: 790 },
  'NMRC_AQ_N143': { x: 1330, y: 830 },
  'NMRC_AQ_N144': { x: 1330, y: 870 },
  'NMRC_AQ_N145': { x: 1330, y: 910 },
  'NMRC_AQ_N146': { x: 1330, y: 950 },
  'NMRC_AQ_N147': { x: 1330, y: 990 },
  'NMRC_AQ_N148': { x: 1330, y: 1030 },
  'NMRC_AQ_KP2': { x: 1330, y: 1070 },
  'NMRC_AQ_PARI': { x: 1330, y: 1110 },
  'NMRC_AQ_ALPHA1': { x: 1330, y: 1150 },
  'NMRC_AQ_DELTA1': { x: 1330, y: 1190 },
  'NMRC_AQ_GNIDA': { x: 1330, y: 1230 },
  'NMRC_AQ_DEPOT': { x: 1330, y: 1270 },

  // PINK LINE
  'DLI_INTER_LAJPAT': { x: 760, y: 620 }, // Lajpat Nagar (Interchange Violet)
  'DLI_PNK_HAZRAT': { x: 830, y: 560 },
  'DLI_PNK_ASHRAM': { x: 805, y: 580 },
  'DLI_PNK_VINOBAPURI': { x: 780, y: 600 },
  'DLI_PNK_SOUTH_EXT': { x: 680, y: 620 },
};

// Fallback grid projection generator for missing coordinate keys
const getStationCoords = (station: MetroStation, idx: number, total: number) => {
  if (schematicCoordinates[station.id]) {
    return schematicCoordinates[station.id];
  }
  // Default grid alignment based on index
  if (station.network === 'Noida Metro') {
    return { x: 1330, y: 470 + idx * 40 };
  }
  return { x: 200 + (idx % 20) * 50, y: 250 + Math.floor(idx / 20) * 80 };
};

export default function MetroMap({ language }: MetroMapProps) {
  const router = useRouter();
  const t = useTranslation(language);

  // Filter States
  const [selectedNetwork, setSelectedNetwork] = useState('Delhi Metro');
  const [routeMode, setRouteMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MetroStation[]>([]);

  // Selection & Route States
  const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null);
  const [sourceStationId, setSourceStationId] = useState<string>('');
  const [destStationId, setDestStationId] = useState<string>('');
  const [activeRoute, setActiveRoute] = useState<MetroRoute | null>(null);

  // SVG Pan & Zoom States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: -280, y: -120 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  // Load all stations and lines
  const [stations, setStations] = useState<MetroStation[]>([]);
  const [lines, setLines] = useState<MetroLine[]>([]);

  useEffect(() => {
    let activeStations: MetroStation[] = [];
    let activeLines: MetroLine[] = [];

    if (selectedNetwork === 'All Metro Networks') {
      activeStations = [...(metroNetworks['Delhi']?.stations || []), ...(metroNetworks['Noida']?.stations || [])];
      activeLines = [...(metroNetworks['Delhi']?.lines || []), ...(metroNetworks['Noida']?.lines || [])];
    } else if (selectedNetwork === 'Noida Metro') {
      activeStations = metroNetworks['Noida']?.stations || [];
      activeLines = metroNetworks['Noida']?.lines || [];
    } else {
      activeStations = metroNetworks['Delhi']?.stations || [];
      activeLines = metroNetworks['Delhi']?.lines || [];
    }

    setStations(activeStations);
    setLines(activeLines);
  }, [selectedNetwork]);

  // Recalculate route when source/destination IDs change
  useEffect(() => {
    if (sourceStationId && destStationId && sourceStationId !== destStationId) {
      const route = calculateRoute('Delhi', sourceStationId, destStationId);
      setActiveRoute(route);
    } else {
      setActiveRoute(null);
    }
  }, [sourceStationId, destStationId]);

  // Handle Search Input
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = stations.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.line.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  }, [searchQuery, stations]);

  // Pan & Zoom controls
  const handleZoom = (type: 'in' | 'out' | 'reset' | 'fit') => {
    if (type === 'in') setZoom((z) => Math.min(z + 0.3, 3.5));
    else if (type === 'out') setZoom((z) => Math.max(z - 0.3, 0.5));
    else if (type === 'reset') {
      setZoom(1);
      setPan({ x: -280, y: -120 });
    } else if (type === 'fit') {
      setZoom(0.85);
      setPan({ x: -150, y: -50 });
    }
  };

  const focusStation = (station: MetroStation) => {
    const coords = getStationCoords(station, 0, 1);
    setZoom(1.8);
    setPan({
      x: 450 - coords.x * 1.8,
      y: 300 - coords.y * 1.8,
    });
    setSelectedStation(station);
    setSearchQuery('');
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Check if a station/line is part of the active route
  const isStationInRoute = (stationId: string) => {
    if (!activeRoute) return true;
    return activeRoute.stops.some((s) => s.stationId === stationId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls Header */}
      <div
        className="card"
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          border: '2px solid rgba(0, 87, 184, 0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--metro-navy)' }}>
              🗺️ Metro Maps & Transit Network
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--metro-text-subtle)', marginTop: '2px' }}>
              Explore schematic metro networks across India with dynamic route highlighting
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className={routeMode ? 'btn-primary' : 'btn-outline'}
              onClick={() => setRouteMode(!routeMode)}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              {routeMode ? '✕ Exit Route Mode' : '🗺️ Plan Route Mode'}
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
          {/* Network Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '4px' }}>
              Metro Network:
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              style={{ margin: 0, padding: '10px' }}
            >
              <option value="Delhi Metro">Delhi Metro (DMRC)</option>
              <option value="Noida Metro">Noida Metro (NMRC Aqua Line)</option>
              <option value="All Metro Networks">All Metro Networks</option>
            </select>
          </div>

          {/* Station Search */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '4px' }}>
              Search Station:
            </label>
            <input
              type="text"
              placeholder="Search station e.g. Rajiv Chowk, Noida Sector 51..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ margin: 0, padding: '10px' }}
            />
            {searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid var(--metro-card-border)',
                  borderRadius: '10px',
                  zIndex: 100,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.15)',
                  marginTop: '4px',
                }}
              >
                {searchResults.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => focusStation(st)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      borderBottom: '1px solid var(--metro-card-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--metro-navy)' }}>{st.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)' }}>{st.network} • {st.line}</div>
                    </div>
                    <span className="metro-line-badge" style={{ backgroundColor: st.lineColor || 'var(--metro-blue)', fontSize: '0.7rem' }}>
                      {st.line}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Route Mode Inputs */}
          {routeMode && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '4px' }}>
                  From Station:
                </label>
                <select
                  value={sourceStationId}
                  onChange={(e) => setSourceStationId(e.target.value)}
                  style={{ margin: 0, padding: '10px' }}
                >
                  <option value="">Select Origin</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.line})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '4px' }}>
                  To Station:
                </label>
                <select
                  value={destStationId}
                  onChange={(e) => setDestStationId(e.target.value)}
                  style={{ margin: 0, padding: '10px' }}
                >
                  <option value="">Select Destination</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.line})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SVG Canvas Map Box */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '560px',
          borderRadius: '18px',
          overflow: 'hidden',
          border: '2px solid var(--metro-card-border)',
          background: '#FAFAFA',
          boxShadow: '0 8px 24px rgba(11, 31, 58, 0.08)',
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 900 560"
          style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Subtle Transit Grid Background Pattern */}
          <defs>
            <pattern id="schematicGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 87, 184, 0.04)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#schematicGrid)" />

          {/* Pan & Zoom Transform Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Render Line Paths */}
            {lines.map((line) => {
              const lineStations = line.stations
                .map((id) => stations.find((s) => s.id === id))
                .filter((s): s is MetroStation => !!s);

              if (lineStations.length < 2) return null;

              // Compute path data
              let d = '';
              lineStations.forEach((st, idx) => {
                const coords = getStationCoords(st, idx, lineStations.length);
                if (idx === 0) d += `M ${coords.x} ${coords.y}`;
                else d += ` L ${coords.x} ${coords.y}`;
              });

              const isLineActiveInRoute = activeRoute
                ? lineStations.some((st) => activeRoute.stops.some((rSt) => rSt.stationId === st.id))
                : true;

              return (
                <path
                  key={line.id}
                  d={d}
                  fill="none"
                  stroke={line.color || '#0057B8'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={activeRoute ? (isLineActiveInRoute ? 1 : 0.2) : 1}
                  style={{ transition: 'opacity 0.3s ease' }}
                />
              );
            })}

            {/* Render Walking Transfer Link between Noida Sec 51 (Aqua) & Sec 52 (Blue) */}
            {(() => {
              const st51 = stations.find((s) => s.id === 'NMRC_AQ_N51');
              const st52 = stations.find((s) => s.id === 'DLI_INTER_NOIDA52');
              if (st51 && st52) {
                const p1 = getStationCoords(st51, 0, 1);
                const p2 = getStationCoords(st52, 0, 1);
                return (
                  <g key="walking_link_sec51_52">
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#F59E0B" strokeWidth="4" strokeDasharray="5 5" />
                    <rect x={(p1.x + p2.x) / 2 - 40} y={(p1.y + p2.y) / 2 - 12} width="80" height="18" rx="4" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1" />
                    <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2} fontSize="9" fontWeight="800" fill="#92400E" textAnchor="middle">
                      🚶 300m Walk
                    </text>
                  </g>
                );
              }
              return null;
            })()}

            {/* Render Station Nodes */}
            {stations.map((st, idx) => {
              const coords = getStationCoords(st, idx, stations.length);
              const isSelected = selectedStation?.id === st.id;
              const isRouteActive = isStationInRoute(st.id);
              const isImportantInterchange = st.isInterchange;

              // Hide labels at zoom level 1 unless searched, selected, route active, or important interchange
              const showLabel = zoom > 1.3 || isSelected || (activeRoute && isRouteActive) || isImportantInterchange || searchQuery.length > 0;

              return (
                <g
                  key={st.id}
                  style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
                  opacity={activeRoute ? (isRouteActive ? 1 : 0.25) : 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStation(st);
                  }}
                >
                  {/* Selection Highlight Aura */}
                  {isSelected && (
                    <circle cx={coords.x} cy={coords.y} r="16" fill="var(--metro-blue)" fillOpacity="0.3" stroke="var(--metro-blue)" strokeWidth="2" />
                  )}

                  {/* Node Symbol */}
                  {st.isInterchange ? (
                    <g>
                      <circle cx={coords.x} cy={coords.y} r="8" fill="#FFFFFF" stroke="var(--metro-navy)" strokeWidth="3" />
                      <circle cx={coords.x} cy={coords.y} r="4" fill="#7F00FF" />
                    </g>
                  ) : (
                    <circle cx={coords.x} cy={coords.y} r="5" fill="#FFFFFF" stroke={st.lineColor || '#0057B8'} strokeWidth="2.5" />
                  )}

                  {/* Station Name Label */}
                  {showLabel && (
                    <g>
                      <text
                        x={coords.x + 9}
                        y={coords.y + (idx % 2 === 0 ? -6 : 10)}
                        fontSize="9.5"
                        fontWeight={st.isInterchange || isSelected ? 800 : 600}
                        fill={isSelected ? 'var(--metro-blue)' : 'var(--metro-navy)'}
                        style={{
                          paintOrder: 'stroke',
                          stroke: '#FFFFFF',
                          strokeWidth: '3px',
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                        }}
                      >
                        {st.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Zoom & Control Buttons */}
        <div style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleZoom('in')}
            title="Zoom In"
            style={{ width: '40px', height: '40px', padding: 0, fontSize: '1.2rem' }}
          >
            ＋
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleZoom('out')}
            title="Zoom Out"
            style={{ width: '40px', height: '40px', padding: 0, fontSize: '1.2rem' }}
          >
            －
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleZoom('fit')}
            title="Fit Network"
            style={{ padding: '6px 10px', fontSize: '0.78rem', backgroundColor: 'var(--metro-navy)', color: '#FFFFFF' }}
          >
            Fit Network
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => handleZoom('reset')}
            title="Reset View"
            style={{ padding: '6px 10px', fontSize: '0.78rem', backgroundColor: '#FFFFFF' }}
          >
            Reset
          </button>
        </div>

        {/* Clean Map Legend */}
        <div
          style={{
            position: 'absolute',
            left: '16px',
            bottom: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(6px)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--metro-card-border)',
            boxShadow: '0 4px 12px rgba(11, 31, 58, 0.1)',
            fontSize: '0.78rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Map Legend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #0057B8', background: '#FFFFFF' }} />
            <span>Normal Station Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', border: '2.5px solid #0B1F3A', background: '#7F00FF' }} />
            <span style={{ fontWeight: 700 }}>Interchange Station</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #00A8E8', background: '#FFFFFF' }} />
            <span>NMRC Aqua Line (#00A8E8)</span>
          </div>
        </div>
      </div>

      {/* Selected Station Info Drawer */}
      {selectedStation && (
        <div
          className="card"
          style={{
            borderLeft: `6px solid ${selectedStation.lineColor || 'var(--metro-blue)'}`,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="metro-line-badge" style={{ backgroundColor: selectedStation.lineColor || 'var(--metro-blue)' }}>
                  {selectedStation.network} • {selectedStation.line}
                </span>
                {selectedStation.isInterchange && (
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#F3E8FF', color: '#6B21A8', fontWeight: 800 }}>
                    ⚡ Interchange Station
                  </span>
                )}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--metro-navy)', fontWeight: 800 }}>
                {selectedStation.name} ({selectedStation.code})
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--metro-text-muted)', marginTop: '4px' }}>
                Network: <strong>{selectedStation.network}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStation(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--metro-text-subtle)' }}
            >
              ✕
            </button>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', background: 'var(--metro-light-bg)', padding: '14px', borderRadius: '10px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)', display: 'block' }}>CONNECTED LINES</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--metro-navy)' }}>
                {selectedStation.interchangeLines && selectedStation.interchangeLines.length > 0
                  ? [selectedStation.line, ...selectedStation.interchangeLines].join(', ')
                  : selectedStation.line}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)', display: 'block' }}>PLATFORMS</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--metro-navy)' }}>
                {selectedStation.platformNumbers ? selectedStation.platformNumbers.join(', ') : 'Platform information unavailable'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)', display: 'block' }}>ENTRY / EXIT GATES</span>
              <strong style={{ fontSize: '0.88rem', color: 'var(--metro-navy)' }}>
                {selectedStation.entryGates ? selectedStation.entryGates.join(', ') : 'Gate information unavailable'}
              </strong>
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setSourceStationId(selectedStation.id);
                setRouteMode(true);
              }}
              style={{ flex: 1 }}
            >
              Set as From 🚉
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setDestStationId(selectedStation.id);
                setRouteMode(true);
              }}
              style={{ flex: 1 }}
            >
              Set as To 🎯
            </button>
            {sourceStationId && destStationId && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => router.push(`/journey?src=${sourceStationId}&dest=${destStationId}`)}
                style={{ flex: 1 }}
              >
                Go to Journey Planner ➔
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
