#!/usr/bin/env bash
# Convertit les enregistrements du studio (jour-N.m4a / jour-N.webm) en MP3
# lisibles partout, avec un volume harmonisé, dans public/audio/.
# Usage : bash scripts/convertir-audio.sh dossier/des/enregistrements
set -euo pipefail

source_dir="${1:?Indique le dossier qui contient les fichiers jour-N.m4a ou jour-N.webm}"
mkdir -p public/audio

for fichier in "$source_dir"/jour-*.*; do
  [ -e "$fichier" ] || continue
  nom="$(basename "${fichier%.*}")"
  # Mono, 44,1 kHz, volume normalisé (EBU R128), 96 kbit/s : léger et clair pour la voix.
  ffmpeg -hide_banner -loglevel error -y -i "$fichier" \
    -ac 1 -ar 44100 -af "highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11" \
    -codec:a libmp3lame -b:a 96k "public/audio/${nom}.mp3"
  echo "✓ public/audio/${nom}.mp3"
done
echo "Pense à ajouter les numéros des jours dans AUDIOS_DISPONIBLES (lib/programme.ts)."
