TESTS = test/node/*.js
REPORTER = dot

all: everyplay.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 200 \
		--growl \
		$(TESTS)

test-cov: lib-cov
	EVERYPLAY_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	jscoverage lib lib-cov

everyplay.js: components
	@./node_modules/.bin/component build --standalone EP
	@cp build/build.js everyplay.js

everyplay.min.js: everyplay.js
	./node_modules/.bin/uglifyjs -m -o everyplay.min.js everyplay.js

test-server:
	@node test/server

docs: test-docs

test-docs:
	make test REPORTER=doc \
		| cat docs/head.html - docs/tail.html \
		> docs/test.html

build: components
	@./node_modules/.bin/component build --dev

components: component.json
	@./node_modules/.bin/component install --dev

clean:
	rm -fr build components everyplay.js everyplay.min.js

.PHONY: test-cov test docs test-docs clean

