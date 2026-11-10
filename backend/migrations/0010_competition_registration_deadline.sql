-- Registration closes on 12 December 2026 at 23:59 WIB for all competitions.
UPDATE competition_batches
SET closes_at = '2026-12-12T23:59:00+07:00'
WHERE competition_id IN ('comp-business-case', 'comp-paper-poster', 'comp-design');
