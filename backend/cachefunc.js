// cachefunc.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, 'cache');


export async function setupCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    console.log('Cache dir ready');
  } catch (err) {
    console.log('Cache dir issue:', err.message);
  }
}


export async function getTheCachedData(ticker) {
  const cacheFile = path.join(CACHE_DIR, `${ticker.toLowerCase()}.json`);
  
  try {
    const stats = await fs.stat(cacheFile);
    const lastfileUpdate = new Date(stats.mtime).toDateString();
    const currentDate = new Date().toDateString();
    
    // If file is from today, it's valid
    if (lastfileUpdate === currentDate) {
      const data = JSON.parse(await fs.readFile(cacheFile, 'utf8'));
      return { data, fresh: true };
    }
    
    const data = JSON.parse(await fs.readFile(cacheFile, 'utf8'));
    return { data, fresh: false };
  } catch (err) {
    return { data: null, fresh: false };
  }
}

export async function saveToCache(ticker, data) {
  const cacheFile = path.join(CACHE_DIR, `${ticker.toLowerCase()}.json`);
  
  try {
    await fs.writeFile(cacheFile, JSON.stringify(data, null, 2)); // pretty print so I can read it better in the cache directory
    console.log(`Saved ${ticker} to cache`);
    return true;
  } catch (err) {
    console.log(`Warning: couldn't save cache for ${ticker}:`, err.message);
    return false;
  }
}


export async function getCacheStatus() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    const status = {};
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const ticker = file.replace('.json', '').toUpperCase();
        const stats = await fs.stat(path.join(CACHE_DIR, file));
        
        status[ticker] = {
          lastUpdated: stats.mtime,
          ageHours: Math.round((Date.now() - stats.mtime) / 3600000 * 10) / 10
        };
      }
    }
    
    return status;
  } catch (err) {
    console.error('Error checking cache status:', err);
    throw err;
  }
}


export default {
  setupCacheDir,
  getTheCachedData,
  saveToCache,
  getCacheStatus,
  CACHE_DIR 
};