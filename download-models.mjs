import fs from 'fs';
import https from 'https';
import path from 'path';

const modelsDir = './public/models';
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
const files = [
  'ssd_mobilenetv1_model-weights_manifest.json', 'ssd_mobilenetv1_model-shard1', 'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json', 'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json', 'face_recognition_model-shard1', 'face_recognition_model-shard2'
];

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  https.get(baseUrl + file, (res) => {
    const stream = fs.createWriteStream(filePath);
    res.pipe(stream);
  });
});

console.log("Downloading AI models to /public/models... check the folder in a moment!");