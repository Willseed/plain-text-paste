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
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const area = document.getElementById('pasteArea') as HTMLTextAreaElement | null;
  if (area) enablePlainTextPaste(area);
});