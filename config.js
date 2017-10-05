module.exports = {
  authentic: {
    server: 'https://authentic.apps.js.la'
  },
  s3: {
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: process.env.S3_BUCKET,
    endpoint: process.env.S3_HOST
  }
}
