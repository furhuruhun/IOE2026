-- Isi URL Case masing-masing lomba, lalu jalankan file ini ke database.
-- URL kosong berarti Case belum tersedia. Guidebook publik tidak berubah.
INSERT INTO competition_cases (competition_id, url) VALUES
('comp-business-case', 'https://drive.google.com/drive/folders/1fdmmeIya4h9Byw2nsk4Bn-IxuKxPLwkU?usp=sharing'),
('comp-paper-poster', 'https://drive.google.com/drive/folders/1ZEidrzYeQTaVtm3eayyooZnScV4TqWJ-?usp=sharing'),
('comp-design', 'https://drive.google.com/drive/folders/1BifC90k8c0ov5CRvQ-8nwLeMlLHfJiUr?usp=sharing')
ON CONFLICT(competition_id) DO UPDATE SET url = excluded.url;
