import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  Euro, 
  Calendar,
  ArrowLeft,
  Grid3X3,
  Map,
  ChevronDown,
  X,
  Verified,
  Phone,
  Mail,
  AlertCircle,
  Menu,
  User
} from 'lucide-react';
import { supabase, type Company } from '../lib/supabase';
import { renderStars } from '../utils/starRating';

interface CompanyWithRating extends Company {
  average_rating?: number;
  review_count?: number;
}

interface CompanyListPageProps {
  selectedService?: string;
  onNavigateBack: () => void;
}

function CompanyListPage({ selectedService, onNavigateBack }: CompanyListPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('best-match');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Supabase state
  const [companies, setCompanies] = useState<CompanyWithRating[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [errorCompanies, setErrorCompanies] = useState<string | null>(null);

  // Load companies from Supabase
  useEffect(() => {
    loadCompanies();
  }, [selectedService]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      setErrorCompanies(null);

      let qy = supabase
        .from("companies_with_rating")
        .select("id,created_at,name,description,email,phone,website,location,services,status,user_id,average_rating,review_count")
        .eq("status", "approved")
        .order('created_at', { ascending: false });

      if (selectedService) {
        qy = qy.contains("services", [selectedService]);
      }

      const { data: companiesData, error: companiesError } = await qy;

      if (companiesError) {
        throw companiesError;
      }

      setCompanies(companiesData || []);
    } catch (error: any) {
      console.error('Error loading companies:', error);
      setErrorCompanies(error.message || 'Chyba pri načítavaní firiem');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const quickFilters = [
    { id: 'verified', label: 'Overené', icon: Shield },
    { id: 'rating-4plus', label: '★ 4+', icon: Star },
    { id: 'today', label: 'Dnes', icon: Calendar },
    { id: 'escrow', label: 'Escrow', icon: Shield },
    { id: 'budget-50', label: 'Do 50 €', icon: Euro }
  ];

  const sortOptions = [
    { value: 'best-match', label: 'Najlepšie pre mňa (AI)' },
    { value: 'rating', label: 'Hodnotenie' },
    { value: 'price', label: 'Cena' },
    { value: 'response-time', label: 'Rýchlosť reakcie' },
    { value: 'distance', label: 'Vzdialenosť' }
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f !== filterId));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <button
              onClick={onNavigateBack}
              className="mr-4 p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {selectedService ? `${selectedService} - Zoznam firiem` : 'Všetky služby'}
          </h1>
          <p className="text-xl text-blue-100">
            Nájdite si overených odborníkov vo vašom okolí
          </p>
        </div>
      </div>

      {/* Filter Bar - Sticky */}
      <div className="sticky top-16 bg-white/90 backdrop-blur-md border-b shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search and Quick Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hľadať firmy..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((filter) => {
                const IconComponent = filter.icon;
                const isActive = activeFilters.includes(filter.id);
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent size={16} />
                    {filter.label}
                  </button>
                );
              })}
              
              {/* More Filters Button */}
              <button
                onClick={() => setShowAdvancedFilters(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
              >
                <Filter size={16} />
                Viac filtrov
              </button>
            </div>
          </div>

          {/* Active Filters Pills */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {activeFilters.map((filterId) => {
                const filter = quickFilters.find(f => f.id === filterId);
                return (
                  <div
                    key={filterId}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {filter?.label}
                    <button
                      onClick={() => removeFilter(filterId)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Vymazať všetko
              </button>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-3 pt-3 border-t">
            <p className="text-gray-600 text-sm">
              {loadingCompanies ? (
                'Načítavam firmy...'
              ) : (
                <>
                  Zodpovedá <span className="font-semibold">{companies.length} firmám</span> • 
                </>
              )}
              priem. odpoveď <span className="font-semibold">23 min</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sort and View Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 size={16} />
              Zoznam
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map size={16} />
              Mapa
            </button>
          </div>
        </div>
      </div>

      {/* Company List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Loading State */}
        {loadingCompanies && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {errorCompanies && (
          <div className="text-center py-20">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chyba pri načítavaní
              </h3>
              <p className="text-gray-600 mb-4">
                {errorCompanies}
              </p>
              <button
                onClick={loadCompanies}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Skúsiť znovu
              </button>
            </div>
          </div>
        )}

        {/* No Companies State */}
        {!loadingCompanies && !errorCompanies && companies.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <Shield className="text-gray-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Žiadne firmy
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedService 
                  ? `Zatiaľ nie sú registrované žiadne firmy pre službu "${selectedService}"`
                  : 'Zatiaľ nie sú registrované žiadne firmy'
                }
              </p>
            </div>
          </div>
        )}

        {/* Companies Grid */}
        {!loadingCompanies && !errorCompanies && companies.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col"
              >
                {/* Company Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={`${company.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {company.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {company.name}
                        </h3>
                        {company.status === 'approved' && (
                          <Verified className="text-blue-600" size={20} />
                        )}
                      </div>
                      
                      {/* Rating Placeholder - TODO: Add reviews system */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(company.average_rating || 0)}
                          <span className="ml-1 text-gray-500 text-sm">
                            {company.average_rating ? company.average_rating.toFixed(1) : 'N/A'} ({company.review_count || 0})
                          </span>
                        </div>
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {company.location || 'Neurčené'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          Nová firma
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="text-right">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Overená
                    </span>
                  </div>
                </div>

                {/* Content that should grow to push buttons to bottom */}
                <div className="flex-grow">
                  {/* Services */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {company.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {company.description || 'Popis firmy nie je k dispozícii.'}
                  </p>

                  {/* Contact Info */}
                  {(company.email || company.phone) && (
                    <div className="text-sm text-gray-600 mb-4">
                      {company.email && (
                        <div className="flex items-center gap-1 mb-1">
                          <Mail size={14} />
                          {company.email}
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          {company.phone}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium">
                    Kontaktovať
                  </button>
                  {company.phone && (
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Phone size={18} />
                    </button>
                  )}
                  {company.email && (
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <Mail size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Pokročilé filtre</h2>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Advanced Filter Content - Placeholder */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cenový rozsah (€/hod)
                  </label>
                  <div className="bg-gray-100 h-12 rounded-lg flex items-center justify-center text-gray-500">
                    Slider placeholder
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesto/Okres
                  </label>
                  <input
                    type="text"
                    placeholder="Zadajte mesto alebo okres"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategórie služieb
                  </label>
                  <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center text-gray-500">
                    Multi-select placeholder
                  </div>
                </div>
              </div>
              
              {/* Modal Actions */}
              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Vymazať
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
                >
                  Použiť
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyListPage;