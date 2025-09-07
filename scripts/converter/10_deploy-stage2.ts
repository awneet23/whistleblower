import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const main = async () => {
    console.log("🚀 Starting Stage 2 Deployment - Complete EncryptedERC Integration");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Read existing deployment data
    const deploymentPath = path.join(__dirname, "../../deployments/converter/latest-converter.json");
    let deploymentData: any = {};
    
    if (fs.existsSync(deploymentPath)) {
        deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
        console.log("✅ Found existing EncryptedERC deployment");
    } else {
        console.log("❌ No existing EncryptedERC deployment found. Please run deployment scripts first:");
        console.log("1. npx hardhat run scripts/converter/01_deploy-basics.ts --network fuji");
        console.log("2. npx hardhat run scripts/converter/02_deploy-converter.ts --network fuji");
        return;
    }

    const { contracts } = deploymentData;
    
    // Deploy enhanced BountyEscrow with ZK proof support
    console.log("\n📋 Deploying Enhanced BountyEscrow Contract...");
    const BountyEscrow = await ethers.getContractFactory("BountyEscrow");
    const bountyEscrow = await BountyEscrow.deploy(contracts.encryptedERC);
    await bountyEscrow.waitForDeployment();
    
    const bountyEscrowAddress = await bountyEscrow.getAddress();
    console.log("✅ Enhanced BountyEscrow deployed to:", bountyEscrowAddress);

    // Update deployment data
    const updatedDeploymentData = {
        ...deploymentData,
        contracts: {
            ...contracts,
            bountyEscrow: bountyEscrowAddress
        },
        stage2: {
            deployedAt: new Date().toISOString(),
            features: [
                "ZK proof-based transfers in BountyEscrow",
                "Complete converter functionality integration",
                "Multi-token support (USDC, LINK, DAI, TEST)",
                "Encrypted balance management with 100x faster decryption",
                "Vercel KV database integration",
                "Frontend API routes for all EncryptedERC operations"
            ]
        }
    };

    // Save updated deployment data
    fs.writeFileSync(deploymentPath, JSON.stringify(updatedDeploymentData, null, 2));
    
    // Create timestamped backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, `../../deployments/converter/stage2-${timestamp}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(updatedDeploymentData, null, 2));

    console.log("\n🎉 Stage 2 Deployment Complete!");
    console.log("📁 Deployment data saved to:", deploymentPath);
    console.log("📁 Backup saved to:", backupPath);
    
    console.log("\n📋 Deployed Contracts:");
    console.log("- EncryptedERC:", contracts.encryptedERC);
    console.log("- Registrar:", contracts.registrar);
    console.log("- Enhanced BountyEscrow:", bountyEscrowAddress);
    console.log("- Test ERC20:", contracts.testERC20);
    
    console.log("\n🔧 Next Steps:");
    console.log("1. Register users: WALLET_NUMBER=1,2 npx hardhat run scripts/converter/03_register-user.ts --network fuji");
    console.log("2. Set auditor: npx hardhat run scripts/converter/04_set-auditor.ts --network fuji");
    console.log("3. Test deposit: npx hardhat run scripts/converter/06_deposit.ts --network fuji");
    console.log("4. Test transfer: npx hardhat run scripts/converter/07_transfer.ts --network fuji");
    console.log("5. Test withdrawal: npx hardhat run scripts/converter/09_withdraw.ts --network fuji");
    console.log("6. Deploy frontend with updated contract addresses");
    
    console.log("\n🌐 Frontend Integration:");
    console.log("- Update NEXT_PUBLIC_ENCRYPTED_ERC_ADDRESS in .env.local");
    console.log("- Update NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS in .env.local");
    console.log("- Deploy to Vercel with KV database configured");
    
    console.log("\n✨ Stage 2 Features Implemented:");
    console.log("✅ ZK proof-based transfers (no more administrative transfers)");
    console.log("✅ Complete converter mode integration");
    console.log("✅ Multi-token support (USDC, LINK, DAI, TEST)");
    console.log("✅ Encrypted balance management with optimized decryption");
    console.log("✅ Frontend API routes for all operations");
    console.log("✅ Vercel KV database schema extended");
    console.log("✅ Deposit/withdraw interfaces implemented");
    console.log("✅ Real-time balance checking with privacy preservation");
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
