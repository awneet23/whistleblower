import { EncryptedERC__factory } from "../../typechain-types";
import * as fs from "fs";
import * as path from "path";
import { getWallet } from "../../src/utils";

const main = async () => {
    // Use the OWNER wallet (deployer)
    const WALLET_NUMBER = 1; 
    const deployer = await getWallet(WALLET_NUMBER);

    // Read deployed EncryptedERC address
    const deploymentPath = path.join(__dirname, "../../deployments/standalone/latest-standalone.json");
    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    const eERCAddress = deploymentData.contracts.encryptedERC;

    // Put your auditor’s Ethereum address here (wallet #2 from your .env)
    const auditorAddress = "0x1327D82E64a57F7080496D87cC566749DdD5FE26";

    const encryptedERC = await EncryptedERC__factory.connect(eERCAddress, deployer);

    try {
        console.log("🔧 Setting auditor for standalone EncryptedERC...");
        console.log("EncryptedERC Address:", eERCAddress);
        console.log("Auditor Address:", auditorAddress);

        const tx = await encryptedERC.setAuditorPublicKey(auditorAddress);
        const receipt = await tx.wait();
        console.log("✅ Auditor successfully configured in block:", receipt?.blockNumber);

        // Read back what’s stored
        const storedAuditor = await encryptedERC.auditor();
        const auditorPublicKey = await encryptedERC.auditorPublicKey();

        console.log("Auditor address:", storedAuditor);
        console.log("Auditor public key X:", auditorPublicKey.x.toString());
        console.log("Auditor public key Y:", auditorPublicKey.y.toString());

        console.log("\n🎯 Standalone System Ready!");
    } catch (error) {
        console.error("❌ Error setting auditor:", error);
    }
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
