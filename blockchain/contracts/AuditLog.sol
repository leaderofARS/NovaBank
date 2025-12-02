// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract AuditLog {
    // Event to emit when a transaction is logged
    event TransactionLogged(string indexed transactionId, string transactionHash, uint256 timestamp);

    // Struct to hold record details
    struct Record {
        string transactionHash;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from Transaction ID (e.g., "TXN123") to the Record
    mapping(string => Record) public logs;

    // Function to log a transaction hash
    // transactionId: The ID from your PostgreSQL DB (e.g., "TXN55")
    // transactionHash: The SHA-256 hash of the transaction details
    function logTransaction(string memory transactionId, string memory transactionHash) public {
        require(!logs[transactionId].exists, "Transaction already logged");

        logs[transactionId] = Record({
            transactionHash: transactionHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit TransactionLogged(transactionId, transactionHash, block.timestamp);
    }

    // Function to verify if a hash matches the stored record
    function verifyTransaction(string memory transactionId, string memory providedHash) public view returns (bool) {
        require(logs[transactionId].exists, "Transaction not found");
        
        // Compare stored hash with provided hash
        return keccak256(abi.encodePacked(logs[transactionId].transactionHash)) == keccak256(abi.encodePacked(providedHash));
    }
}
