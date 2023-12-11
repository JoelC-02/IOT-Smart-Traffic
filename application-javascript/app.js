/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = process.env.CHANNEL_NAME || 'mychannel';
const chaincodeName = process.env.CHAINCODE_NAME || 'basic';

const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'javascriptAppUser';

const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://jc952072:QgeODFlQO4Pndbw4@cluster0.3l5isbk.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);
 
 // Reference the database to use
 const dbName = "IOT_Traffic";
 
 function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}
                      
 async function run(doc) {
    try {
        // Connect to the Atlas cluster
         await client.connect();
         const db = client.db(dbName);

         // Reference the "data" collection in the specified database
         const col = db.collection("data");

         // Insert the document into the specified collection      
         const p = await col.insertOne(doc);
         console.log("Pushed to MongoDB\n");

        } catch (err) {
         console.log(err.stack);
     }
 
     finally {
        await client.close();
    }
}


async function submitData(id, loc, type, vis, cnt, contract)
{
	console.log('\n--> Submit Transaction');
	let result = await contract.submitTransaction('CreateAsset', id, loc, type, vis, cnt);
	console.log('*** Result: committed');
	if (`${result}` !== '') {
		console.log(`*** Result: ${prettyJSONString(result.toString())}`);
		run(JSON.parse(result.toString()));
	}
}
async function main()
{
	try {
		const ccp = buildCCPOrg1();


		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');


		const wallet = await buildWallet(Wallets, walletPath);


		await enrollAdmin(caClient, wallet, mspOrg1);


		await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');


		const gateway = new Gateway();

		try {

			await gateway.connect(ccp, {
				wallet,
				identity: org1UserId,
				discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
			});

			const network = await gateway.getNetwork(channelName);


			const contract = network.getContract(chaincodeName);


			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');

			let dgram = require("dgram");
			const port =7878;
			let host = "aaaa::1";
			let updServer = dgram.createSocket("udp6").bind(port, host);
			let counter = 1
			updServer.on("message", async (msg, sender) => {
			console.log(`SENDER:${sender.address}:${sender.port} | MSG:${msg}`);
			const tokens = msg.toString().split(" ");
			let id = "asset" + counter;
			counter++;
			try{
				submitData(id, tokens[0], tokens[1], tokens[2], tokens[3], contract);
			}
			catch (error) {
				console.error(`******** FAILED to run the application: ${error}`);
				process.exit(1);
			}
			});

			updServer.on("listening", () => {
			console.log(
				"Listening on ",
				updServer.address().address,
				updServer.address().port
			);
			});

			updServer.on("error", (err) => {
			console.log(err);
			});


			console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');
			let result = await contract.evaluateTransaction('GetAllAssets');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
		} finally {
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
		process.exit(1);
	}
}
main()


function getCurrentTimeAsString() {
const now = new Date();
const days = String(now.getDate() - 1).padStart(2, '0'); // Subtract 1 to get the day part (0-indexed)
const hours = String(now.getUTCHours()).padStart(2, '0');
const minutes = String(now.getUTCMinutes()).padStart(2, '0');
const seconds = String(now.getUTCSeconds()).padStart(2, '0');

return `${days}:${hours}:${minutes}:${seconds}`;
}


