import { supabase } from './supabase';

export type ProviderForm = {
  name: string;
  description: string;
  services?: string;
  location: string;
  email: string;
  phone?: string;
  logo_url?: string;
  website?: string; // honeypot
};

export async function submitProvider(f: ProviderForm) {
  // Basic validation
  if (!f.name?.trim() || !f.description?.trim() || !f.location?.trim() || !f.email?.trim()) {
    throw new Error('Vyplňte povinné polia.');
  }
  
  if (!/\S+@\S+\.\S+/.test(f.email)) {
    throw new Error('E-mail nemá správny tvar.');
  }
  
  // Honeypot check
  if (f.website && f.website.trim().length) {
    return { ok: true }; // Silent success for bots
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('Musíte byť prihlásený pre pridanie firmy.');
  }

  // Convert services string to array
  const servicesArray = f.services 
    ? f.services.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];

  const payload = {
    user_id: user.id,
    name: f.name.trim(),
    description: f.description.trim(),
    services: servicesArray,
    location: f.location.trim(),
    email: f.email.trim(),
    phone: f.phone?.trim() || null,
    logo_url: f.logo_url?.trim() || null,
    status: 'pending'
  };

  const { error } = await supabase.from('companies').insert([payload]);
  
  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Chyba pri ukladaní: ${error.message}`);
  }
  
  return { ok: true };
}