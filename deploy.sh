#!/bin/bash

# Quest5 Production Deployment Script
# Usage: ./deploy.sh
# Note: Uses npm run deploy which auto-bumps version via predeploy hook

set -e

npm run deploy

echo ""
echo "Deployment complete!"
echo "Site: https://quest5.lifestylesquest.com"
