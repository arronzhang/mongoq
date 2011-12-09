
test:
	@echo "Please start mongodb[localhost:27017] at first."
	@echo "Test mongoq"
	@NODE_ENV=test ./node_modules/.bin/mocha --slow 20 --growl \
		./test/*.test.js

docs: docs/api.html

docs/api.html: lib/*.js
	dox \
		--private \
		--title Mongoq \
		--desc "" \
		$(shell find lib/* -type f) > $@

docclean:
	rm -f docs/*.{1,html}

.PHONY: test
