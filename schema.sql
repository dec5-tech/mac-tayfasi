-- mac-tayfasi veritabanı şeması
-- Neon PostgreSQL Dashboard > SQL Editor'da çalıştırın

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  team TEXT NOT NULL CHECK (team IN ('red', 'white')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL DEFAULT 'Halı Saha',
  team_size INT NOT NULL DEFAULT 8,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  -- Beyan penceresi: maçtan önceki Perşembe 12:00 → Salı 12:00
  response_opens_at TIMESTAMPTZ NOT NULL,
  response_closes_at TIMESTAMPTZ NOT NULL,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS match_responses (
  id SERIAL PRIMARY KEY,
  match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('in', 'out')),
  responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- İlk admin kullanıcısı (şifreyi değiştirin!)
-- Şifre hash'i bcryptjs ile üretilir, aşağıdaki hash "admin123" için örnek
-- INSERT INTO users (email, password_hash, name, team, is_admin)
-- VALUES ('admin@example.com', '$2a$10$...', 'Admin', 'red', true);
