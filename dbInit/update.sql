ALTER TABLE userList 
ADD last_hashedLoginIp varchar(64);

ALTER TABLE messageList
ADD hashed_ip varchar(64);

CREATE TABLE bannedIps(
    hashed_ip varchar(64),
    reason varchar(400),
    startTime timeStamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expireTime timeStamp
);