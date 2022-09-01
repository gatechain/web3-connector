for X in hipo-wallet
do 
  npx lerna add $X --exact --no-bootstrap --scope=example-next
done
