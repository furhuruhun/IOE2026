-- seed/seed.sql

-- Clean up existing data
DELETE FROM announcements;
DELETE FROM notifications;
DELETE FROM event_registrations;
DELETE FROM event_speakers;
DELETE FROM events;
DELETE FROM requirement_submissions;
DELETE FROM requirement_templates;
DELETE FROM team_members;
DELETE FROM teams;
DELETE FROM competition_timeline_items;
DELETE FROM competition_prizes;
DELETE FROM competition_batches;
DELETE FROM competitions;

-- 1. COMPETITIONS
INSERT INTO competitions (id, slug, name, description, guidebook_url, logo_url, total_prize_pool_idr, max_team_members, is_published, created_at)
VALUES
(
  'comp-business-case',
  'business-case-competition',
  'Business Case Competition',
  'Business Case Competition menantang peserta untuk menganalisis studi kasus nyata seputar ekonomi dan industri maritim, lalu merumuskan strategi bisnis yang aplikatif dan berdampak. Peserta berkompetisi secara tim untuk menyusun analisis paling tajam dan solusi paling realistis di hadapan dewan juri.',
  NULL,
  NULL,
  20000000,
  5,
  1,
  '2026-08-01T00:00:00+07:00'
),
(
  'comp-paper-poster',
  'paper-poster-competition',
  'Paper & Poster Competition',
  'Paper & Poster Competition adalah ruang bagi peserta untuk menuangkan gagasan ilmiah tertulis maupun visual seputar keberlanjutan ekosistem maritim Indonesia. Karya terbaik akan dipresentasikan langsung di hadapan juri pada babak final.',
  NULL,
  NULL,
  15000000,
  5,
  1,
  '2026-08-01T00:00:00+07:00'
),
(
  'comp-design',
  'design-competition',
  'Design Competition',
  'Design Competition mengajak peserta merancang solusi visual/desain kreatif yang menjawab tantangan energi, ekonomi, dan inovasi digital di sektor kelautan. Fokus penilaian ada pada orisinalitas ide, kekuatan visual, dan relevansi solusi terhadap isu maritim.',
  NULL,
  NULL,
  15000000,
  5,
  1,
  '2026-08-01T00:00:00+07:00'
);

-- Batches
INSERT INTO competition_batches (id, competition_id, name, opens_at, closes_at, sort_order)
VALUES
('batch-bc-1', 'comp-business-case', 'Batch 1', '2026-01-01T00:00:00+07:00', '2027-03-15T23:59:00+07:00', 1),
('batch-pp-1', 'comp-paper-poster', 'Batch 1', '2026-01-01T00:00:00+07:00', '2027-03-10T23:59:00+07:00', 1),
('batch-ds-1', 'comp-design', 'Batch 1', '2026-01-01T00:00:00+07:00', '2027-03-20T23:59:00+07:00', 1);

-- Prizes
INSERT INTO competition_prizes (id, competition_id, label, amount_idr, sort_order)
VALUES
('prize-bc-1', 'comp-business-case', 'Juara 1', 10000000, 1),
('prize-bc-2', 'comp-business-case', 'Juara 2', 6000000, 2),
('prize-bc-3', 'comp-business-case', 'Juara 3', 4000000, 3),

('prize-pp-1', 'comp-paper-poster', 'Juara 1', 8000000, 1),
('prize-pp-2', 'comp-paper-poster', 'Juara 2', 5000000, 2),
('prize-pp-3', 'comp-paper-poster', 'Juara 3', 2000000, 3),

('prize-ds-1', 'comp-design', 'Juara 1', 8000000, 1),
('prize-ds-2', 'comp-design', 'Juara 2', 5000000, 2),
('prize-ds-3', 'comp-design', 'Juara 3', 2000000, 3);

-- Timeline Items
INSERT INTO competition_timeline_items (id, competition_id, label, occurs_at, show_in_calendar, sort_order)
VALUES
('tl-bc-1', 'comp-business-case', 'Pendaftaran Dibuka', '2027-01-17T09:00:00+07:00', 1, 1),
('tl-bc-2', 'comp-business-case', 'Batas Akhir Pendaftaran', '2027-03-15T23:59:00+07:00', 1, 2),
('tl-bc-3', 'comp-business-case', 'Studi Kasus Dirilis', '2027-03-22T09:00:00+07:00', 1, 3),
('tl-bc-4', 'comp-business-case', 'Batas Pengumpulan Jawaban', '2027-04-05T23:59:00+07:00', 1, 4),
('tl-bc-5', 'comp-business-case', 'Pengumuman Finalis', '2027-04-20T09:00:00+07:00', 1, 5),
('tl-bc-6', 'comp-business-case', 'Grand Final & Awarding Night', '2027-05-10T19:00:00+07:00', 1, 6),

('tl-pp-1', 'comp-paper-poster', 'Pendaftaran Dibuka', '2027-01-17T09:00:00+07:00', 1, 1),
('tl-pp-2', 'comp-paper-poster', 'Batas Akhir Pendaftaran', '2027-03-10T23:59:00+07:00', 1, 2),
('tl-pp-3', 'comp-paper-poster', 'Batas Pengumpulan Karya', '2027-03-24T23:59:00+07:00', 1, 3),
('tl-pp-4', 'comp-paper-poster', 'Pengumuman Finalis', '2027-04-15T09:00:00+07:00', 1, 4),
('tl-pp-5', 'comp-paper-poster', 'Grand Final & Awarding Night', '2027-05-10T19:00:00+07:00', 1, 5),

('tl-ds-1', 'comp-design', 'Pendaftaran Dibuka', '2027-01-17T09:00:00+07:00', 1, 1),
('tl-ds-2', 'comp-design', 'Batas Akhir Pendaftaran', '2027-03-20T23:59:00+07:00', 1, 2),
('tl-ds-3', 'comp-design', 'Batas Pengumpulan Karya', '2027-04-03T23:59:00+07:00', 1, 3),
('tl-ds-4', 'comp-design', 'Pengumuman Finalis', '2027-04-25T09:00:00+07:00', 1, 4),
('tl-ds-5', 'comp-design', 'Grand Final & Awarding Night', '2027-05-10T19:00:00+07:00', 1, 5);

-- Requirement Templates (5 standar per kompetisi)
-- Business Case
INSERT INTO requirement_templates (id, competition_id, name, type, due_at, instructions, accepted_formats, sort_order)
VALUES
('comp-business-case-req-1', 'comp-business-case', 'Payment Proof Document', 'group', '2027-03-15T23:59:00+07:00', 'Transfer ke Rekening BNI 1234567890 a.n. KMKL ITB. Unggah bukti transfer yang jelas.', '["jpg","png"]', 1),
('comp-business-case-req-2', 'comp-business-case', 'Identity Card', 'individual', '2027-03-15T23:59:00+07:00', 'Unggah foto Kartu Tanda Mahasiswa (KTM) yang masih berlaku.', '["jpg","png"]', 2),
('comp-business-case-req-3', 'comp-business-case', 'Passport Photo', 'individual', '2027-03-15T23:59:00+07:00', 'Unggah pas foto formal terbaru dengan latar belakang bebas.', '["jpg","png"]', 3),
('comp-business-case-req-4', 'comp-business-case', 'Active Student Status Letter', 'individual', '2027-03-15T23:59:00+07:00', 'Unggah Surat Keterangan Mahasiswa Aktif dari universitas/fakultas terkait.', '["jpg","png"]', 4),
('comp-business-case-req-5', 'comp-business-case', 'Twibbon and Poster Proof', 'individual', '2027-03-15T23:59:00+07:00', 'Unggah tangkapan layar bukti unggah Twibbon dan Poster IOE 2027 di media sosial.', '["jpg","png"]', 5);

-- Paper & Poster
INSERT INTO requirement_templates (id, competition_id, name, type, due_at, instructions, accepted_formats, sort_order)
VALUES
('comp-paper-poster-req-1', 'comp-paper-poster', 'Payment Proof Document', 'group', '2027-03-10T23:59:00+07:00', 'Transfer ke Rekening BNI 1234567890 a.n. KMKL ITB. Unggah bukti transfer yang jelas.', '["jpg","png"]', 1),
('comp-paper-poster-req-2', 'comp-paper-poster', 'Identity Card', 'individual', '2027-03-10T23:59:00+07:00', 'Unggah foto Kartu Tanda Mahasiswa (KTM) yang masih berlaku.', '["jpg","png"]', 2),
('comp-paper-poster-req-3', 'comp-paper-poster', 'Passport Photo', 'individual', '2027-03-10T23:59:00+07:00', 'Unggah pas foto formal terbaru dengan latar belakang bebas.', '["jpg","png"]', 3),
('comp-paper-poster-req-4', 'comp-paper-poster', 'Active Student Status Letter', 'individual', '2027-03-10T23:59:00+07:00', 'Unggah Surat Keterangan Mahasiswa Aktif dari universitas/fakultas terkait.', '["jpg","png"]', 4),
('comp-paper-poster-req-5', 'comp-paper-poster', 'Twibbon and Poster Proof', 'individual', '2027-03-10T23:59:00+07:00', 'Unggah tangkapan layar bukti unggah Twibbon dan Poster IOE 2027 di media sosial.', '["jpg","png"]', 5);

-- Design
INSERT INTO requirement_templates (id, competition_id, name, type, due_at, instructions, accepted_formats, sort_order)
VALUES
('comp-design-req-1', 'comp-design', 'Payment Proof Document', 'group', '2027-03-20T23:59:00+07:00', 'Transfer ke Rekening BNI 1234567890 a.n. KMKL ITB. Unggah bukti transfer yang jelas.', '["jpg","png"]', 1),
('comp-design-req-2', 'comp-design', 'Identity Card', 'individual', '2027-03-20T23:59:00+07:00', 'Unggah foto Kartu Tanda Mahasiswa (KTM) yang masih berlaku.', '["jpg","png"]', 2),
('comp-design-req-3', 'comp-design', 'Passport Photo', 'individual', '2027-03-20T23:59:00+07:00', 'Unggah pas foto formal terbaru dengan latar belakang bebas.', '["jpg","png"]', 3),
('comp-design-req-4', 'comp-design', 'Active Student Status Letter', 'individual', '2027-03-20T23:59:00+07:00', 'Unggah Surat Keterangan Mahasiswa Aktif dari universitas/fakultas terkait.', '["jpg","png"]', 4),
('comp-design-req-5', 'comp-design', 'Twibbon and Poster Proof', 'individual', '2027-03-20T23:59:00+07:00', 'Unggah tangkapan layar bukti unggah Twibbon dan Poster IOE 2027 di media sosial.', '["jpg","png"]', 5);

-- 2. EVENTS
INSERT INTO events (id, slug, name, description, starts_at, registration_closes_at, quota, is_paid, price_idr, is_published, created_at)
VALUES
(
  'event-talkshow',
  'talkshow',
  'Talkshow Maritim Nasional',
  'Talkshow inspiratif bersama para pakar maritim membahas potensi masa depan industri dan energi laut berkelanjutan di Indonesia.',
  '2027-03-20T09:00:00+07:00',
  '2027-03-05T23:59:00+07:00',
  250,
  0,
  0,
  1,
  '2026-08-01T00:00:00+07:00'
),
(
  'event-workshop',
  'workshop',
  'Workshop Inovasi Maritim',
  'Sesi pelatihan intensif dengan bimbingan praktisi ahli mengenai teknik analisis dan pemodelan maritim digital.',
  '2027-03-25T13:00:00+07:00',
  '2027-03-12T23:59:00+07:00',
  100,
  0,
  0,
  1,
  '2026-08-01T00:00:00+07:00'
),
(
  'event-short-course',
  'short-course',
  'Short Course: Marine Tech 101',
  'Kursus singkat daring bersertifikat mengenai dasar-dasar instrumentasi dan komputasi kelautan modern.',
  '2027-04-01T09:00:00+07:00',
  '2027-03-19T23:59:00+07:00',
  50,
  1,
  150000,
  1,
  '2026-08-01T00:00:00+07:00'
),
(
  'event-exhibition',
  'exhibition',
  'Maritime Innovation Exhibition',
  'Pameran karya riset, teknologi mutakhir, dan portofolio karya mahasiswa serta industri di sektor maritim.',
  '2027-05-08T09:00:00+07:00',
  '2027-03-26T23:59:00+07:00',
  NULL,
  0,
  0,
  1,
  '2026-08-01T00:00:00+07:00'
);

-- Speakers for Workshop
INSERT INTO event_speakers (id, event_id, name, session_at, sort_order)
VALUES
('spk-ws-1', 'event-workshop', 'Dr. Ir. Maritime Expert, M.Eng.', '2027-03-25T13:00:00+07:00', 1),
('spk-ws-2', 'event-workshop', 'Capt. Ocean Navigator, Ph.D.', '2027-03-25T15:30:00+07:00', 2);
