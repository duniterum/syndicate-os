// SPDX-License-Identifier: UNLICENSED
// =============================================================================
//  MembershipSaleV3 - V3 CANDIDATE (not deployed, not activated)
//  The Syndicate - Acquisition-first membership distribution engine
// =============================================================================
//  STATUS: Implementation candidate for docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md.
//          This contract is not deployed, not registered, and not wired to the
//          frontend. V2b remains the live sale until an explicit deployment,
//          verification, funding, registry update, and product activation pass.
//
//  V3 MODEL
//  --------
//      gross USDC
//        -> verified acquisition cost, if an eligible source exists
//        -> net protocol contribution
//        -> 70% Vault / 20% Liquidity / 10% Operations
//        -> SYN delivered at the deterministic era rate
//        -> one reconstructable receipt event
//
//  SYN remains the V1 seat. A wallet is seated by holding SYN. This contract
//  only distributes SYN and records membership-sale receipts.
// =============================================================================
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SourceRegistryV1} from "./SourceRegistryV1.sol";

contract MembershipSaleV3 is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --------------------------------------------------------------- errors
    error ZeroAddress();
    error BadGenesisOffset();
    error BadEraCaps();
    error SaleConcluded();
    error BelowEraMinimum(uint256 min);
    error ExceedsTxMax(uint256 maxTx);
    error AddressEraCapExceeded(uint256 capRemaining);
    error EraInventoryInsufficient(uint256 eraCapRemaining);
    error InsufficientInventory(uint256 available);
    error SlippageExceeded(uint256 got, uint256 minOut);
    error NotWindingDown();
    error RecoveryTimelocked(uint256 readyAt);
    error ProtectedToken();
    error AlreadyKnown();
    error InvalidProof();
    error ReserveFloorViolation(uint256 maxSynOut);
    error SourceNotEligible();
    error SelfReferral();
    error ReferrerNotSeated();
    error SourceAlreadyLinked();
    error NothingToClaim();
    error OnlySelf();
    error UnknownHistoricalMemberNumber(address member);
    error InvalidHistoricalMemberNumber(uint256 memberNumber);
    error HistoricalMemberNumberTaken(uint256 memberNumber);
    error SourceEscrowLocked();
    error DuplicateRouteWallet();

    // ----------------------------------------------- era-advance reason codes
    uint8 internal constant REASON_RANGE = 0;
    uint8 internal constant REASON_CAP = 1;
    uint8 public constant RECEIPT_VERSION = 3;

    // --------------------------------------------------------------- events
    event MembershipPurchasedV3(
        bytes32 indexed receiptId,
        address indexed buyer,
        address indexed recipient,
        uint256 memberNumber,
        uint256 grossUsdc,
        uint256 acquisitionCost,
        uint256 protocolContribution,
        uint256 vaultAmount,
        uint256 liquidityAmount,
        uint256 operationsAmount,
        uint256 synOut,
        uint64 synPerUsdc,
        uint16 era,
        uint16 chapter,
        bytes32 sourceId,
        uint8 sourceClass,
        address sourceWallet,
        uint16 commissionBps,
        uint8 attributionScope,
        uint256 attributionWindowEndsAt,
        uint256 sourceGrossRemaining,
        uint256 buyerGrossRemaining,
        bool firstSeat,
        uint8 receiptVersion
    );

    event EraAdvanced(uint16 indexed fromEra, uint16 indexed toEra, uint256 atSeatNumber, uint8 reason);
    event V1MembershipRecognized(address indexed member);
    event HistoricalMembershipRecognized(address indexed member, uint256 indexed memberNumber);
    event UnsoldSynRecovered(address indexed to, uint256 amount);
    event SourceAttributionLinked(bytes32 indexed sourceId, address indexed buyer, uint64 expiresAt);
    // Reserved for a future indexer/maintenance transition. Expiry is read-time
    // in this V3 candidate and is not emitted during normal purchases.
    event SourceAttributionExpired(bytes32 indexed sourceId, address indexed buyer);
    event SourcePayoutEscrowed(bytes32 indexed sourceId, address indexed payoutWallet, uint256 amount);
    event SourcePayoutClaimed(bytes32 indexed sourceId, address indexed payoutWallet, uint256 amount);

    // ----------------------------------------------------------- immutables
    IERC20 public immutable USDC;
    IERC20 public immutable SYN;
    SourceRegistryV1 public immutable SOURCE_REGISTRY;
    address public immutable VAULT;
    address public immutable LIQUIDITY;
    address public immutable OPERATIONS;
    uint256 public immutable GENESIS_OFFSET;
    bytes32 public immutable V1_MEMBER_ROOT;
    uint256 public immutable MAX_USDC_PER_TX;
    uint256 public immutable RESERVE_THROUGH_SEAT;

    uint256 private constant GENESIS_END = 333;
    uint256 private constant FINAL_SEAT = 1_000_000;
    uint256 private constant SCALE_6_TO_18 = 1e12;
    uint16 private constant BPS_DENOMINATOR = 10_000;
    uint256 public constant RECOVERY_TIMELOCK = 14 days;

    // ---------------------------------------------------------------- state
    uint64 public pausedAt;
    uint256 public memberCount;
    uint256 public receiptCount;
    uint256 public totalGrossUsdc;
    uint256 public totalAcquisitionCost;
    uint256 public totalProtocolContribution;
    uint256 public totalSynSold;
    uint16 public activeEra;

    mapping(uint16 => uint256) public eraSynCap;
    mapping(uint16 => uint256) public soldInEra;
    mapping(uint16 => uint256) public maxUsdcPerAddressPerEra;

    mapping(address => bool) public knownMember;
    mapping(address => uint256) public memberNumberOf;
    mapping(uint256 => address) public memberByNumber;
    mapping(address => uint256) public grossContributed;
    mapping(address => mapping(uint16 => uint256)) public usdcByAddressEra;

    mapping(bytes32 => uint256) public sourceGrossAttributed;
    mapping(bytes32 => mapping(address => uint256)) public buyerGrossAttributedToSource;
    mapping(address => bytes32) public buyerSourceId;
    mapping(address => uint64) public buyerSourceExpiresAt;
    mapping(bytes32 => uint256) public sourceEscrowOwed;
    uint256 public totalAcquisitionEscrowed;

    struct PurchaseContext {
        address buyer;
        address recipient;
        uint256 grossUsdc;
        uint256 synOut;
        uint16 era;
        uint64 synPerUsdc;
        bool firstSeat;
        uint256 memberNumber;
        uint16 chapter;
    }

    struct SourceContext {
        bytes32 sourceId;
        bool active;
        uint16 commissionBps;
        address payoutWallet;
        address sourceWallet;
        uint8 sourceClass;
        uint8 scope;
        uint256 windowEnds;
        uint256 sourceGrossRemaining;
        uint256 buyerGrossRemaining;
    }

    struct RouteContext {
        uint256 acquisitionCost;
        uint256 protocolContribution;
        uint256 vaultAmount;
        uint256 liquidityAmount;
        uint256 operationsAmount;
    }

    // ------------------------------------------------------------ construct
    constructor(
        address usdc,
        address syn,
        address sourceRegistry,
        address vault,
        address liquidity,
        address operations,
        uint256 genesisOffset,
        bytes32 v1MemberRoot,
        uint256[9] memory addrCaps,
        uint256 maxUsdcPerTx,
        uint256 reserveThroughSeat,
        uint256[9] memory eraCaps
    ) Ownable(msg.sender) {
        if (
            usdc == address(0) || syn == address(0) || sourceRegistry == address(0) ||
            vault == address(0) || liquidity == address(0) || operations == address(0)
        ) revert ZeroAddress();
        if (vault == liquidity || vault == operations || liquidity == operations) revert DuplicateRouteWallet();
        if (genesisOffset >= FINAL_SEAT) revert BadGenesisOffset();
        if (maxUsdcPerTx == 0) revert BadEraCaps();
        if (
            reserveThroughSeat != 0 &&
            (reserveThroughSeat <= GENESIS_END || reserveThroughSeat > FINAL_SEAT)
        ) revert BadEraCaps();

        USDC = IERC20(usdc);
        SYN = IERC20(syn);
        SOURCE_REGISTRY = SourceRegistryV1(sourceRegistry);
        VAULT = vault;
        LIQUIDITY = liquidity;
        OPERATIONS = operations;
        GENESIS_OFFSET = genesisOffset;
        V1_MEMBER_ROOT = v1MemberRoot;
        MAX_USDC_PER_TX = maxUsdcPerTx;
        RESERVE_THROUGH_SEAT = reserveThroughSeat;

        memberCount = genesisOffset;
        uint16 startEra = _eraIndexForSeat(genesisOffset + 1);
        activeEra = startEra;

        for (uint16 e = startEra; e <= 9; ++e) {
            (, uint256 minU,) = _eraParams(e);
            if (addrCaps[e - 1] < minU) revert BadEraCaps();
            if (maxUsdcPerTx < minU) revert BadEraCaps();
            if (e == 1) {
                eraSynCap[e] = type(uint256).max;
            } else {
                uint256 cap = eraCaps[e - 1];
                if (cap < _minEntrySyn(e)) revert BadEraCaps();
                eraSynCap[e] = cap;
            }
            maxUsdcPerAddressPerEra[e] = addrCaps[e - 1];
        }

        for (uint16 e = 1; e < startEra; ++e) {
            eraSynCap[e] = eraCaps[e - 1];
            maxUsdcPerAddressPerEra[e] = addrCaps[e - 1];
        }
    }

    // ========================================================= membership
    function claimV1Membership(bytes32[] calldata proof) external pure {
        proof;
        revert InvalidProof();
    }

    function claimHistoricalMembership(uint256 memberNumber, bytes32[] calldata proof) external {
        _claimHistoricalMembership(msg.sender, memberNumber, proof);
    }

    // ============================================================ purchase
    function buy(
        uint256 grossUsdc,
        address recipient,
        bytes32 sourceId,
        uint256 minSynOut,
        bytes32[] calldata v1Proof
    ) external nonReentrant whenNotPaused {
        if (recipient == address(0)) revert ZeroAddress();

        if (v1Proof.length > 0) revert InvalidProof();

        PurchaseContext memory p = _preparePurchase(grossUsdc, recipient, minSynOut);
        SourceContext memory s = _resolveSource(sourceId, p);
        RouteContext memory r = _routeAmounts(grossUsdc, s.commissionBps);

        _recordPurchase(p, s, r);

        USDC.safeTransferFrom(msg.sender, address(this), grossUsdc);
        _payAcquisition(s, r.acquisitionCost);
        _send(USDC, VAULT, r.vaultAmount);
        _send(USDC, LIQUIDITY, r.liquidityAmount);
        _send(USDC, OPERATIONS, r.operationsAmount);
        _send(SYN, recipient, p.synOut);

        _emitReceipt(p, s, r);
    }

    /// @notice Claims an acquisition payout that could not be pushed during buy.
    ///         Anyone may call; funds always go to the registry's current payout wallet.
    function claimSourceEscrow(bytes32 sourceId) external nonReentrant {
        uint256 amount = sourceEscrowOwed[sourceId];
        if (amount == 0) revert NothingToClaim();

        SourceRegistryV1.SourceRecord memory record = SOURCE_REGISTRY.sourceConfig(sourceId);
        if (record.payoutWallet == address(0)) revert ZeroAddress();
        if (record.status != SourceRegistryV1.SourceStatus.ACTIVE) revert SourceEscrowLocked();

        sourceEscrowOwed[sourceId] = 0;
        totalAcquisitionEscrowed -= amount;
        _send(USDC, record.payoutWallet, amount);
        emit SourcePayoutClaimed(sourceId, record.payoutWallet, amount);
    }

    /// @notice Self-call wrapper so source payouts can fall back to escrow on token-level reverts.
    function pushSourcePayout(address to, uint256 amount) external {
        if (msg.sender != address(this)) revert OnlySelf();
        _send(USDC, to, amount);
    }

    // ================================================================ views
    function quote(uint256 grossUsdc, address recipient, bytes32 sourceId)
        external
        view
        returns (
            uint256 synOut,
            uint16 era,
            uint64 synPerUsdc,
            uint256 seatIfFirst,
            uint256 acquisitionCost,
            uint256 protocolContribution
        )
    {
        bool concluded;
        (era, concluded) = _resolveEraView();
        if (concluded || memberCount >= FINAL_SEAT) revert SaleConcluded();
        (synPerUsdc,,) = _eraParams(era);
        synOut = grossUsdc * uint256(synPerUsdc) * SCALE_6_TO_18;
        bool firstSeat;
        (firstSeat, seatIfFirst) = _membershipState(recipient);
        uint16 bps = _previewCommissionBps(sourceId, recipient, grossUsdc, firstSeat);
        acquisitionCost = (grossUsdc * bps) / BPS_DENOMINATOR;
        protocolContribution = grossUsdc - acquisitionCost;
    }

    function currentEra() external view returns (uint16) {
        (uint16 era, bool concluded) = _resolveEraView();
        return concluded ? 0 : era;
    }

    function remainingEraCap(uint16 era) external view returns (uint256) {
        uint256 cap = eraSynCap[era];
        uint256 sold = soldInEra[era];
        return cap > sold ? cap - sold : 0;
    }

    function nextSeatNumber() external view returns (uint256) {
        return memberCount + 1;
    }

    function availableSyn() external view returns (uint256) {
        return SYN.balanceOf(address(this));
    }

    function sellableSynForNextSeat() external view returns (uint256) {
        uint256 bal = SYN.balanceOf(address(this));
        uint256 r = _reserveSyn(memberCount + 1);
        return bal > r ? bal - r : 0;
    }

    function currentReserveFloor() external view returns (uint256) {
        return _reserveSyn(memberCount);
    }

    function isConcluded() public view returns (bool) {
        if (memberCount >= FINAL_SEAT) return true;
        (, bool concluded) = _resolveEraView();
        return concluded;
    }

    function eraOfSeat(uint256 seat) external pure returns (uint16) {
        return _eraIndexForSeat(seat);
    }

    function chapterOfMember(uint256 memberNumber) external pure returns (uint16) {
        return _chapterForMember(memberNumber);
    }

    // ============================================================ internals
    function _preparePurchase(uint256 grossUsdc, address recipient, uint256 minSynOut)
        internal
        returns (PurchaseContext memory p)
    {
        (uint16 era, bool concluded) = _syncEra();
        if (concluded || memberCount >= FINAL_SEAT) revert SaleConcluded();

        (uint64 synPerUsdc, uint256 minUsdc6,) = _eraParams(era);
        if (grossUsdc < minUsdc6) revert BelowEraMinimum(minUsdc6);
        if (grossUsdc > MAX_USDC_PER_TX) revert ExceedsTxMax(MAX_USDC_PER_TX);

        uint256 spentThisEra = usdcByAddressEra[recipient][era];
        uint256 addrCap = maxUsdcPerAddressPerEra[era];
        if (spentThisEra + grossUsdc > addrCap) revert AddressEraCapExceeded(addrCap - spentThisEra);

        uint256 synOut = grossUsdc * uint256(synPerUsdc) * SCALE_6_TO_18;
        if (synOut < minSynOut) revert SlippageExceeded(synOut, minSynOut);

        uint256 eraRemaining = eraSynCap[era] - soldInEra[era];
        if (synOut > eraRemaining) revert EraInventoryInsufficient(eraRemaining);

        uint256 available = SYN.balanceOf(address(this));
        if (synOut > available) revert InsufficientInventory(available);

        bool firstSeat;
        uint256 assignedNumber;
        (firstSeat, assignedNumber) = _membershipState(recipient);
        uint256 reserveAfter = _reserveSyn(memberCount + (firstSeat ? 1 : 0));
        uint256 sellableNow = available > reserveAfter ? available - reserveAfter : 0;
        if (synOut > sellableNow) revert ReserveFloorViolation(sellableNow);

        p = PurchaseContext({
            buyer: msg.sender,
            recipient: recipient,
            grossUsdc: grossUsdc,
            synOut: synOut,
            era: era,
            synPerUsdc: synPerUsdc,
            firstSeat: firstSeat,
            memberNumber: assignedNumber,
            chapter: _chapterForMember(assignedNumber)
        });
    }

    function _resolveSource(bytes32 requestedSourceId, PurchaseContext memory p)
        internal
        returns (SourceContext memory s)
    {
        bool explicitSource = requestedSourceId != bytes32(0);
        bool autoLinked;
        bytes32 linked = buyerSourceId[p.recipient];
        bool linkedCanApply = _sourceCanApply(linked, p);
        if (requestedSourceId == bytes32(0) && linkedCanApply) {
            requestedSourceId = linked;
            autoLinked = requestedSourceId != bytes32(0);
        }
        if (
            requestedSourceId != bytes32(0) &&
            linked != bytes32(0) &&
            linked != requestedSourceId &&
            linkedCanApply
        ) revert SourceAlreadyLinked();
        if (requestedSourceId == bytes32(0)) return s;

        SourceRegistryV1.SourceRecord memory record = SOURCE_REGISTRY.sourceConfig(requestedSourceId);
        if (record.sourceWallet == address(0)) {
            if (autoLinked && !explicitSource) return s;
            revert SourceNotEligible();
        }
        if (!p.firstSeat && linked == bytes32(0) && explicitSource) revert SourceNotEligible();
        if (record.sourceWallet == p.buyer || record.sourceWallet == p.recipient) revert SelfReferral();
        if (
            record.sourceClass == SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION &&
            SYN.balanceOf(record.sourceWallet) == 0
        ) {
            if (autoLinked && !explicitSource) return s;
            revert ReferrerNotSeated();
        }
        if (!p.firstSeat && !record.appliesToRepeatPurchases) {
            if (autoLinked && !explicitSource) return s;
            revert SourceNotEligible();
        }

        uint256 projectedSourceGross = sourceGrossAttributed[requestedSourceId] + p.grossUsdc;
        uint256 projectedBuyerGross = buyerGrossAttributedToSource[requestedSourceId][p.recipient] + p.grossUsdc;
        (
            bool eligible,
            uint16 commissionBps,
            address payoutWallet,
            SourceRegistryV1.SourceClass sourceClass,
            SourceRegistryV1.AttributionScope scope,
            SourceRegistryV1.SourceStatus status
        ) = SOURCE_REGISTRY.attributionTerms(requestedSourceId, projectedSourceGross, projectedBuyerGross);
        if (!eligible || status != SourceRegistryV1.SourceStatus.ACTIVE) {
            if (autoLinked && !explicitSource) return s;
            revert SourceNotEligible();
        }
        if (payoutWallet == p.buyer || payoutWallet == p.recipient) revert SelfReferral();

        if (!autoLinked && (linked == bytes32(0) || linked != requestedSourceId)) {
            buyerSourceId[p.recipient] = requestedSourceId;
            buyerSourceExpiresAt[p.recipient] = record.endTime;
            emit SourceAttributionLinked(requestedSourceId, p.recipient, record.endTime);
        }

        s = SourceContext({
            sourceId: requestedSourceId,
            active: true,
            commissionBps: commissionBps,
            payoutWallet: payoutWallet,
            sourceWallet: record.sourceWallet,
            sourceClass: uint8(sourceClass),
            scope: uint8(scope),
            windowEnds: record.endTime,
            sourceGrossRemaining: _remainingAfter(record.grossCap, projectedSourceGross),
            buyerGrossRemaining: _remainingAfter(record.perBuyerCap, projectedBuyerGross)
        });
    }

    function _routeAmounts(uint256 grossUsdc, uint16 commissionBps) internal pure returns (RouteContext memory r) {
        r.acquisitionCost = (grossUsdc * commissionBps) / BPS_DENOMINATOR;
        r.protocolContribution = grossUsdc - r.acquisitionCost;
        r.vaultAmount = (r.protocolContribution * 70) / 100;
        r.liquidityAmount = (r.protocolContribution * 20) / 100;
        r.operationsAmount = r.protocolContribution - r.vaultAmount - r.liquidityAmount;
    }

    function _recordPurchase(PurchaseContext memory p, SourceContext memory s, RouteContext memory r) internal {
        if (p.firstSeat) {
            knownMember[p.recipient] = true;
            memberCount += 1;
            memberNumberOf[p.recipient] = memberCount;
            memberByNumber[memberCount] = p.recipient;
        }

        soldInEra[p.era] += p.synOut;
        usdcByAddressEra[p.recipient][p.era] += p.grossUsdc;
        grossContributed[p.recipient] += p.grossUsdc;
        totalGrossUsdc += p.grossUsdc;
        totalAcquisitionCost += r.acquisitionCost;
        totalProtocolContribution += r.protocolContribution;
        totalSynSold += p.synOut;

        if (s.active) {
            sourceGrossAttributed[s.sourceId] += p.grossUsdc;
            buyerGrossAttributedToSource[s.sourceId][p.recipient] += p.grossUsdc;
        }
    }

    function _payAcquisition(SourceContext memory s, uint256 amount) internal {
        if (amount == 0) return;
        try this.pushSourcePayout(s.payoutWallet, amount) {}
        catch {
            sourceEscrowOwed[s.sourceId] += amount;
            totalAcquisitionEscrowed += amount;
            emit SourcePayoutEscrowed(s.sourceId, s.payoutWallet, amount);
        }
    }

    function _emitReceipt(PurchaseContext memory p, SourceContext memory s, RouteContext memory r) internal {
        receiptCount += 1;
        bytes32 receiptId = keccak256(abi.encode(block.chainid, address(this), receiptCount));
        emit MembershipPurchasedV3(
            receiptId,
            p.buyer,
            p.recipient,
            p.memberNumber,
            p.grossUsdc,
            r.acquisitionCost,
            r.protocolContribution,
            r.vaultAmount,
            r.liquidityAmount,
            r.operationsAmount,
            p.synOut,
            p.synPerUsdc,
            p.era,
            p.chapter,
            s.sourceId,
            s.sourceClass,
            s.sourceWallet,
            s.commissionBps,
            s.scope,
            s.windowEnds,
            s.sourceGrossRemaining,
            s.buyerGrossRemaining,
            p.firstSeat,
            RECEIPT_VERSION
        );
    }

    function _previewCommissionBps(bytes32 sourceId, address recipient, uint256 grossUsdc, bool firstSeat)
        internal
        view
        returns (uint16)
    {
        if (sourceId == bytes32(0)) {
            if (!_linkedSourceStillOpen(recipient)) return 0;
            sourceId = buyerSourceId[recipient];
        }
        if (sourceId == bytes32(0)) return 0;

        SourceRegistryV1.SourceRecord memory record = SOURCE_REGISTRY.sourceConfig(sourceId);
        if (record.sourceWallet == address(0)) return 0;
        if (record.sourceWallet == recipient) return 0;
        if (
            record.sourceClass == SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION &&
            SYN.balanceOf(record.sourceWallet) == 0
        ) return 0;
        if (!firstSeat && !record.appliesToRepeatPurchases) return 0;

        uint256 projectedSourceGross = sourceGrossAttributed[sourceId] + grossUsdc;
        uint256 projectedBuyerGross = buyerGrossAttributedToSource[sourceId][recipient] + grossUsdc;
        (bool eligible, uint16 bps, address payoutWallet,,, SourceRegistryV1.SourceStatus status) =
            SOURCE_REGISTRY.attributionTerms(sourceId, projectedSourceGross, projectedBuyerGross);
        if (payoutWallet == recipient) return 0;
        return eligible && status == SourceRegistryV1.SourceStatus.ACTIVE ? bps : 0;
    }

    function _membershipState(address recipient) internal view returns (bool firstSeat, uint256 assignedNumber) {
        if (knownMember[recipient]) {
            assignedNumber = memberNumberOf[recipient];
            if (assignedNumber == 0) revert UnknownHistoricalMemberNumber(recipient);
            return (false, assignedNumber);
        }
        return (true, memberCount + 1);
    }

    function _sourceCanApply(bytes32 sourceId, PurchaseContext memory p) internal view returns (bool) {
        if (sourceId == bytes32(0)) return false;
        uint64 expiresAt = buyerSourceExpiresAt[p.recipient];
        if (expiresAt != 0 && block.timestamp > expiresAt) return false;

        SourceRegistryV1.SourceRecord memory record = SOURCE_REGISTRY.sourceConfig(sourceId);
        if (record.sourceWallet == address(0)) return false;
        if (record.sourceWallet == p.buyer || record.sourceWallet == p.recipient) return false;
        if (
            record.sourceClass == SourceRegistryV1.SourceClass.MEMBER_INTRODUCTION &&
            SYN.balanceOf(record.sourceWallet) == 0
        ) return false;
        if (!p.firstSeat && !record.appliesToRepeatPurchases) return false;

        uint256 projectedSourceGross = sourceGrossAttributed[sourceId] + p.grossUsdc;
        uint256 projectedBuyerGross = buyerGrossAttributedToSource[sourceId][p.recipient] + p.grossUsdc;
        (bool eligible,, address payoutWallet,,, SourceRegistryV1.SourceStatus status) =
            SOURCE_REGISTRY.attributionTerms(sourceId, projectedSourceGross, projectedBuyerGross);

        return eligible &&
            status == SourceRegistryV1.SourceStatus.ACTIVE &&
            payoutWallet != p.buyer &&
            payoutWallet != p.recipient;
    }

    function _linkedSourceStillOpen(address recipient) internal view returns (bool) {
        bytes32 sourceId = buyerSourceId[recipient];
        if (sourceId == bytes32(0)) return false;
        uint64 expiresAt = buyerSourceExpiresAt[recipient];
        if (expiresAt != 0 && block.timestamp > expiresAt) return false;
        return true;
    }

    function _remainingAfter(uint256 cap, uint256 projected) internal pure returns (uint256) {
        if (cap == 0) return type(uint256).max;
        return cap > projected ? cap - projected : 0;
    }

    // ===================================================== era engine (state)
    function _syncEra() internal returns (uint16 era, bool concluded) {
        era = activeEra == 0 ? 1 : activeEra;
        while (true) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(era);
            uint256 minEntry = minU * uint256(spu) * SCALE_6_TO_18;
            bool rangeFilled = memberCount >= endSeat;
            bool capExhausted = (eraSynCap[era] - soldInEra[era]) < minEntry;
            if (!rangeFilled && !capExhausted) {
                concluded = false;
                break;
            }
            if (era == 9) {
                concluded = true;
                break;
            }
            uint8 reason = rangeFilled ? REASON_RANGE : REASON_CAP;
            uint256 atSeat = rangeFilled ? endSeat + 1 : memberCount + 1;
            emit EraAdvanced(era, era + 1, atSeat, reason);
            era += 1;
        }
        if (era != activeEra) activeEra = era;
    }

    function _resolveEraView() internal view returns (uint16 era, bool concluded) {
        era = activeEra == 0 ? 1 : activeEra;
        while (true) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(era);
            uint256 minEntry = minU * uint256(spu) * SCALE_6_TO_18;
            bool rangeFilled = memberCount >= endSeat;
            bool capExhausted = (eraSynCap[era] - soldInEra[era]) < minEntry;
            if (!rangeFilled && !capExhausted) return (era, false);
            if (era == 9) return (9, true);
            era += 1;
        }
    }

    // ============================================================ admin
    function pause() external onlyOwner {
        _pause();
        pausedAt = uint64(block.timestamp);
    }

    function unpause() external onlyOwner {
        _unpause();
        pausedAt = 0;
    }

    function recoverUnsoldSyn() external onlyOwner {
        bool concluded = isConcluded();
        if (!concluded) {
            if (!paused()) revert NotWindingDown();
            uint256 readyAt = uint256(pausedAt) + RECOVERY_TIMELOCK;
            if (pausedAt == 0 || block.timestamp < readyAt) revert RecoveryTimelocked(readyAt);
        }
        uint256 bal = SYN.balanceOf(address(this));
        _send(SYN, VAULT, bal);
        emit UnsoldSynRecovered(VAULT, bal);
    }

    function rescueToken(address token) external onlyOwner {
        if (token == address(USDC) || token == address(SYN)) revert ProtectedToken();
        IERC20 t = IERC20(token);
        _send(t, VAULT, t.balanceOf(address(this)));
    }

    // ====================================================== era schedule
    function _eraParams(uint16 era)
        internal
        pure
        returns (uint64 synPerUsdc, uint256 minUsdc6, uint256 endSeat)
    {
        if (era == 1) return (100, 5_000_000, 333);
        if (era == 2) return (50, 10_000_000, 1_000);
        if (era == 3) return (40, 10_000_000, 3_333);
        if (era == 4) return (16, 25_000_000, 10_000);
        if (era == 5) return (12, 25_000_000, 25_000);
        if (era == 6) return (6, 50_000_000, 50_000);
        if (era == 7) return (4, 50_000_000, 100_000);
        if (era == 8) return (2, 100_000_000, 250_000);
        if (era == 9) return (1, 100_000_000, 1_000_000);
        revert SaleConcluded();
    }

    function _minEntrySyn(uint16 era) internal pure returns (uint256) {
        (uint64 spu, uint256 minU,) = _eraParams(era);
        return minU * uint256(spu) * SCALE_6_TO_18;
    }

    function _eraIndexForSeat(uint256 seat) internal pure returns (uint16) {
        for (uint16 e = 1; e <= 9; ++e) {
            (,, uint256 endSeat) = _eraParams(e);
            if (seat <= endSeat) return e;
        }
        revert SaleConcluded();
    }

    function _chapterForMember(uint256 memberNumber) internal pure returns (uint16) {
        if (memberNumber == 0) return 0;
        if (memberNumber <= 333) return 1;
        if (memberNumber <= 1_000) return 2;
        if (memberNumber <= 3_333) return 3;
        if (memberNumber <= 10_000) return 4;
        return 5;
    }

    function _reserveSyn(uint256 m) internal view returns (uint256 reserve) {
        uint256 target = RESERVE_THROUGH_SEAT;
        if (target == 0 || m >= target) return 0;
        uint256 prevEnd = 0;
        for (uint16 e = 1; e <= 9; ++e) {
            (uint64 spu, uint256 minU, uint256 endSeat) = _eraParams(e);
            uint256 segEnd = endSeat < target ? endSeat : target;
            uint256 already = m > prevEnd ? m : prevEnd;
            if (segEnd > already) {
                reserve += (segEnd - already) * (minU * uint256(spu) * SCALE_6_TO_18);
            }
            prevEnd = endSeat;
            if (endSeat >= target) break;
        }
    }

    function _claimHistoricalMembership(address member, uint256 memberNumber, bytes32[] calldata proof) internal {
        if (knownMember[member]) revert AlreadyKnown();
        if (memberNumber == 0 || memberNumber > GENESIS_OFFSET) revert InvalidHistoricalMemberNumber(memberNumber);
        if (!_verifyHistoricalMember(proof, member, memberNumber)) revert InvalidProof();
        if (memberByNumber[memberNumber] != address(0)) revert HistoricalMemberNumberTaken(memberNumber);

        knownMember[member] = true;
        memberNumberOf[member] = memberNumber;
        memberByNumber[memberNumber] = member;
        emit HistoricalMembershipRecognized(member, memberNumber);
        emit V1MembershipRecognized(member);
    }

    function _verifyHistoricalMember(bytes32[] calldata proof, address who, uint256 memberNumber) internal view returns (bool) {
        if (V1_MEMBER_ROOT == bytes32(0)) return false;
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(who, memberNumber))));
        return MerkleProof.verify(proof, V1_MEMBER_ROOT, leaf);
    }

    function _send(IERC20 token, address to, uint256 amount) private {
        if (amount == 0) return;
        token.safeTransfer(to, amount);
    }
}