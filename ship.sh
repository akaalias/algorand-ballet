#!/usr/bin/env zsh

# abort on errors
set -e

# build
npm run build

echo -n "My commit message: "
read MESSAGE

echo $MESSAGE

git add -A
git commit -m $MESSAGE
git push origin main

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages