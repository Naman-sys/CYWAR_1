import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const TIMEOUT = 10000; // 10 seconds

export async function scrapeURL(url: string): Promise<{ title: string; content: string }> {
  try {
    // Validate URL format
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol. Only http and https are supported.');
    }

    // Fetch HTML with timeout
    const response = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': USER_AGENT,
      },
      maxRedirects: 5,
      maxContentLength: 1024 * 1024 * 10, // 10MB max
    });

    // Parse HTML
    const $ = cheerio.load(response.data);

    // Extract title
    let title = $('title').text().trim();
    if (!title) {
      title = $('h1').first().text().trim();
    }
    if (!title) {
      title = urlObj.hostname || 'Unknown';
    }

    // Extract main content
    // Remove scripts, styles, and metadata
    $('script, style, meta, noscript').remove();

    // Try to get article content
    let content = '';
    
    // Try common article containers
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content-body',
      'main',
    ];

    for (const selector of articleSelectors) {
      const extracted = $(selector).text().trim();
      if (extracted.length > 100) {
        content = extracted;
        break;
      }
    }

    // Fallback: get body text
    if (!content || content.length < 100) {
      content = $('body').text().trim();
    }

    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();

    // Limit content length (first 5000 chars)
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '...';
    }

    if (!content || content.length < 20) {
      throw new Error('Could not extract meaningful content from the URL.');
    }

    return { title, content };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The website took too long to respond.');
      }
      if (error.response?.status === 404) {
        throw new Error('Website not found (404).');
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied (403). Website may block scraping.');
      }
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
    if (error instanceof Error) {
      throw new Error(`Scraping error: ${error.message}`);
    }
    throw new Error('Unknown error while scraping URL');
  }
}
