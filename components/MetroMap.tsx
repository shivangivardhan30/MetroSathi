import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getStationsByCity, getLinesByCity, MetroStation, MetroLine, availableNetworks, metroNetworks } from '../lib/metroData';
import { calculateRoute, MetroRoute } from '../lib/routeCalculator';
import { useTranslation } from '../lib/translations';

interface MetroMapProps {
  language: 'en' | 'hi';
}

export default function MetroMap({ language }: MetroMapProps) {
  const router = useRouter();
  const t = useTranslation(language);

  // States
  const [selectedNetwork, setSelectedNetwork] = useState('All Metro Networks');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [stations, setStations] = useState<MetroStation[]>([]);
  const [lines, setLines] = useState<MetroLine[]>([]);
  
  // Interactive States
  const [selectedStation, setSelectedStation] = useState<MetroStation | null>(null);
  const [sourceStation, setSourceStation] = useState<MetroStation | null>(null);
  const [destStation, setDestStation] = useState<MetroStation | null>(null);
  const [activeRoute, setActiveRoute] = useState<MetroRoute | null>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MetroStation[]>([]);

  // Zoom and Pan States
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const mapRef = useRef<SVGSVGElement>(null);

  // Dimensions for SVG Box
  const width = 680;
  const height = 500;
  const padding = 60;

  // Load stations & lines based on network/city selection
  useEffect(() => {
    let activeStations: MetroStation[] = [];
    let activeLines: MetroLine[] = [];

    if (selectedNetwork === 'All Metro Networks') {
      // Include Delhi NCR & Noida Metro combined
      activeStations = [...(metroNetworks['Delhi']?.stations || []), ...(metroNetworks['Noida']?.stations || [])];
      activeLines = [...(metroNetworks['Delhi']?.lines || []), ...(metroNetworks['Noida']?.lines || [])];
    } else if (selectedNetwork === 'Noida Metro') {
      activeStations = metroNetworks['Noida']?.stations || [];
      activeLines = metroNetworks['Noida']?.lines || [];
    } else if (selectedNetwork === 'Delhi Metro') {
      activeStations = metroNetworks['Delhi']?.stations || [];
      activeLines = metroNetworks['Delhi']?.lines || [];
    } else {
      const cityKey = availableNetworks.find(n => n.name === selectedNetwork)?.city || 'Delhi';
      activeStations = metroNetworks[cityKey]?.stations || [];
      activeLines = metroNetworks[cityKey]?.lines || [];
    }

    setStations(activeStations);
    setLines(activeLines);
    
    setSelectedStation(null);
    setSourceStation(null);
    setDestStation(null);
    setActiveRoute(null);
    setSearchQuery('');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [selectedNetwork]);

  // Recalculate route when source/destination changes
  useEffect(() => {
    if (sourceStation && destStation && sourceStation.id !== destStation.id) {
      const route = calculateRoute(selectedCity, sourceStation.id, destStation.id);
      setActiveRoute(route);
    } else {
      setActiveRoute(null);
    }
  }, [sourceStation, destStation, selectedCity]);

  // Search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = stations.filter(
      (s) => s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query) || s.line.toLowerCase().includes(query) || s.network.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery, stations]);

  // Get coordinates bounds
  const latitudes = stations.map((s) => s.latitude);
  const longitudes = stations.map((s) => s.longitude);
  const minLat = latitudes.length ? Math.min(...latitudes) : 0;
  const maxLat = latitudes.length ? Math.max(...latitudes) : 1;
  const minLon = longitudes.length ? Math.min(...longitudes) : 0;
  const maxLon = longitudes.length ? Math.max(...longitudes) : 1;

  // Projection helper
  const project = (lat: number, lon: number) => {
    if (maxLon === minLon || maxLat === minLat) {
      return { x: width / 2, y: height / 2 };
    }
    const x = padding + ((lon - minLon) / (maxLon - minLon)) * (width - 2 * padding);
    const y = height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);
    return { x, y };
  };

  const focusOnStation = (station: MetroStation) => {
    const { x, y } = project(station.latitude, station.longitude);
    const targetZoom = 2;
    setZoom(targetZoom);
    setPan({
      x: width / 2 - x * targetZoom,
      y: height / 2 - y * targetZoom,
    });
    setSelectedStation(station);
    setSearchQuery('');
  };

  // Mouse Pan Handlers
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

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'in') {
      setZoom((z) => Math.min(z + 0.35, 4));
    } else if (direction === 'out') {
      setZoom((z) => Math.max(z - 0.35, 0.7));
    } else {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  };

  const handlePlanJourney = () => {
    if (sourceStation && destStation) {
      router.push(`/journey?src=${sourceStation.id}&dest=${destStation.id}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Controls Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Network Filter Selector */}
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--metro-navy)', marginBottom: '4px' }}>
            Select Metro Network
          </label>
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            style={{ margin: 0, padding: '10px 14px' }}
          >
            {availableNetworks.map(net => (
              <option key={net.name} value={net.name} disabled={!net.isAvailable}>
                {net.name} {!net.isAvailable ? '(Coming Soon)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Station Search */}
        <div style={{ flex: '2', minWidth: '220px', position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--metro-navy)', marginBottom: '4px' }}>
            Search Station on Map
          </label>
          <input
            type="text"
            placeholder="Search e.g. Noida Sector 51, Pari Chowk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ margin: 0, padding: '10px 14px' }}
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
                zIndex: 20,
                maxHeight: '180px',
                overflowY: 'auto',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
                marginTop: '4px',
              }}
            >
              {searchResults.map((station) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => focusOnStation(station)}
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
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--metro-light-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--metro-navy)' }}>📍 {station.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--metro-text-subtle)' }}>{station.network} • {station.line}</div>
                  </div>
                  <span className="metro-line-badge" style={{ backgroundColor: station.lineColor || '#00A8E8', fontSize: '0.7rem' }}>
                    {station.line}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Map Container */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--metro-card-border)', background: '#F8FAFC', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)' }}>
        <svg
          ref={mapRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 87, 184, 0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Map Group */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Draw Metro Line Paths */}
            {lines.map((line) => {
              const points = line.stations
                .map((id) => stations.find((s) => s.id === id))
                .filter((s): s is MetroStation => !!s)
                .map((s) => project(s.latitude, s.longitude));

              if (points.length < 2) return null;

              let d = `M ${points[0].x} ${points[0].y}`;
              for (let i = 1; i < points.length; i++) {
                d += ` L ${points[i].x} ${points[i].y}`;
              }

              return (
                <path
                  key={line.id}
                  d={d}
                  fill="none"
                  stroke={line.color || 'var(--metro-blue)'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}

            {/* Walking Connection Link (Noida Sec 51 Aqua Line <-> Sec 52 Blue Line) */}
            {(() => {
              const st51 = stations.find(s => s.id === 'NMRC_AQ_N51');
              const st52 = stations.find(s => s.id === 'DLI_INTER_NOIDA52');
              if (st51 && st52) {
                const p1 = project(st51.latitude, st51.longitude);
                const p2 = project(st52.latitude, st52.longitude);
                return (
                  <g>
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#64748B" strokeWidth="3" strokeDasharray="4 4" />
                    <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 6} fontSize="7" fontWeight="800" fill="#0B1F3A" textAnchor="middle">
                      🚶 300m Walk
                    </text>
                  </g>
                );
              }
              return null;
            })()}

            {/* Station Nodes */}
            {stations.map((station) => {
              const { x, y } = project(station.latitude, station.longitude);
              const isSelected = selectedStation?.id === station.id;
              const isSource = sourceStation?.id === station.id;
              const isDest = destStation?.id === station.id;

              return (
                <g
                  key={station.id}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStation(station);
                  }}
                >
                  {/* Selection Pulsing Aura */}
                  {(isSelected || isSource || isDest) && (
                    <circle
                      cx={x}
                      cy={y}
                      r={station.isInterchange ? '18' : '14'}
                      fill={isSource ? 'var(--metro-red)' : isDest ? 'var(--metro-green)' : 'var(--metro-blue)'}
                      fillOpacity="0.25"
                    />
                  )}

                  {/* Station Node Symbol */}
                  {station.isInterchange ? (
                    <>
                      <circle cx={x} cy={y} r="8" fill="#FFFFFF" stroke="var(--metro-navy)" strokeWidth="3" />
                      <circle cx={x} cy={y} r="4" fill="#7F00FF" />
                    </>
                  ) : (
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="#FFFFFF"
                      stroke={station.lineColor || 'var(--metro-blue)'}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Station Name Label */}
                  <text
                    x={x + 9}
                    y={y + 4}
                    fontSize="9.5"
                    fontWeight={isSelected || isSource || isDest ? 800 : 600}
                    fill={isSource ? 'var(--metro-red)' : isDest ? 'var(--metro-green)' : 'var(--metro-navy)'}
                    style={{
                      paintOrder: 'stroke',
                      stroke: '#FFFFFF',
                      strokeWidth: '3px',
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                    }}
                  >
                    {station.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom Controls Overlay */}
        <div style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 5 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleZoom('in')}
            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px', fontSize: '1.2rem' }}
          >
            ＋
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleZoom('out')}
            style={{ width: '40px', height: '40px', padding: 0, borderRadius: '10px', fontSize: '1.2rem' }}
          >
            －
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleZoom('reset')}
            style={{ padding: '6px 10px', fontSize: '0.78rem', backgroundColor: 'var(--metro-navy)', color: '#FFFFFF' }}
          >
            {t.map.resetMap}
          </button>
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', left: '16px', bottom: '16px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--metro-card-border)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '6px', pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '2.5px solid #00A8E8', background: '#FFFFFF' }} />
            <span>NMRC Aqua Line (#00A8E8)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '2.5px solid var(--metro-navy)', background: '#FFFFFF' }} />
            <span style={{ fontWeight: 700 }}>Interchange Node</span>
          </div>
        </div>
      </div>

      {/* Selected Station Inspection Drawer */}
      {selectedStation && (
        <div className="card" style={{ borderLeft: `6px solid ${selectedStation.lineColor || '#00A8E8'}`, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span className="metro-line-badge" style={{ backgroundColor: selectedStation.lineColor || '#00A8E8' }}>
                {selectedStation.network} • {selectedStation.line}
              </span>
              <h3 style={{ margin: '8px 0 4px 0', fontSize: '1.25rem', color: 'var(--metro-navy)', fontWeight: 800 }}>
                {selectedStation.name} ({selectedStation.code})
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--metro-text-muted)' }}>
                Network: <strong>{selectedStation.network}</strong> {selectedStation.isInterchange ? '• ⚡ Interchange Available' : ''}
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

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setSourceStation(selectedStation)}
              style={{ flex: 1, minWidth: '140px' }}
            >
              Set as Source 🚉
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setDestStation(selectedStation)}
              style={{ flex: 1, minWidth: '140px' }}
            >
              Set as Destination 🎯
            </button>
          </div>

          {sourceStation && destStation && (
            <button
              type="button"
              className="btn-primary"
              onClick={handlePlanJourney}
              style={{ width: '100%', marginTop: '12px' }}
            >
              Plan Journey ({sourceStation.name} ➔ {destStation.name})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
