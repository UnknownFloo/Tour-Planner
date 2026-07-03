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

