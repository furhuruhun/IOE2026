-- Read-path indexes used by public catalogs, dashboards, and registration checks.
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_user
  ON event_registrations(event_id, user_id);

CREATE INDEX IF NOT EXISTS idx_team_members_competition_user
  ON team_members(competition_id, user_id);

CREATE INDEX IF NOT EXISTS idx_competition_batches_competition_closes
  ON competition_batches(competition_id, closes_at);

CREATE INDEX IF NOT EXISTS idx_competition_timeline_competition_sort
  ON competition_timeline_items(competition_id, sort_order, id);

CREATE INDEX IF NOT EXISTS idx_event_speakers_event_sort
  ON event_speakers(event_id, sort_order, id);
