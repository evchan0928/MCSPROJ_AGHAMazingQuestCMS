FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential libpq-dev gcc postgresql-client && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt

RUN pip install --upgrade pip && pip install --no-cache-dir -r /app/requirements.txt

COPY . /app

WORKDIR /app/backend

EXPOSE 8000

CMD ["gunicorn","config.wsgi:application","--bind","0.0.0.0:8000","--workers","3"]
