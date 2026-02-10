const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'public', 'data', 'airports_sample.csv');
const jsonPath = path.join(__dirname, 'public', 'data', 'airports_sample.json');

fs.readFile(csvPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading CSV:', err);
    return;
  }

  const lines = data.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1);

  const jsonData = rows.map(row => {
    const values = row.split(',');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index] ? values[index].trim() : '';
    });
    return obj;
  });

  fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error('Error writing JSON:', err);
      return;
    }
    console.log('JSON file created successfully.');
  });
});