# 1. Install the Supabase CLI (for local dev only)
npm install -g supabase

# 2. Log in to Supabase
supabase login

# 3. Create a new Supabase project
#    Visit https://supabase.com/dashboard, sign in, and click "New project".
#    Name it (e.g. "panga-app"), set a password for the database, pick a region close to you.
#    Once created, you'll be taken to the project dashboard.

# 4. Get the project URL and anon key from project settings
#    Go to Project Settings -> API.
#    Under "Project URL" copy the URL.
#    Under "Project API keys" copy the "anon" (public) key.
#    Then generate .env.local with those values:
echo "# Auto-generated from Supabase project settings
VITE_SUPABASE_URL=<your-project-url>
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>" > .env.local
echo "Edit .env.local with your actual values from step 4."

# 5. Set up the database schema
#    In the Supabase dashboard SQL editor, create tables for each entity:
#    projects, tasks, resources, docEntries, goals, issues, contacts, reminders
#    Or run: supabase db push  (after defining your schema in a migration)
supabase db push

# 6. Enable authentication
#    Go to Authentication -> Providers in the Supabase dashboard.
#    Enable "Google" as a sign-in provider (you'll need a Google OAuth client ID/secret).
