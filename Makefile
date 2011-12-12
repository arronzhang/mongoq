dd.html: head.html foot.html Readme.md
	@./node_modules/.bin/md2html Readme.md \
		| cat head.html - foot.html \
		> $@ 

clean:
	rm -f index.html

.PHONY: clean
