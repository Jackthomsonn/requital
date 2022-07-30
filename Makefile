define header
  $(info $(START)▶▶▶ $(1)$(END))
endef

init:
	$(call header, Initialise apps)
	npm i && cd apps/requital-app && expo install

run-apps:
	$(call header, Run apps)
	npm run dev

deploy-functions:
	$(call header, Deploy functions)
	(cd apps/requital-functions/functions npm run deploy)

deploy-app:
	$(call header, Deploy app)
	(cd apps/requital-app && eas build)