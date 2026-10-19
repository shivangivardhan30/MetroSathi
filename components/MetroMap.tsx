import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getStationById, availableNetworks, MetroStation, MetroLine, metroNetworks } from '../lib/metroData';
import { calculateRoute, MetroRoute } from '../lib/routeCalculator';
import { useTranslation } from '../lib/translations';

interface MetroMapProps {
  language: 'en' | 'hi';
}

// -------------------------------------------------------------
// PRECISE SCHEMATIC TRANSIT COORDINATES (0°, 45°, 90°)
// Cleanly spaced, zero random fallback, geometrically aligned
// -------------------------------------------------------------
const schematicCoordinates: Record<string, { x: number; y: number }> = {
  // === YELLOW LINE (Vertical central spine x = 650) ===
  'DLI_YEL_ROHINI18': { x: 650, y: 70 },
  'DLI_YEL_ADARSH': { x: 650, y: 120 },
  'DLI_INTER_AZADPUR': { x: 650, y: 170 }, // Interchange Pink
  'DLI_YEL_VISHWA': { x: 650, y: 220 },
  'DLI_INTER_KASHMERE': { x: 650, y: 280 }, // Interchange Red & Violet
  'DLI_YEL_CHANDNI': { x: 650, y: 345 },
  'DLI_YEL_CHAWRI': { x: 650, y: 410 },
  'DLI_INTER_RAJIV': { x: 650, y: 480 }, // Rajiv Chowk (Central Hub: Blue, Yellow, Airport)
  'DLI_YEL_PATEL': { x: 650, y: 545 },
  'DLI_INTER_CENTRAL': { x: 650, y: 610 }, // Interchange Violet
  'DLI_INTER_INA': { x: 650, y: 675 }, // Interchange Pink
  'DLI_YEL_AIIMS': { x: 650, y: 735 },
  'DLI_INTER_HAUZ_KHAS': { x: 650, y: 795 }, // Interchange Magenta
  'DLI_YEL_SAKET': { x: 650, y: 855 },
  'DLI_YEL_QUTAB': { x: 650, y: 915 },
  'DLI_YEL_CHHATTARPUR': { x: 650, y: 975 },
  'DLI_YEL_ARJAN': { x: 650, y: 1035 },
  'DLI_INTER_SIKANDARPUR': { x: 650, y: 1095 }, // Interchange Rapid Metro
  'DLI_YEL_HUDA': { x: 650, y: 1155 }, // Millennium City Centre Gurugram

  // === RED LINE (Horizontal northern corridor y = 280) ===
  'DLI_RED_PITAMPURA': { x: 120, y: 280 },
  'DLI_RED_KOHAT': { x: 180, y: 280 },
  'DLI_INTER_NSP': { x: 240, y: 280 }, // Netaji Subhash Place (Interchange Pink)
  'DLI_RED_KESHAV': { x: 310, y: 280 },
  'DLI_INTER_INDERLOK': { x: 380, y: 280 }, // Inderlok (Interchange Green)
  'DLI_RED_SHASTRI': { x: 450, y: 280 },
  'DLI_RED_PRATAP': { x: 520, y: 280 },
  'DLI_RED_TIS_HAZARI': { x: 585, y: 280 },
  // Kashmere Gate at (650, 280)
  'DLI_INTER_WELCOME': { x: 780, y: 280 }, // Welcome (Interchange Pink)
  'DLI_RED_JHILMIL': { x: 850, y: 280 },
  'DLI_RED_MANSAROVAR': { x: 920, y: 280 },
  'DLI_RED_RAJ_BAGH': { x: 990, y: 280 },
  'DLI_RED_MOHIT': { x: 1060, y: 280 },
  'DLI_RED_SHAHEED': { x: 1130, y: 280 },

  // === BLUE LINE (East-West mainline through Rajiv Chowk to Noida) ===
  'DLI_INTER_DWARKA21': { x: 50, y: 480 }, // Dwarka Sec 21 (Interchange Airport)
  'DLI_BLU_DWARKA8': { x: 90, y: 480 },
  'DLI_BLU_DWARKA9': { x: 130, y: 480 },
  'DLI_BLU_DWARKA14': { x: 170, y: 480 },
  'DLI_BLU_DWARKAMOR': { x: 210, y: 480 },
  'DLI_BLU_UTTAM': { x: 250, y: 480 },
  'DLI_INTER_JANAKPURI': { x: 300, y: 480 }, // Janakpuri West (Interchange Magenta)
  'DLI_INTER_RAJOURI': { x: 365, y: 480 }, // Rajouri Garden (Interchange Pink)
  'DLI_BLU_SUBHASH': { x: 415, y: 480 },
  'DLI_BLU_MOTINAGAR': { x: 465, y: 480 },
  'DLI_INTER_KIRTINAGAR': { x: 515, y: 480 }, // Kirti Nagar (Interchange Green)
  'DLI_BLU_RAJENDRA': { x: 555, y: 480 },
  'DLI_BLU_JHANDEWALAN': { x: 585, y: 480 },
  'DLI_BLU_RKASHRAM': { x: 615, y: 480 },
  // Rajiv Chowk at (650, 480)
  'DLI_BLU_BARAKHAMBA': { x: 710, y: 480 },
  'DLI_INTER_MANDIHOUSE': { x: 770, y: 480 }, // Mandi House (Interchange Violet)
  'DLI_INTER_MAYUR1': { x: 860, y: 520 }, // Mayur Vihar-1 (Interchange Pink)
  'DLI_BLU_MAYUREXT': { x: 910, y: 535 },
  'DLI_BLU_NEWASHOK': { x: 955, y: 545 },
  'DLI_BLU_NOIDA15': { x: 1000, y: 555 },
  'DLI_BLU_NOIDA16': { x: 1045, y: 565 },
  'DLI_BLU_NOIDA18': { x: 1090, y: 575 },
  'DLI_INTER_BOTANICAL': { x: 1140, y: 585 }, // Botanical Garden (Interchange Magenta)
  'DLI_BLU_GOLFCOURSE': { x: 1190, y: 585 },
  'DLI_BLU_NOIDACITY': { x: 1240, y: 585 },
  'DLI_BLU_NOIDA34': { x: 1290, y: 585 },
  'DLI_INTER_NOIDA52': { x: 1340, y: 585 }, // Noida Sec 52 (Transfer to Aqua Line)
  'DLI_BLU_NOIDA61': { x: 1395, y: 585 },
  'DLI_BLU_NOIDA59': { x: 1445, y: 585 },
  'DLI_BLU_NOIDA62': { x: 1495, y: 585 },

  // === NOIDA METRO AQUA LINE (NMRC) ===
  'NMRC_AQ_N51': { x: 1340, y: 640 }, // Sec 51 (Walking Transfer to DMRC Sec 52)
  'NMRC_AQ_N50': { x: 1340, y: 675 },
  'NMRC_AQ_N76': { x: 1340, y: 705 },
  'NMRC_AQ_N101': { x: 1340, y: 735 },
  'NMRC_AQ_N81': { x: 1340, y: 765 },
  'NMRC_AQ_NSEZ': { x: 1340, y: 795 },
  'NMRC_AQ_N83': { x: 1340, y: 825 },
  'NMRC_AQ_N137': { x: 1340, y: 855 },
  'NMRC_AQ_N142': { x: 1340, y: 885 },
  'NMRC_AQ_N143': { x: 1340, y: 915 },
  'NMRC_AQ_N144': { x: 1340, y: 945 },
  'NMRC_AQ_N145': { x: 1340, y: 975 },
  'NMRC_AQ_N146': { x: 1340, y: 1005 },
  'NMRC_AQ_N147': { x: 1340, y: 1035 },
  'NMRC_AQ_N148': { x: 1340, y: 1065 },
  'NMRC_AQ_KP2': { x: 1340, y: 1095 },
  'NMRC_AQ_PARICHOWK': { x: 1340, y: 1125 }, // Pari Chowk
  'NMRC_AQ_ALPHA1': { x: 1340, y: 1155 },
  'NMRC_AQ_DELTA1': { x: 1340, y: 1185 },
  'NMRC_AQ_GNIDA': { x: 1340, y: 1215 },
  'NMRC_AQ_DEPOT': { x: 1340, y: 1245 },

  // === VIOLET LINE (South corridor Kashmere Gate -> Faridabad) ===
  // DLI_INTER_KASHMERE: (650, 280)
  // DLI_INTER_MANDIHOUSE: (770, 480)
  'DLI_VIO_JANPATH': { x: 715, y: 550 },
  // DLI_INTER_CENTRAL: (650, 610)
  'DLI_VIO_JANGPURA': { x: 720, y: 650 },
  'DLI_VIO_JN_STADIUM': { x: 755, y: 680 },
  'DLI_INTER_LAJPAT': { x: 790, y: 710 }, // Lajpat Nagar (Interchange Pink)
  'DLI_VIO_MOOLCHAND': { x: 820, y: 750 },
  'DLI_VIO_OKHLA': { x: 845, y: 800 },
  'DLI_VIO_SARITAVIHAR': { x: 865, y: 850 },
  'DLI_VIO_TUGHLAKABAD': { x: 885, y: 900 },
  'DLI_VIO_NHPC': { x: 905, y: 950 },
  'DLI_VIO_BADARPUR': { x: 925, y: 1000 },
  'DLI_VIO_FARIDABAD': { x: 945, y: 1050 },

  // === GREEN LINE (West Corridor Inderlok/Kirti Nagar -> Tikri) ===
  // DLI_INTER_INDERLOK: (380, 280)
  'DLI_GRE_ASHOKPARK': { x: 380, y: 350 },
  'DLI_GRE_SATGURU': { x: 445, y: 415 },
  // DLI_INTER_KIRTINAGAR: (515, 480)
  'DLI_GRE_PASCHIM': { x: 320, y: 350 },
  'DLI_GRE_NANGLOI': { x: 260, y: 350 },
  'DLI_GRE_MUNDKA': { x: 200, y: 350 },
  'DLI_GRE_MUNDKA_IND': { x: 150, y: 350 },
  'DLI_GRE_TIKRI': { x: 100, y: 350 },
  'DLI_GRE_SHREERAM': { x: 50, y: 350 },

  // === PINK LINE (Orbital Ring Line) ===
  'DLI_PNK_MAJLIS': { x: 530, y: 120 },
  // Azadpur at (650, 170)
  // NSP at (240, 280)
  // Rajouri Garden at (365, 480)
  'DLI_PNK_MAYAPURI': { x: 410, y: 560 },
  'DLI_PNK_BHIKAJI': { x: 490, y: 630 },
  // INA at (650, 675)
  'DLI_PNK_SOUTHEXT': { x: 720, y: 690 },
  // Lajpat Nagar at (790, 710)
  'DLI_PNK_VINOBAPURI': { x: 840, y: 675 },
  'DLI_PNK_ASHRAM': { x: 860, y: 625 },
  'DLI_PNK_NIZAMUDDIN': { x: 860, y: 575 },
  // Mayur Vihar-1 at (860, 520)
  'DLI_PNK_MAYURPK1': { x: 860, y: 440 },
  // Welcome at (780, 280)
  'DLI_PNK_KARKARDUMA': { x: 840, y: 220 },
  'DLI_PNK_SHIVVIHAR': { x: 880, y: 170 },

  // === MAGENTA LINE (Southern Cross-Link Janakpuri W -> Botanical Garden) ===
  // Janakpuri West at (300, 480)
  'DLI_MAG_MUNIRKA': { x: 480, y: 765 },
  'DLI_MAG_IIT': { x: 565, y: 780 },
  // Hauz Khas at (650, 795)
  'DLI_MAG_OKHLANSIC': { x: 845, y: 760 },
  'DLI_MAG_JAMIA': { x: 990, y: 690 },
  // Botanical Garden at (1140, 585)

  // === AIRPORT EXPRESS (Orange High-Speed Line) ===
  // Rajiv Chowk at (650, 480)
  'DLI_ORG_IGI': { x: 200, y: 530 },
  // Dwarka Sec 21 at (50, 480)

  // === GURGAON RAPID METRO ===
  // Sikandarpur at (650, 1095)
  'DLI_RM_DLF3': { x: 740, y: 1095 }
};

// Major landmark interchange stations that always show readable badge labels
const prominentStationIds = new Set([
  'DLI_INTER_RAJIV',
  'DLI_INTER_KASHMERE',
  'DLI_INTER_MANDIHOUSE',
  'DLI_INTER_CENTRAL',
  'DLI_INTER_INA',
  'DLI_INTER_HAUZ_KHAS',
  'DLI_INTER_LAJPAT',
  'DLI_INTER_MAYUR1',
  'DLI_INTER_BOTANICAL',
  'DLI_INTER_NOIDA52',
  'NMRC_AQ_N51',
  'NMRC_AQ_PARICHOWK',
  'DLI_INTER_JANAKPURI',
  'DLI_INTER_RAJOURI',
  'DLI_INTER_KIRTINAGAR',
  'DLI_INTER_INDERLOK',
  'DLI_INTER_NSP',
  'DLI_INTER_AZADPUR',
  'DLI_INTER_WELCOME',
  'DLI_INTER_DWARKA21',
  'DLI_YEL_HUDA',
  'DLI_RED_SHAHEED'
]);

export default function MetroMap({ language }: MetroMapProps) {
  const router = useRouter();
  const t = useTranslation(language);

  // States
  const [selectedNetwork, setSelectedNetwork] = useState('All Metro Networks');
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('ALL');
  const [routeMode, setRouteMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MetroStation[]>([]);

  // Selection & Route States
  const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null);
  const [hoveredStation, setHoveredStation] = useState<MetroStation | null>(null);
  const [sourceStationId, setSourceStationId] = useState<string>('');
  const [destStationId, setDestStationId] = useState<string>('');
  const [activeRoute, setActiveRoute] = useState<MetroRoute | null>(null);

  // Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement>(null);

  // Data sets
  const [stations, setStations] = useState<MetroStation[]>([]);
  const [lines, setLines] = useState<MetroLine[]>([]);

  // Load networks based on filter
  useEffect(() => {
    let activeStations: MetroStation[] = [];
    let activeLines: MetroLine[] = [];

    if (selectedNetwork === 'Noida Metro') {
      activeStations = metroNetworks['Noida']?.stations || [];
      activeLines = metroNetworks['Noida']?.lines || [];
      // Focus on Noida
      setZoom(1.3);
      setPan({ x: -450, y: -250 });
    } else if (selectedNetwork === 'Delhi Metro') {
      activeStations = metroNetworks['Delhi']?.stations || [];
      activeLines = metroNetworks['Delhi']?.lines || [];
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      activeStations = [
        ...(metroNetworks['Delhi']?.stations || []),
        ...(metroNetworks['Noida']?.stations || [])
      ];
      activeLines = [
        ...(metroNetworks['Delhi']?.lines || []),
        ...(metroNetworks['Noida']?.lines || [])
      ];
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }

    setStations(activeStations);
    setLines(activeLines);
    setSelectedLineFilter('ALL');
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
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = stations.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.line.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  }, [searchQuery, stations]);

  // Pan & Zoom controls
  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (type === 'in') setZoom((z) => Math.min(z + 0.3, 3.5));
    else if (type === 'out') setZoom((z) => Math.max(z - 0.3, 0.6));
    else if (type === 'reset') {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setSelectedStation(null);
      setSelectedLineFilter('ALL');
    }
  };

  const focusStation = (station: MetroStation) => {
    const coords = schematicCoordinates[station.id];
    if (coords) {
      setZoom(1.8);
      setPan({
        x: 450 - coords.x * 1.8,
        y: 280 - coords.y * 1.8
      });
    }
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
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((z) => Math.min(Math.max(z * zoomFactor, 0.6), 3.5));
  };

  // Check if station or line is active in route
  const isStationInRoute = (stationId: string) => {
    if (!activeRoute) return true;
    return activeRoute.stops.some((s) => s.stationId === stationId);
  };

  const isLineHighlighted = (line: MetroLine) => {
    if (selectedLineFilter !== 'ALL' && line.name !== selectedLineFilter) {
      return false;
    }
    if (activeRoute) {
      return line.stations.some((stId) => activeRoute.stops.some((r) => r.stationId === stId));
    }
    return true;
  };

  // Line filter pills list
  const filterLines = [
    { label: language === 'en' ? 'All Lines' : 'सभी लाइनें', value: 'ALL', color: 'var(--metro-navy)' },
    { label: language === 'en' ? 'Blue Line' : 'ब्लू लाइन', value: 'Blue Line', color: '#0066CC' },
    { label: language === 'en' ? 'Yellow Line' : 'येलो लाइन', value: 'Yellow Line', color: '#F59E0B' },
    { label: language === 'en' ? 'Red Line' : 'रेड लाइन', value: 'Red Line', color: '#DC241F' },
    { label: language === 'en' ? 'Pink Line' : 'पिंक लाइन', value: 'Pink Line', color: '#EC4899' },
    { label: language === 'en' ? 'Violet Line' : 'वायलेट लाइन', value: 'Violet Line', color: '#7F00FF' },
    { label: language === 'en' ? 'Aqua Line (Noida)' : 'एक्वा लाइन (नोएडा)', value: 'Aqua Line', color: '#00A8E8' },
    { label: language === 'en' ? 'Green Line' : 'ग्रीन लाइन', value: 'Green Line', color: '#10B981' },
    { label: language === 'en' ? 'Magenta Line' : 'मजेंटा लाइन', value: 'Magenta Line', color: '#C026D3' },
    { label: language === 'en' ? 'Airport Express' : 'एयरपोर्ट एक्सप्रेस', value: 'Airport Express', color: '#F97316' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Header Toolbar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          border: '2px solid rgba(0, 87, 184, 0.2)',
          boxShadow: '0 4px 16px rgba(11, 31, 58, 0.06)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--metro-navy)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🗺️</span> {language === 'en' ? 'Interactive Schematic Metro Map' : 'इंटरैक्टिव योजनाबद्ध मेट्रो मानचित्र'}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--metro-text-subtle)', marginTop: '2px' }}>
              {language === 'en'
                ? 'High-contrast transit network diagram with line isolation and route highlighting'
                : 'लाइन पृथक्करण और मार्ग हाइलाइटिंग के साथ उच्च-कंट्रास्ट मेट्रो नेटवर्क'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              className={routeMode ? 'btn-primary' : 'btn-outline'}
              onClick={() => setRouteMode(!routeMode)}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              {routeMode
                ? (language === 'en' ? '✕ Exit Route Mode' : '✕ रूट मोड बंद करें')
                : (language === 'en' ? '📍 Plan Route on Map' : '📍 मानचित्र पर मार्ग खोजें')}
            </button>
          </div>
        </div>

        {/* Search & Network Selector Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '4px' }}>
              {language === 'en' ? 'Select Metro Network:' : 'मेट्रो नेटवर्क चुनें:'}
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              style={{ margin: 0, padding: '10px', fontWeight: 700 }}
            >
              <option value="All Metro Networks">{language === 'en' ? 'All Metro Networks (Delhi NCR + Noida)' : 'सभी मेट्रो नेटवर्क'}</option>
              <option value="Delhi Metro">Delhi Metro (DMRC)</option>
              <option value="Noida Metro">Noida Metro (NMRC Aqua Line)</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '4px' }}>
              {language === 'en' ? 'Search Station on Map:' : 'मानचित्र पर स्टेशन खोजें:'}
            </label>
            <input
              type="text"
              placeholder={language === 'en' ? 'Search e.g. Rajiv Chowk, Noida Sector 51, Lajpat Nagar...' : 'उदा., राजीव चौक, नोएडा सेक्टर 51...'}
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
                  maxHeight: '220px',
                  overflowY: 'auto',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
                  marginTop: '4px'
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
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--metro-light-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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

          {/* Route Mode Selectors */}
          {routeMode && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '4px' }}>
                  {language === 'en' ? 'From Station:' : 'स्रोत स्टेशन:'}
                </label>
                <select
                  value={sourceStationId}
                  onChange={(e) => setSourceStationId(e.target.value)}
                  style={{ margin: 0, padding: '10px' }}
                >
                  <option value="">{language === 'en' ? '-- Select Origin --' : '-- स्रोत चुनें --'}</option>
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.line})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '4px' }}>
                  {language === 'en' ? 'To Station:' : 'गंतव्य स्टेशन:'}
                </label>
                <select
                  value={destStationId}
                  onChange={(e) => setDestStationId(e.target.value)}
                  style={{ margin: 0, padding: '10px' }}
                >
                  <option value="">{language === 'en' ? '-- Select Destination --' : '-- गंतव्य चुनें --'}</option>
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

        {/* 2. Interactive Line Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '10px 0 2px', marginTop: '6px' }}>
          {filterLines.map((fl) => {
            const isSelected = selectedLineFilter === fl.value;
            return (
              <button
                key={fl.value}
                type="button"
                onClick={() => setSelectedLineFilter(fl.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: `1.5px solid ${fl.color}`,
                  background: isSelected ? fl.color : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : fl.color,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {fl.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Route Summary Banner (if route planned) */}
      {activeRoute && (
        <div
          style={{
            background: 'linear-gradient(135deg, var(--metro-navy) 0%, #0F2942 100%)',
            color: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            border: '2px solid var(--metro-blue)'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {language === 'en' ? 'Active Route Highlighted on Map' : 'सक्रिय मार्ग मानचित्र पर प्रदर्शित'}
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>
              {activeRoute.source} ➔ {activeRoute.destination}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '4px' }}>
              {activeRoute.totalStops} stops • {activeRoute.interchanges} transfer(s) • ~{activeRoute.estimatedTime} mins • ₹{activeRoute.totalFare}
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => router.push(`/journey?src=${sourceStationId}&dest=${destStationId}`)}
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            {language === 'en' ? 'Open Full Journey Plan ➔' : 'पूर्ण यात्रा विवरण देखें ➔'}
          </button>
        </div>
      )}

      {/* 4. Main SVG Canvas Map Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '620px',
          borderRadius: '18px',
          overflow: 'hidden',
          border: '2px solid var(--metro-card-border)',
          background: '#FFFFFF',
          boxShadow: '0 8px 30px rgba(11, 31, 58, 0.08)'
        }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 1550 1350"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Schematic Graph Background */}
          <defs>
            <pattern id="cleanGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(11, 31, 58, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cleanGrid)" />

          {/* Pan & Zoom Transform Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Draw All Metro Line Paths */}
            {lines.map((line) => {
              const lineStations = line.stations
                .map((id) => stations.find((s) => s.id === id))
                .filter((s): s is MetroStation => !!s && !!schematicCoordinates[s.id]);

              if (lineStations.length < 2) return null;

              // Build smooth schematic path
              let d = '';
              lineStations.forEach((st, idx) => {
                const pt = schematicCoordinates[st.id];
                if (idx === 0) d += `M ${pt.x} ${pt.y}`;
                else d += ` L ${pt.x} ${pt.y}`;
              });

              const isHighlighted = isLineHighlighted(line);

              return (
                <g key={`line_group_${line.id}`}>
                  {/* Subtle Glow aura when isolated or in active route */}
                  {(selectedLineFilter === line.name || (activeRoute && isHighlighted)) && (
                    <path
                      d={d}
                      fill="none"
                      stroke={line.color || '#0057B8'}
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.3"
                    />
                  )}

                  {/* Main Line Stroke */}
                  <path
                    d={d}
                    fill="none"
                    stroke={line.color || '#0057B8'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isHighlighted ? 1 : 0.12}
                    style={{ transition: 'opacity 0.25s ease' }}
                  />
                </g>
              );
            })}

            {/* Dedicated 300m Walking Transfer between Noida Sec 51 (Aqua Line) & Sec 52 (Blue Line) */}
            {(() => {
              const p51 = schematicCoordinates['NMRC_AQ_N51'];
              const p52 = schematicCoordinates['DLI_INTER_NOIDA52'];
              if (p51 && p52) {
                return (
                  <g key="walking_transfer_bridge">
                    <line
                      x1={p51.x}
                      y1={p51.y}
                      x2={p52.x}
                      y2={p52.y}
                      stroke="#F59E0B"
                      strokeWidth="5"
                      strokeDasharray="6 6"
                    />
                    <rect
                      x={(p51.x + p52.x) / 2 + 10}
                      y={(p51.y + p52.y) / 2 - 12}
                      width="92"
                      height="24"
                      rx="6"
                      fill="#FFFBEB"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                    />
                    <text
                      x={(p51.x + p52.x) / 2 + 56}
                      y={(p51.y + p52.y) / 2 + 4}
                      fontSize="10"
                      fontWeight="800"
                      fill="#92400E"
                      textAnchor="middle"
                    >
                      🚶 300m Walk
                    </text>
                  </g>
                );
              }
              return null;
            })()}

            {/* Draw Station Nodes */}
            {stations.map((st, idx) => {
              const pt = schematicCoordinates[st.id];
              if (!pt) return null;

              const isSelected = selectedStation?.id === st.id;
              const isSource = sourceStationId === st.id;
              const isDest = destStationId === st.id;
              const inActiveRoute = isStationInRoute(st.id);
              const isInterchange = st.isInterchange;
              const isProminent = prominentStationIds.has(st.id);

              // Intelligent Label Visibility:
              // Prominent interchanges & terminal stations always show badge.
              // When zooming > 1.2 or searching or hovering or in route, full labels appear!
              const showText =
                zoom > 1.2 ||
                isSelected ||
                isSource ||
                isDest ||
                isProminent ||
                searchQuery.length > 0 ||
                (selectedLineFilter !== 'ALL' && st.line === selectedLineFilter);

              const opacity = activeRoute ? (inActiveRoute ? 1 : 0.18) : selectedLineFilter !== 'ALL' ? (st.line === selectedLineFilter ? 1 : 0.18) : 1;

              return (
                <g
                  key={st.id}
                  style={{ cursor: 'pointer', transition: 'opacity 0.25s ease' }}
                  opacity={opacity}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStation(st);
                  }}
                  onMouseEnter={() => setHoveredStation(st)}
                  onMouseLeave={() => setHoveredStation(null)}
                >
                  {/* Selection Pulsing Ring */}
                  {(isSelected || isSource || isDest) && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="18"
                      fill={isSource ? '#E53935' : isDest ? '#10B981' : '#0057B8'}
                      fillOpacity="0.25"
                      stroke={isSource ? '#E53935' : isDest ? '#10B981' : '#0057B8'}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Station Node Symbol */}
                  {isInterchange ? (
                    <g>
                      {/* Double Concentric Interchange Node */}
                      <circle cx={pt.x} cy={pt.y} r="10" fill="#FFFFFF" stroke="#0B1F3A" strokeWidth="3.5" />
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#7F00FF" />
                    </g>
                  ) : (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5.5"
                      fill="#FFFFFF"
                      stroke={st.lineColor || '#0057B8'}
                      strokeWidth="3"
                    />
                  )}

                  {/* Clean Station Name Label with Anti-Collision Alternation */}
                  {showText && (
                    <g pointerEvents="none">
                      {isProminent ? (
                        // Prominent Pill Badge for Hub Stations
                        <g>
                          <rect
                            x={pt.x + 12}
                            y={pt.y - 12}
                            width={st.name.length * 7.5 + 16}
                            height="22"
                            rx="6"
                            fill="#FFFFFF"
                            stroke="#0B1F3A"
                            strokeWidth="1.5"
                            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                          />
                          <text
                            x={pt.x + 20}
                            y={pt.y + 3}
                            fontSize="11"
                            fontWeight="800"
                            fill="#0B1F3A"
                          >
                            {st.name}
                          </text>
                        </g>
                      ) : (
                        // Regular Station Clean Text with White Stroke Halo
                        <text
                          x={pt.x + 10}
                          y={pt.y + (idx % 2 === 0 ? -7 : 11)}
                          fontSize="10"
                          fontWeight={isSelected ? 800 : 600}
                          fill={isSelected ? '#0057B8' : '#0B1F3A'}
                          style={{
                            paintOrder: 'stroke',
                            stroke: '#FFFFFF',
                            strokeWidth: '4px',
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round'
                          }}
                        >
                          {st.name}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Station Quick Tooltip */}
        {hoveredStation && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(11, 31, 58, 0.95)',
              color: '#FFFFFF',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📍 {hoveredStation.name}</span>
            <span>•</span>
            <span style={{ color: hoveredStation.lineColor || '#38BDF8' }}>{hoveredStation.line}</span>
            {hoveredStation.isInterchange && <span>⚡ (Interchange)</span>}
          </div>
        )}

        {/* Floating Zoom Controls */}
        <div style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleZoom('in')}
            title="Zoom In (+)"
            style={{ width: '42px', height: '42px', padding: 0, fontSize: '1.3rem', borderRadius: '10px' }}
          >
            ＋
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleZoom('out')}
            title="Zoom Out (-)"
            style={{ width: '42px', height: '42px', padding: 0, fontSize: '1.3rem', borderRadius: '10px' }}
          >
            －
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleZoom('reset')}
            title="Reset Map View"
            style={{ padding: '8px 12px', fontSize: '0.78rem', backgroundColor: 'var(--metro-navy)', color: '#FFFFFF', borderRadius: '8px' }}
          >
            {language === 'en' ? 'Center Map' : 'रीसेट करें'}
          </button>
        </div>

        {/* Clean Map Legend */}
        <div
          style={{
            position: 'absolute',
            left: '16px',
            bottom: '16px',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--metro-card-border)',
            boxShadow: '0 4px 14px rgba(11, 31, 58, 0.08)',
            fontSize: '0.78rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 800, color: 'var(--metro-navy)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {language === 'en' ? 'Transit Legend' : 'मानचित्र संकेत'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '2.5px solid #0057B8', background: '#FFFFFF' }} />
            <span>{language === 'en' ? 'Standard Station' : 'सामान्य स्टेशन'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '13px', height: '13px', borderRadius: '50%', border: '3px solid #0B1F3A', background: '#7F00FF' }} />
            <strong style={{ color: 'var(--metro-navy)' }}>{language === 'en' ? 'Interchange Station' : 'इंटरचेंज स्टेशन'}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '18px', height: '4px', borderTop: '3px dashed #F59E0B' }} />
            <span>{language === 'en' ? 'Walking Transfer (Sec 51 ↔ 52)' : 'पैदल स्थानांतरण (~300m)'}</span>
          </div>
        </div>
      </div>

      {/* 5. Selected Station Detailed Inspection Drawer */}
      {selectedStation && (
        <div
          className="card"
          style={{
            borderLeft: `6px solid ${selectedStation.lineColor || 'var(--metro-blue)'}`,
            animation: 'fadeIn 0.2s ease',
            boxShadow: '0 8px 24px rgba(11, 31, 58, 0.1)'
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
                    ⚡ {language === 'en' ? 'Interchange Available' : 'इंटरचेंज उपलब्ध'}
                  </span>
                )}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--metro-navy)', fontWeight: 800 }}>
                {selectedStation.name} ({selectedStation.code})
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--metro-text-muted)', marginTop: '4px' }}>
                {language === 'en' ? 'Metro Authority / Network:' : 'मेट्रो प्राधिकरण:'} <strong>{selectedStation.network}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStation(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--metro-text-subtle)' }}
              title="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px', background: 'var(--metro-light-bg)', padding: '14px', borderRadius: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)', display: 'block', fontWeight: 700 }}>
                {language === 'en' ? 'CONNECTING LINES' : 'कनेक्टिंग लाइनें'}
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--metro-navy)' }}>
                {selectedStation.interchangeLines && selectedStation.interchangeLines.length > 0
                  ? [selectedStation.line, ...selectedStation.interchangeLines].join(', ')
                  : selectedStation.line}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)', display: 'block', fontWeight: 700 }}>
                {language === 'en' ? 'PLATFORM GUIDANCE' : 'प्लेटफॉर्म मार्गदर्शन'}
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--metro-navy)' }}>
                {selectedStation.platformNumbers ? `Platform ${selectedStation.platformNumbers.join(', ')}` : 'Platform information unavailable'}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)', display: 'block', fontWeight: 700 }}>
                {language === 'en' ? 'ENTRY / EXIT GATES' : 'प्रवेश / निकास द्वार'}
              </span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--metro-navy)' }}>
                {selectedStation.entryGates ? selectedStation.entryGates.join(', ') : 'Gate information unavailable'}
              </strong>
            </div>
          </div>

          {/* Quick Route Planning CTAs */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setSourceStationId(selectedStation.id);
                setRouteMode(true);
              }}
              style={{ flex: 1, minWidth: '150px' }}
            >
              🚉 {language === 'en' ? 'Set as Origin' : 'स्रोत स्टेशन बनाएं'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setDestStationId(selectedStation.id);
                setRouteMode(true);
              }}
              style={{ flex: 1, minWidth: '150px' }}
            >
              🎯 {language === 'en' ? 'Set as Destination' : 'गंतव्य स्टेशन बनाएं'}
            </button>
            {sourceStationId && destStationId && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => router.push(`/journey?src=${sourceStationId}&dest=${destStationId}`)}
                style={{ flex: 1, minWidth: '180px' }}
              >
                {language === 'en' ? 'Go to Journey Planner ➔' : 'यात्रा योजनाकार पर जाएं ➔'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
