#!/bin/env bash

(cd backend && rails server) &
(cd frontend && npm run dev) &
wait

