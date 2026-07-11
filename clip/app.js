// --- 1. INITIALIZATION & STATE ---
let snippets = [];
let vault = {}; 

function loadSnippets() {
  const saved = localStorage.getItem('mySnippets');
  if (saved) {
    snippets = JSON.parse(saved);
    snippets = snippets.map(s => s.id ? s : { ...s, id: Date.now() + Math.random() });
    
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    snippets = snippets.filter(s => !s.deletedAt || (Date.now() - s.deletedAt < THIRTY_DAYS_MS));
    saveSnippets();
  } else {
    snippets = [
      { id: 1, title: '✂️ Intro', text: 'MAS Barbery - Mobile Barbering. Contact: Manuel at (555) 555-5555.', category: '💈 Barbering' },
      { id: 2, title: '💼 Arrival', text: '[GREETING] [NAME], this is Manuel with Ecolab. I will be arriving at [ADDRESS] on [TODAY] around [NOW].', category: '🏢 Work' }
    ];
    saveSnippets();
  }
  
  const savedVault = localStorage.getItem('myVault');
  if (savedVault) {
    vault = JSON.parse(savedVault);
  } else {
    vault = {
      "NAME": [],
      "ADDRESS": ["Town 'n' Country, Tampa, FL", "Side Splitters Comedy Club"],
      "DATE": ["Today", "Tomorrow"],
      "TIME": ["Morning", "Afternoon", "Evening"],
      "PHONE": ["(555) 555-5555"],
      "EMAIL": ["manuel.serrano@ecolab.com"],
      "AMOUNT": [],
      "SERVICE": ["Haircut & Beard Trim", "Pest Control Routine Service"]
    };
    saveVault();
  }

  renderSnippets();
  renderQuickInsertChips(); 
}

function saveSnippets() { localStorage.setItem('mySnippets', JSON.stringify(snippets)); }
function saveVault() { localStorage.setItem('myVault', JSON.stringify(vault)); }
function getActiveSnippets() { return snippets.filter(s => !s.deletedAt); }
function getUniqueCategories() { return [...new Set(getActiveSnippets().map(s => s.category))]; }

// --- DYNAMIC QUICK INSERT CHIPS ---
function renderQuickInsertChips() {
  const container = document.getElementById('quick-insert-chips');
  if (!container) return;
  container.innerHTML = '';
  
  // Added the new Smart Tags to the top of the list!
  const smartVars = ['GREETING', 'TODAY', 'NOW'];
  const vaultVars = Object.keys(vault);
  const allVars = [...new Set([...smartVars, ...vaultVars])];
  
  allVars.forEach(v => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'var-chip';
    // Style smart tags slightly differently to distinguish them
    if (smartVars.includes(v)) {
      btn.style.backgroundColor = 'var(--primary)';
      btn.style.color = 'white';
    }
    btn.innerText = `[${v}]`;
    
    btn.addEventListener('click', () => {
      const textarea = document.getElementById('input-text');
      const insertText = btn.innerText;
      const startPos = textarea.selectionStart; 
      const endPos = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, startPos) + insertText + textarea.value.substring(endPos);
      textarea.selectionStart = textarea.selectionEnd = startPos + insertText.length;
      textarea.focus();
    });
    
    container.appendChild(btn);
  });
}

// --- NEW: SMART TAG PROCESSOR ---
function processSmartTags(text) {
  const now = new Date();
  const hours = now.getHours();
  
  let greeting = "Good evening";
  if (hours < 12) greeting = "Good morning";
  else if (hours < 17) greeting = "Good afternoon";

  const dateString = now.toLocaleDateString();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let processed = text;
  // Globally replace the exact smart tags silently
  processed = processed.replace(/\[GREETING\]/g, greeting);
  processed = processed.replace(/\[TODAY\]/g, dateString);
  processed = processed.replace(/\[NOW\]/g, timeString);
  
  return processed;
}

// --- CUSTOM MODAL UTILITIES ---
function asyncConfirm(message, confirmBtnText = "Yes", isDanger = true) {
  return new Promise(resolve => {
    document.getElementById('confirm-msg').innerText = message;
    const btnYes = document.getElementById('btn-confirm-yes');
    btnYes.innerText = confirmBtnText;
    btnYes.className = isDanger ? 'danger-btn' : 'primary-btn';
    document.getElementById('modal-confirm').classList.remove('hidden');

    const cleanup = () => {
      document.getElementById('modal-confirm').classList.add('hidden');
      btnYes.removeEventListener('click', handleYes);
      document.getElementById('btn-confirm-no').removeEventListener('click', handleNo);
    };

    const handleYes = () => { cleanup(); resolve(true); };
    const handleNo = () => { cleanup(); resolve(false); };

    btnYes.addEventListener('click', handleYes);
    document.getElementById('btn-confirm-no').addEventListener('click', handleNo);
  });
}

function asyncPrompt(message, defaultVal = "") {
  return new Promise(resolve => {
    document.getElementById('prompt-msg').innerText = message;
    const input = document.getElementById('input-single-prompt');
    input.value = defaultVal;
    document.getElementById('modal-single-prompt').classList.remove('hidden');
    setTimeout(() => input.focus(), 100);

    const form = document.getElementById('form-single-prompt');
    const newForm = form.cloneNode(true);
    form.replaceWith(newForm);

    document.getElementById('btn-prompt-cancel').addEventListener('click', () => {
      document.getElementById('modal-single-prompt').classList.add('hidden');
      resolve(null);
    }, {once: true});

    newForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = newForm.querySelector('input').value;
      document.getElementById('modal-single-prompt').classList.add('hidden');
      resolve(val);
    });
  });
}

// --- VAULT MANAGEMENT ---
function renderVault() {
  const container = document.getElementById('vault-container');
  container.innerHTML = '';

  Object.keys(vault).forEach(category => {
    const section = document.createElement('div');
    section.className = 'vault-section';
    
    const header = document.createElement('div');
    header.className = 'vault-section-title';
    header.innerHTML = `<span>[${category}]</span><button class="delete-vault-opt" title="Delete entire category">🗑️</button>`;
    
    header.querySelector('button').addEventListener('click', async () => {
      if (await asyncConfirm(`Delete the variable [${category}] and all its options?`)) {
        delete vault[category];
        saveVault(); renderVault(); renderQuickInsertChips();
      }
    });
    section.appendChild(header);

    vault[category].forEach((option, index) => {
      const optDiv = document.createElement('div');
      optDiv.className = 'vault-option-item';
      optDiv.innerHTML = `<span>${option}</span><button class="delete-vault-opt" title="Remove option">❌</button>`;
      optDiv.querySelector('button').addEventListener('click', () => {
        vault[category].splice(index, 1);
        saveVault(); renderVault();
      });
      section.appendChild(optDiv);
    });

    const addRow = document.createElement('div');
    addRow.className = 'add-vault-row';
    addRow.innerHTML = `<input type="text" placeholder="Add option..." id="input-new-opt-${category}"><button class="primary-btn">Add</button>`;
    addRow.querySelector('button').addEventListener('click', () => {
      const input = document.getElementById(`input-new-opt-${category}`);
      const val = input.value.trim();
      if (val) {
        vault[category].push(val);
        saveVault(); renderVault();
      }
    });
    section.appendChild(addRow);
    container.appendChild(section);
  });
}

document.getElementById('btn-manage-vault').addEventListener('click', () => {
  renderVault();
  document.getElementById('modal-vault').classList.remove('hidden');
  document.getElementById('modal-settings').classList.add('hidden'); 
});

document.getElementById('btn-add-vault-cat').addEventListener('click', () => {
  let newCat = document.getElementById('input-new-vault-cat').value.trim().toUpperCase();
  newCat = newCat.replace(/\[|\]/g, ''); 
  
  if (!newCat) return;
  if (vault[newCat]) return alert("Variable already exists!");
  
  vault[newCat] = [];
  saveVault();
  renderVault();
  renderQuickInsertChips(); 
  document.getElementById('input-new-vault-cat').value = '';
});

// --- CATEGORY MANAGEMENT ---
function updateCategoryDropdown() {
  const select = document.getElementById('select-category');
  select.innerHTML = '<option value="">-- Select Folder --</option>';
  getUniqueCategories().forEach(cat => {
    const option = document.createElement('option');
    option.value = cat; option.innerText = cat; select.appendChild(option);
  });
  select.innerHTML += '<option value="NEW_FOLDER">➕ Create New Folder...</option>';
}

document.getElementById('select-category').addEventListener('change', (e) => {
  const newCatInput = document.getElementById('input-new-category');
  if (e.target.value === 'NEW_FOLDER') {
    newCatInput.classList.remove('hidden'); newCatInput.focus();
  } else {
    newCatInput.classList.add('hidden'); newCatInput.value = '';
  }
});

async function renameFolder(oldName) {
  const newName = await asyncPrompt(`Rename folder "${oldName}" to:`, oldName);
  if (!newName || newName.trim() === '' || newName === oldName) return;
  snippets.forEach(s => { if (s.category === oldName && !s.deletedAt) s.category = newName.trim(); });
  saveSnippets(); renderSnippets(document.getElementById('input-search').value);
}

// --- SWIPE-TO-REVEAL LOGIC ---
function createSnippetCard(snippet) {
  const wrapper = document.createElement('div');
  wrapper.className = 'swipe-container';
  
  const leftAction = document.createElement('button');
  leftAction.className = 'swipe-actions action-btn left-action';
  leftAction.innerText = '📋 Copy';
  leftAction.addEventListener('click', () => {
    btn.classList.add('snapping'); btn.style.transform = `translateX(0px)`; btn.dataset.open = "false";
    handleDispatch(snippet, 'copy');
  });
  
  const rightAction = document.createElement('button');
  rightAction.className = 'swipe-actions action-btn right-action';
  rightAction.innerText = '🗑️ Trash';
  rightAction.addEventListener('click', async () => {
    const confirmDelete = await asyncConfirm(`Move "${snippet.title}" to the Trash?`);
    if (confirmDelete) {
      const index = snippets.findIndex(s => s.id === snippet.id);
      if (index > -1) { snippets[index].deletedAt = Date.now(); saveSnippets(); renderSnippets(document.getElementById('input-search').value); }
    } else {
      btn.classList.add('snapping'); btn.style.transform = `translateX(0px)`; btn.dataset.open = "false";
    }
  });
  
  const btn = document.createElement('button');
  btn.className = 'snippet-card snapping';
  btn.dataset.open = "false"; 
  
  const colors = ['var(--cat-personal)', 'var(--cat-professional)', 'var(--cat-barbering)', 'var(--cat-comedy)', 'var(--cat-proposals)'];
  btn.style.borderLeftColor = colors[snippet.category.length % colors.length];
  btn.innerText = snippet.title;

  let startX = 0, startY = 0, isSwiping = false;

  btn.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    isSwiping = true; btn.classList.remove('snapping');
  }, { passive: true });

  btn.addEventListener('touchmove', e => {
    if (!isSwiping) return;
    let diffX = e.touches[0].clientX - startX; let diffY = e.touches[0].clientY - startY;
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
      isSwiping = false; if (btn.dataset.open === "false") btn.style.transform = `translateX(0px)`; return;
    }
    if (btn.dataset.open === "false") {
      if (diffX > 100) diffX = 100; if (diffX < -100) diffX = -100;
      btn.style.transform = `translateX(${diffX}px)`;
    }
  }, { passive: true });

  btn.addEventListener('touchend', e => {
    if (!isSwiping) return;
    let diffX = e.changedTouches[0].clientX - startX;
    btn.classList.add('snapping'); isSwiping = false;
    if (btn.dataset.open === "false") {
      if (diffX > 50) { btn.style.transform = `translateX(100px)`; btn.dataset.open = "right"; } 
      else if (diffX < -50) { btn.style.transform = `translateX(-100px)`; btn.dataset.open = "left"; } 
      else { btn.style.transform = `translateX(0px)`; }
    }
  });

  btn.addEventListener('click', () => {
    if (btn.dataset.open !== "false") {
      btn.classList.add('snapping'); btn.style.transform = `translateX(0px)`; btn.dataset.open = "false"; return;
    }
    openSnippetModal(snippet);
  });

  wrapper.appendChild(leftAction); wrapper.appendChild(rightAction); wrapper.appendChild(btn);
  return wrapper;
}

// --- RENDERING MAIN UI ---
function renderSnippets(filterText = '') {
  const container = document.getElementById('snippet-container');
  const recentContainer = document.getElementById('recent-container');
  container.innerHTML = ''; recentContainer.innerHTML = '';

  const lowerFilter = filterText.toLowerCase();
  const activeSnippets = getActiveSnippets();
  
  if (!filterText) {
    const recentSnippets = [...activeSnippets].filter(s => s.lastUsed).sort((a, b) => b.lastUsed - a.lastUsed).slice(0, 5);
    const recentSection = document.createElement('div');
    recentSection.className = 'recent-section';
    recentSection.innerHTML = '<div class="category-title">⏱️ Recently Used</div>';
    
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'recent-scroll';
    
    if (recentSnippets.length > 0) {
      recentSnippets.forEach(snippet => scrollDiv.appendChild(createSnippetCard(snippet)));
    } else {
      const placeholder = document.createElement('div'); placeholder.className = 'empty-recent';
      placeholder.innerText = 'Nothing copied yet!'; scrollDiv.appendChild(placeholder);
    }
    recentSection.appendChild(scrollDiv); recentContainer.appendChild(recentSection);
  }

  const filteredSnippets = activeSnippets.filter(s => 
    s.title.toLowerCase().includes(lowerFilter) || s.text.toLowerCase().includes(lowerFilter) || s.category.toLowerCase().includes(lowerFilter)
  );
  const categories = [...new Set(filteredSnippets.map(s => s.category))];

  categories.forEach(cat => {
    const details = document.createElement('details'); details.className = 'category-section';
    if (filterText) details.open = true;

    const summary = document.createElement('summary'); summary.className = 'category-title';
    const titleSpan = document.createElement('span'); titleSpan.innerText = cat; titleSpan.style.flexGrow = '1';
    
    const editFolderBtn = document.createElement('button'); editFolderBtn.className = 'edit-folder-btn';
    editFolderBtn.innerText = '✏️'; editFolderBtn.addEventListener('click', (e) => { e.preventDefault(); renameFolder(cat); });

    summary.appendChild(titleSpan); summary.appendChild(editFolderBtn); details.appendChild(summary);

    const contentDiv = document.createElement('div'); contentDiv.className = 'details-content grid';
    filteredSnippets.filter(s => s.category === cat).forEach(snippet => contentDiv.appendChild(createSnippetCard(snippet)));
    
    details.appendChild(contentDiv); container.appendChild(details);
  });
}

document.getElementById('input-search').addEventListener('input', (e) => renderSnippets(e.target.value));

// --- TRASH UI ---
function renderTrash() {
  const container = document.getElementById('trash-container'); container.innerHTML = '';
  const trashedSnippets = snippets.filter(s => s.deletedAt).sort((a, b) => b.deletedAt - a.deletedAt);
  if (trashedSnippets.length === 0) return container.innerHTML = '<p class="empty-recent">Trash is empty.</p>';

  trashedSnippets.forEach(snippet => {
    const item = document.createElement('div'); item.className = 'trash-item';
    const daysRemaining = Math.max(1, Math.ceil(30 - ((Date.now() - snippet.deletedAt) / (1000 * 60 * 60 * 24))));
    
    const infoDiv = document.createElement('div'); infoDiv.className = 'trash-info';
    infoDiv.innerHTML = `<span class="trash-title">${snippet.title}</span><span class="trash-days">${daysRemaining} days left</span>`;

    const actionsDiv = document.createElement('div'); actionsDiv.className = 'trash-actions';
    const restoreBtn = document.createElement('button'); restoreBtn.className = 'icon-action-btn'; restoreBtn.innerText = '♻️';
    restoreBtn.addEventListener('click', () => { delete snippet.deletedAt; saveSnippets(); renderSnippets(); renderTrash(); });

    const nukeBtn = document.createElement('button'); nukeBtn.className = 'icon-action-btn'; nukeBtn.innerText = '❌';
    nukeBtn.addEventListener('click', async () => {
      if (await asyncConfirm(`Permanently delete "${snippet.title}"?`)) { 
        snippets = snippets.filter(s => s.id !== snippet.id); saveSnippets(); renderTrash(); 
      }
    });

    actionsDiv.appendChild(restoreBtn); actionsDiv.appendChild(nukeBtn);
    item.appendChild(infoDiv); item.appendChild(actionsDiv); container.appendChild(item);
  });
}

document.getElementById('btn-trash-modal').addEventListener('click', () => { renderTrash(); document.getElementById('modal-trash').classList.remove('hidden'); });

// --- MODALS (ADD/EDIT) ---
function openSnippetModal(snippet = null) {
  updateCategoryDropdown();
  const modal = document.getElementById('modal-snippet');
  const titleInput = document.getElementById('input-title');
  const selectCat = document.getElementById('select-category');
  const newCatInput = document.getElementById('input-new-category');
  const textInput = document.getElementById('input-text');
  const idInput = document.getElementById('input-id');
  const copyBtnContainer = document.getElementById('action-copy-container');
  const deleteBtn = document.getElementById('btn-delete-snippet');

  newCatInput.classList.add('hidden');

  if (snippet) {
    document.getElementById('modal-title').innerText = "Preview & Edit";
    idInput.value = snippet.id; titleInput.value = snippet.title; selectCat.value = snippet.category; textInput.value = snippet.text;
    copyBtnContainer.classList.remove('hidden'); deleteBtn.classList.remove('hidden');
    
    document.getElementById('btn-copy-snippet').onclick = () => handleDispatch(snippet, 'copy');
    document.getElementById('btn-sms-snippet').onclick = () => handleDispatch(snippet, 'sms');
    document.getElementById('btn-email-snippet').onclick = () => handleDispatch(snippet, 'email');
  } else {
    document.getElementById('modal-title').innerText = "Add New Snippet";
    idInput.value = ''; titleInput.value = ''; selectCat.value = ''; textInput.value = '';
    copyBtnContainer.classList.add('hidden'); deleteBtn.classList.add('hidden');
  }
  modal.classList.remove('hidden');
}

document.getElementById('btn-add').addEventListener('click', () => openSnippetModal());

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
    if (index > -1) snippets[index] = { id: parseFloat(id), title, category, text, lastUsed: snippets[index].lastUsed, deletedAt: snippets[index].deletedAt };
  } else {
    snippets.push({ id: Date.now(), title, category, text });
  }
  saveSnippets(); renderSnippets(document.getElementById('input-search').value); document.getElementById('modal-snippet').classList.add('hidden');
});

document.getElementById('btn-delete-snippet').addEventListener('click', async () => {
  if (await asyncConfirm("Move this snippet to the Trash?")) {
    const id = document.getElementById('input-id').value;
    const index = snippets.findIndex(s => s.id.toString() === id);
    if (index > -1) { snippets[index].deletedAt = Date.now(); saveSnippets(); renderSnippets(document.getElementById('input-search').value); }
    document.getElementById('modal-snippet').classList.add('hidden');
  }
});

// --- iOS COPY FALLBACK ---
async function robustCopy(text) {
  try { await navigator.clipboard.writeText(text); return true; } 
  catch (err) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text; textArea.style.position = "fixed"; textArea.style.opacity = "0";
      document.body.appendChild(textArea); textArea.focus(); textArea.select();
      const success = document.execCommand('copy'); document.body.removeChild(textArea);
      if (success) return true; throw new Error("Fallback failed");
    } catch (fallbackErr) {
      if (navigator.share) { navigator.share({ text: text }).catch(console.error); return false; } 
      else { alert("Clipboard blocked. Try again."); return false; }
    }
  }
}

// --- DISPATCH SYSTEM (WITH VAULT SUGGESTIONS & SMART TAGS) ---
function handleDispatch(snippet, actionType) {
  // 1. Process Smart Tags silently FIRST
  let textWithSmartTags = processSmartTags(snippet.text);

  // 2. Find any remaining brackets for the user to fill manually
  const matches = textWithSmartTags.match(/\[([^\]]+)\]/g);

  const executeFinalAction = async (finalText) => {
    const index = snippets.findIndex(s => s.id === snippet.id);
    if (index > -1) { snippets[index].lastUsed = Date.now(); saveSnippets(); renderSnippets(document.getElementById('input-search').value); }
    document.getElementById('modal-snippet').classList.add('hidden');

    if (actionType === 'copy') {
      if (await robustCopy(finalText)) {
        const toast = document.getElementById('toast'); toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
      }
    } 
    else if (actionType === 'sms') { window.location.href = `sms:&body=${encodeURIComponent(finalText)}`; } 
    else if (actionType === 'email') { window.location.href = `mailto:?body=${encodeURIComponent(finalText)}`; }
  };

  if (matches) {
    const uniqueVariables = [...new Set(matches)];
    const container = document.getElementById('fill-vars-container');
    container.innerHTML = ''; 

    uniqueVariables.forEach((v, index) => {
      const cleanVar = v.replace(/\[|\]/g, ''); 
      let chipHtml = '';
      
      if (vault[cleanVar] && vault[cleanVar].length > 0) {
        const chipButtons = vault[cleanVar].map(opt => {
          const safeOpt = opt.replace(/"/g, '&quot;'); 
          return `<button type="button" class="var-chip suggestion-chip" data-target="var-input-${index}" data-val="${safeOpt}">${opt}</button>`;
        }).join('');
        
        chipHtml = `<div class="var-chips-container" style="margin-top: 5px; margin-bottom: 0;"><div class="var-chips">${chipButtons}</div></div>`;
      }

      const div = document.createElement('div');
      div.style.display = 'flex'; div.style.flexDirection = 'column'; div.style.gap = '5px';
      div.innerHTML = `<label class="var-label">${v}</label><input type="text" data-var="${v}" required placeholder="Enter ${v}..." id="var-input-${index}">${chipHtml}`;
      container.appendChild(div);
    });

    container.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('data-target');
        const val = e.target.getAttribute('data-val');
        document.getElementById(targetId).value = val;
      });
    });

    document.getElementById('modal-fill-vars').classList.remove('hidden');
    setTimeout(() => document.getElementById('var-input-0').focus(), 100);

    const form = document.getElementById('form-fill-vars');
    const newForm = form.cloneNode(true);
    form.replaceWith(newForm);

    document.getElementById('btn-fill-cancel').addEventListener('click', () => {
      document.getElementById('modal-fill-vars').classList.add('hidden');
    }, {once: true});

    newForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let processedText = textWithSmartTags; // Start with the smart-tagged text
      const inputs = newForm.querySelectorAll('input');
      inputs.forEach(input => {
        processedText = processedText.split(input.getAttribute('data-var')).join(input.value);
      });
      document.getElementById('modal-fill-vars').classList.add('hidden');
      executeFinalAction(processedText); 
    });
  } else {
    // If no manual variables left, execute instantly
    executeFinalAction(textWithSmartTags);
  }
}

// --- SETTINGS & UTILS ---
document.getElementById('btn-settings').addEventListener('click', () => document.getElementById('modal-settings').classList.remove('hidden'));
document.querySelectorAll('.close-modal').forEach(btn => { btn.addEventListener('click', (e) => e.target.closest('.modal').classList.add('hidden')); });

document.getElementById('btn-backup').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snippets));
  const a = document.createElement('a'); a.href = dataStr; a.download = "snippets_backup.json"; document.body.appendChild(a); a.click(); a.remove();
});

document.getElementById('input-restore').addEventListener('change', (event) => {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      let imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        snippets = imported.map(s => s.id ? s : { ...s, id: Date.now() + Math.random() });
        saveSnippets(); renderSnippets(); renderQuickInsertChips(); alert('Restored!'); document.getElementById('modal-settings').classList.add('hidden');
      } else alert('Invalid file.');
    } catch (err) { alert('Error reading file.'); }
  };
  reader.readAsText(file);
});

document.getElementById('btn-clear-all').addEventListener('click', async () => {
  if (await asyncConfirm("⚠️ Factory Reset? All active and trashed snippets will be destroyed.", "Yes, Wipe Data")) {
    snippets = []; saveSnippets(); renderSnippets(); document.getElementById('modal-settings').classList.add('hidden');
  }
});

const themeBtn = document.getElementById('btn-theme');
if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark'); themeBtn.innerText = '☀️'; }
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  themeBtn.innerText = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

loadSnippets();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
