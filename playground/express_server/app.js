import express from 'express';
import Redis from 'ioredis';
import { createHash, randomInt } from 'crypto';
import { timeStamp } from 'console';
const app = express();
const port = 3001;
const redis = new Redis({
  host: 'redis',
  port: 6379,
});


//expire time in sec
const expireTime=20

function hash_sha256(string) {
  return createHash('sha256').update(string).digest('hex');
}

async function updateUserList(req){
  const returnObj = {};
  returnObj["remoteAddress"] = req.socket.remoteAddress;
  returnObj["remoteAddressHash"] = hash_sha256(req.socket.remoteAddress);
  returnObj["x-forwarded-for"] = req.headers['x-forwarded-for'] ;

  //res.send('ip: '+JSON.stringify(returnObj))

  //convert to unix time
  const curTime = Math.floor((new Date().getTime() )/1000)
  const newExpireTime = curTime + expireTime

  //maybe async good here bc it will run it on a different thread
  let val = await redis.get("checked")
  if(val == null){
    redis.hdel("activeUserTable",await redis.zrangebyscore("activeUserList",0,curTime))
    await redis.zremrangebyscore("activeUserList",0,curTime)

    redis.set("checked",1)
    redis.expire("checked",expireTime)
  }

  redis.zadd("activeUserList",newExpireTime,returnObj["remoteAddressHash"])
  redis.hset("activeUserTable",returnObj["remoteAddressHash"],newExpireTime)

  redis.zadd("activeUserList",newExpireTime,newExpireTime)
  redis.hset("activeUserTable",newExpireTime,newExpireTime)
}


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

app.get("/updateCount",async (req,res)=>{
  try{
    await updateUserList(req);
    res.send("good update")
  } catch (error){
    console.error(error)
  }
})

app.get("/activeCount",async (req,res)=>{
  try {
    await updateUserList(req);
    let userCount = await redis.zcount("activeUserList","-inf", "+inf")
    //must send string "" usage
    res.send(""+userCount)
  } catch (error){
    console.error(error)
    res.status(500).send("Offline")
  }
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
