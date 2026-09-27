import { MetroStation, getStationById, metroNetworks } from './metroData';

export interface RouteStop {
  stationId: string;
  stationName: string;
  network: string;
  line: string;
  lineColor: string;
  isInterchange: boolean;
  isWalkingTransfer?: boolean;
  interchangeToLine?: string;
  interchangeToNetwork?: string;
  directionTowards?: string;
  platformNumber?: string | null;
  entryGate?: string | null;
  exitGate?: string | null;
  fare: number;
}

export interface MetroRoute {
  source: string;
  destination: string;
  stops: RouteStop[];
  totalStops: number;
  interchanges: number;
  estimatedTime: number; // in minutes
  totalFare: number;
  distance: number; // in km
}

interface StateNode {
  stationId: string;
  lineName: string;
}

interface GraphEdge {
  target: StateNode;
  weight: number;
  isTransfer: boolean;
  isWalkingTransfer?: boolean;
}

function nodeKey(node: StateNode): string {
  return `${node.stationId}__${node.lineName}`;
}

// Build line-state graph across all networks in region
function buildGlobalLineStateGraph(): Map<string, GraphEdge[]> {
  const graph = new Map<string, GraphEdge[]>();

  const getEdges = (key: string): GraphEdge[] => {
    if (!graph.has(key)) graph.set(key, []);
    return graph.get(key)!;
  };

  // 1. Add intra-line edges for all networks
  Object.values(metroNetworks).forEach(network => {
    network.lines.forEach(line => {
      for (let i = 0; i < line.stations.length - 1; i++) {
        const stA = line.stations[i];
        const stB = line.stations[i + 1];

        const keyA = nodeKey({ stationId: stA, lineName: line.name });
        const keyB = nodeKey({ stationId: stB, lineName: line.name });

        getEdges(keyA).push({
          target: { stationId: stB, lineName: line.name },
          weight: 1.0,
          isTransfer: false,
        });

        getEdges(keyB).push({
          target: { stationId: stA, lineName: line.name },
          weight: 1.0,
          isTransfer: false,
        });
      }
    });
  });

  // 2. Add same-station inter-line transfer edges
  const stationLinesMap = new Map<string, string[]>();
  Object.values(metroNetworks).forEach(network => {
    network.lines.forEach(line => {
      line.stations.forEach(stId => {
        const lines = stationLinesMap.get(stId) || [];
        if (!lines.includes(line.name)) {
          lines.push(line.name);
        }
        stationLinesMap.set(stId, lines);
      });
    });
  });

  stationLinesMap.forEach((lines, stId) => {
    if (lines.length > 1) {
      for (let i = 0; i < lines.length; i++) {
        for (let j = i + 1; j < lines.length; j++) {
          const l1 = lines[i];
          const l2 = lines[j];

          const key1 = nodeKey({ stationId: stId, lineName: l1 });
          const key2 = nodeKey({ stationId: stId, lineName: l2 });

          getEdges(key1).push({
            target: { stationId: stId, lineName: l2 },
            weight: 3.5,
            isTransfer: true,
          });

          getEdges(key2).push({
            target: { stationId: stId, lineName: l1 },
            weight: 3.5,
            isTransfer: true,
          });
        }
      }
    }
  });

  // 3. Add explicit Walking Transfer Link between NMRC Noida Sec 51 & DMRC Noida Sec 52
  const keySec51 = nodeKey({ stationId: 'NMRC_AQ_N51', lineName: 'Aqua Line' });
  const keySec52 = nodeKey({ stationId: 'DLI_INTER_NOIDA52', lineName: 'Blue Line' });

  getEdges(keySec51).push({
    target: { stationId: 'DLI_INTER_NOIDA52', lineName: 'Blue Line' },
    weight: 4.5, // 300m walking pathway
    isTransfer: true,
    isWalkingTransfer: true,
  });

  getEdges(keySec52).push({
    target: { stationId: 'NMRC_AQ_N51', lineName: 'Aqua Line' },
    weight: 4.5,
    isTransfer: true,
    isWalkingTransfer: true,
  });

  return graph;
}

// Dijkstra Shortest Path Search
function findShortestStatePath(
  sourceStationId: string,
  destStationId: string
): StateNode[] {
  const graph = buildGlobalLineStateGraph();

  const startNodes: StateNode[] = [];
  const targetNodes: StateNode[] = [];

  Object.values(metroNetworks).forEach(network => {
    network.lines.forEach(line => {
      if (line.stations.includes(sourceStationId)) {
        startNodes.push({ stationId: sourceStationId, lineName: line.name });
      }
      if (line.stations.includes(destStationId)) {
        targetNodes.push({ stationId: destStationId, lineName: line.name });
      }
    });
  });

  if (startNodes.length === 0 || targetNodes.length === 0) return [];

  const targetKeys = new Set(targetNodes.map(nodeKey));
  const distances = new Map<string, number>();
  const previous = new Map<string, StateNode>();
  const pq: { node: StateNode; dist: number }[] = [];

  startNodes.forEach(node => {
    const key = nodeKey(node);
    distances.set(key, 0);
    pq.push({ node, dist: 0 });
  });

  let endKey: string | null = null;

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { node, dist } = pq.shift()!;
    const key = nodeKey(node);

    if (dist > (distances.get(key) ?? Infinity)) continue;

    if (targetKeys.has(key)) {
      endKey = key;
      break;
    }

    const edges = graph.get(key) || [];
    for (const edge of edges) {
      const neighborKey = nodeKey(edge.target);
      const newDist = dist + edge.weight;

      if (newDist < (distances.get(neighborKey) ?? Infinity)) {
        distances.set(neighborKey, newDist);
        previous.set(neighborKey, node);
        pq.push({ node: edge.target, dist: newDist });
      }
    }
  }

  if (!endKey) return [];

  const path: StateNode[] = [];
  let currKey: string | undefined = endKey;

  while (currKey) {
    const parts = currKey.split('__');
    const node: StateNode = { stationId: parts[0], lineName: parts[1] };
    path.unshift(node);
    const prevNode = previous.get(currKey);
    currKey = prevNode ? nodeKey(prevNode) : undefined;
  }

  return path;
}

// Calculate train direction heading ("Towards X")
function getTrainDirection(
  lineName: string,
  fromStationId: string,
  toStationId: string
): string | undefined {
  for (const network of Object.values(metroNetworks)) {
    const line = network.lines.find(l => l.name === lineName);
    if (line && line.stations.length >= 2) {
      const idxFrom = line.stations.indexOf(fromStationId);
      const idxTo = line.stations.indexOf(toStationId);

      if (idxFrom !== -1 && idxTo !== -1) {
        if (idxTo > idxFrom) {
          const terminalId = line.stations[line.stations.length - 1];
          return getStationById(terminalId)?.name;
        } else if (idxTo < idxFrom) {
          const terminalId = line.stations[0];
          return getStationById(terminalId)?.name;
        }
      }
    }
  }
  return undefined;
}

export function calculateFare(totalStops: number): number {
  if (totalStops <= 2) return 10;
  if (totalStops <= 5) return 20;
  if (totalStops <= 12) return 30;
  if (totalStops <= 21) return 40;
  if (totalStops <= 32) return 50;
  return 60;
}

export function calculateJourneyTime(totalStops: number, interchanges: number): number {
  const travelMinutes = totalStops * 2.2;
  const interchangeMinutes = interchanges * 5.0;
  return Math.max(2, Math.round(travelMinutes + interchangeMinutes));
}

export function calculateRoute(
  city: string,
  sourceStationId: string,
  destinationStationId: string
): MetroRoute | null {
  const sourceStation = getStationById(sourceStationId);
  const destStation = getStationById(destinationStationId);

  if (!sourceStation || !destStation) return null;

  if (sourceStationId === destinationStationId) {
    return {
      source: sourceStation.name,
      destination: destStation.name,
      stops: [
        {
          stationId: sourceStation.id,
          stationName: sourceStation.name,
          network: sourceStation.network,
          line: sourceStation.line,
          lineColor: sourceStation.lineColor,
          isInterchange: false,
          platformNumber: sourceStation.platformNumbers?.[0] || null,
          entryGate: sourceStation.entryGates?.[0] || null,
          exitGate: sourceStation.exitGates?.[0] || null,
          fare: 0,
        },
      ],
      totalStops: 0,
      interchanges: 0,
      estimatedTime: 0,
      totalFare: 0,
      distance: 0,
    };
  }

  const statePath = findShortestStatePath(sourceStationId, destinationStationId);
  if (statePath.length === 0) return null;

  const stops: RouteStop[] = [];
  let interchangesCount = 0;

  for (let i = 0; i < statePath.length; i++) {
    const currState = statePath[i];
    const nextState = statePath[i + 1];

    const isTransferNode = nextState && (nextState.lineName !== currState.lineName || nextState.stationId !== currState.stationId);
    const isWalkingTransfer = nextState && currState.stationId !== nextState.stationId && nextState.lineName !== currState.lineName;

    if (isTransferNode && (currState.stationId === nextState.stationId || isWalkingTransfer)) {
      const station = getStationById(currState.stationId)!;
      const nextStation = getStationById(nextState.stationId)!;

      stops.push({
        stationId: station.id,
        stationName: station.name,
        network: station.network,
        line: currState.lineName,
        lineColor: station.lineColor,
        isInterchange: true,
        isWalkingTransfer: isWalkingTransfer,
        interchangeToLine: nextState.lineName,
        interchangeToNetwork: nextStation.network,
        platformNumber: station.platformNumbers?.[0] || null,
        entryGate: station.entryGates?.[0] || null,
        exitGate: station.exitGates?.[0] || null,
        fare: 0,
      });

      interchangesCount++;
      if (currState.stationId === nextState.stationId) {
        i++; // Skip duplicate same-station node
      }
      continue;
    }

    const station = getStationById(currState.stationId)!;

    let dirHeading: string | undefined;
    if (i < statePath.length - 1) {
      const nextDistinct = statePath.slice(i + 1).find(s => s.stationId !== currState.stationId);
      if (nextDistinct) {
        dirHeading = getTrainDirection(currState.lineName, currState.stationId, nextDistinct.stationId);
      }
    }

    stops.push({
      stationId: station.id,
      stationName: station.name,
      network: station.network,
      line: currState.lineName,
      lineColor: station.lineColor,
      isInterchange: station.isInterchange,
      directionTowards: dirHeading,
      platformNumber: station.platformNumbers?.[0] || null,
      entryGate: station.entryGates?.[0] || null,
      exitGate: station.exitGates?.[0] || null,
      fare: 0,
    });
  }

  const totalStops = stops.length - 1;
  const estimatedTime = calculateJourneyTime(totalStops, interchangesCount);
  const totalFare = calculateFare(totalStops);
  const distance = Math.round(totalStops * 1.3 * 10) / 10;

  if (stops.length > 0) {
    stops[stops.length - 1].fare = totalFare;
  }

  return {
    source: sourceStation.name,
    destination: destStation.name,
    stops,
    totalStops,
    interchanges: interchangesCount,
    estimatedTime,
    totalFare,
    distance,
  };
}

export function searchStations(query: string, cityFilter?: string, networkFilter?: string): MetroStation[] {
  let allStations: MetroStation[] = [];
  
  for (const network of Object.values(metroNetworks)) {
    if (cityFilter && cityFilter !== 'All' && network.city !== cityFilter) continue;
    if (networkFilter && networkFilter !== 'All Metro Networks' && network.network !== networkFilter) continue;
    allStations.push(...network.stations);
  }

  if (!query.trim()) return allStations;

  const queryLower = query.toLowerCase();
  return allStations.filter(
    station =>
      station.name.toLowerCase().includes(queryLower) ||
      station.code.toLowerCase().includes(queryLower) ||
      station.line.toLowerCase().includes(queryLower) ||
      station.network.toLowerCase().includes(queryLower)
  );
}

export function getStationsByLine(lineName: string): MetroStation[] {
  const matching: MetroStation[] = [];
  for (const network of Object.values(metroNetworks)) {
    matching.push(...network.stations.filter(s => s.line === lineName));
  }
  return matching;
}
