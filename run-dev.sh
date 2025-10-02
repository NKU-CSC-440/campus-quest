#!/usr/bin/env bash

set -e # stop immediately on errors
set -o pipefail # do not silently ignore errors in pipelines
cd "${0%/*}" # cd into script's current location

(cd backend && rails server) &
(cd frontend && npm run dev) &
wait

