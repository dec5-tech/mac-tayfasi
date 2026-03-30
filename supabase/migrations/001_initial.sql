-- Enums
CREATE TYPE team_type AS ENUM ('red', 'white');
CREATE TYPE match_status AS ENUM ('upcoming', 'completed', 'cancelled');
CREATE TYPE response_status AS ENUM ('in', 'out');

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team team_type NOT NULL DEFAULT 'red',
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, team)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'team')::team_type, 'red')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL DEFAULT 'Halı Saha',
  team_size INT NOT NULL DEFAULT 8,
  status match_status NOT NULL DEFAULT 'upcoming',
  -- Beyan penceresi: maçtan sonraki perşembe 12:00 -> maçtan önceki salı 12:00
  response_opens_at TIMESTAMPTZ NOT NULL,
  response_closes_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are viewable by authenticated users"
  ON matches FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create matches"
  ON matches FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update matches"
  ON matches FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Match Responses
CREATE TABLE match_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status response_status NOT NULL DEFAULT 'in',
  is_starter BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

ALTER TABLE match_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responses are viewable by authenticated users"
  ON match_responses FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own response"
  ON match_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own response"
  ON match_responses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own response"
  ON match_responses FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE match_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
