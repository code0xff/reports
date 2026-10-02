// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.20;

import {AIDRegistry} from "../src/AIDRegistry.sol";
import {IAIDRegistry} from "../src/interfaces/IAIDRegistry.sol";
import {MockIdentityRegistry8004} from "../src/mocks/MockIdentityRegistry8004.sol";

interface Vm {
    function prank(address) external;
    function startPrank(address) external;
    function stopPrank() external;
    function warp(uint256) external;
    function expectRevert(bytes calldata) external;
}

/// A contract that is not an ERC-8004 registry in any sense: two views, and it
/// says every agent id belongs to whoever deployed it.
contract FakeRegistry {
    address immutable claimant;
    constructor() { claimant = msg.sender; }
    function ownerOf(uint256) external view returns (address) { return claimant; }
    function getAgentWallet(uint256) external pure returns (address) { return address(0); }
}

contract AIDProbe {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    AIDRegistry aid;
    MockIdentityRegistry8004 reg;
    address constant OWNER = address(0xA11CE);
    address constant WALLET_A = address(0xA);
    address constant WALLET_B = address(0xB);
    uint64 constant WIN = 7 days;

    function setUp() public {
        vm.warp(1_790_000_000);
        aid = new AIDRegistry(WIN, 365 days);
        reg = new MockIdentityRegistry8004();
    }

    function _agent() internal returns (uint256 id) {
        vm.startPrank(OWNER); id = reg.register(); reg.setAgentWallet(id, WALLET_A); vm.stopPrank();
    }

    /// 1. A self-deployed two-function contract is accepted as the "ERC-8004 registry",
    ///    and the anchor reports ACTIVE.
    function test_fakeRegistryYieldsActive() public {
        vm.prank(address(0xF00));
        FakeRegistry fake = new FakeRegistry();
        vm.prank(address(0xF00));
        aid.bind(address(fake), 424242);
        require(aid.state(address(0xF00)) == IAIDRegistry.State.ACTIVE, "expected ACTIVE");
    }

    /// 2. Liveness: ACTIVE -> STALE after the window with no transaction; heartbeat restores.
    function test_livenessWindow() public {
        uint256 id = _agent();
        vm.prank(WALLET_A); aid.bind(address(reg), id);
        require(aid.state(WALLET_A) == IAIDRegistry.State.ACTIVE, "active");
        vm.warp(block.timestamp + WIN + 1);
        require(aid.state(WALLET_A) == IAIDRegistry.State.STALE, "stale after window");
        vm.prank(WALLET_A); aid.heartbeat();
        require(aid.state(WALLET_A) == IAIDRegistry.State.ACTIVE, "active after heartbeat");
    }

    /// 3. Binding drift: owner moves the wallet; anchor goes STALE with no AID transaction,
    ///    and the new wallet takes the binding over atomically.
    function test_driftAndTakeover() public {
        uint256 id = _agent();
        vm.prank(WALLET_A); aid.bind(address(reg), id);
        vm.prank(OWNER); reg.setAgentWallet(id, WALLET_B);
        require(aid.state(WALLET_A) == IAIDRegistry.State.STALE, "A stale on drift");
        vm.prank(WALLET_B); aid.bind(address(reg), id);
        require(aid.anchorOf(address(reg), id) == WALLET_B, "B took over");
        require(aid.state(WALLET_A) == IAIDRegistry.State.DORMANT, "A dormant after takeover");
    }

    /// 4. Owner pre-emption: after drift, the OWNER address (which also satisfies the
    ///    predicate) binds first; the recommended anchor - the new agentWallet - is then
    ///    locked out for as long as the owner holds the token.
    function test_ownerPreemptsRecommendedWalletAnchor() public {
        uint256 id = _agent();
        vm.prank(WALLET_A); aid.bind(address(reg), id);
        vm.prank(OWNER); reg.setAgentWallet(id, WALLET_B);
        vm.prank(OWNER); aid.bind(address(reg), id);                // owner races in
        vm.prank(WALLET_B);
        vm.expectRevert(abi.encodeWithSelector(IAIDRegistry.AgentAlreadyBound.selector, address(reg), id, OWNER));
        aid.bind(address(reg), id);                                  // wallet cannot bind
    }

    /// 5. A -> gap -> A: the same anchor regains the predicate without any AID transaction
    ///    and on-chain state() reports ACTIVE again. Only an off-chain resolver can say the
    ///    gap was not this AID's.
    function test_gapIsInvisibleToState() public {
        uint256 id = _agent();
        vm.prank(WALLET_A); aid.bind(address(reg), id);
        vm.prank(OWNER); reg.setAgentWallet(id, WALLET_B);
        require(aid.state(WALLET_A) == IAIDRegistry.State.STALE, "gap");
        vm.prank(OWNER); reg.setAgentWallet(id, WALLET_A);
        require(aid.state(WALLET_A) == IAIDRegistry.State.ACTIVE, "active again, same boundAt");
    }

    /// 6. Successor is unilateral: an anchor may name any address, including one that never consented.
    function test_successorNeedsNoConsent() public {
        vm.prank(address(0xDEAD)); aid.retire(address(0xBEEF));
        require(aid.successorOf(address(0xDEAD)) == address(0xBEEF), "successor set");
        require(aid.state(address(0xDEAD)) == IAIDRegistry.State.RETIRED, "retired");
    }

    /// 7. Retirement blocks every anchor-authorised write.
    function test_retiredBlocksWrites() public {
        vm.prank(address(0xDEAD)); aid.retire(address(0));
        vm.prank(address(0xDEAD));
        vm.expectRevert(abi.encodeWithSelector(IAIDRegistry.AIDRetired.selector, address(0xDEAD)));
        aid.heartbeat();
    }
}
