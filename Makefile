define header
  $(info $(START)▶▶▶ $(1)$(END))
endef

init:
	$(call header, Initialise apps)
	npm i && cd apps/requital-app && expo install && cd .. && cd requital-functions && npm i

run-apps:
	$(call header, Run apps)
	npm run dev

setup-tunnel:
	$(call header, Setup tunnel)
	npm run setup-tunnel

lint:
	$(call header, Lint)
	npm run lint

deploy-functions:
	$(call header, Deploy functions)
	(cd apps/requital-functions/functions && npm run deploy)

deploy-app-ios:
	$(call header, Deploy IOS app)
	(cd apps/requital-app && eas build --platform=ios)

deploy-app-android:
	$(call header, Deploy Android app)
	(cd apps/requital-app && eas build --platform=android)

access-secret:
	$(call header, Access secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:access $(KEY)

set-secret:
	$(call header, Set secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:set $(KEY)

prune-secrets:
	$(call header, Get secrets)
	cd apps/requital-functions/functions && npx firebase functions:secrets:prune