// @ts-check
const { test, expect } = require('@playwright/test');
const { randomDelay, logResponses, saveResponsesToExcel,logFailure } = require('../pages/functions');
const xlsx = require('xlsx');
const fs = require('fs');

// Helper function to read URLs from the Excel file
function readUrlsFromExcel(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const workbook = xlsx.readFile(filePath);
  const sheetName = 'ADPA';
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  return data; // returns an array of objects with keys 'country' and 'url'
}

// Read URLs from the Excel file
const urls = readUrlsFromExcel('urls.xlsx');

urls.forEach(({ country, url }) => {
  test(`has title and checks status code for abbviepro ${country} URL`, async ({ page }) => {
    // Create an array to store URLs and status codes
    let responses = [];
    const mainUrl = url;
    
    

    try {
    await logResponses(page, responses, mainUrl);
    await page.goto(mainUrl, { waitUntil: 'load' });

    // Additional manual wait if necessary
    await page.waitForTimeout(randomDelay(3000, 5000));

    // Expect the title to contain at least one non-whitespace character
    await expect(page).toHaveTitle(/\S+/);

    // Save responses to Excel file in a sheet named after the country
    await saveResponsesToExcel(responses, country, 'ADPA');
    } catch (error) {
      await logFailure(country, url, error.message, 'ADPA');
    }
  });
});