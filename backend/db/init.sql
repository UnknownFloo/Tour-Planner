-- PostgreSQL initialization script for TourPlanner backend

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "Users" (
    "Id" serial PRIMARY KEY,
    "Username" varchar(80) NOT NULL UNIQUE,
    "PasswordHash" varchar(256) NOT NULL,
    "PasswordSalt" varchar(128) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Tours" (
    "Id" serial PRIMARY KEY,
    "Name" varchar(120) NOT NULL,
    "Description" varchar(1000),
    "StartLatitude" double precision NOT NULL,
    "StartLongitude" double precision NOT NULL,
    "EndLatitude" double precision NOT NULL,
    "EndLongitude" double precision NOT NULL,
    "TransportType" varchar(40) NOT NULL,
    "DistanceKm" double precision NOT NULL DEFAULT 0,
    "EstimatedTimeMinutes" integer NOT NULL DEFAULT 0,
    "ImageUrl" varchar(2048),
    "IsPublic" boolean NOT NULL DEFAULT false,
    "UserId" integer NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "TourLogs" (
    "Id" serial PRIMARY KEY,
    "TourId" integer NOT NULL REFERENCES "Tours"("Id") ON DELETE CASCADE,
    "Timestamp" timestamp with time zone NOT NULL DEFAULT now(),
    "Comment" varchar(1000),
    "Difficulty" integer NOT NULL CHECK ("Difficulty" BETWEEN 1 AND 5),
    "TotalDistanceKm" double precision NOT NULL DEFAULT 0,
    "TotalTimeMinutes" integer NOT NULL DEFAULT 0,
    "Rating" integer NOT NULL CHECK ("Rating" BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS idx_tours_userid ON "Tours"("UserId");
CREATE INDEX IF NOT EXISTS idx_tourlogs_tourid ON "TourLogs"("TourId");
CREATE INDEX IF NOT EXISTS idx_tours_name ON "Tours"("Name");
CREATE INDEX IF NOT EXISTS idx_tours_transporttype ON "Tours"("TransportType");

-- Optional full-text search vector for tour data
ALTER TABLE "Tours" ADD COLUMN IF NOT EXISTS "SearchVector" tsvector;
UPDATE "Tours" SET "SearchVector" = to_tsvector('german', coalesce("Name", '') || ' ' || coalesce("Description", '') || ' ' || coalesce("TransportType", ''));
CREATE INDEX IF NOT EXISTS idx_tours_searchvector ON "Tours" USING GIN ("SearchVector");

CREATE OR REPLACE FUNCTION tours_search_vector_trigger() RETURNS trigger AS $$
begin
  new."SearchVector" := to_tsvector('german', coalesce(new."Name", '') || ' ' || coalesce(new."Description", '') || ' ' || coalesce(new."TransportType", ''));
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tours_search_vector_update ON "Tours";
CREATE TRIGGER tours_search_vector_update
BEFORE INSERT OR UPDATE
ON "Tours"
FOR EACH ROW EXECUTE FUNCTION tours_search_vector_trigger();
