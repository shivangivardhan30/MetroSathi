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
      ? "Hello! I am MetroMate, your AI travel assistant. Ask me questions about metro routes, platforms, exit gates, or ticketing across India!"
      : "नमस्ते! मैं मेट्रो साथी हूँ, आपका AI यात्रा सहायक। भारत के किसी भी मेट्रो मार्ग, प्लेटफॉर्म, निकास द्वार या टिकट के बारे में मुझसे पूछें!";

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
    if (textLower.includes('ticket') || textLower.includes('book') || textLower.includes('fare') || textLower.includes('किराया') || textLower.includes('टिकट') || textLower.includes('बुक')) {
      const response = language === 'en'
        ? "You can easily book a single journey QR ticket directly through our Journey Planner page. Fares are calculated dynamically based on the number of stations you travel."
        : "आप हमारे यात्रा योजनाकार (Journey Planner) पेज के माध्यम से सीधे सिंगल जर्नी क्यूआर टिकट बुक कर सकते हैं। आप जितने स्टेशनों की यात्रा करते हैं, उसके आधार पर किरायों की गणना की जाती है।";
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
    <main className="container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', maxWidth: '840px', padding: '24px 16px 0 16px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ color: '#0B1F3A', margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>
            {t.assistant.title}
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: '4px 0 0' }}>{t.assistant.description}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div
        style={{
          flex: 1,
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 12px 32px rgba(11, 31, 58, 0.08), 0 0 1px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0, 87, 184, 0.12)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              width: '100%',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <div
              style={{
                maxWidth: '85%',
                background: msg.sender === 'user' 
                  ? 'linear-gradient(135deg, #0B1F3A 0%, #0057B8 100%)' 
                  : '#F8FAFC',
                color: msg.sender === 'user' ? 'white' : '#0F172A',
                borderRadius: msg.sender === 'user' 
                  ? '20px 20px 4px 20px' 
                  : '20px 20px 20px 4px',
                padding: '14px 18px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Message text */}
              <div style={{ fontSize: '0.98rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>

              {/* Interactive inline route data */}
              {msg.routeData && (
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px', color: '#1e293b' }}>
                  <RouteDetails route={msg.routeData} language={language} />
                </div>
              )}

              {/* Timestamp */}
              <div style={{ fontSize: '0.75rem', alignSelf: 'flex-end', color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'rgba(255,255,255,0.8)', padding: '14px 20px', borderRadius: '20px', color: '#888', display: 'flex', gap: '4px', border: '1px solid rgba(102,126,234,0.1)' }}>
              <div style={{ animation: 'bounce 0.8s infinite', animationDelay: '0s' }}>●</div>
              <div style={{ animation: 'bounce 0.8s infinite', animationDelay: '0.2s' }}>●</div>
              <div style={{ animation: 'bounce 0.8s infinite', animationDelay: '0.4s' }}>●</div>
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
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(0, 87, 184, 0.12)',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontWeight: '700', color: '#0B1F3A', fontSize: '0.9rem', marginBottom: '10px' }}>
            💡 {t.assistant.sampleQuestionsTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {cannedQuestions.map((faq) => (
              <button
                key={faq.question}
                onClick={() => handleAsk(faq.question)}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0057B8')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                ❓ {faq.question}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Input Form */}
      <div style={{ display: 'flex', gap: '10px', paddingBottom: '24px' }}>
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
            border: '1px solid #CBD5E1',
            borderRadius: '16px',
            padding: '14px 20px',
            fontSize: '1rem',
            background: 'white',
            outline: 'none',
            boxShadow: '0 4px 12px rgba(11, 31, 58, 0.04)',
          }}
        />
        <button
          onClick={() => handleAsk()}
          className="button"
          style={{
            margin: 0,
            borderRadius: '16px',
            padding: '14px 24px',
            fontWeight: 'bold',
          }}
        >
          🚀 Send
        </button>
      </div>
    </main>
  );
}
