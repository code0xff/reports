#!/bin/sh
# Recompute the salt with cast and ask the live v1.1 escrow on Base for getHash
# of the same fixture xcheck_test.go hashes with the Go SDK. Public RPC, no keys.
R=https://base.gateway.tenderly.co; E=0xf96815976523E00e65Be8f34cA5e64b4f41EB19c
SALT=0xd0967e09b6c8fccf96277d95a03e98583e8605ab10858b1349aa50ea6d78132c
TH=$(cast keccak "x402AuthCaptureSaltBinding(address receiverAuthorizer,address policy,uint256 saltNonce)")
echo "cast salt: $(cast keccak $(cast abi-encode 'f(bytes32,address,address,uint256)' $TH 0x1111111111111111111111111111111111111111 0x0000000000000000000000000000000000000000 0xabc))"
SIG='getHash((address,address,address,address,uint120,uint48,uint48,uint48,uint16,uint16,address,uint256))(bytes32)'
for P in 0x0000000000000000000000000000000000000000 0x5555555555555555555555555555555555555555; do
  echo "chain getHash payer=$P: $(cast call --rpc-url $R $E "$SIG" "(0x2222222222222222222222222222222222222222,$P,0x3333333333333333333333333333333333333333,0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,1000000,1800000000,1800086400,1802678400,100,100,0x4444444444444444444444444444444444444444,$SALT)")"
done
