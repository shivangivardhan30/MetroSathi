# MetroSathi - Metro Transit Navigation & Passenger Guidance System

> **Tagline**: Navigate every metro journey with confidence.

MetroSathi is a comprehensive, production-grade passenger transit web application designed for seamless navigation across Indian metro networks, with deep coverage of Delhi NCR, Noida Metro (Aqua Line), Airport Express, and Rapid Metro Gurgaon.

---

## Key Features

### 1. Optimal Route Planning & Inter-Network Navigation
- **Graph-Based Shortest Path Engine**: Automatically calculates the fastest route, minimum interchanges, estimated travel time, distance, and fare.
- **Inter-Network Transfer Walkway Support**: Clear guidance for dedicated transfer corridors (e.g. Noida Sector 51 on Aqua Line to Noida Sector 52 on Blue Line with ~300m walkway instructions).
- **Train Direction Guidance**: Shows the exact terminus direction (e.g., *"Board train towards Noida Electronic City"* or *"Board train towards Samaypur Badli"*).
- **Platform & Gate Guidance**: Displays boarding platform numbers and recommended entry/exit gates for each station.

### 2. Destination Arrival SOS Alert & Alarm System
- **Pre-Arrival Warning**: Alerts passengers 1 station before their destination with a gentle two-tone chime and vibration so they can prepare their belongings.
- **High-Priority Arrival SOS Alarm**:
  - 4-tone ascending alert chime generated using the Web Audio API (works natively across all modern browsers without external audio assets).
  - Device haptic vibration pattern (`navigator.vibrate([500, 250, 500, 250, 1000])`).
  - Automated voice announcement in both English and Hindi.
  - High-contrast visual modal highlighting the destination station name and designated exit gate.
- **Instant SOS Test Mode**: One-click test button to preview chime sound, vibration, and alert popup at any time.
- **Transit Emergency SOS Helpline**: Quick dialer for official transit security numbers:
  - DMRC 24x7 Helpline: `155370`
  - National Emergency & Police: `112`
  - Women Transit Safety Helpline: `1091`

### 3. Interactive Schematic Metro Map
- **Vector SVG Transit Map**: Clean schematic diagram showing all lines with standard official color codes.
- **Interactive Controls**: Smooth pan, zoom, reset view, and line-specific isolation filters (Red, Yellow, Blue, Green, Violet, Pink, Magenta, Grey, Airport Express, Aqua Line).
- **Route Highlighting**: Dynamically illuminates active transit routes and station nodes.
- **Station Inspector**: Tap any station on the map to view connecting lines, platforms, and interchange details.

### 4. Digital Transit Pass & QR Ticketing
- **Fare Calculator**: Official distance-based fare calculation across standard networks.
- **Electronic Ticket Generation**: Generates scannable simulated QR passes with booking references, timestamps, passenger counts, and gate validation status.
- **Save & Download**: Pass export support for printing or offline presentation.

### 5. Passenger Information Desk
- Instant transit query answers for first/last train timings, interchange tips, luggage rules, smart card recharge, and lost & found procedures.

### 6. Formal Public Transit Aesthetic
- **Design Philosophy**: Modeled after standard government and transit authority portals (DMRC, IRCTC, TfL).
- **Color Palette**: Royal Transit Blue (`#1D4ED8`), Deep Navy (`#0F172A`), Off-White (`#F8FAFC`), and clean Slate borders (`#CBD5E1`).
- **Zero-Emoji Policy**: Clean SVG vector iconography and professional typography throughout the interface.
- **Bilingual Support**: Instant toggle between English and Hindi (हिन्दी).

---

## Covered Metro Networks & Lines

| Network | Lines Included |
| :--- | :--- |
| **Delhi Metro (DMRC)** | Red Line, Yellow Line, Blue Line (Main & Branch), Green Line, Violet Line, Pink Line, Magenta Line, Grey Line |
| **Airport Express Line** | New Delhi to Yashobhoomi Dwarka Sector 25 |
| **Noida Metro (NMRC)** | Aqua Line (Noida Sector 51 to Depot) with inter-network transfer to Blue Line |
| **Rapid Metro Gurgaon** | Sector 55-56 to Phase 3 with interchange at Sikanderpur (Yellow Line) |

---

## Tech Stack

- **Framework**: Next.js (React 18)
- **Language**: TypeScript
- **Styling**: Standard CSS3 design tokens with responsive layout
- **Audio & Haptics**: Web Audio API (Synthesized Chimes) + Web Speech API + Vibration API
- **Deployment**: Vercel / Node.js runtime

---

## Getting Started

### Prerequisites
- Node.js (v18.x or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shivangivardhan30/MetroSathi.git
cd MetroSathi
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## Project Structure

```text
MetroSathi/
├── components/
│   ├── JourneyTracker.tsx      # Real-time simulation, Pre-Arrival & SOS Destination Alert
│   ├── Layout.tsx              # Official transit header, gov strip & navigation
│   ├── LocationCard.tsx        # GPS station locator
│   ├── LoginForm.tsx           # Passenger authentication
│   ├── MetroMap.tsx            # Interactive SVG schematic map
│   ├── MetroSathiLogo.tsx      # Official vector logo
│   ├── NavIcons.tsx            # Clean vector SVG transit icons
│   ├── RouteDetails.tsx        # Step-by-step station breakdown & interchange notes
│   ├── SearchableDropdown.tsx  # Station selector with autocomplete
│   ├── TicketBooking.tsx       # Dynamic QR ticket booking modal
│   └── UserProfile.tsx         # Passenger transit pass history
├── lib/
│   ├── authContext.tsx         # Authentication state provider
│   ├── languageContext.tsx     # Language state provider
│   ├── metroData.ts            # Network lines, stations, interchanges & coordinates
│   ├── routeCalculator.ts      # Dijkstra shortest-path routing algorithm
│   ├── translations.ts         # English and Hindi dictionaries
│   └── validateMetroData.ts    # Graph integrity & connectivity checker
├── pages/
│   ├── _app.tsx                # App wrapper & global meta tags
│   ├── assistant.tsx           # Passenger Information Desk
│   ├── index.tsx               # Homepage & route planner
│   ├── journey.tsx             # Dedicated route search & live tracker
│   ├── map.tsx                 # Fullscreen interactive metro map
│   └── tickets.tsx             # Digital QR ticket booking page
└── styles/
    └── globals.css             # Formal transit design tokens & styling
```

---

## License

This project is licensed under the MIT License.
