import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream, statSync } from 'fs';
import { readdir } from 'fs/promises';
import { join } from 'path';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = 'lab-videos';

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error('必要な環境変数が設定されていません: CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
});

const mode = process.argv[2];

// R2 既存オブジェクト一覧
const listRes = await client.send(new ListObjectsV2Command({ Bucket: BUCKET }));
const existing = new Set(listRes.Contents?.map((o) => o.Key) ?? []);

// videos.json（常に上書き）
if (!mode || mode === 'json') {
  process.stdout.write('[upload] videos.json ... ');
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'videos.json',
    Body: (await import('fs')).readFileSync('services/cloudflare/r2/videos.json'),
    ContentType: 'application/json',
  }));
  console.log('done');
}

// サムネイル（差分のみ）
if (!mode || mode === 'thumbnails') {
  const thumbDir = 'services/cloudflare/r2/thumbnails';
  const files = (await readdir(thumbDir)).filter((f) => f.endsWith('.jpg'));
  for (const file of files) {
    const key = `thumbnails/${file}`;
    if (existing.has(key)) { console.log(`[skip] ${key}`); continue; }
    process.stdout.write(`[upload] ${key} ... `);
    await client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: (await import('fs')).readFileSync(join(thumbDir, file)),
      ContentType: 'image/jpeg',
    }));
    console.log('done');
  }
}

// 動画（差分のみ・マルチパート）
if (!mode || mode === 'videos') {
  const videosDir = 'services/cloudflare/r2/videos';
  const files = (await readdir(videosDir)).filter((f) => f.endsWith('.mp4'));
  for (const file of files) {
    const key = `videos/${file}`;
    if (existing.has(key)) { console.log(`[skip] ${key}`); continue; }
    const filePath = join(videosDir, file);
    const sizeMiB = (statSync(filePath).size / 1024 / 1024).toFixed(1);
    process.stdout.write(`[upload] ${key} (${sizeMiB} MiB) ... `);
    await new Upload({
      client,
      params: { Bucket: BUCKET, Key: key, Body: createReadStream(filePath), ContentType: 'video/mp4' },
    }).done();
    console.log('done');
  }
}
