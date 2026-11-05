-- TESTING ONLY: membuka pendaftaran pada 4 November 2026.
-- Jangan dipakai sebagai jadwal produksi permanen.
-- Untuk mengembalikan jadwal resmi, jalankan seed resmi yang sudah disetujui.

-- Open all competition registration batches for testing and keep them open
-- through the end of November 2026.
UPDATE competition_batches
SET opens_at = '2026-11-04T00:00:00+07:00',
    closes_at = '2026-11-30T23:59:59+07:00'
WHERE competition_id IS NOT NULL;

-- Keep the public competition timeline consistent with the testing window.
UPDATE competition_timeline_items
SET occurs_at = '2026-11-04T00:00:00+07:00'
WHERE label = 'Pendaftaran Dibuka';

UPDATE competition_timeline_items
SET occurs_at = '2026-11-30T23:59:59+07:00'
WHERE label = 'Batas Akhir Pendaftaran';

-- Allow requirement uploads during the same testing window.
UPDATE requirement_templates
SET due_at = '2026-11-30T23:59:59+07:00';

-- Allow event registration during the same testing window. Event start dates
-- are intentionally preserved from the approved seed data.
UPDATE events
SET registration_closes_at = '2026-11-30T23:59:59+07:00'
WHERE is_published = 1;

