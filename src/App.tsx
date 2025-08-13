import React, { useState } from 'react';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import CompanyListPage from './pages/CompanyListPage';
import AddCompanyPage from './pages/AddCompanyPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ReferencesPage from './pages/ReferencesPage';
import NewsPage from './pages/NewsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ContactPage from './pages/ContactPage';
import MyAccountPage from './pages/MyAccountPage';
import { 
  MessageCircle, 
  Hammer, 
  Droplets, 
  Zap, 
  Puzzle, 
  Palette, 
  Trees, 
  Wrench, 
  Flame, 
  HelpCircle,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'companyList' | 'addCompany' | 'howItWorks' | 'references' | 'news' | 'helpCenter' | 'contact' | 'myAccount'>('home');
  const [selectedService, setSelectedService] = useState<string>('');
  const [message, setMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setIsLoggedIn(true);
          
          // Try to get user's full name from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single();
          
          setUserFullName(profile?.full_name || null);
        } else {
          setIsLoggedIn(false);
          setUserFullName(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
        setUserFullName(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        
        // Try to get user's full name from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        
        setUserFullName(profile?.full_name || null);
      } else {
        setIsLoggedIn(false);
        setUserFullName(null);
      }
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const services = [
    { name: 'Murár', icon: Hammer, color: 'from-amber-500 to-orange-600' },
    { name: 'Vodár', icon: Droplets, color: 'from-blue-500 to-cyan-600' },
    { name: 'Elektrikár', icon: Zap, color: 'from-yellow-500 to-amber-600' },
    { name: 'Obkladač', icon: Puzzle, color: 'from-purple-500 to-indigo-600' },
    { name: 'Maliar', icon: Palette, color: 'from-pink-500 to-rose-600' },
    { name: 'Záhradník', icon: Trees, color: 'from-green-500 to-emerald-600' },
    { name: 'Tesár', icon: Wrench, color: 'from-stone-500 to-gray-600' },
    { name: 'Kúrenár', icon: Flame, color: 'from-red-500 to-orange-600' },
    { name: 'Iné služby', icon: HelpCircle, color: 'from-slate-500 to-gray-600' }
  ];

  const menuItems = [
    { label: 'Ako fungujeme?', action: 'howItWorks' },
    { label: 'Referencie', action: 'references' },
    { label: 'Novinky', action: 'news' },
    { label: 'Centrum pomoci', action: 'helpCenter' },
    { label: 'Kontakt', action: 'contact' },
    { label: 'Môj účet', action: 'myAccount' }
  ];

  const handleAsk = async () => {
    if (message.trim()) {
      setIsLoading(true);
      try {
const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTION_URL}/ai-assistant`, {
         method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: message }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAiResponse(data.reply);
        setMessage('');
      } catch (error) {
        console.error('Chyba pri volaní AI asistenta:', error);
        setAiResponse('Prepáčte, nastala chyba pri komunikácii s AI asistentom. Skúste to prosím znovu.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const navigateToCompanyList = (serviceName: string) => {
    setSelectedService(serviceName);
    setCurrentPage('companyList');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setSelectedService('');
  };

  const navigateToAddCompany = () => {
    setCurrentPage('addCompany');
  };

  const navigateToHowItWorks = () => {
    setCurrentPage('howItWorks');
  };

  const navigateToReferences = () => {
    setCurrentPage('references');
  };

  const navigateToNews = () => {
    setCurrentPage('news');
  };

  const navigateToHelpCenter = () => {
    setCurrentPage('helpCenter');
  };

  const navigateToContact = () => {
    setCurrentPage('contact');
  };

  const navigateToMyAccount = () => {
    setCurrentPage('myAccount');
  };

  const handleMenuClick = (action: string | null) => {
    if (action === 'howItWorks') {
      navigateToHowItWorks();
    } else if (action === 'references') {
      navigateToReferences();
    } else if (action === 'news') {
      navigateToNews();
    } else if (action === 'helpCenter') {
      navigateToHelpCenter();
    } else if (action === 'contact') {
      navigateToContact();
    } else if (action === 'myAccount') {
      navigateToMyAccount();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                onClick={navigateToHome}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 cursor-pointer"
              >
                ServisAI
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    className="relative"
                  >
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleMenuClick(item.action);
                      }}
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                    >
                      {item.action === 'myAccount' && isLoggedIn && !isLoadingAuth ? (
                        <span className="flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
                          <User size={14} />
                          {userFullName || 'Prihlásený'}
                        </span>
                      ) : item.action === 'myAccount' && !isLoggedIn && !isLoadingAuth ? (
                        <span className="flex items-center gap-2 bg-red-100 text-red-800 rounded-full px-3 py-1 text-sm font-medium">
                          <LogOut size={14} />
                          Odhlásený
                        </span>
                      ) : (
                        item.label
                      )}
                    </a>
                  </div>
                ))}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToAddCompany();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ml-4"
                >
                  Pridať firmu
                </a>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  className="relative"
                >
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick(item.action);
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    {item.action === 'myAccount' && isLoggedIn && !isLoadingAuth ? (
                      <span className="flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium">
                        <User size={14} />
                        {userFullName || 'Prihlásený'}
                      </span>
                    ) : item.action === 'myAccount' && !isLoggedIn && !isLoadingAuth ? (
                      <span className="flex items-center gap-2 bg-red-100 text-red-800 rounded-full px-3 py-1 text-sm font-medium">
                        <LogOut size={14} />
                        Odhlásený
                      </span>
                    ) : (
                      item.label
                    )}
                  </a>
                </div>
              ))}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToAddCompany();
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white block px-3 py-2 text-base font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 mt-4"
              >
                Pridať firmu
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        {/* Render different pages based on currentPage */}
        {currentPage === 'home' && (
          <>
            {/* Hero Section with AI Chat */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                  Nájdite svojho
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    AI Asistenta
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
                  Opýtajte sa nášho AI asistenta na čokoľvek o domácich službách. 
                  Pomôže vám nájsť správneho odborníka pre váš projekt.
                </p>
              </div>

              {/* AI Chat Interface */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-20">
                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl mr-4">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">AI Asistent</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Napíšte svoju otázku... napr. 'Potrebujem opraviť vodovodné potrubie'"
                    className="flex-1 px-6 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white/80 backdrop-blur-sm"
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleAsk()}
                  />
                  <button
                    onClick={handleAsk}
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? 'Načítavam...' : 'Odoslať'}
                  </button>
                </div>
                
                {/* Loading State */}
                {isLoading && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                      <p className="text-blue-700 font-medium">AI asistent premýšľa...</p>
                    </div>
                  </div>
                )}
                
                {/* AI Response */}
                {aiResponse && !isLoading && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg mr-4 flex-shrink-0">
                        <MessageCircle className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-green-800 mb-2">AI Asistent odpovedá:</h4>
                        <p className="text-green-700 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Services Grid */}
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Naše služby</h3>
                <p className="text-lg text-gray-600">Vyberte si kategóriu služby, ktorú potrebujete</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <div
                      key={index}
                      onClick={() => navigateToCompanyList(service.name)}
                      className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                    >
                      <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="text-white" size={28} />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 text-center group-hover:text-blue-600 transition-colors duration-200">
                        {service.name}
                      </h4>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {currentPage === 'companyList' && (
          <CompanyListPage 
            selectedService={selectedService}
            onNavigateBack={navigateToHome}
          />
        )}

        {currentPage === 'addCompany' && (
          <AddCompanyPage 
            onNavigateBack={navigateToHome}
          />
        )}

        {currentPage === 'howItWorks' && (
          <HowItWorksPage 
            onNavigateBack={navigateToHome}
            onNavigateToAddCompany={navigateToAddCompany}
          />
        )}

        {currentPage === 'references' && (
          <ReferencesPage 
            onNavigateBack={navigateToHome}
          />
        )}

        {currentPage === 'news' && (
          <NewsPage 
            onNavigateBack={navigateToHome}
          />
        )}

        {currentPage === 'helpCenter' && (
          <HelpCenterPage 
            onNavigateBack={navigateToHome}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage 
            onNavigateBack={navigateToHome}
          />
        )}

        {currentPage === 'myAccount' && (
          <MyAccountPage 
            onNavigateBack={navigateToHome}
            onNavigateToAddCompany={navigateToAddCompany}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              ServisAI
            </h2>
            <p className="text-gray-600 mb-6">
              Váš AI asistent pre domácé služby
            </p>
            <div className="flex justify-center space-x-6">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick(item.action);
                  }}
                  className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                © 2025 ServisAI. Všetky práva vyhradené.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;