import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../lib/translations';
import { useLanguage } from '../lib/languageContext';
import { metroNetworks, getStationById, getStationsByCity, MetroStation } from '../lib/metroData';
import { calculateRoute, MetroRoute } from '../lib/routeCalculator';
import RouteDetails from '../components/RouteDetails';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  routeData?: MetroRoute | null;
  timestamp: Date;
}

export default function Assistant() {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = useTranslation(language);

  // Initialize initial greeting and react to language changes
  useEffect(() => {
    const greetingText = language === 'en'
      ? "Welcome to the Passenger Help & Transit Information Desk. How can we assist you with routes, interchange stations, platforms, or exit gates today?"
      : "यात्री सहायता एवं पारगमन सूचना केंद्र में आपका स्वागत है। आज हम आपको मार्ग, इंटरचेंज स्टेशन, प्लेटफॉर्म या निकास द्वार के बारे में क्या जानकारी दे सकते हैं?";

    setMessages([
      {
        id: 'greet_1',
        sender: 'ai',
        text: greetingText,
        timestamp: new Date(),
      },
    ]);
  }, [language]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const cannedQuestions = [
    { question: t.assistant.question1, answer: t.assistant.answer1 },
    { question: t.assistant.question2, answer: t.assistant.answer2 },
    { question: t.assistant.question3, answer: t.assistant.answer3 },
  ];

  // Client-side NLP query parser
  const parseQueryAndReply = (userText: string) => {
    const textLower = userText.toLowerCase();
    
    // Find all stations in our database matching query
    const matchedStations: { station: MetroStation; city: string }[] = [];
    
    Object.entries(metroNetworks).forEach(([cityName, network]) => {
      network.stations.forEach((station) => {
        const stationNameLower = station.name.toLowerCase();
        // Match both English name and common variations
        if (
          textLower.includes(stationNameLower) ||
          textLower.includes(stationNameLower.replace(' ', '')) ||
          textLower.includes(station.code.toLowerCase())
        ) {
          // Avoid duplicates
          if (!matchedStations.some((s) => s.station.id === station.id)) {
            matchedStations.push({ station, city: cityName });
          }
        }
      });
    });

    // Case 1: Route query containing at least two stations in the same city
    if (matchedStations.length >= 2) {
      // Find two stations in the same city
      let src = matchedStations[0];
      let dest = matchedStations[1];
      
      // Look for a pair sharing the same city
      let foundPair = false;
      for (let i = 0; i < matchedStations.length; i++) {
        for (let j = i + 1; j < matchedStations.length; j++) {
          if (matchedStations[i].city === matchedStations[j].city) {
            src = matchedStations[i];
            dest = matchedStations[j];
            foundPair = true;
            break;
          }
        }
        if (foundPair) break;
      }

      if (foundPair) {
        // Decide which is source and which is destination based on word ordering
        const idxSrc = textLower.indexOf(src.station.name.toLowerCase());
        const idxDest = textLower.indexOf(dest.station.name.toLowerCase());
        
        let start = src;
        let end = dest;
        if (idxDest !== -1 && idxSrc !== -1 && idxDest < idxSrc) {
          start = dest;
          end = src;
        }

        const calculatedRoute = calculateRoute(start.city, start.station.id, end.station.id);
        
        if (calculatedRoute) {
          const aiResponse = language === 'en'
            ? `I found a route for you in ${start.city}! Board at ${start.station.name} and head to ${end.station.name}. Details are shown below:`
            : `मुझे आपके लिए ${start.city} में एक मार्ग मिला है! ${start.station.name} पर चढ़ें और ${end.station.name} पर जाएं। विवरण नीचे दिखाया गया है:`;

          return {
            text: aiResponse,
            routeData: calculatedRoute,
          };
        }
      }
    }

    // Case 2: Station Gate enquiry
    if (matchedStations.length === 1 && (textLower.includes('gate') || textLower.includes('exit') || textLower.includes('द्वार') || textLower.includes('निकास'))) {
      const { station } = matchedStations[0];
      const entryGatesStr = station.entryGates && station.entryGates.length > 0 ? station.entryGates.join(', ') : 'Gate information unavailable';
      const exitGatesStr = station.exitGates && station.exitGates.length > 0 ? station.exitGates.join(', ') : 'Gate information unavailable';
      
      const response = language === 'en'
        ? `At ${station.name} station (${station.line}), entry gates: ${entryGatesStr}. Exit gates: ${exitGatesStr}.`
        : `${station.name} स्टेशन (${station.line}) पर, प्रवेश द्वार: ${entryGatesStr}। निकास द्वार: ${exitGatesStr}।`;
        
      return { text: response };
    }

    // Case 3: Platform enquiry
    if (matchedStations.length === 1 && (textLower.includes('platform') || textLower.includes('प्लेटफार्म') || textLower.includes('नंबर'))) {
      const { station } = matchedStations[0];
      const platformStr = station.platformNumbers && station.platformNumbers.length > 0 ? station.platformNumbers.join(' and ') : 'Platform information unavailable';
      
      const response = language === 'en'
        ? `${station.name} station serves the ${station.line}. Platforms: ${platformStr}. ${station.isInterchange ? `Interchange lines: ${station.interchangeLines?.join(', ')}.` : ''}`
        : `${station.name} स्टेशन प्लेटफॉर्म: ${platformStr} पर ${station.line} की सेवाएं प्रदान करता है। ${station.isInterchange ? `यह ${station.interchangeLines?.join(', ')} से जुड़ता है।` : ''}`;
        
      return { text: response };
    }

    // Case 4: Ticket enquiries
    if (textLower.includes('ticket') || textLower.includes('book') || textLower.includes('fare') || textLower.includes('किराया') || textLower.includes('टिकट') || textLower.includes('बुक') || textLower.includes('lane') || textLower.includes('लेना')) {
      const response = language === 'en'
        ? "You can easily book digital QR tickets by navigating to the 'Tickets' section (/tickets) or clicking 'Buy Metro Ticket' after searching your route. We support single/group tickets with instant QR generation and simulated UPI/Card payment."
        : "आप नेविगेशन बार में 'Tickets' (/tickets) पेज पर जाकर या अपनी यात्रा सर्च करके 'मेट्रो टिकट खरीदें' पर क्लिक करके आसानी से डिजिटल क्यूआर टिकट प्राप्त कर सकते हैं। इसमें UPI, कार्ड और नेट बैंकिंग द्वारा तत्काल QR कोड टिकट मिलता है।";
      return { text: response };
    }

    // Default Fallback
    const response = language === 'en'
      ? "I'm not sure I understood that fully. You can ask me route directions (e.g. 'How to go from Rajiv Chowk to Noida'), exit gate details, or platform assignments."
      : "मुझे खेद है, मैं इसे पूरी तरह समझ नहीं पाया। आप मुझसे मार्ग निर्देश (उदा. 'राजीव चौक से नोएडा कैसे जाएं'), निकास द्वार विवरण, या प्लेटफॉर्म के बारे में पूछ सकते हैं।";
      
    return { text: response };
  };

  const handleAsk = (customQuery?: string) => {
    const textToSubmit = customQuery || query;
    if (!textToSubmit.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: textToSubmit,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const result = parseQueryAndReply(textToSubmit);
      const aiMsg: Message = {
        id: `msg_${Date.now()}_ai`,
        sender: 'ai',
        text: result.text,
        routeData: result.routeData || null,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', maxWidth: '860px', padding: '20px 16px 0 16px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h1 style={{ color: 'var(--metro-navy)', margin: 0, fontSize: '1.45rem', fontWeight: 700 }}>
            {t.assistant.title}
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '4px 0 0' }}>{t.assistant.description}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div
        style={{
          flex: 1,
          background: '#FFFFFF',
          borderRadius: '6px',
          padding: '20px',
          border: '1px solid var(--metro-card-border)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginBottom: '16px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                background: msg.sender === 'user' 
                  ? 'var(--metro-blue)' 
                  : '#F8FAFC',
                color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                borderRadius: '6px',
                padding: '12px 16px',
                border: msg.sender === 'user' ? '1px solid #1E40AF' : '1px solid var(--metro-card-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Message text */}
              <div style={{ fontSize: '0.92rem', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>

              {/* Interactive inline route data */}
              {msg.routeData && (
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px', color: '#1e293b' }}>
                  <RouteDetails route={msg.routeData} language={language} />
                </div>
              )}

              {/* Timestamp */}
              <div style={{ fontSize: '0.72rem', alignSelf: 'flex-end', color: msg.sender === 'user' ? 'rgba(255,255,255,0.75)' : '#94A3B8' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: '4px', color: '#64748B', fontSize: '0.85rem', border: '1px solid #CBD5E1' }}>
              Fetching transit information...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* FAQs Panel / Suggestions */}
      {messages.length === 1 && (
        <section
          style={{
            background: 'white',
            borderRadius: '6px',
            padding: '14px',
            border: '1px solid var(--metro-card-border)',
            marginBottom: '14px',
          }}
        >
          <div style={{ fontWeight: '700', color: '#0B1F3A', fontSize: '0.85rem', marginBottom: '8px' }}>
            {t.assistant.sampleQuestionsTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {cannedQuestions.map((faq) => (
              <button
                key={faq.question}
                onClick={() => handleAsk(faq.question)}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--metro-card-border)',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--metro-blue)', e.currentTarget.style.color = 'var(--metro-blue)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--metro-card-border)', e.currentTarget.style.color = '#334155')}
              >
                {faq.question}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Input Form */}
      <div style={{ display: 'flex', gap: '8px', paddingBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.assistant.placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAsk();
          }}
          style={{
            flex: 1,
            border: '1px solid var(--metro-card-border)',
            borderRadius: '4px',
            padding: '10px 14px',
            fontSize: '0.92rem',
            background: 'white',
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleAsk()}
          className="button"
          style={{
            margin: 0,
            borderRadius: '4px',
            padding: '10px 20px',
            fontWeight: 600,
          }}
        >
          Send Enquiry
        </button>
      </div>
    </main>
  );
}
