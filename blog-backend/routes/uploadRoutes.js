import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';

const router = express.Router();

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

const storageFolder = path.resolve('src/storage');
if (!fs.existsSync(storageFolder)) {
  fs.mkdirSync(storageFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = path.join(storageFolder, req.file.filename);
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(fileExtension)) {
    const thumbnailPath = path.join(
      storageFolder,
      `${req.file.filename.split('.')[0]}-thumbnail.png`
    );

    ffmpeg(filePath)
      .on('end', () => {
        res.json({
          success: true,
          type: 'video',
          url: `${req.protocol}://${req.get('host')}/storage/${
            req.file.filename
          }`,
          banner: `${req.protocol}://${req.get('host')}/storage/${path.basename(
            thumbnailPath
          )}`,
        });
      })
      .on('error', err => {
        console.error('Error generating thumbnail:', err);
        res
          .status(500)
          .json({ message: 'Error generating thumbnail', error: err.message });
      })
      .screenshots({
        count: 1,
        folder: storageFolder,
        filename: `${req.file.filename.split('.')[0]}-thumbnail.png`,
        size: '320x240',
      });
  } else {
    res.json({
      success: true,
      type: 'blog',
      url: `${req.protocol}://${req.get('host')}/storage/${req.file.filename}`,
    });
  }
});

export default router;