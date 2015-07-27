#! /bin/bash
#
# Install the packages listed in util/packages.json as *global* packages.
# 

pushd $(dirname $0)                                                                                     2> /dev/null  > /dev/null

rm -f package.json
cp global-npm-packages.json package.json
if test -f package.json ; then
    #cat package.json
    npm-check-updates -u
    npm update -g
    cat package.json > global-npm-packages.json
fi
rm -f package.json

popd                                                                                                    2> /dev/null  > /dev/null
