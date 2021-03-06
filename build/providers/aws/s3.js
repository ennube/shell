"use strict";
var common_1 = require('./common');
var _ = require('lodash');
var ProgressBar = require('progress');
var chalk = require('chalk');
var aws = require('aws-sdk');
var s3 = require('s3');
// Returns a { [bucketName]: Date  relation of buckets }
function listBuckets() {
    var s3 = new aws.S3();
    return common_1.send(function () { return s3.listBuckets(); })
        .then(function (result) { return _.fromPairs(result.Buckets.map(function (item) { return [item.Name, {
            creationDate: item.CreationDate,
            ownerId: result.Owner.ID,
            ownerName: result.Owner.DisplayName
        }]; })); });
}
exports.listBuckets = listBuckets;
;
/*
headBucket(params = {}, callback) ⇒ AWS.Request
This operation is useful to determine if a bucket exists and you have permission to access it.
*/
function syncBucket(params) {
    return new Promise(function (resolve, reject) {
        console.log(("Syncinc " + params.sourceDirectory + " \u2190\u2192") +
            ("s3://" + params.bucketName + "/" + params.destinationDirectory));
        var awsS3Client = new aws.S3();
        var s3Client = s3.createClient({ s3Client: awsS3Client });
        var sync = function () {
            var progressBar = undefined;
            var lastAmount = 0;
            var task = s3Client.uploadDir({
                localDir: params.sourceDirectory,
                s3Params: {
                    Bucket: params.bucketName,
                    Prefix: params.destinationDirectory ?
                        params.destinationDirectory + "/" : ''
                },
            })
                .on('progress', function () {
                if (task == undefined || task.progressTotal == 0)
                    return;
                if (progressBar === undefined)
                    progressBar = new ProgressBar('[:bar] :percent :etas', {
                        incomplete: chalk.grey('\u2588'),
                        complete: chalk.white('\u2588'),
                        total: task.progressTotal,
                        width: process.stdout['columns'] | 40,
                    });
                progressBar.tick(task.progressAmount - lastAmount);
                lastAmount = task.progressAmount;
            })
                .on('end', function () {
                resolve();
            })
                .on('error', function (err) {
                reject(err);
            });
        };
        if (params.createBucket) {
            //console.log(`creating bucket`);
            common_1.send(function () { return awsS3Client.createBucket({
                Bucket: params.bucketName,
                CreateBucketConfiguration: {
                    LocationConstraint: params.defaultRegion
                }
            }); })
                .then(sync)
                .catch(function () { return console.log("Bucket creation failed"); });
        }
        else
            sync();
    });
}
exports.syncBucket = syncBucket;
//# sourceMappingURL=s3.js.map