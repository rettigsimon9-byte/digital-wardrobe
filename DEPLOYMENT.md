# App im Internet verfügbar machen (Railway)

## Was du brauchst
- GitHub Account (kostenlos): https://github.com
- Railway Account (kostenlos starten): https://railway.app

---

## Schritt 1: Code auf GitHub hochladen

1. Gehe zu https://github.com → "New repository"
2. Name: `digital-wardrobe` → "Create repository"
3. Führe diese Befehle im Terminal aus (im Ordner digital-wardrobe):

```
git remote add origin https://github.com/DEIN-USERNAME/digital-wardrobe.git
git push -u origin master
```

---

## Schritt 2: Bei Railway deployen

1. Gehe zu https://railway.app → "Start a New Project"
2. Klicke "Deploy from GitHub repo"
3. Wähle dein `digital-wardrobe` Repository
4. Railway erkennt Next.js automatisch → "Deploy Now"

---

## Schritt 3: Volume für Datenbank hinzufügen

Die SQLite-Datenbank muss auf einem Volume gespeichert werden:

1. In Railway: Klicke auf deinen Service → "Volumes"
2. "Add Volume" → Mount Path: `/data`
3. Klicke "Add"

---

## Schritt 4: Umgebungsvariablen setzen

In Railway → dein Service → "Variables" → folgende hinzufügen:

| Variable | Wert |
|---|---|
| `ANTHROPIC_API_KEY` | dein API Key (sk-ant-...) |
| `NEXTAUTH_SECRET` | 1a80e65cbaaad19dceae0faf283d3641abefb064224d2852f17838114ed21efd |
| `NEXTAUTH_URL` | https://DEINE-APP.railway.app (Railway zeigt dir die URL) |
| `DATABASE_URL` | file:/data/wardrobe.db |

---

## Schritt 5: Fertig!

Railway gibt dir eine URL wie `https://digital-wardrobe-production.up.railway.app`

Diese URL funktioniert von **überall** – PC, Handy, unterwegs.

---

## Kosten

- Railway Hobby Plan: ~5€/Monat
- Es gibt ein kostenloses Startguthaben zum Testen

---

## Wichtig: Bestehende Daten übernehmen

Wenn du schon Daten lokal hast, musst du die Datenbank nicht neu befüllen –
die Accounts und Kleidungsstücke auf Railway sind eine frische Installation.
Einfach neu registrieren und Bilder erneut hochladen.
