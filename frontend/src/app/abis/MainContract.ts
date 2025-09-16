export const MainContractAddress = '0x5b76c0E78281001C2809A6bc6A98180A7ADc30b4'
export const MainContractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "submissionId",
				"type": "uint256"
			}
		],
		"name": "acceptBountySubmission",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "bountyToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "escrowAccount",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "publicKey",
				"type": "string"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "topic",
				"type": "string"
			}
		],
		"name": "BountyCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "topic",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "bountyAmount",
				"type": "uint256"
			}
		],
		"name": "createBounty",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "encryptedWalletAddress",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyAmount",
				"type": "uint256"
			}
		],
		"name": "FullDescriptionSubmitted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "pubKey",
				"type": "string"
			}
		],
		"name": "registerNewsOrganization",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "submissionId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "acceptedBy",
				"type": "address"
			}
		],
		"name": "SubmissionAccepted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "submissionId",
				"type": "uint256"
			}
		],
		"name": "SubmissionReceived",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "ownerEncryptedWalletAddress",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "encryptedTeaser",
				"type": "string"
			}
		],
		"name": "submitBounty",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "submissionId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "encryptedFullDescription",
				"type": "string"
			}
		],
		"name": "submitFullDescription",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "BOUNTY_TOKEN",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "bountyCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "BountyMap",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "newsOrgId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "topic",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "bountyAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "acceptedSubmissionId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "hasAcceptedSubmission",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "bountySubmissionCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "BountySubmissionMap",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "newsOrgId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "submissionId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "ownerAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "ownerEncryptedWalletAddress",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "encryptedTeaser",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "encryptedFullDescription",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isAccepted",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ESCROW_ACCOUNT",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllBountiesFromAllOrganizations",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "newsOrganizationId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "newsOrganizationPublicKey",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "bountyId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "orgName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "topic",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "bountyAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "submissionCount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "hasAcceptedSubmission",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "acceptedSubmissionId",
						"type": "uint256"
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "newsOrgId",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "bountyId",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "submissionId",
								"type": "uint256"
							},
							{
								"internalType": "address",
								"name": "ownerAddress",
								"type": "address"
							},
							{
								"internalType": "string",
								"name": "ownerEncryptedWalletAddress",
								"type": "string"
							},
							{
								"internalType": "string",
								"name": "encryptedTeaser",
								"type": "string"
							},
							{
								"internalType": "string",
								"name": "encryptedFullDescription",
								"type": "string"
							},
							{
								"internalType": "bool",
								"name": "isAccepted",
								"type": "bool"
							}
						],
						"internalType": "struct MainContract.BountySubmission",
						"name": "acceptedSubmission",
						"type": "tuple"
					}
				],
				"internalType": "struct MainContract.BountyWithOrgInfo[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllNewsOrganizations",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "newsOrgId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "orgOwner",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "pubKey",
						"type": "string"
					},
					{
						"internalType": "uint256[]",
						"name": "bountyIds",
						"type": "uint256[]"
					}
				],
				"internalType": "struct MainContract.NewsOrganization[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			}
		],
		"name": "getBountyWithOrgInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "newsOrganizationId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "newsOrganizationPublicKey",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "bountyId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "orgName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "topic",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "bountyAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "submissionCount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "hasAcceptedSubmission",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "acceptedSubmissionId",
						"type": "uint256"
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "newsOrgId",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "bountyId",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "submissionId",
								"type": "uint256"
							},
							{
								"internalType": "address",
								"name": "ownerAddress",
								"type": "address"
							},
							{
								"internalType": "string",
								"name": "ownerEncryptedWalletAddress",
								"type": "string"
							},
							{
								"internalType": "string",
								"name": "encryptedTeaser",
								"type": "string"
							},
							{
								"internalType": "string",
								"name": "encryptedFullDescription",
								"type": "string"
							},
							{
								"internalType": "bool",
								"name": "isAccepted",
								"type": "bool"
							}
						],
						"internalType": "struct MainContract.BountySubmission",
						"name": "acceptedSubmission",
						"type": "tuple"
					}
				],
				"internalType": "struct MainContract.BountyWithOrgInfo",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "orgOwner",
				"type": "address"
			}
		],
		"name": "getOrgInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "orgId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "orgOwner",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "pubKey",
						"type": "string"
					},
					{
						"components": [
							{
								"internalType": "uint256",
								"name": "newsOrganizationId",
								"type": "uint256"
							},
							{
								"internalType": "string",
								"name": "newsOrganizationPublicKey",
								"type": "string"
							},
							{
								"internalType": "uint256",
								"name": "bountyId",
								"type": "uint256"
							},
							{
								"internalType": "string",
								"name": "orgName",
								"type": "string"
							},
							{
								"internalType": "string",
								"name": "topic",
								"type": "string"
							},
							{
								"internalType": "string",
								"name": "description",
								"type": "string"
							},
							{
								"internalType": "uint256",
								"name": "bountyAmount",
								"type": "uint256"
							},
							{
								"internalType": "uint256",
								"name": "submissionCount",
								"type": "uint256"
							},
							{
								"internalType": "bool",
								"name": "hasAcceptedSubmission",
								"type": "bool"
							},
							{
								"internalType": "uint256",
								"name": "acceptedSubmissionId",
								"type": "uint256"
							},
							{
								"components": [
									{
										"internalType": "uint256",
										"name": "newsOrgId",
										"type": "uint256"
									},
									{
										"internalType": "uint256",
										"name": "bountyId",
										"type": "uint256"
									},
									{
										"internalType": "uint256",
										"name": "submissionId",
										"type": "uint256"
									},
									{
										"internalType": "address",
										"name": "ownerAddress",
										"type": "address"
									},
									{
										"internalType": "string",
										"name": "ownerEncryptedWalletAddress",
										"type": "string"
									},
									{
										"internalType": "string",
										"name": "encryptedTeaser",
										"type": "string"
									},
									{
										"internalType": "string",
										"name": "encryptedFullDescription",
										"type": "string"
									},
									{
										"internalType": "bool",
										"name": "isAccepted",
										"type": "bool"
									}
								],
								"internalType": "struct MainContract.BountySubmission",
								"name": "acceptedSubmission",
								"type": "tuple"
							}
						],
						"internalType": "struct MainContract.BountyWithOrgInfo[]",
						"name": "bountyList",
						"type": "tuple[]"
					}
				],
				"internalType": "struct MainContract.OrgInfo",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newsReporter",
				"type": "address"
			}
		],
		"name": "getSubmittedBountiesByNewsReporter",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "newsOrgId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "bountyId",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "submissionId",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "ownerAddress",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "ownerEncryptedWalletAddress",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "encryptedTeaser",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "encryptedFullDescription",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "isAccepted",
						"type": "bool"
					}
				],
				"internalType": "struct MainContract.BountySubmission[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "NewsOrganizationMap",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "newsOrgId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "orgOwner",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "pubKey",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "newsOrgCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "NewsReporterToSubmissionIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "OrgOwnerToOrgId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "PUBLIC_KEY",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
