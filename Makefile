define header
  $(info $(START)▶▶▶ $(1)$(END))
endef

init:
	$(call header, Initialise apps)
	npm i && cd apps/requital-app && expo install

run-apps:
	$(call header, Run apps)
	npm run dev

get-secret:
	$(call header, Get secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:get $KEY

set-secret:
	$(call header, Set secret)
	cd apps/requital-functions/functions && npx firebase functions:secrets:set $(KEY)

prune-secrets:
	$(call header, Get secrets)
	cd apps/requital-functions/functions && npx firebase functions:secrets:prune

deploy-functions-dev:
	$(call header, Deploy functions)
	(cd apps/requital-functions/functions && npm run deploy:dev)

deploy-functions-prod:
	$(call header, Deploy functions)
	(cd apps/requital-functions/functions && npm run deploy:prod)

deploy-app:
	$(call header, Deploy app)
	(cd apps/requital-app && eas build)