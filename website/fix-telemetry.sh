#!/bin/bash
# Fix telemetry server - add trust proxy setting

echo "🔧 Fixing telemetry server (port 3000)..."
echo ""

TELEMETRY_PATH="/opt/3dpc-telemetry"
SERVER_FILE="$TELEMETRY_PATH/server.js"

# Check if file exists
if [ ! -f "$SERVER_FILE" ]; then
    echo "❌ Error: $SERVER_FILE not found!"
    echo "Looking for telemetry in other locations..."
    
    # Try alternative locations
    if [ -d "/opt/server-telemetry" ]; then
        TELEMETRY_PATH="/opt/server-telemetry"
        SERVER_FILE="$TELEMETRY_PATH/server.js"
        echo "✅ Found at: $TELEMETRY_PATH"
    elif [ -d "$HOME/server-telemetry" ]; then
        TELEMETRY_PATH="$HOME/server-telemetry"
        SERVER_FILE="$TELEMETRY_PATH/server.js"
        echo "✅ Found at: $TELEMETRY_PATH"
    else
        echo "❌ Cannot find telemetry server directory!"
        exit 1
    fi
fi

# Backup original file
echo "📦 Creating backup..."
cp "$SERVER_FILE" "$SERVER_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Check if trust proxy already exists
if grep -q "trust proxy" "$SERVER_FILE"; then
    echo "⚠️  'trust proxy' setting already exists in the file"
    echo "Showing current configuration:"
    grep -A 2 -B 2 "trust proxy" "$SERVER_FILE"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
    fi
fi

# Find the line with "const app = express();" and add trust proxy after it
echo "✏️  Adding trust proxy setting..."

sed -i '/const app = express();/a app.set('\''trust proxy'\'', 1);' "$SERVER_FILE"

# Verify the change
if grep -q "trust proxy" "$SERVER_FILE"; then
    echo "✅ Successfully added trust proxy setting!"
    echo ""
    echo "📝 Changes made:"
    grep -A 1 "const app = express()" "$SERVER_FILE" | head -3
    echo ""
else
    echo "❌ Failed to add trust proxy setting"
    echo "Restoring backup..."
    mv "$SERVER_FILE.backup."* "$SERVER_FILE"
    exit 1
fi

# Restart PM2 process
echo "🔄 Restarting telemetry server..."
pm2 restart 3dpc-telemetry

# Wait a bit
sleep 3

# Show logs
echo ""
echo "📊 Last 15 lines of logs:"
pm2 logs 3dpc-telemetry --lines 15 --nostream

echo ""
echo "✅ Done! Telemetry server should be working now."
echo ""
echo "To check status: pm2 list"
echo "To view logs: pm2 logs 3dpc-telemetry"



