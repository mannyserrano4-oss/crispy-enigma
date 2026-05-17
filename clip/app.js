// --- 1. INITIALIZATION & STATE ---
let snippets = [];

// Seed defaults if the app is opened for the very first time
const defaultSnippets = [
  { title: 'MAS Info', text: 'MAS Barbery - Mobile Barbering. Contact: Manuel at (555) 555-5555', category: 'barbering' },
  { title: 'Ecolab Arrival', text: 'Hello [NAME], this is Manuel with Ecolab. I will be arriving at [ADDRESS] on [DATE] around [TIME] for your service.', category: 'professional' },
  { title: 'Gig Promo', text: 'I am performing at Comic\'s Night Out on [DATE]! Come through, show starts at [TIME].', category: 'comedy' },
  { title: 'Service Proposal', text: 'Proposal for [NAME]: Service at [ADDRESS] on [DATE]. Rate is $[AMOUNT].', category: 'proposals' }
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
}

function saveSnippets() {
  localStorage.setItem('mySnippets', JSON.stringify(snippets));
}

// --- 2. RENDERING THE UI ---
function renderSnippets() {
  const container = document.getElementById('snippet-container');
  container.innerHTML = '';

  // Group snippets by category
  const categories = [...new Set(snippets.map(s => s.category))];

  categories.forEach(cat => {
    // Create Section
    const section = document.createElement('div');
    section.className = 'category-section';
    
    // Create Title
    const title = document.createElement('div');
    title.className = 'category-title';
    title.innerText = cat;
    section.appendChild(title);

    // Create Grid
    const grid = document.createElement('div');
    grid.className = 'grid';

    // Add buttons for this category
    snippets.filter(s => s.category === cat).forEach(snippet => {
      const btn = document.createElement('button');
      btn.className = `snippet-card cat-${cat}`;
      btn.innerText = snippet.title;
      btn.addEventListener('click', () => handleSnippetClick(snippet));
      grid.appendChild(btn);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

// --- 3. HANDLING CLICKS & DYNAMIC VARIABLES ---
async function handleSnippetClick(snippet) {
  let finalText = snippet.text;

  // Regex to find anything in brackets, e.g., [NAME], [DATE]
  const bracketRegex = /\[([^\]]+)\]/g;
  const matches = finalText.match(bracketRegex);

  if (matches) {
    // Deduplicate matches so we only ask for [NAME] once if used twice
    const uniqueVariables = [...new Set(matches)];
    
    for (let variable of uniqueVariables) {
      let userInput = prompt(`Enter value for ${variable}:`);
      if (userInput === null) return; // User hit cancel
      
      // Replace ALL instances of that variable in the text
      finalText = finalText.split(variable).join(userInput);
    }
  }

  // Copy to clipboard
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

// --- 4. MODALS & ADDING SNIPPETS ---
document.getElementById('btn-add').addEventListener('click', () => document.getElementById('modal-add').classList.remove('hidden'));
document.getElementById('btn-settings').addEventListener('click', () => document.getElementById('modal-settings').classList.remove('hidden'));

// Close modals
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.closest('.modal').classList.add('hidden');
  });
});

// Save New Snippet
document.getElementById('btn-save-snippet').addEventListener('click', () => {
  const title = document.getElementById('input-title').value.trim();
  const category = document.getElementById('input-category').value;
  const text = document.getElementById('input-text').value.trim();

  if (!title || !text) return alert("Title and text are required!");

  snippets.push({ title, category, text });
  saveSnippets();
  renderSnippets();
  
  // Clear and close
  document.getElementById('input-title').value = '';
  document.getElementById('input-text').value = '';
  document.getElementById('modal-add').classList.add('hidden');
});

// --- 5. BACKUP & RESTORE ---
// Export
document.getElementById('btn-backup').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snippets));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "snippets_backup.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});

// Import
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

// Clear All
document.getElementById('btn-clear-all').addEventListener('click', () => {
  if (confirm("Are you sure? This will delete all snippets from this device.")) {
    snippets = [];
    saveSnippets();
    renderSnippets();
    document.getElementById('modal-settings').classList.add('hidden');
  }
});

// --- 6. THEME TOGGLE ---
const themeBtn = document.getElementById('btn-theme');
// Check local storage for theme preference
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

// Start app
loadSnippets();

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
