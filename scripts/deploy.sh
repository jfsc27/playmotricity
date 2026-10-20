#!/bin/bash

set -e

echo "=== Iniciando despliegue de PlayMotricity ==="

cd /opt/playmotricity

echo "Copiando variables de entorno..."
cp /home/ec2-user/playmotricity.env .env
chmod 600 .env

echo "Construyendo imagenes Docker..."
docker compose build

echo "Deteniendo version anterior..."
docker rm -f playmotricity-frontend playmotricity-backend 2>/dev/null || true

echo "Levantando nueva version..."
docker compose up -d

echo "Limpiando imagenes antiguas..."
docker image prune -f

echo "=== Despliegue completado ==="