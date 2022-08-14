define header
  $(info $(START)▶▶▶ $(1)$(END))
endef

init:
	$(call header, Initialise apps)
	npm i

run-apps:
	$(call header, Run apps)
	npm run dev

setup-tunnel:
	$(call header, Setup tunnel)
	npm run setup-tunnel

lint:
	$(call header, Lint)
	npm run lint

test:
	$(call header, Test)
	npm run test

deploy-functions:
	$(call header, Deploy functions)
	(cd apps/requital-functions/functions && npm run deploy)

build-app-ios:
	$(call header, Build IOS app)
	(cd apps/requital-app && eas build --platform=ios)

publish-app-ios:
	$(call header, Publish IOS app)
	(cd apps/requital-app && eas submit --platform=ios)

publish-converters:
	$(call header, Publish converters)
	(cd apps/requital-converters && npm publish)

access-secret:
	$(call header, Access secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:access $(KEY)

set-secret:
	$(call header, Set secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:set $(KEY)

prune-secrets:
	$(call header, Get secrets)
	cd apps/requital-functions/functions && npx firebase functions:secrets:prune