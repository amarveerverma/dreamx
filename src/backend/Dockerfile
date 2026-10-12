# Stage 1: Build
FROM python:3.12-slim as builder

WORKDIR /build
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.12-slim

# Create non-root user
RUN groupadd -g 10001 dreamx && \
    useradd -u 10001 -g dreamx -s /bin/bash -m dreamx

WORKDIR /app
COPY --from=builder /root/.local /home/dreamx/.local
COPY . /app

# Ensure correct permissions
RUN chown -R dreamx:dreamx /app

# Switch to non-root user
USER 10001
ENV PATH=/home/dreamx/.local/bin:$PATH

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
