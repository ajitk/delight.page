#! /usr/bin/env sh

DIR=chrome
FILE_CR=delight-chrome.zip
FILE_FF=delight-firefox.zip
mkdir -p $DIR
cp -r build icons src manifest.json $DIR/

export NODE_ENV=production
npm run build
7z a $FILE_CR $DIR/

cd $DIR
7z a ../$FILE_FF *
