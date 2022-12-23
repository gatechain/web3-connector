#!/bin/sh

# $1 abis; $2 out 
npx abi-gen --abis $1 --out $2 --partials 'template/partials/**/*.handlebars' --template 'template/contract.handlebars' 

