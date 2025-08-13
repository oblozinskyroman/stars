import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Globe, Phone, Mail, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Company {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  services: string[];
  average_rating: number;
  review_count: number;
  created_at: string;
}

interface CompanyListPageProps {
  selectedService: string;
  onNavigateBack: () => void;
}

const CompanyListPage: React.FC<CompanyListPageProps> = ({ selectedService, onNavigateBack }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('best-match');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const quickFilters = [
    { id: 'rating-4plus', label: '★ 4+ hodnotenie', count: 0 },
    { id: 'with-reviews', label: 'S recenziami', count: 0 },
    { id: 'today', label: 'Dnes', count: 0 },
    { id: 'new-7days', label: 'Nové (7 dní)', count: 0 },
  ];

  const sortOptions = [
    { value: 'best-match', label: 'Najlepšie pre mňa (AI)' },
    { value: 'rating', label: 'Hodnotenie' },
    { value: 'newest', label: 'Najnovšie' },
    { value: 'name', label: 'Názov (A-Z)' },
    { value: 'review-count', label: 'Počet recenzií' },
  ];

  useEffect(() => {
    loadCompanies();
  }, [selectedService, searchQuery, sortBy, activeFilters]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('companies_with_rating')
        .select('*')
        .eq('status', 'approved');

      // Apply service filter if selected
      if (selectedService && selectedService !== 'all') {
        query = query.contains('services', [selectedService]);
      }

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      // Apply active filters
      if (activeFilters.includes('rating-4plus')) {
        query = query.gte('average_rating', 4);
      }

      if (activeFilters.includes('with-reviews')) {
        query = query.gt('review_count', 0);
      }

      if (activeFilters.includes('today')) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte('created_at', today.toISOString());
      }

      if (activeFilters.includes('new-7days')) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        query = query.gte('created_at', sevenDaysAgo.toISOString());
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.order('average_rating', { ascending: false, nullsLast: true })
                      .order('review_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'review-count':
          query = query.order('review_count', { ascending: false })
                      .order('average_rating', { ascending: false, nullsLast: true });
          break;
        case 'best-match':
        default:
          // Smart sorting: prioritize companies with good ratings and reviews
          query = query.order('average_rating', { ascending: false, nullsLast: true })
                      .order('review_count', { ascending: false })
                      .order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading companies:', error);
        return;
      }

      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam firmy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onNavigateBack}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← Späť
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedService === 'all' ? 'Všetky firmy' : `Firmy - ${selectedService}`}
              </h1>
              <span className="ml-2 text-sm text-gray-500">
                ({companies.length} {companies.length === 1 ? 'firma' : companies.length < 5 ? 'firmy' : 'firiem'})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vyhľadávanie
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Názov firmy, popis, lokalita..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rýchle filtre
                </label>
                <div className="space-y-2">
                  {quickFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeFilters.includes(filter.id)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Triediť podľa
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Companies List */}
          <div className="flex-1">
            {companies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Žiadne firmy nenájdené
                </h3>
                <p className="text-gray-600">
                  Skúste zmeniť vyhľadávacie kritériá alebo filtre.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {companies.map((company) => (
                  <div key={company.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {company.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            {company.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {company.location}
                              </div>
                            )}
                            {company.average_rating > 0 && (
                              <div className="flex items-center gap-1">
                                <div className="flex">
                                  {renderStars(company.average_rating)}
                                </div>
                                <span className="font-medium">
                                  {company.average_rating.toFixed(1)}
                                </span>
                                <span className="text-gray-500">
                                  ({company.review_count} {company.review_count === 1 ? 'recenzia' : company.review_count < 5 ? 'recenzie' : 'recenzií'})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Overené
                          </span>
                        </div>
                      </div>

                      {company.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {company.description}
                        </p>
                      )}

                      {company.services && company.services.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {company.services.slice(0, 3).map((service, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {service}
                              </span>
                            ))}
                            {company.services.length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{company.services.length - 3} ďalších
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {company.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {company.phone}
                            </div>
                          )}
                          {company.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {company.email}
                            </div>
                          )}
                          {company.website && (
                            <div className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Web
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Kontaktovať
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                            Zobraziť profil
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyListPage;