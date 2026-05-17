# Digitaler Kleiderschrank - Setup

## Schritt 1: API-Key einrichten

Erstelle eine Datei `.env.local` im Projektordner:

```
ANTHROPIC_API_KEY=sk-ant-dein-key-hier
```

Deinen API-Key bekommst du unter: https://console.anthropic.com

## Schritt 2: App starten

```bash
npm run dev
```

Öffne dann http://localhost:3000 im Browser.

## App auf dem Handy nutzen

Starte die App und öffne auf deinem Handy:
```
http://DEINE-PC-IP:3000
```

Deine PC-IP findest du mit: `ipconfig` (Windows) → IPv4-Adresse

Oder starte mit:
```bash
npm run dev -- --hostname 0.0.0.0
```

## Features

- **Kleiderschrank** — alle Kleidungsstücke in einer Übersicht
- **Hinzufügen** — Foto hochladen, KI analysiert Farbe, Stil, Kategorie automatisch
- **Outfit erstellen** — KI kombiniert passende Kleidungsstücke nach Anlass
- **Gespeichert** — gespeicherte Outfits verwalten
