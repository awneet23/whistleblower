// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interface to the EncryptedERC contract
interface IEncryptedERC {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title BountyEscrow
 * @notice A trustless escrow system for bounties where news organizations can post bounties
 * and whistleblowers can submit claims. Funds are locked in escrow until approved.
 */
contract BountyEscrow is ReentrancyGuard {
    // State Variables
    IEncryptedERC private encryptedToken;
    uint256 public bountyCounter;
    uint256 public claimCounter;

    struct Bounty {
        uint256 id;
        string title;
        address organization;
        address rewardTokenContract; // The public ERC20 token (e.g., USDC address)
        uint256 rewardAmount;
        bool isOpen;
        uint256 createdAt;
    }

    struct Claim {
        uint256 id;
        uint256 bountyId;
        address whistleblower; // The anonymous sender
        string teaser;
        string encryptedDataCid; // The IPFS link
        uint8 status; // 0: Pending, 1: Approved, 2: Rejected
        uint256 submittedAt;
    }

    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public organizationBounties;
    mapping(uint256 => uint256[]) public bountyClaims;

    // Events
    event BountyCreated(uint256 indexed id, address indexed organization, uint256 amount, string title);
    event ClaimSubmitted(uint256 indexed id, uint256 indexed bountyId, address indexed whistleblower, string teaser);
    event RewardReleased(uint256 indexed claimId, address indexed whistleblower, uint256 amount);
    event ClaimRejected(uint256 indexed claimId);

    // Constructor
    constructor(address _encryptedTokenAddress) {
        require(_encryptedTokenAddress != address(0), "Invalid token address");
        encryptedToken = IEncryptedERC(_encryptedTokenAddress);
    }

    // --- Functions ---

    /**
     * @notice Creates a new bounty and locks funds in escrow
     * @param _title The title/description of the bounty
     * @param _rewardTokenContract The ERC20 token contract for rewards (for display purposes)
     * @param _rewardAmount The amount of encrypted tokens to lock as reward
     */
    function createBounty(
        string memory _title, 
        address _rewardTokenContract, 
        uint256 _rewardAmount
    ) external nonReentrant {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_rewardAmount > 0, "Reward amount must be greater than 0");
        
        // Pull the locked funds from the organization and hold them within this contract
        bool success = encryptedToken.transferFrom(msg.sender, address(this), _rewardAmount);
        require(success, "Token transfer for bounty failed");

        bountyCounter++;
        bounties[bountyCounter] = Bounty({
            id: bountyCounter,
            title: _title,
            organization: msg.sender,
            rewardTokenContract: _rewardTokenContract,
            rewardAmount: _rewardAmount,
            isOpen: true,
            createdAt: block.timestamp
        });

        organizationBounties[msg.sender].push(bountyCounter);

        emit BountyCreated(bountyCounter, msg.sender, _rewardAmount, _title);
    }

    /**
     * @notice Submits a claim for a bounty
     * @param _bountyId The ID of the bounty to claim
     * @param _teaser A public teaser of the information
     * @param _encryptedDataCid The IPFS CID of the encrypted full information
     */
    function submitClaim(
        uint256 _bountyId, 
        string memory _teaser, 
        string memory _encryptedDataCid
    ) external {
        require(_bountyId > 0 && _bountyId <= bountyCounter, "Invalid bounty ID");
        require(bounties[_bountyId].isOpen, "Bounty is not open");
        require(bytes(_teaser).length > 0, "Teaser cannot be empty");
        require(bytes(_encryptedDataCid).length > 0, "Encrypted data CID cannot be empty");
        
        claimCounter++;
        claims[claimCounter] = Claim({
            id: claimCounter,
            bountyId: _bountyId,
            whistleblower: msg.sender,
            teaser: _teaser,
            encryptedDataCid: _encryptedDataCid,
            status: 0, // Pending
            submittedAt: block.timestamp
        });

        bountyClaims[_bountyId].push(claimCounter);

        emit ClaimSubmitted(claimCounter, _bountyId, msg.sender, _teaser);
    }

    /**
     * @notice Releases the reward to the whistleblower (only by bounty creator)
     * @param _claimId The ID of the claim to approve and pay
     */
    function releaseReward(uint256 _claimId) external nonReentrant {
        require(_claimId > 0 && _claimId <= claimCounter, "Invalid claim ID");
        
        Claim storage claim = claims[_claimId];
        Bounty storage bounty = bounties[claim.bountyId];

        require(msg.sender == bounty.organization, "Only the bounty creator can release funds");
        require(claim.status == 0, "Claim is not pending");
        require(bounty.isOpen, "Bounty is closed");

        claim.status = 1; // Mark as Approved
        bounty.isOpen = false; // Close the bounty after one successful claim

        // Transfer the reward from this contract to the anonymous whistleblower
        bool success = encryptedToken.transfer(claim.whistleblower, bounty.rewardAmount);
        require(success, "Reward transfer failed");

        emit RewardReleased(_claimId, claim.whistleblower, bounty.rewardAmount);
    }

    /**
     * @notice Rejects a claim (only by bounty creator)
     * @param _claimId The ID of the claim to reject
     */
    function rejectClaim(uint256 _claimId) external {
        require(_claimId > 0 && _claimId <= claimCounter, "Invalid claim ID");
        
        Claim storage claim = claims[_claimId];
        Bounty storage bounty = bounties[claim.bountyId];

        require(msg.sender == bounty.organization, "Only the bounty creator can reject claims");
        require(claim.status == 0, "Claim is not pending");

        claim.status = 2; // Mark as Rejected

        emit ClaimRejected(_claimId);
    }

    // --- View Functions for Frontend ---

    /**
     * @notice Gets all open bounties
     * @return Array of open bounty IDs
     */
    function getOpenBounties() external view returns (uint256[] memory) {
        uint256[] memory openBounties = new uint256[](bountyCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= bountyCounter; i++) {
            if (bounties[i].isOpen) {
                openBounties[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = openBounties[i];
        }
        
        return result;
    }

    /**
     * @notice Gets bounties created by a specific organization
     * @param _organization The address of the organization
     * @return Array of bounty IDs
     */
    function getBountiesByOrganization(address _organization) external view returns (uint256[] memory) {
        return organizationBounties[_organization];
    }

    /**
     * @notice Gets claims for a specific bounty
     * @param _bountyId The ID of the bounty
     * @return Array of claim IDs
     */
    function getClaimsByBounty(uint256 _bountyId) external view returns (uint256[] memory) {
        return bountyClaims[_bountyId];
    }

    /**
     * @notice Gets bounty details
     * @param _bountyId The ID of the bounty
     * @return Bounty struct
     */
    function getBounty(uint256 _bountyId) external view returns (Bounty memory) {
        require(_bountyId > 0 && _bountyId <= bountyCounter, "Invalid bounty ID");
        return bounties[_bountyId];
    }

    /**
     * @notice Gets claim details
     * @param _claimId The ID of the claim
     * @return Claim struct
     */
    function getClaim(uint256 _claimId) external view returns (Claim memory) {
        require(_claimId > 0 && _claimId <= claimCounter, "Invalid claim ID");
        return claims[_claimId];
    }

    /**
     * @notice Gets multiple bounties at once
     * @param _bountyIds Array of bounty IDs
     * @return Array of Bounty structs
     */
    function getBounties(uint256[] memory _bountyIds) external view returns (Bounty[] memory) {
        Bounty[] memory result = new Bounty[](_bountyIds.length);
        for (uint256 i = 0; i < _bountyIds.length; i++) {
            if (_bountyIds[i] > 0 && _bountyIds[i] <= bountyCounter) {
                result[i] = bounties[_bountyIds[i]];
            }
        }
        return result;
    }

    /**
     * @notice Gets multiple claims at once
     * @param _claimIds Array of claim IDs
     * @return Array of Claim structs
     */
    function getClaims(uint256[] memory _claimIds) external view returns (Claim[] memory) {
        Claim[] memory result = new Claim[](_claimIds.length);
        for (uint256 i = 0; i < _claimIds.length; i++) {
            if (_claimIds[i] > 0 && _claimIds[i] <= claimCounter) {
                result[i] = claims[_claimIds[i]];
            }
        }
        return result;
    }
}
