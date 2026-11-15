-- 0013_bcc_team_member_limit.sql
-- Ubah jumlah maksimal anggota tim Business Case Competition (BCC) menjadi 4 orang

UPDATE competitions SET max_team_members = 4 WHERE id = 'comp-business-case' OR slug = 'business-case-competition';
