const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying AuditLog contract...");

    const AuditLog = await hre.ethers.getContractFactory("AuditLog");
    const auditLog = await AuditLog.deploy();

    await auditLog.waitForDeployment();

    const address = await auditLog.getAddress();

    console.log(`AuditLog deployed to: ${address}`);

    // Save the address and ABI to a file so the backend can use it
    const artifact = await hre.artifacts.readArtifact("AuditLog");
    const contractData = {
        address: address,
        abi: artifact.abi
    };

    const outputPath = path.join(__dirname, "..", "deployed_contract.json");
    fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));
    console.log(`Contract data saved to ${outputPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
