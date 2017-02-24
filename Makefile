all: build | silent

build: node_modules
	@node ./lib/index.js . $(CHECK) $(DEPLOY)
	@while [ -n "$$(find .build -depth -type d -empty -print -exec rmdir {} +)" ]; do :; done
	@rsync -rlpgoDc --delete .build/ build
	@rm -rf .build

install: node_modules
	@node ./lib/index.js . --check --deploy --quiet
	@while [ -n "$$(find .build -depth -type d -empty -print -exec rmdir {} +)" ]; do :; done

deploy: DEPLOY = --deploy
deploy: check build

check: CHECK = --check
check: build

node_modules: package.json
	@npm install --progress=false

silent:
	@:

run:
	./node_modules/http-server/bin/http-server build -p 8080 -a 127.0.0.1

clean:
	@rm -rf .build build

fixphotos:
	@find . -name "photo.jpg" | xargs -n 1 -P 4 -I PHOTO convert PHOTO -resize 293x293^ -gravity center -extent 293x293^ -strip +set date:create +set date:modify PHOTO

fixthumbnails:
	for f in `find src -name "paper.pdf" -o -name "poster.pdf" -o -name "external.pdf"` ; do convert -thumbnail x300 -background white -alpha remove "$$f"[0] "$${f%.pdf}.png" ; done

statics:
	@wget https://www.google-analytics.com/analytics.js -O src/assets/js/analytics.js 2>/dev/null

findspace:
	find lib src -type f -exec egrep -Il " +$$" {} \;

.PHONY: run clean silent build fixphotos fixthumbnails findspace install
