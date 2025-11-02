FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    wireguard-tools \
    iptables \
    curl \
    unzip \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install xray-core
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="64"; \
    elif [ "$ARCH" = "aarch64" ]; then ARCH="arm64-v8a"; \
    else ARCH="64"; fi && \
    curl -L https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-${ARCH}.zip -o /tmp/xray.zip && \
    unzip /tmp/xray.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/xray && \
    rm /tmp/xray.zip

# Install rathole
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="x86_64"; \
    elif [ "$ARCH" = "aarch64" ]; then ARCH="aarch64"; \
    else ARCH="x86_64"; fi && \
    RATHOLE_VERSION=$(curl -s https://api.github.com/repos/rapiz1/rathole/releases/latest | jq -r '.tag_name' | sed 's/^v//') && \
    if [ -z "$RATHOLE_VERSION" ] || [ "$RATHOLE_VERSION" = "null" ]; then \
        echo "Failed to get version from API, trying v0.4.8..."; \
        RATHOLE_VERSION="v0.4.8"; \
    fi && \
    echo "Downloading rathole ${RATHOLE_VERSION} for ${ARCH}..." && \
    curl -L "https://github.com/rapiz1/rathole/releases/download/${RATHOLE_VERSION}/rathole-${ARCH}-unknown-linux-musl.tar.gz" -o /tmp/rathole.tar.gz -f && \
    if [ ! -f /tmp/rathole.tar.gz ] || [ ! -s /tmp/rathole.tar.gz ]; then \
        echo "Failed to download ${RATHOLE_VERSION}, trying without 'v' prefix..."; \
        RATHOLE_VERSION=$(echo "$RATHOLE_VERSION" | sed 's/^v//') && \
        curl -L "https://github.com/rapiz1/rathole/releases/download/v${RATHOLE_VERSION}/rathole-${ARCH}-unknown-linux-musl.tar.gz" -o /tmp/rathole.tar.gz -f; \
    fi && \
    file /tmp/rathole.tar.gz | grep -q "gzip" && \
    tar -xzf /tmp/rathole.tar.gz -C /tmp && \
    mv /tmp/rathole-*/rathole /usr/local/bin/ && \
    chmod +x /usr/local/bin/rathole && \
    rm -rf /tmp/rathole*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8888

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8888"]

