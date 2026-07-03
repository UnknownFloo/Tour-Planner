# TourPlanner Backend

Dieses Verzeichnis enthält das ASP.NET Core Web API Backend für den TourPlanner.

## Start

1. PostgreSQL starten. Beispiel mit Docker:

```bash
docker run --rm -it -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=tourplanner -p 5432:5432 postgres:15
```

2. Datenbank-Schema anlegen:

```bash
psql "host=localhost port=5432 user=postgres password=postgres dbname=tourplanner" -f db/init.sql
```

3. Backend-Konfiguration setzen:

```bash
export TOURPLANNER_CONNECTION="Host=localhost;Port=5432;Database=tourplanner;Username=postgres;Password=postgres"
export JWT_KEY="ReplaceThisWithASecretKeyForJwtSigning"
```

4. Backend starten:

```bash
dotnet run --project backend.csproj
```

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tours`
- `GET /api/tours/search?query=...`
- `GET /api/tours/{id}`
- `POST /api/tours`
- `PUT /api/tours/{id}`
- `DELETE /api/tours/{id}`
- `POST /api/tours/{tourId}/logs`
- `PUT /api/tours/{tourId}/logs/{logId}`
- `DELETE /api/tours/{tourId}/logs/{logId}`

## Hinweise

- Die Konfiguration wird über `appsettings.json` mit Umgebungsvariablen überschrieben.
- Die OpenRouteService-GPS-Integration bleibt im Angular-Frontend unverändert.
