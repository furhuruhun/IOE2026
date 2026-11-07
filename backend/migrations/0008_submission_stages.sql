ALTER TABLE requirement_templates ADD COLUMN stage TEXT NOT NULL DEFAULT 'registration'
  CHECK (stage IN ('registration', 'submission', 'final'));

CREATE INDEX IF NOT EXISTS idx_requirement_templates_competition_stage
  ON requirement_templates(competition_id, stage, sort_order);

CREATE TABLE IF NOT EXISTS competition_qualifications (
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  team_id        TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'not_passed')),
  updated_by     TEXT NOT NULL REFERENCES users(id),
  updated_at     TEXT NOT NULL,
  PRIMARY KEY (competition_id, team_id)
);

CREATE INDEX IF NOT EXISTS idx_competition_qualifications_competition_status
  ON competition_qualifications(competition_id, status);
