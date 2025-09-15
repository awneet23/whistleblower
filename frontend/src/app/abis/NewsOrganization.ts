export const MainContractABI = [
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
				"internalType": "address",
				"name": "submitter",
				"type": "address"
			}
		],
		"name": "FullDescriptionSubmitted",
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
				"name": "newsOrganizationId",
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
				"internalType": "uint256",
				"name": "newsOrganizationId",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newsOrganizationId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			}
		],
		"name": "getAcceptedBountySubmission",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "ownerAddress",
						"type": "address"
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
					}
				],
				"internalType": "struct MainContract.BountySubmission",
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
				"internalType": "uint256",
				"name": "newsOrganizationId",
				"type": "uint256"
			}
		],
		"name": "getAllBounties",
		"outputs": [
			{
				"components": [
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
						"components": [
							{
								"internalType": "address",
								"name": "ownerAddress",
								"type": "address"
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
							}
						],
						"internalType": "struct MainContract.BountySubmission[]",
						"name": "bountySubmissions",
						"type": "tuple[]"
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
				"internalType": "struct MainContract.Bounty[]",
				"name": "",
				"type": "tuple[]"
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
								"components": [
									{
										"internalType": "address",
										"name": "ownerAddress",
										"type": "address"
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
									}
								],
								"internalType": "struct MainContract.BountySubmission[]",
								"name": "bountySubmissions",
								"type": "tuple[]"
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
						"internalType": "struct MainContract.Bounty[]",
						"name": "bountyList",
						"type": "tuple[]"
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
				"name": "newsOrganizationId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			}
		],
		"name": "getBounty",
		"outputs": [
			{
				"components": [
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
						"components": [
							{
								"internalType": "address",
								"name": "ownerAddress",
								"type": "address"
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
							}
						],
						"internalType": "struct MainContract.BountySubmission[]",
						"name": "bountySubmissions",
						"type": "tuple[]"
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
				"internalType": "struct MainContract.Bounty",
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
				"internalType": "uint256",
				"name": "newsOrganizationId",
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
			}
		],
		"name": "getBountySubmission",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "ownerAddress",
						"type": "address"
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
					}
				],
				"internalType": "struct MainContract.BountySubmission",
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
				"internalType": "uint256",
				"name": "newsOrganizationId",
				"type": "uint256"
			}
		],
		"name": "getNewsOrganization",
		"outputs": [
			{
				"components": [
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
								"components": [
									{
										"internalType": "address",
										"name": "ownerAddress",
										"type": "address"
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
									}
								],
								"internalType": "struct MainContract.BountySubmission[]",
								"name": "bountySubmissions",
								"type": "tuple[]"
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
						"internalType": "struct MainContract.Bounty[]",
						"name": "bountyList",
						"type": "tuple[]"
					}
				],
				"internalType": "struct MainContract.NewsOrganization",
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
				"internalType": "uint256",
				"name": "newsOrganizationId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			}
		],
		"name": "listBountySubmissions",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "ownerAddress",
						"type": "address"
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
		"name": "newsOrganizations",
		"outputs": [
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newsOrganizationId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
			}
		],
		"name": "releasePayment",
		"outputs": [],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newsOrganizationId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bountyId",
				"type": "uint256"
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
				"name": "newsOrganizationId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bountyId",
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
	}
];
