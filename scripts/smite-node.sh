#!/bin/bash
# Smite Node Installer

set -e

echo "=== Smite Node Installer ==="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Get installation directory
INSTALL_DIR="/opt/smite-node"
echo "Installing to: $INSTALL_DIR"

# Create directory
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Prompt for configuration
echo ""
echo "Configuration:"

read -p "Panel CA certificate path: " PANEL_CA_PATH
if [ ! -f "$PANEL_CA_PATH" ]; then
    echo "Error: CA certificate not found at $PANEL_CA_PATH"
    exit 1
fi

read -p "Panel address (host:port, e.g., panel.example.com:443): " PANEL_ADDRESS
if [ -z "$PANEL_ADDRESS" ]; then
    echo "Error: Panel address is required"
    exit 1
fi

read -p "Node API port (default: 8888): " NODE_API_PORT
NODE_API_PORT=${NODE_API_PORT:-8888}

read -p "Node name (default: node-1): " NODE_NAME
NODE_NAME=${NODE_NAME:-node-1}

# Copy CA certificate
mkdir -p certs
cp "$PANEL_CA_PATH" certs/ca.crt

# Create .env file
cat > .env << EOF
NODE_API_PORT=$NODE_API_PORT
NODE_NAME=$NODE_NAME

PANEL_CA_PATH=/etc/smite-node/certs/ca.crt
PANEL_ADDRESS=$PANEL_ADDRESS
EOF

# Copy necessary files (in production, this would be from repo)
# For now, create a minimal docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  smite-node:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: smite-node
    network_mode: host
    cap_add:
      - NET_ADMIN
    devices:
      - /dev/net/tun
    sysctls:
      - net.ipv4.ip_forward=1
    volumes:
      - ./certs:/etc/smite-node/certs:ro
      - ./config:/etc/smite-node
      - /etc/wireguard:/etc/wireguard
    env_file:
      - .env
    restart: always
EOF

# Create Dockerfile if not exists
if [ ! -f "Dockerfile" ]; then
    echo "Warning: Dockerfile not found. Please ensure node/Dockerfile exists."
fi

# Install CLI
if [ -f "cli/smite-node.py" ]; then
    sudo cp cli/smite-node.py /usr/local/bin/smite-node
    sudo chmod +x /usr/local/bin/smite-node
fi

# Create config directory
mkdir -p config

# Start services
echo ""
echo "Starting Smite Node..."
docker compose up -d

# Wait for services
echo "Waiting for services to start..."
sleep 5

# Check status
if docker ps | grep -q smite-node; then
    echo ""
    echo "✅ Smite Node installed successfully!"
    echo ""
    echo "Node API: http://localhost:$NODE_API_PORT"
    echo ""
    echo "Check status with: smite-node status"
    echo ""
else
    echo "❌ Installation completed but node is not running"
    echo "Check logs with: docker compose logs"
    exit 1
fi

