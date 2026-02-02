const { Client } = require('minio');
require('dotenv').config();

const BUCKET = 'categories';

async function main() {
  const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true' || false,
    accessKey: process.env.MINIO_ROOT_USER || 'countrynaturalfoods',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'countrynaturalfoods123',
  });

  let exists = false;
  try {
    exists = await minioClient.bucketExists(BUCKET);
  } catch (_) {}

  if (!exists) {
    console.log(`Bucket '${BUCKET}' does not exist. Nothing to delete.`);
    return;
  }

  console.log(`Bucket '${BUCKET}' found. Deleting all objects...`);
  const objects = [];
  for await (const obj of minioClient.listObjectsV2(BUCKET, '', true)) {
    if (obj.name) objects.push(obj.name);
  }

  if (objects.length) {
    await minioClient.removeObjects(BUCKET, objects);
    console.log(`Removed ${objects.length} object(s).`);
  } else {
    console.log('Bucket is already empty.');
  }

  await minioClient.removeBucket(BUCKET);
  console.log(`Bucket '${BUCKET}' removed successfully.`);
}

main().catch((err) => {
  console.error('Error cleaning bucket:', err);
  process.exit(1);
});
