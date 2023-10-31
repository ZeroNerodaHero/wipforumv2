import express from 'express';
import Redis from 'ioredis';
import { createHash } from 'crypto';
const app = express();
const port = 3001;

function hash_sha256(string) {
  return createHash('sha256').update(string).digest('hex');
}

//redis is set up with the following schema:
// sort_timestamp => {"timestamp" . "hashId"}
// activeUser(sorted btw) => {hashId => timestamp}
// on insert(search in activeUser if exists). if exists update old timestamp by removing it and reinserting it
// on timeout(remove from both tiemstamp and insert)


const redis = new Redis({
  host: 'express',
  port: 6379,
});

app.get('/', (req, res) => {
  // Set the value in Redis
  redis.set('myKey', 'Hello, Redis!')
    .then(() => {
      // Example: Get the value
      return redis.get('myKey');
    })
    .then((value) => {
      res.send('Value: ' + value); // Send the response once you have the value
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error retrieving data from Redis');
    });
});

app.get("/updateCount",(req,res)=>{
  const returnObj = {};
  returnObj["remoteAddress"] = req.socket.remoteAddress;
  returnObj["remoteAddressHash"] = hash_sha256(req.socket.remoteAddress);
  returnObj["x-forwarded-for"] = req.headers['x-forwarded-for'] ;
  returnObj["reqIp"] = req.ip
  returnObj["reqIps"] = req.ips

  res.send('ip: '+JSON.stringify(returnObj))
})

app.get("/activeCount",(req,res)=>{
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
