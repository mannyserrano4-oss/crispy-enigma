// --- 1. INITIALIZATION & STATE ---
let snippets = [];

function loadSnippets() {
  const saved = localStorage.getItem('mySnippets');
  if (saved) {
    snippets = JSON.parse(saved);
    snippets = snippets.map(s => s.id ? s : { ...s, id: Date.now() + Math.random() });
    
    // --- AUTO-PURGE LOGIC ---
    // Remove anything in the trash older than 30 days
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    snippets = snippets.filter(s => !s.deletedAt || (now - s.deletedAt < THIRTY_DAYS_MS));
    saveSnippets();
    
  } else {
    snippets = [
      { id: 1, title: '✂️ Intro', text: 'MAS Barbery - Mobile Barbering. Contact: Manuel at (555) 555-5555.', category: '💈 Barbering' },
      { id: 2, title: '💼 Arrival', text: 'Hello [NAME], this is Manuel with Ecolab. I will be arriving at [ADDRESS] on [DATE] around [TIME] for your pest control service.', category: '🏢 Work' },
      { id: 3, title: '🎤 Open Mic Promo', text: 'I am performing at Comic\'s Night Out at Side Splitters on [DATE]! Come through, show starts at [TIME].', category: '🎭 Comedy' },
      { id: 4, title: '🏠 My Address', text: 'Town \'n\' Country, Tampa, FL [ZIP CODE]', category: '📌 Personal' }
    ];
    saveSnippets();
  }
  renderSnippets();
}

function saveSnippets() {
  localStorage.setItem('mySnippets', JSON.stringify(snippets));
}

// Ensure we only process ACTIVE (non-deleted) snippets for the main UI
function getActiveSnippets() {
  return snippets.filter(s => !s.deletedAt);
}

// --- 2. CATEGORY MANAGEMENT ---
function getUniqueCategories() {
  return [...new Set(getActiveSnippets().map(s => s.category))];
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
    if (s.category === oldName && !s.deletedAt) s.category = newName.trim();
  });
  saveSnippets();
  renderSnippets(document.getElementById('input-search').value);
}

// --- 3. RENDERING THE MAIN UI ---
function renderSnippets(filterText = '') {
  const container = document.getElementById('snippet-container');
  const recentContainer = document.getElementById('recent-container');
  container.innerHTML = '';
  recentContainer.innerHTML = '';

  const lowerFilter = filterText.toLowerCase();
  const activeSnippets = getActiveSnippets();
  
  if (!filterText) {
    const recentSnippets = [...activeSnippets]
      .filter(s => s.lastUsed)
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, 5);

    const recentSection = document.createElement('div');
    recentSection.className = 'recent-section';
    recentSection.innerHTML = '<div class="category-title">⏱️ Recently Used</div>';
    
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'recent-scroll';
    
    if (recentSnippets.length > 0) {
      recentSnippets.forEach(snippet => {
        const btn = document.createElement('button');
        btn.className = `snippet-card`;
        btn.innerText = snippet.title;
        btn.addEventListener('click', () => openSnippetModal(snippet));
        scrollDiv.appendChild(btn);
      });
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'empty-recent';
      placeholder.innerText = 'Nothing copied yet!';
      scrollDiv.appendChild(placeholder);
    }
    
    recentSection.appendChild(scrollDiv);
    recentContainer.appendChild(recentSection);
  }

  const filteredSnippets = activeSnippets.filter(s => 
    s.title.toLowerCase().includes(lowerFilter) || 
    s.text.toLowerCase().includes(lowerFilter) ||
    s.category.toLowerCase().includes(lowerFilter)
  );

  const categories = [...new Set(filteredSnippets.map(s => s.category))];

  categories.forEach(cat => {
    const details = document.createElement('details');
    details.className = 'category-section';
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
      e.preventDefault(); 
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

document.getElementById('input-search').addEventListener('input', (e) => renderSnippets(e.target.value));

// --- 4. TRASH UI LOGIC ---
function renderTrash() {
  const container = document.getElementById('trash-container');
  container.innerHTML = '';
  
  const trashedSnippets = snippets.filter(s => s.deletedAt).sort((a, b) => b.deletedAt - a.deletedAt);
  
  if (trashedSnippets.length === 0) {
    container.innerHTML = '<p class="empty-recent">Trash is empty.</p>';
    return;
  }

  trashedSnippets.forEach(snippet => {
    const item = document.createElement('div');
    item.className = 'trash-item';

    // Calculate days remaining before auto-purge
    const daysSinceDeleted = (Date.now() - snippet.deletedAt) / (1000 * 60 * 60 * 24);
    const daysRemaining = Math.max(1, Math.ceil(30 - daysSinceDeleted));

    const infoDiv = document.createElement('div');
    infoDiv.className = 'trash-info';
    infoDiv.innerHTML = `<span class="trash-title">${snippet.title}</span><span class="trash-days">${daysRemaining} days left</span>`;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'trash-actions';

    // Restore Button
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'icon-action-btn';
    restoreBtn.innerText = '♻️';
    restoreBtn.title = "Restore Snippet";
    restoreBtn.addEventListener('click', () => {
      delete snippet.deletedAt; // Remove the soft-delete flag
      saveSnippets();
      renderSnippets();
      renderTrash(); // Refresh the modal
    });

    // Hard Delete Button
    const nukeBtn = document.createElement('button');
    nukeBtn.className = 'icon-action-btn';
    nukeBtn.innerText = '❌';
    nukeBtn.title = "Delete Forever";
    nukeBtn.addEventListener('click', () => {
      if (confirm(`Permanently delete "${snippet.title}"? This cannot be undone.`)) {
        snippets = snippets.filter(s => s.id !== snippet.id);
        saveSnippets();
        renderTrash();
      }
    });

    actionsDiv.appendChild(restoreBtn);
    actionsDiv.appendChild(nukeBtn);
    
    item.appendChild(infoDiv);
    item.appendChild(actionsDiv);
    container.appendChild(item);
  });
}

document.getElementById('btn-trash-modal').addEventListener('click', () => {
  renderTrash();
  document.getElementById('modal-trash').classList.remove('hidden');
});

// --- 5. MODALS (ADD/EDIT) ---
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

  newCatInput.classList.add('hidden');

  if (snippet) {
    modalTitle.innerText = "Preview & Edit";
    idInput.value = snippet.id;
    titleInput.value = snippet.title;
    selectCat.value = snippet.category;
    textInput.value = snippet.text;
    copyBtnContainer.classList.remove('hidden');
    deleteBtn.classList.remove('hidden');
    document.getElementById('btn-copy-snippet').onclick = () => executeCopy(snippet);
  } else {
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

document.getElementById('btn-add').addEventListener('click', () => openSnippetModal());

// --- 6. SAVING & SOFT DELETING ---
document.getElementById('btn-save-snippet').addEventListener('click', () => {
  const id = document.getElementById('input-id').value;
  const title = document.getElementById('input-title').value.trim();
  const text = document.getElementById('input-text').value.trim();
  
  let category = document.getElementById('select-category').value;
  if (category === 'NEW_FOLDER') category = document.getElementById('input-new-category').value.trim();
  if (!title || !text) return alert("Title and text are required!");
  if (!category) category = "📁 Uncategorized";

  if (id) {
    const index = snippets.findIndex(s => s.id.toString() === id);
    if (index > -1) {
      snippets[index] = { id: parseFloat(id), title, category, text, lastUsed: snippets[index].lastUsed, deletedAt: snippets[index].deletedAt };
    }
  } else {
    snippets.push({ id: Date.now(), title, category, text });
  }

  saveSnippets();
  renderSnippets(document.getElementById('input-search').value);
  document.getElementById('modal-snippet').classList.add('hidden');
});

// SOFT DELETE LOGIC
document.getElementById('btn-delete-snippet').addEventListener('click', () => {
  if (!confirm("Move this snippet to the Trash?")) return;
  const id = document.getElementById('input-id').value;
  const index = snippets.findIndex(s => s.id.toString() === id);
  if (index > -1) {
    snippets[index].deletedAt = Date.now(); // Add the deleted timestamp
    saveSnippets();
    renderSnippets(document.getElementById('input-search').value);
  }
  document.getElementById('modal-snippet').classList.add('hidden');
});

// --- 7. COPY LOGIC & QUICK INSERT ---
async function executeCopy(snippet) {
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

// --- 8. SETTINGS & UTILS ---
document.getElementById('btn-settings').addEventListener('click', () => document.getElementById('modal-settings').classList.remove('hidden'));

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', (e) => e.target.closest('.modal').classList.add('hidden'));
});

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
  if (confirm("⚠️ Are you sure? This will permanently delete ALL active and trashed snippets from this device.")) {
    snippets = [];
    saveSnippets();
    renderSnippets();
    document.getElementById('modal-settings').classList.add('hidden');
  }
});

const themeBtn = document.getElementById('btn-theme');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeBtn.innerText = '☀️';
}
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  themeBtn.innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Boot the app
loadSnippets();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
