all: build | silent

build: .install
	@node ./lib/index.js . $(CHECK) $(DEPLOY)
	@while [ -n "$(find .build -depth -type d -empty -print -exec rmdir {} +)" ]; do :; done
	@rsync -rlpgoDc --delete .build/ build 2>/dev/null
	@rm -rf .build

deploy: DEPLOY = --deploy
deploy: check build

check: CHECK = --check
check: build

.install: package.json
	@npm install
	@touch .install

silent:
	@:

run:
	./node_modules/http-server/bin/http-server build -p 8080

clean:
	@rm -rf .build build .install

fixphotos:
	@find . -name "photo.jpg" | xargs -n 1 -P 4 -I PHOTO convert PHOTO -resize 293x293^ -gravity center -extent 293x293^ -strip +set date:create +set date:modify PHOTO

fixthumbnails:
	@for f in `find src -name "paper.pdf" -o -name "poster.pdf" -o -name "external.pdf"` ; do convert -thumbnail x300 -background white -alpha remove "$f"[0] "${f%.pdf}.png" ; done

findspace:
	find src -type f -exec egrep -Il " +$$" {} \;

.PHONY: run clean silent build fixphotos fixthumbnails findspace
