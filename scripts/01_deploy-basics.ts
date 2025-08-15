import { ethers } from "hardhat";
import { deployLibrary, deployVerifiers } from "../test/helpers";
import { DECIMALS } from "./constants";
import * as fs from "fs";
import * as path from "path";

const main = async () => {
	// get deployer
	const [deployer] = await ethers.getSigners();

	// deploy verifiers
	// if true, deploys verifiers for prod, generated with proper trusted setup
	const {
		registrationVerifier,
		mintVerifier,
		withdrawVerifier,
		transferVerifier,
		burnVerifier,
	} = await deployVerifiers(deployer);

	// deploy babyjub library
	const babyJubJub = await deployLibrary(deployer);

	// also deploys new erc20
	const erc20Factory = await ethers.getContractFactory("SimpleERC20");
	const erc20 = await erc20Factory.deploy("Test", "TEST", 18);
	await erc20.waitForDeployment();

	// mints some amount to deployer as well
	const tx = await erc20.mint(deployer.address, ethers.parseEther("10000"));
	await tx.wait();

	console.log("ERC20 deployed at:", erc20.target);
	console.log("Minted 10000 erc20 to deployer");

	// Create deployment data object
	const deploymentData = {
		network: "fuji",
		deployer: deployer.address,
		deploymentTimestamp: new Date().toISOString(),
		contracts: {
			registrationVerifier: registrationVerifier,
			mintVerifier: mintVerifier,
			withdrawVerifier: withdrawVerifier,
			transferVerifier: transferVerifier,
			burnVerifier: burnVerifier,
			babyJubJub: babyJubJub,
			registrar: "",
			encryptedERC: "",
			testERC20: erc20.target,
		},
		metadata: {
			isConverter: true,
			decimals: DECIMALS,
			testTokensMinted: "10000",
			erc20Name: "USDAvax",
			erc20Symbol: "USDAVAX",
		}
	};

	// Display in console
	console.table({
		registrationVerifier,
		mintVerifier,
		withdrawVerifier,
		transferVerifier,
		babyJubJub,
		testERC20: erc20.target,
	});

	// Save to JSON file
	const outputDir = path.join(__dirname, "../deployments");
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const fileName = `deployment-fuji-${Date.now()}.json`;
	const filePath = path.join(outputDir, fileName);
	
	fs.writeFileSync(filePath, JSON.stringify(deploymentData, null, 2));
	
	console.log("\n📁 Deployment data saved to:", filePath);
	console.log("🔗 You can import this file in your frontend like:");
	console.log(`   import deploymentData from './deployments/${fileName}';`);
	
	// Also create a latest.json file for easy access
	const latestFilePath = path.join(outputDir, "latest-fuji.json");
	fs.writeFileSync(latestFilePath, JSON.stringify(deploymentData, null, 2));
	console.log("📄 Latest deployment also saved to: deployments/latest-fuji.json");
};

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
