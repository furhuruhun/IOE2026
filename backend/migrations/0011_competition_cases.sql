CREATE TABLE IF NOT EXISTS competition_cases (
  competition_id TEXT PRIMARY KEY REFERENCES competitions(id),
  url TEXT NOT NULL
);
