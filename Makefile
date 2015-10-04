all: build .modules | silent

statics:
	@wget http://google-analytics.com/ga.js -O src/assets/js/ga.js 2>/dev/null
	@wget http://connect.facebook.net/en_US/sdk.js -O src/assets/js/facebook.js 2>/dev/null
	@wget https://platform.twitter.com/widgets.js -O src/assets/js/twitter.js 2>/dev/null

build: $(shell find src ! -name "\.*" ! -name "links_failed.json")
	@./node_modules/metalsmith-blue/bin/blue .

run:
	./node_modules/http-server/bin/http-server build

clean:
	@rm -rf build 

silent:
	@:

.PHONY:
	run silent clean
