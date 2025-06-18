import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const results: { [key: string]: any } = {};
  
  try {
    // Test 1: Import et utilisation de nodemailer
    results.nodemailer = 'Testing...';
    const nodemailer = await import('nodemailer');
    results.nodemailer = 'OK - Import successful';
  } catch (error) {
    results.nodemailer = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
  
  try {
    // Test 2: Import et utilisation de ExcelJS
    results.exceljs = 'Testing...';
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.default.Workbook();
    workbook.addWorksheet('Test');
    results.exceljs = 'OK - Import and basic usage successful';
  } catch (error) {
    results.exceljs = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
  
  try {
    // Test 3: Import et utilisation de docx
    results.docx = 'Testing...';
    const { Document, Packer, Paragraph } = await import('docx');
    const doc = new Document({
      sections: [{
        children: [new Paragraph('Test')]
      }]
    });
    const buffer = await Packer.toBuffer(doc);
    results.docx = `OK - Import and basic usage successful, buffer size: ${buffer.length}`;
  } catch (error) {
    results.docx = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
  
  try {
    // Test 4: Import et utilisation de sharp
    results.sharp = 'Testing...';
    const sharp = await import('sharp');
    const svgTest = '<svg width="100" height="100"><rect width="100" height="100" fill="red"/></svg>';
    const buffer = await sharp.default(Buffer.from(svgTest))
      .resize(50, 50)
      .png()
      .toBuffer();
    results.sharp = `OK - Import and SVG conversion successful, buffer size: ${buffer.length}`;
  } catch (error) {
    results.sharp = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
  
  try {
    // Test 5: Import et utilisation d'OpenAI
    results.openai = 'Testing...';
    const OpenAI = await import('openai');
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      results.openai = 'ERROR: OPENAI_API_KEY not set';
    } else {
      const openai = new OpenAI.default({ apiKey });
      results.openai = 'OK - Import successful, API key present';
    }
  } catch (error) {
    results.openai = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
  
  // Test 6: Variables d'environnement
  results.environment = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ? 'true' : 'false',
    SMTP_HOST: process.env.SMTP_HOST ? 'Set' : 'Not set',
    SMTP_USER: process.env.SMTP_USER ? 'Set' : 'Not set',
    SMTP_PASS: process.env.SMTP_PASS ? 'Set' : 'Not set',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set'
  };
  
  res.status(200).json({
    message: 'Dependency test results',
    timestamp: new Date().toISOString(),
    results
  });
} 