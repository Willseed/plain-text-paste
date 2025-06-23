/**
 * 將指定的 HTMLTextAreaElement 註冊為「純文字貼上」區域
 */
function enablePlainTextPaste(textarea: HTMLTextAreaElement): void {
  textarea.addEventListener('paste', evt => {
    // 阻止瀏覽器預設貼上行為（會攜帶格式）
    evt.preventDefault();

    // 從剪貼簿僅讀取 text/plain
    const clipboardData = evt.clipboardData ?? (window as any).clipboardData;
    const plain = clipboardData.getData('text/plain');

    // 插入光標位置；對應不同瀏覽器 API
    const start = textarea.selectionStart;
    const end   = textarea.selectionEnd;
    const value = textarea.value;

    textarea.value = value.slice(0, start) + plain + value.slice(end);
    // 重設光標於貼上文字結尾
    const newPos = start + plain.length;
    textarea.setSelectionRange(newPos, newPos);
    
    // 更新行號
    updateLineNumbers();
  });
}

/**
 * 行號更新功能
 */
function updateLineNumbers(): void {
  const textarea = document.getElementById('pasteArea') as HTMLTextAreaElement;
  const lineNumbers = document.getElementById('lineNumbers') as HTMLElement;
  
  if (!textarea || !lineNumbers) return;
  
  const lines = textarea.value.split('\n').length;
  
  let lineNumberText = '';
  const maxLines = Math.max(lines, 20);
  const maxDigits = maxLines.toString().length;
  
  for (let i = 1; i <= maxLines; i++) {
    const lineNum = i.toString().padStart(maxDigits, ' ');
    lineNumberText += lineNum + '\n';
  }
  
  lineNumbers.textContent = lineNumberText;
  
  // 調整行號區域寬度以適應數字位數
  const newWidth = Math.max(50, maxDigits * 12 + 20);
  lineNumbers.style.width = newWidth + 'px';
  textarea.style.paddingLeft = (newWidth + 10) + 'px';
  
  // 同步捲動
  lineNumbers.scrollTop = textarea.scrollTop;
}

/**
 * 同步捲動
 */
function syncScroll(): void {
  const textarea = document.getElementById('pasteArea') as HTMLTextAreaElement;
  const lineNumbers = document.getElementById('lineNumbers') as HTMLElement;
  
  if (!textarea || !lineNumbers) return;
  
  lineNumbers.scrollTop = textarea.scrollTop;
}

/**
 * 主題切換功能
 */
function toggleTheme(): void {
  const button = document.querySelector('.theme-toggle') as HTMLButtonElement;
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  
  if (currentTheme === 'dark') {
    html.removeAttribute('data-theme');
    button.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    button.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
}

/**
 * 載入儲存的主題設定
 */
function loadTheme(): void {
  const savedTheme = localStorage.getItem('theme');
  const button = document.querySelector('.theme-toggle') as HTMLButtonElement;
  const html = document.documentElement;
  
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.setAttribute('data-theme', 'dark');
    button.textContent = '☀️';
  } else {
    html.removeAttribute('data-theme');
    button.textContent = '🌙';
  }
}

/**
 * 處理 Tab 鍵插入空格
 */
function handleTabKey(e: KeyboardEvent): void {
  if (e.key === 'Tab') {
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 2;
    updateLineNumbers();
  }
}

// 將函式暴露到全域範圍，以便 HTML 可以呼叫
(window as any).toggleTheme = toggleTheme;

document.addEventListener('DOMContentLoaded', () => {
  const area = document.getElementById('pasteArea') as HTMLTextAreaElement | null;
  
  if (area) {
    enablePlainTextPaste(area);
    
    // 設定事件監聽器
    area.addEventListener('input', updateLineNumbers);
    area.addEventListener('scroll', syncScroll);
    area.addEventListener('keydown', handleTabKey);
  }
  
  // 載入主題設定和初始化行號
  loadTheme();
  updateLineNumbers();
});