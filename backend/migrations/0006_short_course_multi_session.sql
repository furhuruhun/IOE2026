CREATE TABLE event_registrations_multi_session (
  id                 TEXT PRIMARY KEY,
  event_id           TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type       TEXT NOT NULL CHECK (session_type IN ('seminar','workshop','day1','day2')),
  speaker_id         TEXT REFERENCES event_speakers(id),
  phone              TEXT NOT NULL,
  line_id            TEXT,
  institution        TEXT NOT NULL,
  domicile           TEXT NOT NULL,
  cv_key             TEXT,
  payment_proof_key  TEXT,
  created_at         TEXT NOT NULL,
  discovery_source   TEXT,
  UNIQUE (event_id, user_id, session_type)
);

INSERT INTO event_registrations_multi_session
  (id, event_id, user_id, session_type, speaker_id, phone, line_id, institution, domicile,
   cv_key, payment_proof_key, created_at, discovery_source)
SELECT id, event_id, user_id, session_type, speaker_id, phone, line_id, institution, domicile,
       cv_key, payment_proof_key, created_at, discovery_source
FROM event_registrations;

DROP TABLE event_registrations;
ALTER TABLE event_registrations_multi_session RENAME TO event_registrations;
