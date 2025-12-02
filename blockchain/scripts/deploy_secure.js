const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying SecureAuditLog contract...");

    const SecureAuditLog = await hre.ethers.getContractFactory("SecureAuditLog");
    const secureAuditLog = await SecureAuditLog.deploy();

    await secureAuditLog.waitForDeployment();

    const address = await secureAuditLog.getAddress();

    console.log(`SecureAuditLog deployed to: ${address}`);

    // Save the address and ABI to a file so the backend can use it
    const artifact = await hre.artifacts.readArtifact("SecureAuditLog");
    const contractData = {
        address: address,
        abi: artifact.abi
    };

    const outputPath = path.join(__dirname, "..", "deployed_secure_contract.json");
    fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));
    console.log(`Contract data saved to ${outputPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
