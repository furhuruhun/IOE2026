ALTER TABLE teams ADD COLUMN status TEXT NOT NULL DEFAULT 'pendaftar'
  CHECK (status IN ('pendaftar', 'peserta', 'finalis'));

CREATE INDEX IF NOT EXISTS idx_teams_comp_status ON teams(competition_id, status);
