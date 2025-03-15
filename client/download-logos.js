const fs = require('fs');
const https = require('https');
const path = require('path');

const logoUrls = {
  'favicon.ico': 'https://raw.githubusercontent.com/favicon-community/favicon.ico/master/favicon.ico',
  'logo192.png': 'https://dummyimage.com/192x192/4a90e2/ffffff&text=Quick+Axis',
  'logo512.png': 'https://dummyimage.com/512x512/4a90e2/ffffff&text=Quick+Axis'
};

const publicDir = path.join(__dirname, 'public');

Object.entries(logoUrls).forEach(([filename, url]) => {
  const filePath = path.join(publicDir, filename);
  
  console.log(`Downloading ${filename} from ${url}...`);
  
  const file = fs.createWriteStream(filePath);
  
  https.get(url, (response) => {
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename} successfully!`);
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {}); // Delete the file if there's an error
    console.error(`Error downloading ${filename}: ${err.message}`);
  });
});

console.log('Download process initiated. Please wait...'); 