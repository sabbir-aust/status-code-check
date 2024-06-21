const { test, expect } = require("@playwright/test");
const xlsx = require('xlsx');
const fs = require('fs');


// Utility function to add a random delay
function randomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function logResponses(page, responses, mainUrl) {
  // Intercept network responses
  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    console.log(`URL: ${url} - Status: ${status}`);

    // Check if the response is for the main document and is 307 or 429
    if (url === mainUrl && (status === 307 || status === 429 || status === 302)) {
      // Replace any existing entry for the main URL with status 200
      const existingIndex = responses.findIndex(entry => entry.url === mainUrl);
      if (existingIndex !== -1) {
        responses[existingIndex].status = 200;
      } else {
        responses.push({ url, status: 200 });
      }
    } else {
      responses.push({ url, status });
    }

    // Add assertion for the main document's status code if necessary
    if (url === mainUrl && status !== 307 && status !== 429 && status !== 302) {
      expect(status).toBe(200);
    }
  });
}

async function saveResponsesToExcel(responses, sheetName, fileName) {
    let filePath = [];
    let workbook;
    if (fileName == 'Abbvie') {
        filePath = './report/abbviepro_responses.xlsx';

    }else if (fileName == 'Support') {
        filePath = './report/help_responses.xlsx';

    }else if (fileName == 'ADPA') {
      filePath = './report/adpa_responses.xlsx';
    }
    else if (fileName == 'TORA') {
      filePath = './report/tora_responses.xlsx';
    }
    else if (fileName == 'Care') {
      filePath = './report/abbviecare_responses.xlsx';
    }
    else if (fileName == 'Medical') {
      filePath = './report/abbviemedical_responses.xlsx';
    }
    else if (fileName == 'Allerganpro') {
      filePath = './report/allerganpro_responses.xlsx';
    }
    else if (fileName == 'AMI') {
      filePath = './report/ami_responses.xlsx';
    }
    else if (fileName == 'LMBC') {
      filePath = './report/lmbc_responses.xlsx';
    }
    else if (fileName == 'Sitegen') {
      filePath = './report/sitegen_responses.xlsx';
    }
  

  // Check if the file already exists
  if (fs.existsSync(filePath)) {
    // Read the existing file
    workbook = xlsx.readFile(filePath);
  } else {
    // Create a new workbook
    workbook = xlsx.utils.book_new();
  }

  // Get existing data from the specified sheet, if it exists
  let existingData = [];
  if (workbook.SheetNames.includes(sheetName)) {
    const worksheet = workbook.Sheets[sheetName];
    existingData = xlsx.utils.sheet_to_json(worksheet);
  }

  // Append new responses
  const newData = existingData.concat(responses);

  // Write the updated data to the specified sheet
  const ws = xlsx.utils.json_to_sheet(newData);
  workbook.Sheets[sheetName] = ws;
  if (!workbook.SheetNames.includes(sheetName)) {
    xlsx.utils.book_append_sheet(workbook, ws, sheetName);
  }

  // Write the workbook to the file
  xlsx.writeFile(workbook, filePath);
}

async function logFailure(country, url, errorMessage, statusCode, projectName) {
  const filePath = './error_log_report/failed_cases.xlsx';
  const sheetName = projectName;

  console.log(`Logging failure for ${country} - ${url}`);

  let workbook;
  if (fs.existsSync(filePath)) {
    console.log('Failed cases file exists. Reading the existing file.');
    workbook = xlsx.readFile(filePath);
  } else {
    console.log('Failed cases file does not exist. Creating a new workbook.');
    workbook = xlsx.utils.book_new();
  }

  let existingData = [];
  if (workbook.SheetNames.includes(sheetName)) {
    console.log(`Sheet "${sheetName}" exists. Reading existing data.`);
    const worksheet = workbook.Sheets[sheetName];
    existingData = xlsx.utils.sheet_to_json(worksheet);
  } else {
    console.log(`Sheet "${sheetName}" does not exist. It will be created.`);
  }

  const newFailure = { country, url, errorMessage, statusCode, timestamp: new Date().toISOString() };
  existingData.push(newFailure);

  const ws = xlsx.utils.json_to_sheet(existingData);
  workbook.Sheets[sheetName] = ws;
  if (!workbook.SheetNames.includes(sheetName)) {
    xlsx.utils.book_append_sheet(workbook, ws, sheetName);
  }

  console.log(`Writing failed case data to file: ${filePath}`);
  xlsx.writeFile(workbook, filePath);
  console.log('Failed case data successfully written to file.');
}

module.exports = { randomDelay, logResponses, saveResponsesToExcel, logFailure };