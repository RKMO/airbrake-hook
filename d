#!/bin/bash

CMD=$1

if [[ -z "$CMD" ]]; then
  echo "Usage: $0 [build]"
fi

git_rev() {
  local REV=$(git rev-parse --verify ${1:-HEAD})
  echo "${REV:0:6}"
}

does_image_exist() {
  local IMAGE_TAG=$1
  docker inspect $IMAGE:$IMAGE_TAG 1> /dev/null 2>&1
  return $?
}

docker_build() {
  local IMAGE_TAG=${GIT_REV}

  if does_image_exist $IMAGE_TAG; then
    echo "docker image $IMAGE:$IMAGE_TAG already exists, skipping"
  else
    ./d build
  fi
}

IMAGE=speeddigital/airbrake-hook
GIT_REV=$(git_rev)

case $CMD in
build)
  set -ex

  DOCKER_CMDS=()
  IMAGE_TAG=${IMAGE_TAG:-$GIT_REV}
  BUILD_IMAGE="$IMAGE:$IMAGE_TAG"

  if false && does_image_exist $IMAGE_TAG; then
    echo "docker image $IMAGE:$IMAGE_TAG already exists, skipping build"
  else
    DOCKERFILE=${DOCKERFILE:-Dockerfile}
    docker build -f $DOCKERFILE -t $BUILD_IMAGE .
  fi

  ;;
info)
  echo "latest image:       $IMAGE:$GIT_REV"

  ;;
push)
  set -ex

  IMAGE_TAG=${GIT_REV}
  DOCKER_OPTS=""

  [ -f ./.docker/config.json ] && DOCKER_OPTS="$DOCKER_OPTS --config=.docker"

  docker $DOCKER_OPTS push $IMAGE:$IMAGE_TAG
  docker $DOCKER_OPTS tag -f $IMAGE:$IMAGE_TAG $IMAGE:latest
  docker $DOCKER_OPTS push $IMAGE:latest

  ;;
pull)
  set -ex

  IMAGE_TAG=${IMAGE_TAG:-$TAG-$GIT_REV}

  if does_image_exist $IMAGE_TAG; then
    echo "docker image $IMAGE:$IMAGE_TAG already exists, skipping pull"
  else
    DOCKER_OPTS=""
    [ -f ./.docker/config.json ] && DOCKER_OPTS="$DOCKER_OPTS --config=.docker"
    docker $DOCKER_OPTS pull $IMAGE:$IMAGE_TAG || ./d build $TARGET
  fi

  ;;
deploy)
  set -ex

  docker_build
  ./d push

  KUBE_OPTIONS=""
  [ -f .kube/config ] && KUBE_OPTIONS="--kubeconfig=.kube/config $KUBE_OPTIONS"

  JQ_QUERY=".spec.template.spec.containers[0].image = \"$IMAGE:$GIT_REV\""
  JQ_QUERY="$JQ_QUERY | .spec.template.metadata.labels.app_version = \"$GIT_REV\""

  kubectl $KUBE_OPTIONS get deployments airbrake-hook -o json | \
    jq "$JQ_QUERY" | \
    kubectl $KUBE_OPTIONS apply -f -

  ;;
*)
  echo "Unsupported command $CMD"
  exit -1
esac
