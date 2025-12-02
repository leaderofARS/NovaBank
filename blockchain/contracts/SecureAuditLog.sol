// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SecureAuditLog
 * @dev Implements RBAC and Hash Chaining for maximum security.
 */
contract SecureAuditLog is AccessControl, Pausable {
    // Define roles
    bytes32 public constant NOTARY_ROLE = keccak256("NOTARY_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    // Event for real-time monitoring
    event TransactionLogged(
        string indexed accountNo,
        string transactionId,
        bytes32 currentHash,
        bytes32 previousHash,
        uint256 timestamp
    );

    event ChainCorrupted(string indexed accountNo, string transactionId);

    struct Record {
        string transactionId;
        bytes32 transactionHash;
        uint256 timestamp;
        bytes32 previousHash; // Links to the previous record
    }

    // Mapping: Account Number -> List of Records (History)
    // We can traverse this to rebuild the entire history of an account
    mapping(string => Record[]) public accountHistory;

    // Mapping: Account Number -> Last known Hash (Head of the chain)
    mapping(string => bytes32) public lastAccountHash;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(NOTARY_ROLE, msg.sender); // Initially, deployer is also a notary
    }

    /**
     * @dev Logs a transaction with cryptographic chaining.
     * @param accountNo The bank account number involved.
     * @param transactionId The unique ID from PostgreSQL.
     * @param rawDataHash The SHA-256 hash of the raw transaction data (amount, type, etc).
     */
    function logTransaction(
        string memory accountNo,
        string memory transactionId,
        bytes32 rawDataHash
    ) public onlyRole(NOTARY_ROLE) whenNotPaused {
        // 1. Retrieve the previous hash for this account (Genesis hash is 0x0)
        bytes32 prevHash = lastAccountHash[accountNo];

        // 2. Create the NEW chained hash: Hash(RawData + PreviousHash)
        // This binds this transaction irrevocably to the entire history before it.
        bytes32 finalHash = keccak256(abi.encodePacked(rawDataHash, prevHash));

        // 3. Store the record
        accountHistory[accountNo].push(
            Record({
                transactionId: transactionId,
                transactionHash: finalHash,
                timestamp: block.timestamp,
                previousHash: prevHash
            })
        );

        // 4. Update the head of the chain
        lastAccountHash[accountNo] = finalHash;

        emit TransactionLogged(
            accountNo,
            transactionId,
            finalHash,
            prevHash,
            block.timestamp
        );
    }

    /**
     * @dev Verifies if a specific transaction is valid within the chain.
     * Re-calculates the hash based on inputs and checks against storage.
     */
    function verifyChainIntegrity(
        string memory accountNo,
        uint256 index,
        bytes32 rawDataHash
    ) public view returns (bool, string memory) {
        if (index >= accountHistory[accountNo].length)
            return (false, "Index out of bounds");

        Record memory record = accountHistory[accountNo][index];

        // Re-compute what the hash SHOULD be
        bytes32 expectedHash = keccak256(
            abi.encodePacked(rawDataHash, record.previousHash)
        );

        if (expectedHash == record.transactionHash) {
            return (true, "Valid");
        } else {
            return (false, "Tampered");
        }
    }

    /**
     * @dev Returns the number of transactions logged for an account.
     */
    function getTransactionCount(
        string memory accountNo
    ) public view returns (uint256) {
        return accountHistory[accountNo].length;
    }

    // --- Admin Functions ---

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function grantNotary(address notary) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(NOTARY_ROLE, notary);
    }

    function revokeNotary(address notary) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(NOTARY_ROLE, notary);
    }
}
