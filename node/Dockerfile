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
    echo "Getting latest rathole version..." && \
    RATHOLE_VERSION=$(curl -sL https://api.github.com/repos/rapiz1/rathole/releases | jq -r '.[0].tag_name // "v0.5.0"') && \
    echo "Downloading rathole ${RATHOLE_VERSION} for ${ARCH}..." && \
    RATHOLE_ASSET=$(curl -sL "https://api.github.com/repos/rapiz1/rathole/releases" | jq -r --arg arch "$ARCH" '.[0].assets[] | select(.name | contains($arch) and (contains("linux-gnu") or contains("linux-musl"))) | .browser_download_url' | head -1) && \
    if [ -z "$RATHOLE_ASSET" ] || [ "$RATHOLE_ASSET" = "null" ]; then \
        echo "Error: Could not find rathole binary for ${ARCH}"; \
        exit 1; \
    fi && \
    echo "Downloading from: $RATHOLE_ASSET" && \
    if echo "$RATHOLE_ASSET" | grep -q "\.zip$"; then \
        curl -L "$RATHOLE_ASSET" -o /tmp/rathole.zip -f && \
        unzip -q /tmp/rathole.zip -d /tmp && \
        rm /tmp/rathole.zip; \
    else \
        curl -L "$RATHOLE_ASSET" -o /tmp/rathole.tar.gz -f && \
        tar -xzf /tmp/rathole.tar.gz -C /tmp && \
        rm /tmp/rathole.tar.gz; \
    fi && \
    find /tmp -name "rathole" -type f -executable -exec mv {} /usr/local/bin/ \; && \
    chmod +x /usr/local/bin/rathole && \
    rathole --version && \
    rm -rf /tmp/rathole*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8888

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8888"]

