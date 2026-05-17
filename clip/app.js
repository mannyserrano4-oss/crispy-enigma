let snippets = [];

function loadSnippets() {
  const saved = localStorage.getItem('mySnippets');
  if (saved) {
    snippets = JSON.parse(saved);
    // Ensure old snippets get a unique ID
    snippets = snippets.map(s => s.id ? s : { ...s, id: Date.now() + Math.random() });
  } else {
    // Seed defaults
    snippets = [
      { id: 1, title: '✂️ Intro', text: 'MAS Barbery - Mobile Barbering. Contact: Manuel at (555) 555-5555.', category: '💈 Barbering' },
      { id: 2, title: '💼 Arrival', text: 'Hello [NAME], this is Manuel with Ecolab. I will be arriving at [ADDRESS] on [DATE] around [TIME].', category: '🏢 Work' },
      { id: 3, title: '🏠 My Address', text: 'Town \'n\' Country, Tampa, FL [ZIP CODE]', category: '📌 Personal' }
    ];
    saveSnippets();
  }
  renderSnippets();
}

function saveSnippets() {
  localStorage.setItem('mySnippets', JSON.stringify(snippets));
}

function getUniqueCategories() {
  return [...new Set(snippets.map(s => s.category))];
}

// Populate the Dropdown in the Modal
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

// Toggle "New Folder" text input based on dropdown choice
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

// Render UI (Includes Search Filtering)
function renderSnippets(filterText = '') {
  const container = document.getElementById('snippet-container');
  container.innerHTML = '';

  const lowerFilter = filterText.toLowerCase();
  
  // Filter snippets based on search
  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(lowerFilter) || 
    s.text.toLowerCase().includes(lowerFilter) ||
    s.category.toLowerCase().includes(lowerFilter)
  );

  const categories = [...new Set(filteredSnippets.map(s => s.category))];

  categories.forEach(cat => {
    const details = document.createElement('details');
    details.className = 'category-section';
    
    // If searching, auto-open folders to show results
    if (filterText) details.open = true;

    const summary = document.createElement('summary');
    summary.className = 'category-title';
    
    // Title text
    const titleSpan = document.createElement('span');
    titleSpan.innerText = cat;
    titleSpan.style.flexGrow = '1';
    
    // Edit folder pencil
    const editFolderBtn = document.createElement('button');
    editFolderBtn.className = 'edit-folder-btn';
    editFolderBtn.innerText = '✏️';
    editFolderBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Stop folder from collapsing
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
      // Clicking a card now OPENS THE PREVIEW/EDIT MODAL
      btn.addEventListener('click', () => openSnippetModal(snippet));
      contentDiv.appendChild(btn);
    });

    details.appendChild(contentDiv);
    container.appendChild(details);
  });
}

// Rename entire folder logic
function renameFolder(oldName) {
  const newName = prompt(`Rename folder "${oldName}" to:`, oldName);
  if (!newName || newName.trim() === '' || newName === oldName) return;
  
  snippets.forEach(s => {
    if (s.category === oldName) s.category = newName.trim();
  });
  
  saveSnippets();
  renderSnippets(document.getElementById('input-search').value);
}

// Search Listener
document.getElementById('input-search').addEventListener('input', (e) => {
  renderSnippets(e.target.value);
});

// --- Modal Logic (Unified Add/Edit/Preview) ---

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
    // EDIT / PREVIEW MODE
    modalTitle.innerText = "Preview & Edit";
    idInput.value = snippet.id;
    titleInput.value = snippet.title;
    selectCat.value = snippet.category;
    textInput.value = snippet.text;
    
    copyBtnContainer.classList.remove('hidden');
    deleteBtn.classList.remove('hidden');
    
    // Set up copy button for this specific snippet
    document.getElementById('btn-copy-snippet').onclick = () => executeCopy(snippet.text);

  } else {
    // ADD NEW MODE
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

// Open modal for NEW snippet
document.getElementById('btn-add').addEventListener('click', () => openSnippetModal());

// Save changes (New or Update)
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
      snippets[index] = { id: parseFloat(id), title, category, text };
    }
  } else {
    // Create new
    snippets.push({ id: Date.now(), title, category, text });
  }

  saveSnippets();
  renderSnippets(document.getElementById('input-search').value);
  document.getElementById('modal-snippet').classList.add('hidden');
});

// Delete Snippet
document.getElementById('btn-delete-snippet').addEventListener('click', () => {
  if (!confirm("Delete this snippet?")) return;
  const id = document.getElementById('input-id').value;
  snippets = snippets.filter(s => s.id.toString() !== id);
  saveSnippets();
  renderSnippets(document.getElementById('input-search').value);
  document.getElementById('modal-snippet').classList.add('hidden');
});

// Execute Copy Logic
async function executeCopy(finalText) {
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
    document.getElementById('modal-snippet').classList.add('hidden'); // Close modal on success
    
    // Show Toast
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
  } catch (err) {
    alert('Failed to copy. Try again.');
  }
}

// Variable Chip Insertion (unchanged)
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

// Simple Modals and Theme (unchanged)
document.getElementById('btn-settings').addEventListener('click', () => document.getElementById('modal-settings').classList.remove('hidden'));
document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', (e) => e.target.closest('.modal').classList.add('hidden')));

const themeBtn = document.getElementById('btn-theme');
if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark'); themeBtn.innerText = '☀️'; }
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  themeBtn.innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

loadSnippets();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
