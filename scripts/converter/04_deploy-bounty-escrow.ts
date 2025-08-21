import { ethers } from "hardhat";
import { BountyEscrow } from "../../typechain-types";

async function main() {
  console.log("🚀 Deploying BountyEscrow contract...");

  // Get the contract factory
  const BountyEscrowFactory = await ethers.getContractFactory("BountyEscrow");

  // Get the EncryptedERC contract address from environment or previous deployment
  const encryptedERCAddress = process.env.ENCRYPTED_ERC_ADDRESS;
  
  if (!encryptedERCAddress) {
    throw new Error("ENCRYPTED_ERC_ADDRESS environment variable is required");
  }

  console.log(`📝 Using EncryptedERC address: ${encryptedERCAddress}`);

  // Deploy the contract
  const bountyEscrow = await BountyEscrowFactory.deploy(encryptedERCAddress);
  await bountyEscrow.waitForDeployment();

  const bountyEscrowAddress = await bountyEscrow.getAddress();
  console.log(`✅ BountyEscrow deployed to: ${bountyEscrowAddress}`);

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const bountyCounter = await bountyEscrow.bountyCounter();
  const claimCounter = await bountyEscrow.claimCounter();
  
  console.log(`📊 Initial bounty counter: ${bountyCounter}`);
  console.log(`📊 Initial claim counter: ${claimCounter}`);

  // Save deployment info
  const deploymentInfo = {
    network: "fuji", // or process.env.HARDHAT_NETWORK
    bountyEscrowAddress: bountyEscrowAddress,
    encryptedERCAddress: encryptedERCAddress,
    deployedAt: new Date().toISOString(),
    deployer: await (await ethers.getSigners())[0].getAddress()
  };

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`BountyEscrow: ${deploymentInfo.bountyEscrowAddress}`);
  console.log(`EncryptedERC: ${deploymentInfo.encryptedERCAddress}`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  console.log(`Deployed: ${deploymentInfo.deployedAt}`);

  console.log("\n🔧 Next Steps:");
  console.log("1. Update your .env files with the new contract address:");
  console.log(`   NEXT_PUBLIC_BOUNTY_ESCROW_ADDRESS=${bountyEscrowAddress}`);
  console.log("2. Update your frontend configuration");
  console.log("3. Test the bounty creation and claim submission flows");

  return {
    bountyEscrow: bountyEscrow as BountyEscrow,
    address: bountyEscrowAddress,
    deploymentInfo
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
