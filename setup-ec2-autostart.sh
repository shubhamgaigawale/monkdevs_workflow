#!/bin/bash

# Setup EC2 Auto-start for CRM Application
# This creates a systemd service that starts your app on boot

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Setting up CRM Auto-start Service..."

# Get current directory
CURRENT_DIR=$(pwd)
CURRENT_USER=$(whoami)

# Create systemd service file
sudo tee /etc/systemd/system/crm-app.service > /dev/null <<EOF
[Unit]
Description=CRM Application
After=network.target postgresql.service redis.service

[Service]
Type=forking
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=$CURRENT_DIR/run-production.sh
ExecStop=$CURRENT_DIR/stop-all-services.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ Service file created${NC}"

# Reload systemd
sudo systemctl daemon-reload
echo -e "${GREEN}✓ Systemd reloaded${NC}"

# Enable service
sudo systemctl enable crm-app.service
echo -e "${GREEN}✓ Service enabled for auto-start${NC}"

echo ""
echo -e "${GREEN}CRM Application will now start automatically on system boot!${NC}"
echo ""
echo "Useful commands:"
echo "  Start service:   sudo systemctl start crm-app"
echo "  Stop service:    sudo systemctl stop crm-app"
echo "  Restart service: sudo systemctl restart crm-app"
echo "  Check status:    sudo systemctl status crm-app"
echo "  View logs:       sudo journalctl -u crm-app -f"
