const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const storagePath = path.join(__dirname, 'storage');

if(!fs.existsSync(storagePath)) fs.mkdirSync(storagePath);

app.use(cors());
app.use(express.json());
app.use('/files', express.static(storagePath));

const upload = multer({ dest: storagePath });

//upload files
app.post('/upload', upload.single('file'), (req, res) => {
  const oldPath = req.file.path;
  const newPath = path.join(storagePath, req.file.originalname);
  fs.renameSync(oldPath, newPath);
  res.json({ message: 'File uploaded', name: req.file.originalname });
});

//create text file
app.post('/create', (req, res) => {
  const { name } = req.body;
  const filePath = path.join(storagePath, name);
  if(fs.existsSync(filePath)) {
    return res.status(400).send('File already exists');
  }
  fs.writeFileSync(filePath, ''); //make a empty file
  res.send('File created');
});

//get all the files
app.get('/files', (req, res) => {
  const files = fs.readdirSync(storagePath);
  res.json(files);
});

//get the file information
app.get('/file/:name', (req, res) => {
  const filePath = path.join(storagePath, req.params.name);
  if(fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.send(content);
  } else {
    res.status(404).send('Not found');
  }
});

//save or update a file
app.post('/file/:name', (req, res) => {
  const filePath = path.join(storagePath, req.params.name);
  fs.writeFileSync(filePath, req.body.content);
  res.send('Saved');
});

//delete file
app.delete('/file/:name', (req, res) => {
  const filePath = path.join(storagePath, req.params.name);
  if(fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.send('Deleted');
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
