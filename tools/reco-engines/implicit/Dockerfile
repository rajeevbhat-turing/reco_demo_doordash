FROM python:3.11-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libomp-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY tools/reco-engines/implicit/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY tools/reco-engines/common /app/common
COPY tools/reco-engines/implicit/app.py /app/app.py

ENV PYTHONUNBUFFERED=1 \
    LIBSQL_URL=file:/data/dashdoor.db \
    IMPLICIT_MODEL=als \
    IMPLICIT_FACTORS=64 \
    IMPLICIT_ITERATIONS=15

EXPOSE 8002

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8002"]
