#!/usr/bin/env bash
pip install -r requirements.txt
cd backend
python manage.py collectsatic --noinput
python manage.py migrate