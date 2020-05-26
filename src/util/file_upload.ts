const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');

var credentials = new aws.SharedIniFileCredentials({profile: 'bcl'});
aws.config.credentials = credentials;

// Should work since they claim it's s3 compatible
const spacesEndpoint = new aws.Endpoint('eu-central-1.linodeobjects.com/');
const s3 = new aws.S3({
  endpoint: spacesEndpoint
});
/* 
const s3 = new aws.S3({
    accessKeyId: aws.config.credentials.accessKeyId,
    secretAccessKey: aws.config.credentials.secretAccessKey
}); */

aws.config.getCredentials(function(err) {
    if (err) console.log(err.stack);
    // credentials not loaded
    else {
      console.log("Access key:", aws.config.credentials.accessKeyId);
      console.log("Secret access key:", aws.config.credentials.secretAccessKey);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

export const file_upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'bcl',
      acl: 'public-read',
      key: function (request, file, cb) {
        console.log(file);
        let extension = file.originalname.split(".")[1]
        let fileName = Date.now().toString()+ "." + extension;
        cb(null, fileName);
      }
    }),
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // we are allowing only 5 MB files
    }
  });