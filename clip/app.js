let snippets = [];

// Default seeded data with emojis for visual anchoring
const defaultSnippets = [
  { title: '✂️ Intro', text: 'MAS Barbery - Mobile Barbering. Contact: Manuel at (555) 555-5555.', category: '💈 Barbering' },
  { title: '💼 Arrival', text: 'Hello [NAME], this is Manuel with Ecolab. I will be arriving at [ADDRESS] on [DATE] around [TIME] for your pest control service.', category: '🏢 Work' },
  { title: '🎤 Open Mic Promo', text: 'I am performing at Comic\'s Night Out at Side Splitters on [DATE]! Come through, show starts at [TIME].', category: '🎭 Comedy' },
  { title: '🏠 My Address', text: 'Town \'n\' Country, Tampa, FL [ZIP CODE]', category: '📌 Personal' },
  { title: '📧 Work Email', text: 'manuel.[last]@ecolab.com', category: '🔗 Links & Info' }
];

function loadSnippets() {
  const saved = localStorage.getItem('mySnippets');
  if (saved) {
    snippets = JSON.parse(saved);
  } else {
    snippets = defaultSnippets;
    saveSnippets();
  }
  renderSnippets();
  updateCategoryDatalist();
}

function saveSnippets() {
  localStorage.setItem('mySnippets', JSON.stringify(snippets));
}

// Extract unique categories from current snippets
function getUniqueCategories() {
  return [...new Set(snippets.map(s => s.category))];
}

// Populates the dropdown suggestions for folders
function updateCategoryDatalist() {
  const dataList = document.getElementById('category-list');
  dataList.innerHTML = ''; // Clear existing
  getUniqueCategories().forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    dataList.appendChild(option);
  });
}

function renderSnippets() {
  const container = document.getElementById('snippet-container');
  container.innerHTML = '';

  const categories = getUniqueCategories();

  categories.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'category-section';
    
    const title = document.createElement('div');
    title.className = 'category-title';
    title.innerText = cat;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'grid';

    snippets.filter(s => s.category === cat).forEach(snippet => {
      const btn = document.createElement('button');
      btn.className = `snippet-card`;
      // Assign a random but consistent border color based on category string length
      const colors = ['var(--cat-personal)', 'var(--cat-professional)', 'var(--cat-barbering)', 'var(--cat-comedy)', 'var(--cat-proposals)'];
      btn.style.borderLeftColor = colors[cat.length % colors.length];
      
      btn.innerText = snippet.title;
      btn.addEventListener('click', () => handleSnippetClick(snippet));
      grid.appendChild(btn);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// Handle copying and dynamic variable prompting
async function handleSnippetClick(snippet) {
  let finalText = snippet.text;
  const bracketRegex = /\[([^\]]+)\]/g;
  const matches = finalText.match(bracketRegex);

  if (matches) {
    const uniqueVariables = [...new Set(matches)];
    for (let variable of uniqueVariables) {
      let userInput = prompt(`Enter value for ${variable}:`);
      if (userInput === null) return; 
      finalText = finalText.split(variable).join(userInput);
    }
  }

  try {
    await navigator.clipboard.writeText(finalText);
    showToast();
  } catch (err) {
    alert('Failed to copy.');
  }
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

// Modals
document.getElementById('btn-add').addEventListener('click', () => document.getElementById('modal-add').classList.remove('hidden'));
document.getElementById('btn-settings').addEventListener('click', () => document.getElementById('modal-settings').classList.remove('hidden'));
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', (e) => e.target.closest('.modal').classList.add('hidden'));
});

// --- Quick Insert Logic ---
document.querySelectorAll('.var-chip').forEach(chip => {
  chip.addEventListener('click', (e) => {
    const textarea = document.getElementById('input-text');
    const insertText = e.target.innerText;
    
    // Get cursor position
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    // Inject text at cursor
    textarea.value = textarea.value.substring(0, startPos) + insertText + textarea.value.substring(endPos);
    
    // Move cursor to immediately after the inserted text
    textarea.selectionStart = textarea.selectionEnd = startPos + insertText.length;
    textarea.focus(); // Keep keyboard open
  });
});

// Save New Snippet
document.getElementById('btn-save-snippet').addEventListener('click', () => {
  const title = document.getElementById('input-title').value.trim();
  let category = document.getElementById('input-category').value.trim();
  const text = document.getElementById('input-text').value.trim();

  if (!title || !text) return alert("Title and text are required!");
  if (!category) category = "📁 Uncategorized"; // Default if left blank

  snippets.push({ title, category, text });
  saveSnippets();
  renderSnippets();
  updateCategoryDatalist(); // Update datalist with new folder if created
  
  document.getElementById('input-title').value = '';
  document.getElementById('input-category').value = '';
  document.getElementById('input-text').value = '';
  document.getElementById('modal-add').classList.add('hidden');
});

// Backup & Restore
document.getElementById('btn-backup').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snippets));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "snippets_backup.json");
  document.body.appendChild(downloadAnchorNode); 
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});

document.getElementById('input-restore').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedSnippets = JSON.parse(e.target.result);
      if (Array.isArray(importedSnippets)) {
        snippets = importedSnippets;
        saveSnippets();
        renderSnippets();
        updateCategoryDatalist();
        alert('Snippets restored successfully!');
        document.getElementById('modal-settings').classList.add('hidden');
      } else {
        alert('Invalid backup file format.');
      }
    } catch (err) {
      alert('Error reading file.');
    }
  };
  reader.readAsText(file);
});

document.getElementById('btn-clear-all').addEventListener('click', () => {
  if (confirm("Are you sure? This will delete all snippets from this device.")) {
    snippets = [];
    saveSnippets();
    renderSnippets();
    updateCategoryDatalist();
    document.getElementById('modal-settings').classList.add('hidden');
  }
});

// Theme Toggle
const themeBtn = document.getElementById('btn-theme');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeBtn.innerText = '☀️';
}
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  if (document.body.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
    themeBtn.innerText = '☀️';
  } else {
    localStorage.setItem('theme', 'light');
    themeBtn.innerText = '🌙';
  }
});

// Initialize
loadSnippets();

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
