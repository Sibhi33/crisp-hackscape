import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jmfbclnegkmhfypaqjbf.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptZmJjbG5lZ2ttaGZ5cGFxamJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk5ODYzMzgsImV4cCI6MjAyNTU2MjMzOH0.ZmCN8xTjnr38F73CQZdSP7TT98WFQPlJ85PMoAaVwvQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
