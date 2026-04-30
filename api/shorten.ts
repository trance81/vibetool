import axios from "axios";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Using is.gd API which is simple and doesn't require a key
    const response = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
    res.json({ shorturl: response.data.shorturl });
  } catch (error: any) {
    console.error("Shorten error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to shorten URL" });
  }
}
