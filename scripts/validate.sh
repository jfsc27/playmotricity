#!/bin/bash

set -e

echo "Esperando que PlayMotricity arranque..."
sleep 20

echo "Validando frontend..."
curl -fsS http://localhost/ > /dev/null

echo "Validando backend..."
docker inspect -f '{{.State.Running}}' playmotricity-backend | grep true

echo "Validando frontend..."
docker inspect -f '{{.State.Running}}' playmotricity-frontend | grep true

echo "PlayMotricity funciona correctamente."