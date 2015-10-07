all: build | silent

build:
	@npm install
	@node ./node_modules/metalsmith-blue/lib/index.js .

silent:
	@:

run: build
	./node_modules/http-server/bin/http-server build

clean:
	@rm -rf build 

statics:
	@wget http://google-analytics.com/ga.js -O src/assets/js/ga.js 2>/dev/null
	@wget http://connect.facebook.net/en_US/sdk.js -O src/assets/js/facebook.js 2>/dev/null
	@wget https://platform.twitter.com/widgets.js -O src/assets/js/twitter.js 2>/dev/null

fixphotos:
	@find . -name "photo.jpg" | xargs -n 1 -P 4 -I PHOTO convert PHOTO -resize 293x293^ -gravity center -extent 293x293^ -strip +set date:create +set date:modify PHOTO

.PHONY: run clean silent build
