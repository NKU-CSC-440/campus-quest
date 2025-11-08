#!/usr/bin/env bash

set -e # stop immediately on errors
set -o pipefail # do not silently ignore errors in pipelines
cd "${0%/*}" # cd into script's current location

(cd backend && bundle exec rubocop -A) &
(cd frontend && npx prettier --write .) &
wait
