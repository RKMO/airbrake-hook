# About

Microservice for accepting webhook POST requests from Airbrake and integrating with various backends.
Currently, only Asana is supported. More backends may come.

Use with caution. I do NOT consider this a "production-ready" service.
There are known certainly bugs and security vulnerabilities.

## Requirements

When running the docker image or deploying it to kubernetes you must have the following environment variables set:

* `ASANA_ACCESS_TOKEN`
* `ASANA_PROJECT_WORKSPACE_ID`
* `ASANA_AIRBRAKE_PROJECT_ID`
* `AIRBRAKE_ORG_NAME`

## Development

### Running locally in docker

```
# build the image
docker build -f docker/Dockerfile.production -t airbrake-hook .

# run it (assumes docker/.env.production exists with KEY=value pairs of required environment variables)
docker run -t --env-file docker/.env.production -p 3020:3020 airbrake-hook

# test in another tab
curl -XPOST --data @example.json -H "Content-Type: application/json" dockerhost:3020/airbrake
```

## TODOs

* Authentication
* Support Asana OAauth2
* Better tests
* More backends (statsd, SNS, etc)
* Modular backends

