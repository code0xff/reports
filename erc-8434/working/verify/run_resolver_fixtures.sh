#!/bin/sh
# Runs the proposal's own reference resolver against each of its published fixtures.
# Expects the PR's assets/erc-8434 tree at ./aid and ethers@6 installed.
for f in aid/vectors/fixtures/*.json; do
  echo "== $(basename "$f")"; node aid/tools/aid-resolve/resolve.js --fixture "$f" --now 1790000000
done
