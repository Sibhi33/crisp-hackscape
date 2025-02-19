import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://houmlxwheveremcucbve.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdW1seHdoZXZlcmVtY3VjYnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzUwMDUsImV4cCI6MjA1NTU1MTAwNX0.Q5GGblWYVEJKo-XYWdsodtRiau1Gx7KDLl_O2_XBit8';

export const supabase = createClient(supabaseUrl, supabaseKey);
