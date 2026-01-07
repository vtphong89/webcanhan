/**
 * news.js - Xử lý hiển thị tin tức toán học từ ToanMath.com
 */

// URL của API serverless function
// Khi deploy lên Vercel, dùng relative path này sẽ tự động trỏ đến /api/get-news
// Nếu chạy local hoặc dùng domain khác, uncomment dòng dưới và thay bằng URL thật
const NEWS_API_URL = '/api/get-news';

// Nếu deploy lên Vercel và muốn dùng absolute URL (khuyến nghị):
// const NEWS_API_URL = 'https://your-project.vercel.app/api/get-news';

let newsData = [];
let isLoading = false;

/**
 * Gọi API để lấy tin tức
 */
async function fetchNews() {
  if (isLoading) return;
  
  isLoading = true;
  const statusEl = document.getElementById('news-status');
  const contentEl = document.getElementById('news-content');
  
  if (statusEl) {
    statusEl.textContent = 'Đang tải tin tức toán học...';
    statusEl.style.display = 'block';
  }
  
  if (contentEl) {
    contentEl.innerHTML = '';
  }

  try {
    const response = await fetch(NEWS_API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.message || data.error);
    }
    
    newsData = Array.isArray(data) ? data : [];
    
    if (statusEl) {
      statusEl.style.display = 'none';
    }
    
    renderNews(newsData);
    
  } catch (error) {
    console.error('Error fetching news:', error);
    
    if (statusEl) {
      statusEl.textContent = 'Không thể tải tin tức. Vui lòng thử lại sau.';
      statusEl.style.color = '#e74c3c';
    }
    
    if (contentEl) {
      contentEl.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #666;">
          <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
          <p>Không thể tải tin tức từ ToanMath.com</p>
          <button onclick="fetchNews()" class="admission-btn" style="margin-top: 10px;">
            <i class="fas fa-redo"></i> Thử lại
          </button>
        </div>
      `;
    }
  } finally {
    isLoading = false;
  }
}

/**
 * Hiển thị danh sách tin tức
 */
function renderNews(articles) {
  const contentEl = document.getElementById('news-content');
  if (!contentEl) return;

  if (!articles || articles.length === 0) {
    contentEl.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666;">
        <i class="fas fa-newspaper" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
        <p>Chưa có tin tức nào.</p>
      </div>
    `;
    return;
  }

  const newsHTML = articles.map((article, index) => {
    const imgHTML = article.img 
      ? `<img src="${article.img}" alt="${article.title}" onerror="this.style.display='none'">`
      : '<div class="news-item-no-img"><i class="fas fa-newspaper"></i></div>';
    
    return `
      <div class="news-item" onclick="window.open('${article.link}', '_blank')">
        <div class="news-item-number">${index + 1}</div>
        <div class="news-item-image">${imgHTML}</div>
        <div class="news-item-content">
          <h3 class="news-item-title">${article.title}</h3>
          <a href="${article.link}" target="_blank" class="news-item-link" onclick="event.stopPropagation();">
            <i class="fas fa-external-link-alt"></i> Đọc thêm
          </a>
        </div>
      </div>
    `;
  }).join('');

  contentEl.innerHTML = newsHTML;
}

/**
 * Khởi tạo module tin tức
 */
function initNews() {
  const toggleEl = document.getElementById('news-toggle');
  const contentEl = document.getElementById('news-content');
  
  if (!toggleEl || !contentEl) {
    console.warn('News section elements not found');
    return;
  }

  // Toggle expand/collapse
  toggleEl.addEventListener('click', () => {
    const isCollapsed = contentEl.classList.contains('collapsed');
    
    if (isCollapsed) {
      contentEl.classList.remove('collapsed');
      toggleEl.classList.remove('collapsed');
      
      // Chỉ load tin tức khi mở lần đầu
      if (newsData.length === 0 && !isLoading) {
        fetchNews();
      }
    } else {
      contentEl.classList.add('collapsed');
      toggleEl.classList.add('collapsed');
    }
    
    // Cập nhật icon
    const icon = toggleEl.querySelector('.toggle-icon');
    if (icon) {
      icon.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)';
    }
  });
  
  console.log('News module initialized');
}

// Export functions để có thể gọi từ HTML
window.fetchNews = fetchNews;
window.initNews = initNews;

