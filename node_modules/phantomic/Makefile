version := $(shell node -p "require('./package.json').version")

default: assert.sh
	@test/suite.sh

assert.sh:
	git clone https://github.com/lehmannro/assert.sh.git

install: assert.sh
	rm -rf node_modules
	npm install

release: default
	git tag -a -m "Release ${version}" v${version}
	git push --follow-tags
	npm publish
