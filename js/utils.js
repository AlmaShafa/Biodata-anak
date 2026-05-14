/**
 * Utility Functions
 */

// Safe JSON parse
function safeJsonParse(json, fallback = null) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return fallback;
  }
}

// Safe element getter
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id '${id}' not found`);
  }
  return element;
}

// Show toast notification
function showToast(message, type = 'success', duration = 3000) {
  const toast = getElement('toast');
  if (!toast) return;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-40`;
  toast.textContent = message;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, duration);
}

// Escape HTML untuk mencegah XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Format string untuk display
function formatDisplayText(text) {
  return escapeHtml(text || '-');
}

// Convert blob URL to data URL
async function blobToDataUrl(blobUrl) {
  try {
    const response = await fetch(blobUrl);
    if (!response.ok) throw new Error('Failed to fetch blob');
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting blob:', error);
    return null;
  }
}

// Debounce function untuk search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
