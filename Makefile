all: build | silent

build:
	@npm install
	@./node_modules/metalsmith-blue/bin/blue .

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

.PHONY:
	run clean silent build
