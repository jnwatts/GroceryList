serve:
	./node_modules/.bin/browser-sync \
		-ws \
		--no-open \
		--no-online \
		--port 3000 \
		--cors \
		--ignore '.*'

