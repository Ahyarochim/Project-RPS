// pages/api/generate-bootcamp.ts
// Next.js API route untuk generate bootcamp dengan AI

import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

interface BootcampRequest {
  nama: string;
  durasi: number;
  level: string;
  deskripsi: string;
  additional_context?: string;
}

interface BootcampResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BootcampResponse>
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { nama, durasi, level, deskripsi, additional_context } = req.body as BootcampRequest;

    // Validate input
    if (!nama || !durasi || !level || !deskripsi) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'ai_to_json.py');
    const outputPath = path.join(process.cwd(), 'temp', `bootcamp_${Date.now()}.json`);

    // Ensure temp directory exists
    await fs.mkdir(path.join(process.cwd(), 'temp'), { recursive: true });

    // Build Python command
    const pythonCmd = [
      'python3',
      scriptPath,
      `--name "${nama}"`,
      `--durasi ${durasi}`,
      `--level "${level}"`,
      `--context "${additional_context || ''}"`,
      `--output "${outputPath}"`
    ].join(' ');

    console.log('Executing:', pythonCmd);

    // Execute Python script
    const { stdout, stderr } = await execAsync(pythonCmd, {
      timeout: 300000 // 5 minutes timeout
    });

    if (stderr) {
      console.error('Python stderr:', stderr);
    }

    console.log('Python stdout:', stdout);

    // Read generated JSON
    const jsonData = await fs.readFile(outputPath, 'utf-8');
    const bootcampData = JSON.parse(jsonData);

    // Add metadata
    bootcampData.identitas = {
      nama,
      kode: `BOOT-${Date.now()}`,
      durasi,
      tipe: 'Hybrid', // default
      level,
      kapasitas: 25 // default
    };

    bootcampData.id = `boot-${Date.now()}`;
    bootcampData.createdAt = new Date().toISOString();
    bootcampData.updatedAt = new Date().toISOString();

    // Clean up temp file
    await fs.unlink(outputPath).catch(() => { });

    // Return success
    return res.status(200).json({
      success: true,
      data: bootcampData
    });

  } catch (error) {
    console.error('Error generating bootcamp:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}

// Increase API timeout for AI generation
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: '8mb',
  },
  maxDuration: 300, // 5 minutes
};
