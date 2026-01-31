// express_api.js
// Express.js API untuk generate bootcamp dengan AI
// Alternative untuk Next.js API routes

const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Generate bootcamp endpoint
app.post('/api/generate-bootcamp', async (req, res) => {
  try {
    const { nama, durasi, level, deskripsi, additional_context } = req.body;

    // Validate
    if (!nama || !durasi || !level || !deskripsi) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: nama, durasi, level, deskripsi'
      });
    }

    console.log('🚀 Generating bootcamp:', nama);

    // Paths
    const scriptPath = path.join(__dirname, 'scripts', 'ai_to_json.py');
    const outputPath = path.join(__dirname, 'temp', `bootcamp_${Date.now()}.json`);

    // Ensure temp directory
    await fs.mkdir(path.join(__dirname, 'temp'), { recursive: true });

    // Build command
    // Sanitize context for shell: remove newlines and escape quotes
    const context = additional_context
      ? additional_context.replace(/[\r\n]+/g, ' ').replace(/"/g, '\\"')
      : '';
    const pythonCmd = [
      '"C:\\Users\\Asus\\AppData\\Local\\Programs\\Python\\Python312\\python.exe"',
      `"${scriptPath}"`,
      `--name "${nama}"`,
      `--durasi ${durasi}`,
      `--level "${level}"`,
      `--context "${context}"`,
      `--output "${outputPath}"`
    ].join(' ');

    console.log('Executing Python script...');
    console.log('Command:', pythonCmd);

    // Execute
    let stdout, stderr;
    try {
      const result = await execAsync(pythonCmd, {
        timeout: 300000, // 5 min
        encoding: 'utf-8'
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (execError) {
      // Even on error, we may have stdout/stderr
      stdout = execError.stdout || '';
      stderr = execError.stderr || '';
      console.error('Python script execution failed');
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);

      // Check for common errors
      if (stdout.includes('API key not found') || stderr.includes('API key not found')) {
        return res.status(500).json({
          success: false,
          error: 'OpenAI API key not found. Please set OPENAI_API_KEY in .env.local file'
        });
      }

      if (stdout.includes('Failed to initialize') || stderr.includes('Failed to initialize')) {
        return res.status(500).json({
          success: false,
          error: 'Failed to initialize OpenAI client. Check your API key is valid.'
        });
      }

      throw execError;
    }

    if (stderr && !stderr.includes('✅')) {
      console.warn('Python stderr:', stderr);
    }

    console.log(stdout);

    // Check if output file exists
    try {
      await fs.access(outputPath);
    } catch {
      console.error('Output file not created. Python output:', stdout);
      return res.status(500).json({
        success: false,
        error: 'AI generation failed. Check if OpenAI API key is set in .env.local',
        details: stdout
      });
    }

    // Read result
    const jsonData = await fs.readFile(outputPath, 'utf-8');
    const bootcampData = JSON.parse(jsonData);

    // Add metadata
    bootcampData.identitas = {
      nama,
      kode: `BOOT-${Date.now().toString().slice(-6)}`,
      durasi,
      tipe: 'Hybrid',
      level,
      kapasitas: 25
    };

    bootcampData.id = `boot-${Date.now()}`;
    bootcampData.createdAt = new Date().toISOString();
    bootcampData.updatedAt = new Date().toISOString();

    // Cleanup
    await fs.unlink(outputPath).catch(() => { });

    console.log('✅ Bootcamp generated successfully');

    res.json({
      success: true,
      data: bootcampData
    });

  } catch (error) {
    console.error('❌ Error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Convert to DOCX endpoint
app.post('/api/convert-to-docx', async (req, res) => {
  try {
    const bootcampData = req.body;

    if (!bootcampData || !bootcampData.identitas) {
      return res.status(400).json({
        success: false,
        error: 'Invalid bootcamp data'
      });
    }

    console.log('📄 Converting to DOCX...');

    // Save temp JSON
    const timestamp = Date.now();
    const jsonPath = path.join(__dirname, 'temp', `bootcamp_${timestamp}.json`);
    const docxPath = path.join(__dirname, 'temp', `bootcamp_${timestamp}.docx`);

    await fs.writeFile(jsonPath, JSON.stringify(bootcampData, null, 2), 'utf-8');

    // Convert to DOCX
    const scriptPath = path.join(__dirname, 'scripts', 'json_to_docx.py');
    const pythonCmd = `"C:\\Users\\Asus\\AppData\\Local\\Programs\\Python\\Python312\\python.exe" "${scriptPath}" --input "${jsonPath}" --output "${docxPath}"`;

    const { stdout, stderr } = await execAsync(pythonCmd, { timeout: 60000 });

    if (stderr && !stderr.includes('✅')) {
      console.warn('Python stderr:', stderr);
    }

    console.log(stdout);

    // Read DOCX file
    const docxBuffer = await fs.readFile(docxPath);

    // Cleanup
    await fs.unlink(jsonPath).catch(() => { });
    await fs.unlink(docxPath).catch(() => { });

    // Send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="bootcamp_curriculum.docx"`);
    res.send(docxBuffer);

    console.log('✅ DOCX generated and sent');

  } catch (error) {
    console.error('❌ Error:', error);

    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Bootcamp API Server running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`   - POST /api/generate-bootcamp`);
  console.log(`   - POST /api/convert-to-docx`);
  console.log(`   - GET  /health`);
});

module.exports = app;
