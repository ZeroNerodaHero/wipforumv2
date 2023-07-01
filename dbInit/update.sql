ALTER TABLE messageList
ADD userReference BIGINT;

UPDATE messageList
SET userReference=messageOwner;