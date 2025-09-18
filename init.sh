#! /bin/bash

# bash ./init.sh SLACK_BOT_TOKEN APP_TOKEN
SLACK_BOT_TOKEN=$1
APP_TOKEN=$2

# ---

echo ""
echo "--------------------------------"
echo "Updating yum..."
sudo yum -y update
echo "--------------------------------"
echo ""
echo "--------------------------------"
echo "Installing wget, git..."
sudo yum install -y wget git
echo "--------------------------------"
echo ""
echo "--------------------------------"
echo "Installing nvm..."
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
echo "--------------------------------"
echo ""
echo "--------------------------------"
echo "Installing node..."
nvm install 22
nvm use 22
nvm alias default 22
echo "--------------------------------"
echo ""
echo "--------------------------------"
echo "Installing yarn..."
npm install -g yarn
echo "--------------------------------"

echo "pwd: $(pwd)"

rm -rf new-slack-automation

git clone https://github.com/sijakdan/slack-automation new-slack-automation

cd new-slack-automation/services/server/

echo "SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN" > .env

echo "APP_TOKEN=$APP_TOKEN" >> .env

corepack enable

yarn install

PIDs=$(ps -ef | grep "src/server.ts" | grep -v "rg" | grep -v "grep" | awk '{print $2}')

if [ -n "$PIDs" ]; then
  echo "Killing existing processes..."
  kill -9 $PIDs || true
fi

cd /home/ec2-user

rm -rf slack-automation

mv new-slack-automation slack-automation

cd slack-automation/services/server/

nohup yarn start > /dev/null 2>&1 &
