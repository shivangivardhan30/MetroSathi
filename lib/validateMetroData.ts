import { metroNetworks } from './metroData';

export function validateMetroData(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const placeholderRegex = /station\s*[a-d1-9]/i;

  Object.entries(metroNetworks).forEach(([cityName, network]) => {
    const stationIdMap = new Map<string, boolean>();

    // 1. Validate station attributes
    network.stations.forEach(station => {
      // Check duplicate ID
      if (stationIdMap.has(station.id)) {
        errors.push(`[${cityName}] Duplicate station ID detected: ${station.id}`);
      }
      stationIdMap.set(station.id, true);

      // Check placeholder name
      if (placeholderRegex.test(station.name)) {
        errors.push(`[${cityName}] Placeholder station name found: "${station.name}" (${station.id})`);
      }

      // Check coordinates
      if (
        typeof station.latitude !== 'number' ||
        typeof station.longitude !== 'number' ||
        isNaN(station.latitude) ||
        isNaN(station.longitude) ||
        station.latitude < -90 ||
        station.latitude > 90 ||
        station.longitude < -180 ||
        station.longitude > 180
      ) {
        warnings.push(`[${cityName}] Station "${station.name}" has invalid coordinates (${station.latitude}, ${station.longitude})`);
      }
    });

    // 2. Validate line stations and connectivity
    const lineStationReferences = new Set<string>();

    network.lines.forEach(line => {
      if (line.stations.length < 2) {
        errors.push(`[${cityName}] Line "${line.name}" has fewer than 2 stations.`);
      }

      line.stations.forEach((stId, idx) => {
        lineStationReferences.add(stId);

        const stationObj = network.stations.find(s => s.id === stId);
        if (!stationObj) {
          errors.push(`[${cityName}] Line "${line.name}" references non-existent station ID: ${stId}`);
        }

        if (idx > 0) {
          const prevStId = line.stations[idx - 1];
          if (stId === prevStId) {
            errors.push(`[${cityName}] Line "${line.name}" contains adjacent duplicate station: ${stId}`);
          }
        }
      });
    });

    // 3. Detect isolated stations
    network.stations.forEach(station => {
      if (!lineStationReferences.has(station.id)) {
        warnings.push(`[${cityName}] Isolated station detected (not in any line.stations list): ${station.name} (${station.id})`);
      }
    });
  });

  if (typeof window !== 'undefined') {
    console.group('🚇 [MetroSathi Data Validation Report]');
    if (errors.length === 0 && warnings.length === 0) {
      console.log('✓ All metro networks & station graphs are valid and contiguous!');
    } else {
      if (errors.length > 0) console.error(`Found ${errors.length} Data Error(s):`, errors);
      if (warnings.length > 0) console.warn(`Found ${warnings.length} Data Warning(s):`, warnings);
    }
    console.groupEnd();
  }

  return { errors, warnings };
}
