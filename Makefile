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


deploy-functions-prod:
	$(call header, Deploy functions)
	(cd apps/requital-functions/functions && npm run deploy)

deploy-app:
	$(call header, Deploy app)
	(cd apps/requital-app && npm run build)

access-secret:
	$(call header, Access secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:access $(KEY)

set-secret:
	$(call header, Set secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:set $(KEY)

prune-secrets:
	$(call header, Get secrets)
	cd apps/requital-functions/functions && npx firebase functions:secrets:prune