-- 0012_team_member_limits.sql
-- FOWT design maksimal 5, BCC dan PPC maksimal 3 orang tanpa batas minimal

UPDATE competitions SET max_team_members = 5 WHERE id = 'comp-design' OR slug = 'design-competition';
UPDATE competitions SET max_team_members = 3 WHERE id = 'comp-business-case' OR slug = 'business-case-competition';
UPDATE competitions SET max_team_members = 3 WHERE id = 'comp-paper-poster' OR slug = 'paper-poster-competition';
