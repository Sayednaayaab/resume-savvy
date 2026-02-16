#!/usr/bin/env node

/**
 * Development API Server
 * Runs Vercel serverless functions locally for development
 */

import http from 'http';
import url from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import the API handler
import analyzeAtsHandler from './api/analyze-ats.js';

const PORT = process.env.API_PORT || 3001;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route: /api/analyze-ats
  if (pathname === '/api/analyze-ats') {
    // Parse request body
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        // Parse JSON body
        let parsedBody = {};
        try {
          if (body.trim()) {
            parsedBody = JSON.parse(body);
          }
        } catch (e) {
          console.error('JSON parse error:', e);
          parsedBody = {};
        }

        // Add body to request object in the format Vercel expects
        req.body = parsedBody;

        // Create response wrapper for Vercel-style res object
        const vRes = {
          status: (code) => ({
            end: () => {
              if (!res.headersSent) {
                res.writeHead(code, { 'Content-Type': 'text/plain' });
                res.end();
              }
            },
            json: (data) => {
              if (!res.headersSent) {
                res.writeHead(code, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
              }
            }
          }),
          setHeader: (key, val) => res.setHeader(key, val),
          writeHead: (code, headers) => res.writeHead(code, headers),
          end: (data) => res.end(data),
          json: (data) => {
            if (!res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(data));
            }
          }
        };

        // Call the handler with parsed body
        await analyzeAtsHandler(req, vRes);
      } catch (error) {
        console.error('Handler error:', error);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Internal server error',
            message: error.message
          }));
        }
      }
    });
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`✓ API Server running on http://localhost:${PORT}`);
  console.log(`✓ POST /api/analyze-ats - Resume analysis endpoint`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down API server...');
  server.close(() => {
    console.log('API server closed');
    process.exit(0);
  });
});
