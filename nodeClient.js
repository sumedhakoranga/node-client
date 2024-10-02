const fs = require('fs');
const net = require('net');

const PORT = 3000;
const HOST = "localhost";
let dataBuffer = Buffer.alloc(0);
let stockPackets = [];
let nextRequireSeq = 1;
let connectionEnded = false;

//req all packets - calltype1

const reqAllPackets=()=>{
  const payLoad = Buffer.alloc(2);
  payLoad.writeUInt8(1,0);
  payLoad.writeUInt8(0,1);
  return payLoad;
}

// req missing packets - calltype2
const reqMissingPacket = (seqNumber)=>{
  const payLoad = Buffer.alloc(2);
  payLoad.writeUInt8(2,0);
  payLoad.writeUInt8(seqNumber,1);
  return payLoad;
}


//parsing the packets

const parsePacket = (packet) => {
  return{
    stockSymbol : packet.slice(0, 4).toString('ascii'),
    BuySellIndeicator : packet.slice(4, 5).toString('ascii'),
    quantity : packet.readInt32BE(5),
    price : packet.readInt32BE(9),
    packetSequence : packet.readInt32BE(13),
  }
}

//processing the data and missed sequence

const processData=(chunk)=>{
  const packetSize = 17;
  dataBuffer = Buffer.concat([dataBuffer, chunk]);

  while(dataBuffer.length >= packetSize){
    const packet = dataBuffer.slice(0, packetSize);
    dataBuffer = dataBuffer.slice(packetSize);
    const parsedPacket = parsePacket(packet);
    stockPackets.push(parsedPacket);

    if (parsedPacket.packetSequence !== nextRequireSeq) {
      console.log("there are few missing sequence");
      return nextRequireSeq;
    }

    nextRequireSeq = parsedPacket.packetSequence + 1;
  }
  return null;
}

//connection

const stockClient = net.createConnection({port: PORT, host: HOST},()=>{
  console.log("connected to the server");
  const reqPayLoad = reqAllPackets();
  stockClient.write(reqPayLoad);
})

// data received

stockClient.on('data', (incomingData)=>{
  const missedSeq = processData(incomingData);

  if (missedSeq !== null) {
    //missing data request - callType2
    const resendRequest = reqMissingPacket(missedSeq);
    stockClient.write(resendRequest);
  } else {
    if (!connectionEnded) {
      console.log("All packets received, now closing the connection.");
      connectionEnded = true;
      stockClient.end();
    }
  }
});

//connection end

stockClient.on('end', ()=>{
  console.log('Disconnected from the server');

  //making json file
  const jsonData = JSON.stringify(stockPackets, null, 2);
  fs.writeFileSync('stockData.json', jsonData);
  console.log("Json file is written : stockData.json");
})

stockClient.on("error", (err) => {
  console.error("Socket error:", err);
});