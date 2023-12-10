#IOT Module to find optimal route based on sensor data

##Contiki OS:

1. Open contiki and add rpl-border router from border-router.c
2. Create file udp_traffic.c for generating route, number of vehicles, distance and visibility as sensor data
3. Add 8 sensor nodes from udp_traffic.c in ellipse around border router
4. Listen on serial socket server port 60001 from border router
5. Run sudo ./tunslip6 -a 127.0.0.1 aaaa::1/646. Start simulation

##Hyperledger Fabric:

7. In Hyperledger folder run cd fabric-samples/test-network
8. To close the current network run ./network.sh down9. To create a channel run ./network.sh up createChannel -c mychannel -ca
10. To deploy chaincode run ./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript
11. In Hyperledger folder run cd asset-transfer-basic/application-javascript
12. Create file app.js to store data in blockchain and also push data to MongoDB by specifying the database credentials
13. To start storing data in blockchain run node app.js
14. Blockchain will also push the data to MongoDB database

##Mongo DB:

15. Stored sensor data can be viewed in MongoDB
