import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER || 'countrynaturalfoods',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'countrynaturalfoods123',
});

async function setupMinio() {
  try {
    console.log('Setting up MinIO...');
    
    const bucketName = 'cnf-products';
    
    // Check if bucket exists
    const exists = await minioClient.bucketExists(bucketName);
    
    if (!exists) {
      console.log(`Creating bucket: ${bucketName}`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✓ Bucket ${bucketName} created successfully`);
    } else {
      console.log(`✓ Bucket ${bucketName} already exists`);
    }
    
    // Set bucket policy to public read
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`✓ Bucket ${bucketName} is now publicly readable`);
    
    console.log('\n✅ MinIO setup complete!');
    console.log(`   Bucket: ${bucketName}`);
    console.log(`   URL: http://localhost:9000/${bucketName}/`);
    console.log(`   Console: http://localhost:9001`);
    console.log(`   Username: countrynaturalfoods`);
    console.log(`   Password: countrynaturalfoods123`);
    
  } catch (error) {
    console.error('❌ Error setting up MinIO:', error);
    process.exit(1);
  }
}

setupMinio();
