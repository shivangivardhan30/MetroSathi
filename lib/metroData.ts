// Real Metro Station Data for all Indian Metro Networks
export interface MetroStation {
  id: string;
  name: string;
  code: string;
  city: string;
  network: string; // e.g., "Delhi Metro", "Noida Metro", "Mumbai Metro"
  line: string;
  lineColor: string;
  platformNumbers?: string[];
  entryGates?: string[];
  exitGates?: string[];
  isInterchange: boolean;
  interchangeLines?: string[];
  latitude: number;
  longitude: number;
  fare?: number; // in rupees
}

export interface MetroLine {
  id: string;
  name: string;
  city: string;
  network: string;
  color: string;
  stations: string[]; // station IDs in topological order
}

export interface MetroNetwork {
  city: string;
  network: string;
  lines: MetroLine[];
  stations: MetroStation[];
}

// DELHI METRO STATIONS
const delhiStations: MetroStation[] = [
  // RED LINE
  { id: 'DLI_RED_SHAHEED', name: 'Shaheed Sthal', code: 'SS', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6853, longitude: 77.3491 },
  { id: 'DLI_RED_MOHIT', name: 'Major Mohit Sharma', code: 'MMS', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6776, longitude: 77.3581 },
  { id: 'DLI_RED_RAJ_BAGH', name: 'Raj Bagh', code: 'RB', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6756, longitude: 77.3481 },
  { id: 'DLI_RED_MANSAROVAR', name: 'Mansarovar Park', code: 'MP', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6754, longitude: 77.3010 },
  { id: 'DLI_RED_JHILMIL', name: 'Jhilmil', code: 'JM', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6758, longitude: 77.3124 },
  { id: 'DLI_INTER_WELCOME', name: 'Welcome', code: 'WC', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', platformNumbers: ['1', '2'], isInterchange: true, interchangeLines: ['Pink Line'], latitude: 28.6718, longitude: 77.2776 },
  { id: 'DLI_INTER_KASHMERE', name: 'Kashmere Gate', code: 'KG', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', platformNumbers: ['1', '2', '3', '4'], entryGates: ['Gate 1', 'Gate 2', 'Gate 3', 'Gate 4'], exitGates: ['Exit 1', 'Exit 2', 'Exit 3'], isInterchange: true, interchangeLines: ['Yellow Line', 'Violet Line'], latitude: 28.6675, longitude: 77.2282 },
  { id: 'DLI_RED_TIS_HAZARI', name: 'Tis Hazari', code: 'TH', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6671, longitude: 77.2165 },
  { id: 'DLI_RED_PRATAP', name: 'Pratap Nagar', code: 'PN', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6666, longitude: 77.1988 },
  { id: 'DLI_RED_SHASTRI', name: 'Shastri Nagar', code: 'SN', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6699, longitude: 77.1817 },
  { id: 'DLI_INTER_INDERLOK', name: 'Inderlok', code: 'IL', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: true, interchangeLines: ['Green Line'], latitude: 28.6732, longitude: 77.1699 },
  { id: 'DLI_RED_KESHAV', name: 'Keshav Puram', code: 'KP', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6889, longitude: 77.1616 },
  { id: 'DLI_INTER_NSP', name: 'Netaji Subhash Place', code: 'NSP', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: true, interchangeLines: ['Pink Line'], latitude: 28.6968, longitude: 77.1514 },
  { id: 'DLI_RED_KOHAT', name: 'Kohat Enclave', code: 'KE', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.6981, longitude: 77.1402 },
  { id: 'DLI_RED_PITAMPURA', name: 'Pitam Pura', code: 'PP', city: 'Delhi', network: 'Delhi Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 28.7032, longitude: 77.1322 },

  // YELLOW LINE
  { id: 'DLI_YEL_ROHINI18', name: 'Rohini Sector 18-19', code: 'R18', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.7383, longitude: 77.1398 },
  { id: 'DLI_YEL_ADARSH', name: 'Adarsh Nagar', code: 'AN', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.7164, longitude: 77.1705 },
  { id: 'DLI_INTER_AZADPUR', name: 'Azadpur', code: 'AZ', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: true, interchangeLines: ['Pink Line'], latitude: 28.7077, longitude: 77.1755 },
  { id: 'DLI_YEL_VISHWA', name: 'Vishwavidyalaya', code: 'VV', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.6948, longitude: 77.2148 },
  { id: 'DLI_YEL_CHANDNI', name: 'Chandni Chowk', code: 'CC', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.6579, longitude: 77.2301 },
  { id: 'DLI_YEL_CHAWRI', name: 'Chawri Bazar', code: 'CB', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.6493, longitude: 77.2264 },
  { id: 'DLI_INTER_RAJIV', name: 'Rajiv Chowk', code: 'RC', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', platformNumbers: ['1', '2', '3', '4'], entryGates: ['Gate 1', 'Gate 2', 'Gate 6', 'Gate 7', 'Gate 8'], exitGates: ['Gate 1', 'Gate 2', 'Gate 6'], isInterchange: true, interchangeLines: ['Blue Line'], latitude: 28.6328, longitude: 77.2197 },
  { id: 'DLI_YEL_PATEL', name: 'Patel Chowk', code: 'PC', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.6230, longitude: 77.2139 },
  { id: 'DLI_INTER_CENTRAL', name: 'Central Secretariat', code: 'CS', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: true, interchangeLines: ['Violet Line'], latitude: 28.6147, longitude: 77.2119 },
  { id: 'DLI_INTER_INA', name: 'Dilli Haat INA', code: 'INA', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: true, interchangeLines: ['Pink Line'], latitude: 28.5744, longitude: 77.2102 },
  { id: 'DLI_YEL_AIIMS', name: 'AIIMS', code: 'AI', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.5689, longitude: 77.2077 },
  { id: 'DLI_INTER_HAUZ_KHAS', name: 'Hauz Khas', code: 'HK', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: true, interchangeLines: ['Magenta Line'], latitude: 28.5443, longitude: 77.2067 },
  { id: 'DLI_YEL_SAKET', name: 'Saket', code: 'SK', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.5206, longitude: 77.2014 },
  { id: 'DLI_YEL_QUTAB', name: 'Qutab Minar', code: 'QM', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.5130, longitude: 77.1865 },
  { id: 'DLI_YEL_CHHATTARPUR', name: 'Chhattarpur', code: 'CP', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.5067, longitude: 77.1748 },
  { id: 'DLI_YEL_ARJAN', name: 'Arjan Garh', code: 'AG', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.4808, longitude: 77.1258 },
  { id: 'DLI_INTER_SIKANDARPUR', name: 'Sikandarpur', code: 'SP', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: true, interchangeLines: ['Gurgaon Rapid Metro'], latitude: 28.4936, longitude: 77.0935 },
  { id: 'DLI_YEL_HUDA', name: 'Millennium City Centre Gurugram', code: 'MCC', city: 'Delhi', network: 'Delhi Metro', line: 'Yellow Line', lineColor: '#FFCC00', isInterchange: false, latitude: 28.4593, longitude: 77.0725 },

  // BLUE LINE
  { id: 'DLI_INTER_DWARKA21', name: 'Dwarka Sector 21', code: 'D21', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Airport Express'], latitude: 28.5523, longitude: 77.0583 },
  { id: 'DLI_BLU_DWARKA8', name: 'Dwarka Sector 8', code: 'D8', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5658, longitude: 77.0671 },
  { id: 'DLI_BLU_DWARKA9', name: 'Dwarka Sector 9', code: 'D9', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5749, longitude: 77.0645 },
  { id: 'DLI_BLU_DWARKA14', name: 'Dwarka Sector 14', code: 'D14', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6022, longitude: 77.0259 },
  { id: 'DLI_BLU_DWARKAMOR', name: 'Dwarka Mor', code: 'DM', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6193, longitude: 77.0333 },
  { id: 'DLI_BLU_UTTAM', name: 'Uttam Nagar West', code: 'UNW', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6248, longitude: 77.0653 },
  { id: 'DLI_INTER_JANAKPURI', name: 'Janakpuri West', code: 'JW', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Magenta Line'], latitude: 28.6294, longitude: 77.0777 },
  { id: 'DLI_INTER_RAJOURI', name: 'Rajouri Garden', code: 'RG', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Pink Line'], latitude: 28.6490, longitude: 77.1227 },
  { id: 'DLI_BLU_SUBHASH', name: 'Subhash Nagar', code: 'SH', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6404, longitude: 77.1050 },
  { id: 'DLI_BLU_MOTINAGAR', name: 'Moti Nagar', code: 'MN', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6578, longitude: 77.1425 },
  { id: 'DLI_INTER_KIRTINAGAR', name: 'Kirti Nagar', code: 'KN', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Green Line'], latitude: 28.6558, longitude: 77.1500 },
  { id: 'DLI_BLU_RAJENDRA', name: 'Rajendra Place', code: 'RP', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6425, longitude: 77.1782 },
  { id: 'DLI_BLU_JHANDEWALAN', name: 'Jhandewalan', code: 'JWN', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6443, longitude: 77.1999 },
  { id: 'DLI_BLU_RKASHRAM', name: 'R K Ashram Marg', code: 'RK', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6392, longitude: 77.2084 },
  { id: 'DLI_BLU_BARAKHAMBA', name: 'Barakhamba Road', code: 'BR', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6300, longitude: 77.2244 },
  { id: 'DLI_INTER_MANDIHOUSE', name: 'Mandi House', code: 'MH', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Violet Line'], latitude: 28.6259, longitude: 77.2341 },
  { id: 'DLI_INTER_MAYUR1', name: 'Mayur Vihar Phase-1', code: 'MV1', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Pink Line'], latitude: 28.6044, longitude: 77.2946 },
  { id: 'DLI_BLU_MAYUREXT', name: 'Mayur Vihar Extension', code: 'MVE', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5940, longitude: 77.3050 },
  { id: 'DLI_BLU_NEWASHOK', name: 'New Ashok Nagar', code: 'NAN', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5880, longitude: 77.3110 },
  { id: 'DLI_BLU_NOIDA15', name: 'Noida Sector 15', code: 'N15', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5820, longitude: 77.3180 },
  { id: 'DLI_BLU_NOIDA16', name: 'Noida Sector 16', code: 'N16', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5770, longitude: 77.3240 },
  { id: 'DLI_BLU_NOIDA18', name: 'Noida Sector 18', code: 'N18', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5705, longitude: 77.3260 },
  { id: 'DLI_INTER_BOTANICAL', name: 'Botanical Garden', code: 'BG', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Magenta Line'], latitude: 28.5639, longitude: 77.3343 },
  { id: 'DLI_BLU_GOLFCOURSE', name: 'Golf Course', code: 'GC', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5671, longitude: 77.3460 },
  { id: 'DLI_BLU_NOIDACITY', name: 'Noida City Centre', code: 'NCC', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5747, longitude: 77.3561 },
  { id: 'DLI_BLU_NOIDA34', name: 'Noida Sector 34', code: 'N34', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5810, longitude: 77.3610 },
  { id: 'DLI_INTER_NOIDA52', name: 'Noida Sector 52', code: 'N52', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Noida Metro Aqua Line (via 300m Walking Pathway)'], latitude: 28.5857, longitude: 77.3670 },
  { id: 'DLI_BLU_NOIDA61', name: 'Noida Sector 61', code: 'N61', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5904, longitude: 77.3690 },
  { id: 'DLI_BLU_NOIDA59', name: 'Noida Sector 59', code: 'N59', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.5954, longitude: 77.3730 },
  { id: 'DLI_BLU_NOIDA62', name: 'Noida Sector 62', code: 'N62', city: 'Delhi', network: 'Delhi Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 28.6015, longitude: 77.3770 },

  // VIOLET LINE
  { id: 'DLI_VIO_JANPATH', name: 'Janpath', code: 'JP', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.6089, longitude: 77.2182 },
  { id: 'DLI_VIO_JANGPURA', name: 'Jangpura', code: 'JPN', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.5843, longitude: 77.2377 },
  { id: 'DLI_VIO_JN_STADIUM', name: 'Jawaharlal Nehru Stadium', code: 'JNS', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.5904, longitude: 77.2333 },
  { id: 'DLI_INTER_LAJPAT', name: 'Lajpat Nagar', code: 'LN', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: true, interchangeLines: ['Pink Line'], latitude: 28.5684, longitude: 77.2435 },
  { id: 'DLI_VIO_MOOLCHAND', name: 'Moolchand', code: 'MC', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.5642, longitude: 77.2342 },
  { id: 'DLI_VIO_OKHLA', name: 'Okhla', code: 'OK', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.5429, longitude: 77.2750 },
  { id: 'DLI_VIO_SARITAVIHAR', name: 'Sarita Vihar', code: 'SV', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.5288, longitude: 77.2883 },
  { id: 'DLI_VIO_TUGHLAKABAD', name: 'Tughlakabad', code: 'TB', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.5025, longitude: 77.2993 },
  { id: 'DLI_VIO_NHPC', name: 'NHPC Chowk', code: 'NHPC', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.4577, longitude: 77.2219 },
  { id: 'DLI_VIO_BADARPUR', name: 'Badarpur Border', code: 'BB', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.4933, longitude: 77.3031 },
  { id: 'DLI_VIO_FARIDABAD', name: 'Old Faridabad', code: 'OF', city: 'Delhi', network: 'Delhi Metro', line: 'Violet Line', lineColor: '#7F00FF', isInterchange: false, latitude: 28.4808, longitude: 77.3060 },

  // GREEN LINE
  { id: 'DLI_GRE_ASHOKPARK', name: 'Ashok Park Main', code: 'APM', city: 'Delhi', network: 'Delhi Metro', line: 'Green Line', lineColor: '#00FF00', isInterchange: false, latitude: 28.6715, longitude: 77.1553 },
  { id: 'DLI_GRE_SATGURU', name: 'Satguru Ram Singh Marg', code: 'SRS', city: 'Delhi', network: 'Delhi Metro', line: 'Green Line', lineColor: '#00FF00', isInterchange: false, latitude: 28.6620, longitude: 77.1575 },
  { id: 'DLI_GRE_PASCHIM', name: 'Paschim Vihar West', code: 'PVW', city: 'Delhi', network: 'Delhi Metro', line: 'Green Line', lineColor: '#00FF00', isInterchange: false, latitude: 28.6786, longitude: 77.1023 },
  { id: 'DLI_GRE_NANGLOI', name: 'Nangloi Railway Station', code: 'NRS', city: 'Delhi', network: 'Delhi Metro', line: 'Green Line', lineColor: '#00FF00', isInterchange: false, latitude: 28.6821, longitude: 77.0560 },
  { id: 'DLI_GRE_MUNDKA', name: 'Mundka', code: 'MD', city: 'Delhi', network: 'Delhi Metro', line: 'Green Line', lineColor: '#00FF00', isInterchange: false, latitude: 28.6832, longitude: 77.0313 },
  { id: 'DLI_GRE_MUNDKA_IND', name: 'Mundka Industrial Area', code: 'MIA', city: 'Delhi', network: 'Delhi Metro', line: 'Green Line', lineColor: '#00FF00', isInterchange: false, latitude: 28.6834, longitude: 77.0171 },
  { id: 'DLI_GRE_TIKRI', name: 'Tikri Border', code: 'TBK', city: 'Delhi', network: 'Delhi Metro', line: 'Green Line', lineColor: '#00FF00', isInterchange: false, latitude: 28.6880, longitude: 76.9641 },
  { id: 'DLI_GRE_SHREERAM', name: 'Pandit Shree Ram Sharma', code: 'SRS', city: 'Delhi', network: 'Delhi Metro', line: 'Green Line', lineColor: '#00FF00', isInterchange: false, latitude: 28.6893, longitude: 76.9512 },

  // PINK LINE
  { id: 'DLI_PNK_MAJLIS', name: 'Majlis Park', code: 'MPK', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.7244, longitude: 77.1820 },
  { id: 'DLI_PNK_MAYAPURI', name: 'Mayapuri', code: 'MY', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.6372, longitude: 77.1297 },
  { id: 'DLI_PNK_BHIKAJI', name: 'Bhikaji Cama Place', code: 'BCP', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.5679, longitude: 77.1870 },
  { id: 'DLI_PNK_SOUTHEXT', name: 'South Extension', code: 'SE', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.5695, longitude: 77.2210 },
  { id: 'DLI_PNK_VINOBAPURI', name: 'Vinobapuri', code: 'VNB', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.5660, longitude: 77.2510 },
  { id: 'DLI_PNK_ASHRAM', name: 'Ashram', code: 'ASH', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.5720, longitude: 77.2590 },
  { id: 'DLI_PNK_NIZAMUDDIN', name: 'Sarai Kale Khan Hazrat Nizamuddin', code: 'NZM', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.5887, longitude: 77.2572 },
  { id: 'DLI_PNK_MAYURPK1', name: 'Mayur Vihar Pocket 1', code: 'MVP1', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.6090, longitude: 77.2990 },
  { id: 'DLI_PNK_KARKARDUMA', name: 'Karkarduma Court', code: 'KKC', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.6536, longitude: 77.2958 },
  { id: 'DLI_PNK_SHIVVIHAR', name: 'Shiv Vihar', code: 'SVH', city: 'Delhi', network: 'Delhi Metro', line: 'Pink Line', lineColor: '#FF99CC', isInterchange: false, latitude: 28.7222, longitude: 77.2680 },

  // MAGENTA LINE
  { id: 'DLI_MAG_MUNIRKA', name: 'Munirka', code: 'MK', city: 'Delhi', network: 'Delhi Metro', line: 'Magenta Line', lineColor: '#FF00FF', isInterchange: false, latitude: 28.5549, longitude: 77.1711 },
  { id: 'DLI_MAG_IIT', name: 'IIT Delhi', code: 'IIT', city: 'Delhi', network: 'Delhi Metro', line: 'Magenta Line', lineColor: '#FF00FF', isInterchange: false, latitude: 28.5448, longitude: 77.1899 },
  { id: 'DLI_MAG_OKHLANSIC', name: 'Okhla NSIC', code: 'ONS', city: 'Delhi', network: 'Delhi Metro', line: 'Magenta Line', lineColor: '#FF00FF', isInterchange: false, latitude: 28.5545, longitude: 77.2648 },
  { id: 'DLI_MAG_JAMIA', name: 'Jamia Millia Islamia', code: 'JMI', city: 'Delhi', network: 'Delhi Metro', line: 'Magenta Line', lineColor: '#FF00FF', isInterchange: false, latitude: 28.5585, longitude: 77.2812 },

  // AIRPORT EXPRESS
  { id: 'DLI_ORG_IGI', name: 'IGI Airport', code: 'IGI', city: 'Delhi', network: 'Delhi Metro', line: 'Airport Express', lineColor: '#FF8000', isInterchange: false, latitude: 28.5569, longitude: 77.0867 },

  // GURGAON RAPID METRO
  { id: 'DLI_RM_DLF3', name: 'DLF Phase 3', code: 'DF3', city: 'Delhi', network: 'Delhi Metro', line: 'Gurgaon Rapid Metro', lineColor: '#0080FF', isInterchange: false, latitude: 28.4936, longitude: 77.0935 }
];

const delhiLines: MetroLine[] = [
  {
    id: 'DLI_RED',
    name: 'Red Line',
    city: 'Delhi',
    network: 'Delhi Metro',
    color: '#DC241F',
    stations: [
      'DLI_RED_SHAHEED', 'DLI_RED_MOHIT', 'DLI_RED_RAJ_BAGH', 'DLI_RED_MANSAROVAR', 'DLI_RED_JHILMIL', 
      'DLI_INTER_WELCOME', 'DLI_INTER_KASHMERE', 'DLI_RED_TIS_HAZARI', 'DLI_RED_PRATAP', 'DLI_RED_SHASTRI', 
      'DLI_INTER_INDERLOK', 'DLI_RED_KESHAV', 'DLI_INTER_NSP', 'DLI_RED_KOHAT', 'DLI_RED_PITAMPURA'
    ]
  },
  {
    id: 'DLI_YELLOW',
    name: 'Yellow Line',
    city: 'Delhi',
    network: 'Delhi Metro',
    color: '#FFCC00',
    stations: [
      'DLI_YEL_ROHINI18', 'DLI_YEL_ADARSH', 'DLI_INTER_AZADPUR', 'DLI_YEL_VISHWA', 'DLI_INTER_KASHMERE', 
      'DLI_YEL_CHANDNI', 'DLI_YEL_CHAWRI', 'DLI_INTER_RAJIV', 'DLI_YEL_PATEL', 'DLI_INTER_CENTRAL', 
      'DLI_INTER_INA', 'DLI_YEL_AIIMS', 'DLI_INTER_HAUZ_KHAS', 'DLI_YEL_SAKET', 'DLI_YEL_QUTAB', 
      'DLI_YEL_CHHATTARPUR', 'DLI_YEL_ARJAN', 'DLI_INTER_SIKANDARPUR', 'DLI_YEL_HUDA'
    ]
  },
  {
    id: 'DLI_BLUE',
    name: 'Blue Line',
    city: 'Delhi',
    network: 'Delhi Metro',
    color: '#0066CC',
    stations: [
      'DLI_INTER_DWARKA21', 'DLI_BLU_DWARKA8', 'DLI_BLU_DWARKA9', 'DLI_BLU_DWARKA14', 'DLI_BLU_DWARKAMOR', 
      'DLI_BLU_UTTAM', 'DLI_INTER_JANAKPURI', 'DLI_INTER_RAJOURI', 'DLI_BLU_SUBHASH', 'DLI_BLU_MOTINAGAR', 
      'DLI_INTER_KIRTINAGAR', 'DLI_BLU_RAJENDRA', 'DLI_BLU_JHANDEWALAN', 'DLI_BLU_RKASHRAM', 'DLI_INTER_RAJIV', 
      'DLI_BLU_BARAKHAMBA', 'DLI_INTER_MANDIHOUSE', 'DLI_INTER_MAYUR1', 'DLI_BLU_MAYUREXT', 'DLI_BLU_NEWASHOK',
      'DLI_BLU_NOIDA15', 'DLI_BLU_NOIDA16', 'DLI_BLU_NOIDA18', 'DLI_INTER_BOTANICAL', 'DLI_BLU_GOLFCOURSE', 
      'DLI_BLU_NOIDACITY', 'DLI_BLU_NOIDA34', 'DLI_INTER_NOIDA52', 'DLI_BLU_NOIDA61', 'DLI_BLU_NOIDA59', 'DLI_BLU_NOIDA62'
    ]
  },
  {
    id: 'DLI_VIOLET',
    name: 'Violet Line',
    city: 'Delhi',
    network: 'Delhi Metro',
    color: '#7F00FF',
    stations: [
      'DLI_INTER_KASHMERE', 'DLI_INTER_MANDIHOUSE', 'DLI_VIO_JANPATH', 'DLI_INTER_CENTRAL', 'DLI_VIO_JANGPURA', 
      'DLI_VIO_JN_STADIUM', 'DLI_INTER_LAJPAT', 'DLI_VIO_MOOLCHAND', 'DLI_VIO_OKHLA', 
      'DLI_VIO_SARITAVIHAR', 'DLI_VIO_TUGHLAKABAD', 'DLI_VIO_NHPC', 'DLI_VIO_BADARPUR', 'DLI_VIO_FARIDABAD'
    ]
  },
  {
    id: 'DLI_GREEN',
    name: 'Green Line',
    city: 'Delhi',
    network: 'Delhi Metro',
    color: '#00FF00',
    stations: [
      'DLI_INTER_INDERLOK', 'DLI_GRE_ASHOKPARK', 'DLI_GRE_SATGURU', 'DLI_INTER_KIRTINAGAR', 'DLI_GRE_PASCHIM', 
      'DLI_GRE_NANGLOI', 'DLI_GRE_MUNDKA', 'DLI_GRE_MUNDKA_IND', 'DLI_GRE_TIKRI', 'DLI_GRE_SHREERAM'
    ]
  },
  {
    id: 'DLI_PINK',
    name: 'Pink Line',
    city: 'Delhi',
    network: 'Delhi Metro',
    color: '#FF99CC',
    stations: [
      'DLI_PNK_MAJLIS', 'DLI_INTER_AZADPUR', 'DLI_INTER_NSP', 'DLI_INTER_RAJOURI', 'DLI_PNK_MAYAPURI', 
      'DLI_PNK_BHIKAJI', 'DLI_INTER_INA', 'DLI_PNK_SOUTHEXT', 'DLI_INTER_LAJPAT', 'DLI_PNK_VINOBAPURI', 
      'DLI_PNK_ASHRAM', 'DLI_PNK_NIZAMUDDIN', 'DLI_INTER_MAYUR1', 'DLI_PNK_MAYURPK1', 
      'DLI_INTER_WELCOME', 'DLI_PNK_KARKARDUMA', 'DLI_PNK_SHIVVIHAR'
    ]
  },
  {
    id: 'DLI_MAGENTA',
    name: 'Magenta Line',
    city: 'Delhi',
    network: 'Delhi Metro',
    color: '#FF00FF',
    stations: [
      'DLI_INTER_JANAKPURI', 'DLI_MAG_MUNIRKA', 'DLI_MAG_IIT', 'DLI_INTER_HAUZ_KHAS', 
      'DLI_MAG_OKHLANSIC', 'DLI_MAG_JAMIA', 'DLI_INTER_BOTANICAL'
    ]
  },
  {
    id: 'DLI_AIRPORT',
    name: 'Airport Express',
    city: 'Delhi',
    network: 'Delhi Metro',
    color: '#FF8000',
    stations: [
      'DLI_INTER_RAJIV', 'DLI_ORG_IGI', 'DLI_INTER_DWARKA21'
    ]
  },
  {
    id: 'DLI_RAPID',
    name: 'Gurgaon Rapid Metro',
    city: 'Delhi',
    network: 'Delhi Metro',
    color: '#0080FF',
    stations: [
      'DLI_INTER_SIKANDARPUR', 'DLI_RM_DLF3'
    ]
  }
];

// NOIDA METRO (NMRC AQUA LINE - 21 STATIONS)
const noidaStations: MetroStation[] = [
  { id: 'NMRC_AQ_N51', name: 'Noida Sector 51', code: 'S51', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: true, interchangeLines: ['Delhi Metro Blue Line (via 300m Walk)'], latitude: 28.5862, longitude: 77.3710 },
  { id: 'NMRC_AQ_N50', name: 'Noida Sector 50', code: 'S50', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.5750, longitude: 77.3850 },
  { id: 'NMRC_AQ_N76', name: 'Noida Sector 76', code: 'S76', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.5660, longitude: 77.3890 },
  { id: 'NMRC_AQ_N101', name: 'Noida Sector 101', code: 'S101', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.5580, longitude: 77.3940 },
  { id: 'NMRC_AQ_N81', name: 'Noida Sector 81', code: 'S81', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.5490, longitude: 77.3990 },
  { id: 'NMRC_AQ_NSEZ', name: 'NSEZ', code: 'NSEZ', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.5380, longitude: 77.4040 },
  { id: 'NMRC_AQ_N83', name: 'Noida Sector 83', code: 'S83', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.5280, longitude: 77.4070 },
  { id: 'NMRC_AQ_N137', name: 'Noida Sector 137', code: 'S137', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.5091, longitude: 77.4090 },
  { id: 'NMRC_AQ_N142', name: 'Noida Sector 142', code: 'S142', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.5050, longitude: 77.4170 },
  { id: 'NMRC_AQ_N143', name: 'Noida Sector 143', code: 'S143', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.5027, longitude: 77.4263 },
  { id: 'NMRC_AQ_N144', name: 'Noida Sector 144', code: 'S144', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4940, longitude: 77.4350 },
  { id: 'NMRC_AQ_N145', name: 'Noida Sector 145', code: 'S145', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4890, longitude: 77.4410 },
  { id: 'NMRC_AQ_N146', name: 'Noida Sector 146', code: 'S146', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4850, longitude: 77.4450 },
  { id: 'NMRC_AQ_N147', name: 'Noida Sector 147', code: 'S147', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4800, longitude: 77.4520 },
  { id: 'NMRC_AQ_N148', name: 'Noida Sector 148', code: 'S148', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4758, longitude: 77.4600 },
  { id: 'NMRC_AQ_KP2', name: 'Knowledge Park II', code: 'KP2', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4750, longitude: 77.4720 },
  { id: 'NMRC_AQ_PARICHOWK', name: 'Pari Chowk', code: 'PCK', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4631, longitude: 77.5081 },
  { id: 'NMRC_AQ_ALPHA1', name: 'Alpha 1', code: 'A1', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4580, longitude: 77.5120 },
  { id: 'NMRC_AQ_DELTA1', name: 'Delta 1', code: 'D1', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4550, longitude: 77.5150 },
  { id: 'NMRC_AQ_GNIDA', name: 'GNIDA Office', code: 'GND', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4743, longitude: 77.4850 },
  { id: 'NMRC_AQ_DEPOT', name: 'Depot Station', code: 'DPT', city: 'Noida', network: 'Noida Metro', line: 'Aqua Line', lineColor: '#00A8E8', isInterchange: false, latitude: 28.4480, longitude: 77.5210 },
];

const noidaLines: MetroLine[] = [
  {
    id: 'NMRC_AQUA',
    name: 'Aqua Line',
    city: 'Noida',
    network: 'Noida Metro',
    color: '#00A8E8',
    stations: [
      'NMRC_AQ_N51', 'NMRC_AQ_N50', 'NMRC_AQ_N76', 'NMRC_AQ_N101', 'NMRC_AQ_N81', 
      'NMRC_AQ_NSEZ', 'NMRC_AQ_N83', 'NMRC_AQ_N137', 'NMRC_AQ_N142', 'NMRC_AQ_N143', 
      'NMRC_AQ_N144', 'NMRC_AQ_N145', 'NMRC_AQ_N146', 'NMRC_AQ_N147', 'NMRC_AQ_N148', 
      'NMRC_AQ_KP2', 'NMRC_AQ_PARICHOWK', 'NMRC_AQ_ALPHA1', 'NMRC_AQ_DELTA1', 'NMRC_AQ_GNIDA', 'NMRC_AQ_DEPOT'
    ]
  }
];

// MUMBAI METRO
const mumbaiStations: MetroStation[] = [
  { id: 'MUM_VERSOVA_001', name: 'Versova', code: 'VV', city: 'Mumbai', network: 'Mumbai Metro', line: 'Line 1', lineColor: '#0066CC', isInterchange: false, latitude: 19.1136, longitude: 72.7979 },
  { id: 'MUM_ANDHERI_002', name: 'Andheri', code: 'AN', city: 'Mumbai', network: 'Mumbai Metro', line: 'Line 1', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Central Line'], latitude: 19.1136, longitude: 72.8697 },
  { id: 'MUM_DADAR_003', name: 'Dadar', code: 'DD', city: 'Mumbai', network: 'Mumbai Metro', line: 'Line 1', lineColor: '#0066CC', isInterchange: false, latitude: 19.0176, longitude: 72.8194 },
  { id: 'MUM_BANDRA_004', name: 'Bandra', code: 'BR', city: 'Mumbai', network: 'Mumbai Metro', line: 'Line 1', lineColor: '#0066CC', isInterchange: false, latitude: 19.0596, longitude: 72.8295 },
  { id: 'MUM_FORT_005', name: 'Fort', code: 'FT', city: 'Mumbai', network: 'Mumbai Metro', line: 'Line 1', lineColor: '#0066CC', isInterchange: false, latitude: 18.9676, longitude: 72.8194 },
];

const mumbaiLines: MetroLine[] = [
  {
    id: 'MUM_LINE1',
    name: 'Line 1',
    city: 'Mumbai',
    network: 'Mumbai Metro',
    color: '#0066CC',
    stations: ['MUM_VERSOVA_001', 'MUM_ANDHERI_002', 'MUM_DADAR_003', 'MUM_BANDRA_004', 'MUM_FORT_005'],
  },
];

// BANGALORE METRO
const bangaloreStations: MetroStation[] = [
  { id: 'BNG_BAIYAPPANAHALLI_001', name: 'Baiyappanahalli', code: 'BY', city: 'Bengaluru', network: 'Namma Metro', line: 'Purple Line', lineColor: '#800080', isInterchange: false, latitude: 13.0316, longitude: 77.6412 },
  { id: 'BNG_INDIRANAGAR_005', name: 'Indiranagar', code: 'IN', city: 'Bengaluru', network: 'Namma Metro', line: 'Purple Line', lineColor: '#800080', isInterchange: false, latitude: 13.0326, longitude: 77.6245 },
  { id: 'BNG_VIDHANA_002', name: 'Vidhana Soudha', code: 'VS', city: 'Bengaluru', network: 'Namma Metro', line: 'Purple Line', lineColor: '#800080', isInterchange: true, interchangeLines: ['Green Line'], latitude: 13.0361, longitude: 77.5901 },
  { id: 'BNG_KEMPEGOWDA_003', name: 'Kempegowda Bus Station', code: 'KB', city: 'Bengaluru', network: 'Namma Metro', line: 'Purple Line', lineColor: '#800080', isInterchange: true, interchangeLines: ['Green Line'], latitude: 13.0316, longitude: 77.5732 },
  { id: 'BNG_YESWANTHPUR_004', name: 'Yeswanthpur', code: 'YW', city: 'Bengaluru', network: 'Namma Metro', line: 'Green Line', lineColor: '#00AA00', isInterchange: false, latitude: 13.0084, longitude: 77.5707 },
];

const bangaloreLines: MetroLine[] = [
  {
    id: 'BNG_PURPLE',
    name: 'Purple Line',
    city: 'Bengaluru',
    network: 'Namma Metro',
    color: '#800080',
    stations: ['BNG_BAIYAPPANAHALLI_001', 'BNG_INDIRANAGAR_005', 'BNG_VIDHANA_002', 'BNG_KEMPEGOWDA_003'],
  },
  {
    id: 'BNG_GREEN',
    name: 'Green Line',
    city: 'Bengaluru',
    network: 'Namma Metro',
    color: '#00AA00',
    stations: ['BNG_YESWANTHPUR_004', 'BNG_VIDHANA_002', 'BNG_KEMPEGOWDA_003'],
  },
];

// HYDERABAD METRO
const hyderabadStations: MetroStation[] = [
  { id: 'HYD_NAGOLE_001', name: 'Nagole', code: 'NG', city: 'Hyderabad', network: 'Hyderabad Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: false, latitude: 17.3841, longitude: 78.4757 },
  { id: 'HYD_CHARMINAR_002', name: 'Charminar', code: 'CM', city: 'Hyderabad', network: 'Hyderabad Metro', line: 'Red Line', lineColor: '#DC241F', isInterchange: true, interchangeLines: ['Blue Line'], latitude: 17.3605, longitude: 78.4734 },
  { id: 'HYD_PARADISE_003', name: 'Paradise', code: 'PD', city: 'Hyderabad', network: 'Hyderabad Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 17.3912, longitude: 78.4671 },
];

const hyderabadLines: MetroLine[] = [
  {
    id: 'HYD_RED',
    name: 'Red Line',
    city: 'Hyderabad',
    network: 'Hyderabad Metro',
    color: '#DC241F',
    stations: ['HYD_NAGOLE_001', 'HYD_CHARMINAR_002'],
  },
  {
    id: 'HYD_BLUE',
    name: 'Blue Line',
    city: 'Hyderabad',
    network: 'Hyderabad Metro',
    color: '#0066CC',
    stations: ['HYD_PARADISE_003', 'HYD_CHARMINAR_002'],
  },
];

// CHENNAI METRO
const chennaiStations: MetroStation[] = [
  { id: 'CHN_ALANDUR_001', name: 'Alandur', code: 'AL', city: 'Chennai', network: 'Chennai Metro', line: 'Green Line', lineColor: '#00AA00', isInterchange: false, latitude: 13.0016, longitude: 80.2071 },
  { id: 'CHN_NUNGAMBAKKAM_002', name: 'Nungambakkam', code: 'NU', city: 'Chennai', network: 'Chennai Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: false, latitude: 13.0498, longitude: 80.2412 },
  { id: 'CHN_EGMORE_003', name: 'Egmore', code: 'EM', city: 'Chennai', network: 'Chennai Metro', line: 'Blue Line', lineColor: '#0066CC', isInterchange: true, interchangeLines: ['Green Line'], latitude: 13.0524, longitude: 80.2524 },
];

const chennaiLines: MetroLine[] = [
  {
    id: 'CHN_BLUE',
    name: 'Blue Line',
    city: 'Chennai',
    network: 'Chennai Metro',
    color: '#0066CC',
    stations: ['CHN_NUNGAMBAKKAM_002', 'CHN_EGMORE_003'],
  },
  {
    id: 'CHN_GREEN',
    name: 'Green Line',
    city: 'Chennai',
    network: 'Chennai Metro',
    color: '#00AA00',
    stations: ['CHN_ALANDUR_001', 'CHN_EGMORE_003'],
  },
];

// Export all metro networks
export const metroNetworks: Record<string, MetroNetwork> = {
  Delhi: {
    city: 'Delhi',
    network: 'Delhi Metro',
    lines: delhiLines,
    stations: delhiStations,
  },
  Noida: {
    city: 'Noida',
    network: 'Noida Metro',
    lines: noidaLines,
    stations: noidaStations,
  },
  Mumbai: {
    city: 'Mumbai',
    network: 'Mumbai Metro',
    lines: mumbaiLines,
    stations: mumbaiStations,
  },
  Bengaluru: {
    city: 'Bengaluru',
    network: 'Namma Metro',
    lines: bangaloreLines,
    stations: bangaloreStations,
  },
  Hyderabad: {
    city: 'Hyderabad',
    network: 'Hyderabad Metro',
    lines: hyderabadLines,
    stations: hyderabadStations,
  },
  Chennai: {
    city: 'Chennai',
    network: 'Chennai Metro',
    lines: chennaiLines,
    stations: chennaiStations,
  },
};

export const availableCities = Object.keys(metroNetworks);

export const availableNetworks = [
  { name: 'All Metro Networks', isAvailable: true },
  { name: 'Delhi Metro', isAvailable: true, city: 'Delhi' },
  { name: 'Noida Metro', isAvailable: true, city: 'Noida' },
  { name: 'Mumbai Metro', isAvailable: true, city: 'Mumbai' },
  { name: 'Namma Metro (Bengaluru)', isAvailable: true, city: 'Bengaluru' },
  { name: 'Hyderabad Metro', isAvailable: true, city: 'Hyderabad' },
  { name: 'Chennai Metro', isAvailable: true, city: 'Chennai' },
  { name: 'Kolkata Metro', isAvailable: false, city: 'Kolkata' },
  { name: 'Kochi Metro', isAvailable: false, city: 'Kochi' },
  { name: 'Pune Metro', isAvailable: false, city: 'Pune' },
  { name: 'Ahmedabad Metro', isAvailable: false, city: 'Ahmedabad' },
  { name: 'Jaipur Metro', isAvailable: false, city: 'Jaipur' },
];

export function getStationsByCity(city: string): MetroStation[] {
  return metroNetworks[city]?.stations || [];
}

export function getLinesByCity(city: string): MetroLine[] {
  return metroNetworks[city]?.lines || [];
}

export function getAllStations(): MetroStation[] {
  const all: MetroStation[] = [];
  for (const network of Object.values(metroNetworks)) {
    all.push(...network.stations);
  }
  return all;
}

export function getStationById(stationId: string): MetroStation | undefined {
  for (const network of Object.values(metroNetworks)) {
    const station = network.stations.find(s => s.id === stationId);
    if (station) return station;
  }
  return undefined;
}

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface NearestStationResult {
  station: MetroStation;
  distanceKm: number;
  city: string;
  network: string;
}

export function findGlobalNearestStation(
  userLat: number,
  userLon: number,
  maxRadiusKm: number = 25
): NearestStationResult | null {
  let closestResult: NearestStationResult | null = null;
  let minDistance = Infinity;

  for (const network of Object.values(metroNetworks)) {
    for (const station of network.stations) {
      if (typeof station.latitude === 'number' && typeof station.longitude === 'number') {
        const dist = calculateHaversineDistance(
          userLat,
          userLon,
          station.latitude,
          station.longitude
        );
        if (dist < minDistance) {
          minDistance = dist;
          closestResult = {
            station,
            distanceKm: dist,
            city: network.city,
            network: station.network || network.network,
          };
        }
      }
    }
  }

  if (closestResult && minDistance <= maxRadiusKm) {
    return closestResult;
  }

  return null;
}
