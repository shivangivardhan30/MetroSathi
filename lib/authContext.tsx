import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BookedTicket {
  id: string;
  sourceCity: string;
  sourceStationName: string;
  destinationStationName: string;
  fare: number;
  passengers: number;
  ticketType: string;
  timestamp: number;
  qrCodeData: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  favorites: string[]; // station IDs
  recentJourneys: RecentJourney[];
  bookedTickets: BookedTicket[];
}

export interface RecentJourney {
  id: string;
  sourceCity: string;
  sourceStationId: string;
  sourceStationName: string;
  destinationCity: string;
  destinationStationId: string;
  destinationStationName: string;
  timestamp: number;
  fare: number;
  duration: number;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, phone: string) => Promise<void>;
  logout: () => void;
  addFavorite: (stationId: string) => void;
  removeFavorite: (stationId: string) => void;
  addRecentJourney: (journey: Omit<RecentJourney, 'id'>) => void;
  bookTicket: (ticket: Omit<BookedTicket, 'id' | 'timestamp'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('metroSathiUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && !parsedUser.bookedTickets) {
          parsedUser.bookedTickets = [];
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
      }
    }
  }, []);

  const login = async (email: string, phone: string) => {
    setIsLoading(true);
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validate input
      if (!email && !phone) {
        throw new Error('Email or phone number required');
      }

      // Create user object
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: email || undefined,
        phone: phone || undefined,
        name: email ? email.split('@')[0] : phone,
        favorites: [],
        recentJourneys: [],
        bookedTickets: [],
      };

      // Save to localStorage
      localStorage.setItem('metroSathiUser', JSON.stringify(newUser));
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('metroSathiUser');
    setUser(null);
  };

  const addFavorite = (stationId: string) => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      favorites: Array.from(new Set([...user.favorites, stationId])), // Remove duplicates
    };

    setUser(updatedUser);
    localStorage.setItem('metroSathiUser', JSON.stringify(updatedUser));
  };

  const removeFavorite = (stationId: string) => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      favorites: user.favorites.filter(id => id !== stationId),
    };

    setUser(updatedUser);
    localStorage.setItem('metroSathiUser', JSON.stringify(updatedUser));
  };

  const addRecentJourney = (journey: Omit<RecentJourney, 'id'>) => {
    if (!user) return;

    const newJourney: RecentJourney = {
      ...journey,
      id: `journey_${Date.now()}`,
    };

    // Keep only last 10 journeys
    const recentJourneys = [newJourney, ...user.recentJourneys].slice(0, 10);

    const updatedUser: User = {
      ...user,
      recentJourneys,
    };

    setUser(updatedUser);
    localStorage.setItem('metroSathiUser', JSON.stringify(updatedUser));
  };

  const bookTicket = (ticket: Omit<BookedTicket, 'id' | 'timestamp'>) => {
    if (!user) return;

    const newTicket: BookedTicket = {
      ...ticket,
      id: `ticket_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };

    const bookedTickets = [newTicket, ...(user.bookedTickets || [])];

    const updatedUser: User = {
      ...user,
      bookedTickets,
    };

    setUser(updatedUser);
    localStorage.setItem('metroSathiUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        logout,
        addFavorite,
        removeFavorite,
        addRecentJourney,
        bookTicket,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
