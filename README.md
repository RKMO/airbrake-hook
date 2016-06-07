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
docker build -t airbrake-hook .

# run it (assumes .env exists with KEY=value pairs of required environment variables)
docker run -t --env-file .env -p 3020:3020 airbrake-hook

# test in another tab
curl -XPOST --data @example.json -H "Content-Type: application/json" dockerhost:3020/airbrake
```

## Production

The `docker` directory includes example Kubernetes deployment and service
scripts for those who want to run this on Kubernetes.


The `./d` script is useful for building and pushing images, and deploying them to kubernetes.

```
# build the docker image
./d build

# push the docker image to a remote docker repo (e.g. Docker Hub)
./d push

# build, push, and update the kubernetes deployment with the latest image
./d deploy
```

## TODOs

* Authentication
* Support Asana OAauth2
* Better tests
* More backends (statsd, SNS, etc)
* Modular backends
