#!/bin/sh
# Traitement de la voix off : coupe-bas, égalisation (moins de « boue », plus de présence et d'air),
# dé-esseur, compression douce, normalisation du volume.
ffmpeg -y -loglevel error -i "$1" -ac 1 -ar 48000 -af "\
highpass=f=75:poles=2,\
equalizer=f=250:t=q:w=1.0:g=-2.5,\
equalizer=f=3200:t=q:w=1.2:g=2.5,\
highshelf=f=9000:g=2,\
deesser=i=0.35:m=0.5:f=0.5,\
acompressor=threshold=-24dB:ratio=3:attack=4:release=60:knee=4:makeup=2,\
loudnorm=I=-16:TP=-1.5:LRA=7,\
alimiter=limit=0.89:level=false" -c:a pcm_f32le "$2"
