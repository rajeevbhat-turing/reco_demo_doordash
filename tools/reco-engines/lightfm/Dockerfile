# LightFM has no wheels for Python 3.12+; pin 3.11 in the image.
FROM python:3.11-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libomp-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY tools/reco-engines/lightfm/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# common/ lives next to lightfm/ in the host layout
COPY tools/reco-engines/common /app/common
COPY tools/reco-engines/lightfm/app.py /app/app.py

# Bake the SQLite catalog into the image so the engine doesn't depend
# on a host volume mount. Kept late so a DB swap doesn't invalidate the
# pip-install layer above.
COPY data/db/dashdoor.db /data/dashdoor.db

ENV PYTHONUNBUFFERED=1 \
    LIBSQL_URL=file:/data/dashdoor.db

EXPOSE 8001

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]
