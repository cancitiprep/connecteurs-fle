// ═══════════════════════════════════════════════
// Supabase Configuration
// ═══════════════════════════════════════════════

const SUPABASE_URL = 'https://xdwsahbnnseslgmugyub.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkd3NhaGJubnNlc2xnbXVneXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODgyMTQsImV4cCI6MjA4Njg2NDIxNH0.tv60NuP26KqccMGgyoTjqX6PaMoNhOg7T4fj3ydHi6g';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
