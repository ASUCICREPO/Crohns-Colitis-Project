const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 8080;

// Serve all static files from build directory
app.use('/static', express.static(path.join(__dirname, 'build/static')));

// Find the actual built files
const buildJsDir = path.join(__dirname, 'build/static/js');
const buildCssDir = path.join(__dirname, 'build/static/css');

let mainJsFile, mainCssFile;

try {
  const jsFiles = fs.readdirSync(buildJsDir).filter(file => file.startsWith('main.') && file.endsWith('.js'));
  const cssFiles = fs.readdirSync(buildCssDir).filter(file => file.startsWith('main.') && file.endsWith('.css'));
  
  mainJsFile = jsFiles[0];
  mainCssFile = cssFiles[0];
  
  console.log('Found JS file:', mainJsFile);
  console.log('Found CSS file:', mainCssFile);
} catch (error) {
  console.error('Error reading build files:', error);
}

// Serve the main React app bundle
app.get('/static/js/bundle.js', (req, res) => {
  if (mainJsFile) {
    res.sendFile(path.join(buildJsDir, mainJsFile));
  } else {
    res.status(404).send('JS bundle not found');
  }
});

// Serve the main CSS file
app.get('/static/css/bundle.css', (req, res) => {
  if (mainCssFile) {
    res.sendFile(path.join(buildCssDir, mainCssFile));
  } else {
    res.status(404).send('CSS bundle not found');
  }
});

// Serve sample website pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/sample-website/index.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/sample-website/about.html'));
});

app.get('/treatment.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/sample-website/treatment.html'));
});

app.get('/support.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/sample-website/support.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Test server running at http://localhost:${PORT}`);
  console.log(`📄 Sample pages available:`);
  console.log(`   - Home: http://localhost:${PORT}/`);
  console.log(`   - About: http://localhost:${PORT}/about.html`);
  console.log(`   - Treatment: http://localhost:${PORT}/treatment.html`);
  console.log(`   - Support: http://localhost:${PORT}/support.html`);
  console.log(`🤖 Chat widget will persist across all pages`);
});

module.exports = app;