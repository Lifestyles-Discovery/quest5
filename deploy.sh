#!/bin/bash

# Quest5 Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "Building Quest5..."
npm run build

echo "Uploading to S3..."
aws s3 sync ./dist s3://quest5-lifestylespodium --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id E36JDFN9C0BQ8A --paths '/*'

echo "Deployment complete!"
echo "Site: https://quest5.lifestylespodium.com"
