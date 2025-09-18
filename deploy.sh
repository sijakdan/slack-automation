#! /bin/bash

source .env
echo ""
echo "--------------------------------"
echo "Deploying..."
echo "--------------------------------"

ssh -i $PEM_FILE $SERVER_ADDRESS "bash -s -- $SLACK_BOT_TOKEN $APP_TOKEN" < ./init.sh