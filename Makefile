define header
  $(info $(START)▶▶▶ $(1)$(END))
endef

init:
	$(call header, Initialise apps)
	npm i && cd apps/requital-app && expo install

run-apps:
	$(call header, Run apps)
	npm run dev

access-secret:
	$(call header, Access secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:access $(KEY)

set-secret:
	$(call header, Set secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:set $(KEY)

prune-secrets:
	$(call header, Get secrets)
	cd apps/requital-functions/functions && npx firebase functions:secrets:prune

deploy-functions-prod:
	$(call header, Deploy functions)
	(cd apps/requital-functions/functions && npm run deploy)

deploy-app:
	$(call header, Deploy app)
	(cd apps/requital-app && eas build)