'use strict';
const AWS = require('aws-sdk'); 

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.getOne = (event, ctx, cb) => {
    const params = {
        TableName: process.env.CANDIDATE_TABLE,
        Key: {
          id: event.pathParameters.id,
        },
      };
    
      dynamoDb.get(params).promise()
        .then(result => {
          const response = {
            statusCode: 200,
            body: JSON.stringify(result.Item),
          };
          cb(null, response);
        })
        .catch(error => {
          console.error(error);
          cb(new Error('Couldn\'t fetch candidate.'));
          return;
        });
}

module.exports.list = (event, context, callback) => {
    var params = {
        TableName: process.env.CANDIDATE_TABLE,
        ProjectionExpression: "id, fullname, email"
    };

    console.log("Scanning Candidate table.");

    const onScan = (err, data) => {

        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    candidates: data.Items
                })
            });
        }

    };

    dynamoDb.scan(params, onScan);
}