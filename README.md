# Plagiarism Detection Platform

A Django-based application for detecting plagiarism in documents.

## Features
- User authentication
- Document upload
- Plagiarism checking
- Report generation

## Installation
```bash
git clone <your-repo-url>
cd bri-plagiarism-platform
python -m venv virt
source virt/bin/activate  # or .\virt\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
