// api/get-news.js
// Serverless function để cào tin tức từ ToanMath.com
const axios = require('axios');
const cheerio = require('cheerio');

// Cache để tránh cào quá nhiều lần
let cachedData = null;
let cacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 giờ (milliseconds)

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Kiểm tra cache
    const now = Date.now();
    if (cachedData && cacheTime && (now - cacheTime) < CACHE_DURATION) {
      console.log('Returning cached data');
      return res.status(200).json(cachedData);
    }

    // Cào dữ liệu mới từ trang chính của ToanMath
    console.log('Fetching new data from ToanMath...');
    const { data } = await axios.get('https://toanmath.com/toanmath-com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const articles = [];
    const seenLinks = new Set(); // Để tránh trùng lặp

    // Tìm các bài viết mới nhất
    // ToanMath sử dụng WordPress, các bài viết thường nằm trong:
    // - article.post, .post-item, .entry-item, hoặc các link có href chứa năm/tháng (ví dụ: /2026/01/)
    
    // Cách 1: Tìm các link có pattern /YYYY/MM/ trong href (format của WordPress)
    $('a[href*="/202"]').each((i, el) => {
      if (articles.length >= 10) return false; // Dừng khi đủ 10 bài
      
      const $el = $(el);
      const href = $el.attr('href');
      const text = $el.text().trim();
      
      // Chỉ lấy link có format /YYYY/MM/ (ví dụ: /2026/01/...)
      if (href && /\/\d{4}\/\d{2}\//.test(href) && text && text.length > 15) {
        let fullLink = href;
        if (!fullLink.startsWith('http')) {
          fullLink = fullLink.startsWith('/') 
            ? 'https://toanmath.com' + fullLink 
            : 'https://toanmath.com/' + fullLink;
        }
        
        // Tránh trùng lặp
        if (seenLinks.has(fullLink)) return;
        seenLinks.add(fullLink);
        
        // Tìm ảnh trong cùng container
        let img = null;
        const $parent = $el.closest('article, .post, .entry-item, .post-item, li, div');
        if ($parent.length) {
          img = $parent.find('img').first().attr('src');
          if (img && !img.startsWith('http')) {
            img = img.startsWith('/') 
              ? 'https://toanmath.com' + img 
              : 'https://toanmath.com/' + img;
          }
        }
        
        articles.push({
          title: text,
          link: fullLink,
          img: img || null
        });
      }
    });

    // Cách 2: Nếu chưa đủ 10 bài, tìm trong các container bài viết phổ biến
    if (articles.length < 10) {
      $('article, .post-item, .entry-item, .post, article.post').each((i, el) => {
        if (articles.length >= 10) return false;
        
        const $el = $(el);
        const $link = $el.find('a').first();
        const href = $link.attr('href');
        const title = $link.text().trim() || $el.find('h2, h3, h4, .title').first().text().trim();
        
        if (href && title && title.length > 15) {
          let fullLink = href;
          if (!fullLink.startsWith('http')) {
            fullLink = fullLink.startsWith('/') 
              ? 'https://toanmath.com' + fullLink 
              : 'https://toanmath.com/' + fullLink;
          }
          
          // Chỉ thêm nếu link có format đúng và chưa có
          if (/\/\d{4}\/\d{2}\//.test(fullLink) && !seenLinks.has(fullLink)) {
            seenLinks.add(fullLink);
            
            let img = $el.find('img').first().attr('src');
            if (img && !img.startsWith('http')) {
              img = img.startsWith('/') 
                ? 'https://toanmath.com' + img 
                : 'https://toanmath.com/' + img;
            }
            
            articles.push({
              title: title,
              link: fullLink,
              img: img || null
            });
          }
        }
      });
    }

    // Sắp xếp và giới hạn 10 bài đầu tiên
    articles.splice(10);

    // Lưu vào cache
    cachedData = articles;
    cacheTime = now;

    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    
    // Nếu có cache cũ, trả về cache
    if (cachedData) {
      console.log('Returning stale cache due to error');
      return res.status(200).json(cachedData);
    }
    
    res.status(500).json({ 
      error: 'Cannot fetch news',
      message: error.message 
    });
  }
};

