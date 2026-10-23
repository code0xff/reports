package authcapture

import (
	"fmt"
	"math/big"
	"testing"
)

// Fixed fixture for cross-checking the SDK against the live escrow's getHash.
func TestXCheck(t *testing.T) {
	salt, err := DeriveBoundSalt("0x1111111111111111111111111111111111111111", "0x0000000000000000000000000000000000000000",
		"0x0000000000000000000000000000000000000000000000000000000000000abc")
	if err != nil {
		t.Fatal(err)
	}
	pi := PaymentInfoStruct{
		Operator: "0x2222222222222222222222222222222222222222", Receiver: "0x3333333333333333333333333333333333333333",
		Token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", MaxAmount: "1000000",
		PreApprovalExpiry: 1800000000, AuthorizationExpiry: 1800086400, RefundExpiry: 1802678400,
		MinFeeBps: 100, MaxFeeBps: 100, FeeReceiver: "0x4444444444444444444444444444444444444444", Salt: salt,
	}
	agn, _ := ComputePayerAgnosticPaymentInfoHash(big.NewInt(8453), pi)
	full, _ := ComputePaymentInfoHash(big.NewInt(8453), pi, "0x5555555555555555555555555555555555555555")
	fmt.Println("salt", salt)
	fmt.Println("agnostic", agn)
	fmt.Println("full", full)
}
