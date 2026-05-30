// --- 1. INITIALIZATION & STATE ---
let snippets = [];

function loadSnippets() {
  const saved = localStorage.getItem('mySnippets');
  if (saved) {
    snippets = JSON.parse(saved);
    // Ensure all imported snippets have a unique ID
    snippets = snippets.map(s => s.id ? s : { ...s, id: Date.now() + Math.random() });
  } else {
    // Seed defaults for the first time
    snippets = [
      { id: 1, title: '✂️ Intro', text: 'MAS Barbery - Mobile Barbering. Contact: Manuel at (555) 555-5555.', category: '💈 Barbering' },
      { id: 2, title: '💼 Arrival', text: 'Hello [NAME], this is Manuel with Ecolab. I will be arriving at [ADDRESS] on [DATE] around [TIME] for your pest control service.', category: '🏢 Work' },
      { id: 3, title: '🎤 Open Mic Promo', text: 'I am performing at Comic\'s Night Out at Side Splitters on [DATE]! Come through, show starts at [TIME].', category: '🎭 Comedy' },
      { id: 4, title: '🏠 My Address', text: 'Town \'n\' Country, Tampa, FL [ZIP CODE]', category: '📌 Personal' },
      { id: 5, title: '📧 Work Email', text: 'manuel.[last]@ecolab.com', category: '🔗 Links & Info' }
    ];
    saveSnippets();
  }
  renderSnippets();
}

function saveSnippets() {
  localStorage.setItem('mySnippets', JSON.stringify(snippets));
}

// --- 2. CATEGORY MANAGEMENT ---
function getUniqueCategories() {
  return [...new Set(snippets.map(s => s.category))];
}

function updateCategoryDropdown() {
  const select = document.getElementById('select-category');
  select.innerHTML = '<option value="">-- Select Folder --</option>';
  
  getUniqueCategories().forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.innerText = cat;
    select.appendChild(option);
  });
  
  select.innerHTML += '<option value="NEW_FOLDER">➕ Create New Folder...</option>';
}

// Show/hide the custom folder input based on dropdown
document.getElementById('select-category').addEventListener('change', (e) => {
  const newCatInput = document.getElementById('input-new-category');
  if (e.target.value === 'NEW_FOLDER') {
    newCatInput.classList.remove('hidden');
    newCatInput.focus();
  } else {
    newCatInput.classList.add('hidden');
    newCatInput.value = '';
  }
});

function renameFolder(oldName) {
  const newName = prompt(`Rename folder "${oldName}" to:`, oldName);
  if (!newName || newName.trim() === '' || newName === oldName) return;
  
  snippets.forEach(s => {
    if (s.category === oldName) s.category = newName.trim();
  });
  
  saveSnippets();
  renderSnippets(document.getElementById('input-search').value);
}

// --- 3. RENDERING THE UI ---
function renderSnippets(filterText = '') {
  const container = document.getElementById('snippet-container');
  const recentContainer = document.getElementById('recent-container');
  
  container.innerHTML = '';
  recentContainer.innerHTML = '';

  const lowerFilter = filterText.toLowerCase();
  
  // A. RENDER RECENTLY USED (Only if not searching)
  if (!filterText) {
    const recentSnippets = [...snippets]
      .filter(s => s.lastUsed)
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, 5); // Get top 5

    const recentSection = document.createElement('div');
    recentSection.className = 'recent-section';
    recentSection.innerHTML = '<div class="category-title">⏱️ Recently Used</div>';
    
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'recent-scroll';
    
    // Check if we have recents to show
    if (recentSnippets.length > 0) {
      recentSnippets.forEach(snippet => {
        const btn = document.createElement('button');
        btn.className = `snippet-card`;
        btn.innerText = snippet.title;
        btn.addEventListener('click', () => openSnippetModal(snippet));
        scrollDiv.appendChild(btn);
      });
    } else {
      // The Placeholder!
      const placeholder = document.createElement('div');
      placeholder.className = 'empty-recent';
      placeholder.innerText = 'Nothing copied yet!';
      scrollDiv.appendChild(placeholder);
    }
    
    recentSection.appendChild(scrollDiv);
    recentContainer.appendChild(recentSection);
  }

  // B. RENDER FOLDERS & SNIPPETS
  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(lowerFilter) || 
    s.text.toLowerCase().includes(lowerFilter) ||
    s.category.toLowerCase().includes(lowerFilter)
  );

  const categories = [...new Set(filteredSnippets.map(s => s.category))];

  categories.forEach(cat => {
    const details = document.createElement('details');
    details.className = 'category-section';
    
    // Auto-open folders if searching
    if (filterText) details.open = true;

    const summary = document.createElement('summary');
    summary.className = 'category-title';
    
    const titleSpan = document.createElement('span');
    titleSpan.innerText = cat;
    titleSpan.style.flexGrow = '1';
    
    const editFolderBtn = document.createElement('button');
    editFolderBtn.className = 'edit-folder-btn';
    editFolderBtn.innerText = '✏️';
    editFolderBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevents folder from toggling open/closed
      renameFolder(cat);
    });

    summary.appendChild(titleSpan);
    summary.appendChild(editFolderBtn);
    details.appendChild(summary);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'details-content grid';

    filteredSnippets.filter(s => s.category === cat).forEach(snippet => {
      const btn = document.createElement('button');
      btn.className = `snippet-card`;
      
      const colors = ['var(--cat-personal)', 'var(--cat-professional)', 'var(--cat-barbering)', 'var(--cat-comedy)', 'var(--cat-proposals)'];
      btn.style.borderLeftColor = colors[cat.length % colors.length];
      
      btn.innerText = snippet.title;
      btn.addEventListener('click', () => openSnippetModal(snippet));
      contentDiv.appendChild(btn);
    });

    details.appendChild(contentDiv);
    container.appendChild(details);
  });
}

// Search Listener
document.getElementById('input-search').addEventListener('input', (e) => renderSnippets(e.target.value));


// --- 4. MODALS (ADD, EDIT, PREVIEW) ---
function openSnippetModal(snippet = null) {
  updateCategoryDropdown();
  const modal = document.getElementById('modal-snippet');
  const titleInput = document.getElementById('input-title');
  const selectCat = document.getElementById('select-category');
  const newCatInput = document.getElementById('input-new-category');
  const textInput = document.getElementById('input-text');
  const idInput = document.getElementById('input-id');
  const modalTitle = document.getElementById('modal-title');
  const copyBtnContainer = document.getElementById('action-copy-container');
  const deleteBtn = document.getElementById('btn-delete-snippet');

  newCatInput.classList.add('hidden'); // Reset

  if (snippet) {
    // Edit/Preview Mode
    modalTitle.innerText = "Preview & Edit";
    idInput.value = snippet.id;
    titleInput.value = snippet.title;
    selectCat.value = snippet.category;
    textInput.value = snippet.text;
    
    copyBtnContainer.classList.remove('hidden');
    deleteBtn.classList.remove('hidden');
    
    document.getElementById('btn-copy-snippet').onclick = () => executeCopy(snippet);

  } else {
    // Add New Mode
    modalTitle.innerText = "Add New Snippet";
    idInput.value = '';
    titleInput.value = '';
    selectCat.value = '';
    textInput.value = '';
    
    copyBtnContainer.classList.add('hidden');
    deleteBtn.classList.add('hidden');
  }

  modal.classList.remove('hidden');
}

// Buttons that open/close modals
document.getElementById('btn-add').addEventListener('click', () => openSnippetModal());
document.getElementById('btn-settings').addEventListener('click', () => document.getElementById('modal-settings').classList.remove('hidden'));

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', (e) => e.target.closest('.modal').classList.add('hidden'));
});


// --- 5. SAVING & DELETING SNIPPETS ---
document.getElementById('btn-save-snippet').addEventListener('click', () => {
  const id = document.getElementById('input-id').value;
  const title = document.getElementById('input-title').value.trim();
  const text = document.getElementById('input-text').value.trim();
  
  let category = document.getElementById('select-category').value;
  if (category === 'NEW_FOLDER') {
    category = document.getElementById('input-new-category').value.trim();
  }
  
  if (!title || !text) return alert("Title and text are required!");
  if (!category) category = "📁 Uncategorized";

  if (id) {
    // Update existing
    const index = snippets.findIndex(s => s.id.toString() === id);
    if (index > -1) {
      // Preserve lastUsed if it exists
      snippets[index] = { id: parseFloat(id), title, category, text, lastUsed: snippets[index].lastUsed };
    }
  } else {
    // Create new
    snippets.push({ id: Date.now(), title, category, text });
  }

  saveSnippets();
  renderSnippets(document.getElementById('input-search').value);
  document.getElementById('modal-snippet').classList.add('hidden');
});

document.getElementById('btn-delete-snippet').addEventListener('click', () => {
  if (!confirm("Delete this snippet?")) return;
  const id = document.getElementById('input-id').value;
  snippets = snippets.filter(s => s.id.toString() !== id);
  saveSnippets();
  renderSnippets(document.getElementById('input-search').value);
  document.getElementById('modal-snippet').classList.add('hidden');
});


// --- 6. COPY LOGIC & QUICK INSERT CHIPS ---
async function executeCopy(snippet) {
  let finalText = snippet.text;
  const bracketRegex = /\[([^\]]+)\]/g;
  const matches = finalText.match(bracketRegex);

  if (matches) {
    const uniqueVariables = [...new Set(matches)];
    for (let variable of uniqueVariables) {
      let userInput = prompt(`Enter value for ${variable}:`);
      if (userInput === null) return; // User canceled
      finalText = finalText.split(variable).join(userInput);
    }
  }

  try {
    await navigator.clipboard.writeText(finalText);
    
    // Force update the timestamp to move it to the Recent Row
    const index = snippets.findIndex(s => s.id === snippet.id);
    if (index > -1) {
      snippets[index].lastUsed = Date.now();
      saveSnippets();
      renderSnippets(document.getElementById('input-search').value);
    }
    
    document.getElementById('modal-snippet').classList.add('hidden');
    
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
  } catch (err) {
    alert('Failed to copy. Try again.');
  }
}

// Handle tapping a variable chip
document.querySelectorAll('.var-chip').forEach(chip => {
  chip.addEventListener('click', (e) => {
    const textarea = document.getElementById('input-text');
    const insertText = e.target.innerText;
    
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    
    textarea.value = textarea.value.substring(0, startPos) + insertText + textarea.value.substring(endPos);
    textarea.selectionStart = textarea.selectionEnd = startPos + insertText.length;
    textarea.focus();
  });
});


// --- 7. BACKUP, RESTORE & SETTINGS ---
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
        // Ensure imported items have IDs
        snippets = snippets.map(s => s.id ? s : { ...s, id: Date.now() + Math.random() });
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

document.getElementById('btn-clear-all').addEventListener('click', () => {
  if (confirm("Are you sure? This will delete all snippets from this device.")) {
    snippets = [];
    saveSnippets();
    renderSnippets();
    document.getElementById('modal-settings').classList.add('hidden');
  }
});


// --- 8. THEME TOGGLE & STARTUP ---
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

// Boot the app!
loadSnippets();

// Register Offline Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
