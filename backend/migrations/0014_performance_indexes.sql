-- 0014_performance_indexes.sql
-- Optimasi query read untuk mencegah full table scan pada Cloudflare D1

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_sub_template_user ON requirement_submissions(template_id, user_id);
CREATE INDEX IF NOT EXISTS idx_sub_template_team ON requirement_submissions(template_id, team_id);
CREATE INDEX IF NOT EXISTS idx_sub_user_id ON requirement_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_team_id ON requirement_submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_sub_template_id ON requirement_submissions(template_id);
