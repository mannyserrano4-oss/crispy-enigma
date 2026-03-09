// --- APP CONFIGURATION ---
const APP_CONFIG = {
    cutsRequiredForFree: 5 // ⚙️ Change this to 10 for "Every 10th Cut Free"
};

// --- DATA STATE ---
let clients = [];
let history = [];
let settings = { location: '' };
let activeId = null;
let activeFilter = 'all';
let isDark = false;
let viewArchives = false;
let selectedDisc = 'none'; 
let editInitialState = ""; 

const VIBE_TAGS = ['Mover', 'Sleeper', 'Gamer', 'Sci-fi', 'Fantasy', 'Fitness', 'Traveler', 'Tipper', 'Silent', 'Chill', 'Talkative', 'Sports', 'Family', 'Sensitive skin', 'No politics', 'Picky', 'Movie lover', 'Comedy', 'Foodie', 'Tricky Crown'];

// --- HELPERS ---
// --- NEW: PHONE NUMBER INPUT MASK ---
function applyPhoneMask(event) {
    let input = event.target;
    let x = input.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    if (!x[1]) {
        input.value = '';
        return;
    }
    input.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
}
// ------------------------------------

const getTodayIso = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

window.onerror = function(msg, url, line) {
    showCrashScreen(msg + " (Line " + line + ")");
    return false;
};

// --- CORE FUNCTIONS ---
function saveAll() {
    try {
        localStorage.setItem('bbClients', JSON.stringify(clients));
        localStorage.setItem('bbHistory', JSON.stringify(history));
        localStorage.setItem('bbSettings', JSON.stringify(settings));
    } catch (e) {
        alert("⚠️ STORAGE LIMIT REACHED! Data not saved. Please go to Settings, Export your Full Backup, and then Factory Reset to clear out old history.");
    }
}

try {
    const cRaw = localStorage.getItem('bbClients');
    const hRaw = localStorage.getItem('bbHistory');
    const sRaw = localStorage.getItem('bbSettings');
    if(cRaw) clients = JSON.parse(cRaw);
    if(hRaw) history = JSON.parse(hRaw);
    if(sRaw) settings = JSON.parse(sRaw);
} catch (e) {
    showCrashScreen("Data Corruption: " + e.message);
}

window.onload = () => {
    // Setup the UI dynamically based on the APP_CONFIG variable
    document.getElementById('lblLoyaltyEdit').innerText = `Points (0-${APP_CONFIG.cutsRequiredForFree - 1} ✂️)`;
    document.getElementById('eLoyalty').max = APP_CONFIG.cutsRequiredForFree - 1;
    document.getElementById('lblLoyaltyNote').innerText = `*Use this to manually fix mistakes. ${APP_CONFIG.cutsRequiredForFree} points automatically = 1 Banked Cut.`;

    render();
    document.getElementById('setLoc').value = settings.location || '';
    if(localStorage.getItem('theme') === 'dark') toggleTheme();
};

function openModal(id) { 
    const modalEl = document.getElementById(id);
    
    // NEW: Automatically snap all <details> drawers shut when opening a menu!
    modalEl.querySelectorAll('details').forEach(d => d.removeAttribute('open'));
    
    modalEl.style.display = 'flex'; 
    document.body.style.overflow = 'hidden';
}

function closeModal(id) { 
    document.getElementById(id).style.display = 'none'; 
    const openModals = document.querySelectorAll('.overlay[style*="display: flex"]');
    if (openModals.length === 0) {
        document.body.style.overflow = '';
    }
}

// --- NEW: UPGRADED DAILY BRIEFING LOGIC ---
function openBriefing() {
    const content = document.getElementById('briefingContent');
    const dateEl = document.getElementById('briefingDate');
    
    // Format today's date beautifully (e.g., "Monday, October 12")
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.innerText = new Date().toLocaleDateString(undefined, options);

    // 1. Calculate Yesterday's Take
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yIso = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
    const yTake = history.filter(h => h.date === yIso).reduce((sum, h) => sum + h.amount, 0);

    // 2. Filter Client Pipelines
    const active = clients.filter(c => !c.archived && !c.blacklisted);
    const overdue = active.filter(c => getStatus(c) === 'overdue');
    const due = active.filter(c => getStatus(c) === 'due');
    const bdays = active.filter(c => c.dob && isMonth(c.dob));
    
    // 3. Find 48-Hour Follow-Ups
    const todayDate = new Date(getTodayIso() + 'T00:00:00');
    const followUps = active.filter(c => {
        if (!c.last || !c.phone || c.lastCheckIn === c.last) return false;
        const lastDate = new Date(c.last + 'T00:00:00');
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        return diffDays === 2;
    });

    // Sort to show highest LTV (biggest spenders) first
    overdue.sort((a, b) => (b.spent || 0) - (a.spent || 0));
    due.sort((a, b) => (b.spent || 0) - (a.spent || 0));

    // Helper to format clickable names + VIP crowns
    const formatNames = (arr, max = 5, showVip = false) => {
        if (arr.length === 0) return `<span style="color:var(--text-sub); font-size:0.85rem; font-style:italic;">None right now.</span>`;
        const names = arr.slice(0, max).map(c => {
            let nameStr = c.name.split(' ')[0];
            if (showVip && (c.spent || 0) >= 200) nameStr += '👑'; // The VIP Radar
            return `<span onclick="closeModal('briefingModal'); showClient('${c.id}')" style="color:var(--p-blue-dark); text-decoration:underline; cursor:pointer;">${nameStr}</span>`;
        });
        let text = names.join(', ');
        if (arr.length > max) text += ` <span style="color:var(--text-sub); font-size:0.8rem;">(+${arr.length - max} more)</span>`;
        return `<span style="font-weight:700; font-size:0.95rem;">${text}</span>`;
    };

    // Build the visual HUD
    let html = `
        <div style="background:rgba(183, 228, 199, 0.2); border: 2px solid var(--p-green-dark); border-radius:16px; padding:15px; margin-bottom:15px; text-align:center;">
            <div style="color:var(--p-green-dark); font-weight:800; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;"><i class="fas fa-money-bill-wave"></i> Yesterday's Take</div>
            <div style="font-size:2.2rem; font-weight:900; color:var(--text-main);">$${yTake.toFixed(2)}</div>
        </div>
        
        <div style="background:rgba(162, 210, 255, 0.1); border: 1px solid var(--p-blue-dark); border-radius:16px; padding:15px; margin-bottom:15px;">
            <div style="color:var(--p-blue-dark); font-weight:800; font-size:0.75rem; text-transform:uppercase; margin-bottom:8px;"><i class="fas fa-comment"></i> 48-Hr Follow Ups (${followUps.length})</div>
            ${formatNames(followUps, 4)}
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
            <div style="background:rgba(255, 0, 84, 0.05); border: 1px solid var(--status-overdue); border-radius:16px; padding:15px;">
                <div style="color:var(--status-overdue); font-weight:800; font-size:0.75rem; text-transform:uppercase; margin-bottom:8px;"><i class="fas fa-exclamation-circle"></i> Overdue (${overdue.length})</div>
                ${formatNames(overdue, 4, true)}
            </div>
            <div style="background:rgba(255, 158, 0, 0.05); border: 1px solid var(--status-due); border-radius:16px; padding:15px;">
                <div style="color:var(--status-due); font-weight:800; font-size:0.75rem; text-transform:uppercase; margin-bottom:8px;"><i class="fas fa-clock"></i> Due (${due.length})</div>
                ${formatNames(due, 4)}
            </div>
        </div>

        <div style="background:rgba(255, 143, 171, 0.1); border: 1px solid var(--p-pink-dark); border-radius:16px; padding:15px; margin-bottom:15px;">
            <div style="color:var(--p-pink-dark); font-weight:800; font-size:0.75rem; text-transform:uppercase; margin-bottom:8px;"><i class="fas fa-birthday-cake"></i> Birthdays (${bdays.length})</div>
            ${formatNames(bdays, 6)}
        </div>
    `;

    content.innerHTML = html;
    openModal('briefingModal');
}
// --- END DAILY BRIEFING LOGIC ---

function openMoreMenu() {
    openModal('moreMenuModal');
}

// --- PERFORMANCE FIX: Decouple Math from Rendering ---
function render(search = null) {
    // If no search term is explicitly passed, grab whatever is currently in the search bar
    const currentSearch = search !== null ? search : (document.querySelector('.search-input').value || '');
    
    // Only recalculate metrics if NOT searching
    if (!currentSearch) {
        updateMetrics();
    }
    renderList(currentSearch);
}

function handleSearch(val) {
    // Show the X if there is text, hide it if empty
    document.getElementById('clearSearchIcon').style.display = val.length > 0 ? 'block' : 'none';
    
    // Skips updateMetrics() for lightning speed
    renderList(val);
}

// NEW: Instantly clears the search bar and re-renders
function clearSearch() {
    const input = document.getElementById('mainSearchInput');
    input.value = '';
    document.getElementById('clearSearchIcon').style.display = 'none';
    renderList('');
    input.focus(); // Keeps the keyboard open so you can quickly type a new name
}

function updateMetrics() {
    const totalRev = history.reduce((s, h) => s + (h.amount || 0), 0);
    const totalGive = clients.reduce((s, c) => s + (c.giveback || 0), 0);
    const todayStr = getTodayIso();
    const todayRev = history.filter(h => h.date === todayStr).reduce((s, h) => s + h.amount, 0);
    
    // Only count active clients (no archives, no blacklists)
    const activeClients = clients.filter(c => !c.archived && !c.blacklisted).length;

    document.getElementById('mToday').innerText = '$' + todayRev.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('mRev').innerText = '$' + totalRev.toLocaleString(undefined, {minimumFractionDigits: 2});
    document.getElementById('mGive').innerText = '$' + totalGive.toLocaleString(undefined, {minimumFractionDigits: 2});
    
    // Update the new pill
    if(document.getElementById('mClients')) {
        document.getElementById('mClients').innerText = activeClients;
    }
}

function renderList(search = '') {
    const list = document.getElementById('list');
    list.innerHTML = '';

    // --- NEW: Live Pipeline Counters (Archive & Blacklist Aware) ---
    let countAll = 0, countDue = 0, countOver = 0;
    clients.forEach(c => {
        // Matches the counter to whatever view you are currently in
        const isHidden = !!(c.archived || c.blacklisted);
        if (isHidden !== viewArchives) return; 

        countAll++;
        const stat = getStatus(c);
        if(stat === 'due') countDue++;
        if(stat === 'overdue') countOver++;
    });

    if(document.getElementById('tabAll')) document.getElementById('tabAll').innerText = `All (${countAll})`;
    if(document.getElementById('tabDue')) document.getElementById('tabDue').innerText = `Due (${countDue})`;
    if(document.getElementById('tabOverdue')) document.getElementById('tabOverdue').innerText = `Overdue (${countOver})`;
    // -----------------------------------

    let filtered = clients.filter(c => {
        if(search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
        
        // --- NEW: Pushes Blacklisted clients to the hidden view ---
        const isHidden = c.archived || c.blacklisted; 
        if (viewArchives) return isHidden === true;
        else if (isHidden === true) return false;

        if(!search && activeFilter === 'due') return getStatus(c) === 'due';

        if(!search && activeFilter === 'overdue') return getStatus(c) === 'overdue';
        return true;
    });

    if (activeFilter === 'all' || search) {
        filtered.sort((a,b) => a.name.localeCompare(b.name));
    } else {
        filtered.sort((a,b) => {
            const dateA = a.last || a.first || '2000-01-01';
            const dateB = b.last || b.first || '2000-01-01';
            return dateA.localeCompare(dateB); 
        });
    }

    // --- NEW: EMPTY STATES ---
    if (filtered.length === 0) {
        let emptyIcon = "fas fa-users";
        let emptyText = "No clients found.";
        let emptySub = "Try adjusting your search or add a new client.";

        if (search) {
            emptyIcon = "fas fa-search";
            emptyText = "No Matches Found";
            emptySub = `No one on the roster named "${search}".`;
        } else if (viewArchives) {
            emptyIcon = "fas fa-ghost";
            emptyText = "The Graveyard is Empty";
            emptySub = "No archived or blacklisted clients.";
        } else if (activeFilter === 'overdue') {
            emptyIcon = "fas fa-check-circle";
            emptyText = "Everyone is Caught Up!";
            emptySub = "No clients are currently overdue. Great retention! 🚀";
        } else if (activeFilter === 'due') {
            emptyIcon = "fas fa-calendar-check";
            emptyText = "No one due yet.";
            emptySub = "Your pipeline is looking clear.";
        } else if (activeFilter === 'all') {
            emptyIcon = "fas fa-user-plus";
            emptyText = "Your Book is Empty";
            emptySub = "Tap the + button below to add your first client.";
        }

        list.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; opacity: 0.6; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <i class="${emptyIcon}" style="font-size: 3.5rem; margin-bottom: 15px; color: var(--text-sub);"></i>
                <h3 style="margin: 0 0 8px 0; color: var(--text-main); font-weight: 800;">${emptyText}</h3>
                <p style="margin: 0; font-size: 0.9rem; color: var(--text-sub); line-height: 1.4;">${emptySub}</p>
            </div>
        `;
        
        // Triggers the 48-hr check even if the main list is empty, then stops the function
        renderConcierge(); 
        return; 
    }
    // --- END EMPTY STATES ---
    
    filtered.forEach(c => {
        const stat = getStatus(c);
        let badges = '';
        if(c.dob && isMonth(c.dob)) badges += `<span class="badge" style="color:var(--p-pink-dark)"><i class="fas fa-birthday-cake"></i></span>`;
        if(c.first && isAnniversary(c.first)) badges += `<span class="badge" style="color:var(--p-purple)"><i class="fas fa-medal"></i></span>`;
        if (c.spent >= 250) badges += `<span style="color:var(--p-gold); margin-left:5px;"><i class="fas fa-crown"></i></span>`;
        
        // --- NEW: TIP RADAR ---
        // If they have cuts, and their true average spend is at least $5 over their base price
        if (c.cuts > 0 && c.spent && c.price) {
            const avgSpend = c.spent / c.cuts;
            if (avgSpend >= c.price + 5) badges += `<span style="margin-left:5px; font-size:0.9rem;" title="Consistent Tipper">💸</span>`;
        }
        // ----------------------
        
        let flags = '';
        if(c.strikes > 0) flags = ' ' + '🚩'.repeat(Math.min(c.strikes, 3));

        const div = document.createElement('div');
        // Adds the 'blacklisted' class to paint it red
        div.className = `client-card ${c.blacklisted ? 'blacklisted' : stat}`;
        div.onclick = () => showClient(c.id);
        
        const skullFlag = c.blacklisted ? ' <span style="color:#d32f2f;">💀 DO NOT CUT</span>' : '';
        
        div.innerHTML = `
            <div class="cc-top">
                <div class="cc-name">${c.name} ${badges}${flags}${skullFlag}</div>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="cc-due">${getDueStr(c)}</div>
                    ${!c.blacklisted ? `<div onclick="event.stopPropagation(); activeId='${c.id}'; openCheckout();" style="background:var(--p-green); color:#000; width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; box-shadow: 0 2px 8px rgba(183, 228, 199, 0.4);"><i class="fas fa-cash-register"></i></div>` : ''}
                </div>
            </div>
            <div class="cc-info">Last: ${formatPretty(c.last)}</div>
            <div class="loyalty-visual">${getLoyaltyVisual(c.loyalty)}</div>
        `;
        list.appendChild(div);
    });
    
    renderConcierge(); // Fires the 48-hour check
}

// --- NEW: 48-HOUR CONCIERGE LOGIC ---
function renderConcierge() {
    const box = document.getElementById('conciergeBox');
    const listDiv = document.getElementById('conciergeList');
    if (!box) return;
    
    listDiv.innerHTML = '';
    const todayStr = getTodayIso();
    const todayDate = new Date(todayStr + 'T00:00:00');
    
    let found = 0;
    clients.forEach(c => {
        if (c.archived || c.blacklisted || !c.last || !c.phone) return;
        
        // NEW: Skips them if we already checked in for their most recent cut!
        if (c.lastCheckIn === c.last) return;
        
        const lastDate = new Date(c.last + 'T00:00:00');
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        
        // Exactly 2 days ago!
        if (diffDays === 2) {
            found++;
            const first = c.name.split(' ')[0];
            listDiv.innerHTML += `
                <div style="background:rgba(255,255,255,0.15); padding:10px 15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="color:#fff; font-weight:700; font-size:0.95rem;">${c.name}</span>
                    <button class="btn" style="background:#fff; color:var(--p-blue-dark); width:auto; padding:6px 15px; margin:0; font-size:0.8rem; box-shadow:none;" onclick="fireConcierge('${c.phone}', '${first}', this, '${c.id}')">Text</button>
                </div>
            `;
        }
    });
    
    box.style.display = found > 0 ? 'block' : 'none';
}

function fireConcierge(phone, first, btn, clientId) {
    const msg = `Yo ${first}, just checking in to make sure that cut is still sitting right and styling easy for you.`;
    
    // --- NEW: Save the check-in stamp to memory ---
    const c = getClient(clientId);
    if(c) {
        c.lastCheckIn = c.last; // Locks it to this specific haircut date
        saveAll();
    }
    // ----------------------------------------
    
    btn.innerText = 'Sent ✓';
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
    
    // Automatically hides their name from the radar after 1.5 seconds!
    setTimeout(() => {
        btn.parentElement.style.display = 'none';
    }, 1500);
    
    const ua = navigator.userAgent.toLowerCase();
    const sep = (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) ? '&' : '?';
    window.location.href = `sms:${phone}${sep}body=${encodeURIComponent(msg)}`;
}
// ------------------------------------

function showClient(id) {
    activeId = id;
    const c = getClient(id);
    let nameDisplay = c.name;
    if(c.strikes > 0) nameDisplay += ` (${c.strikes} Strike${c.strikes>1?'s':''})`;
    document.getElementById('vName').innerText = nameDisplay;
    // --- NEW: Phone Number Auto-Formatting ---
    let displayPhone = 'No Phone';
    if (c.phone) {
        const cleaned = ('' + c.phone).replace(/\D/g, ''); // Strips out dashes or spaces
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/); // Looks for exactly 10 digits
        displayPhone = match ? `(${match[1]}) ${match[2]}-${match[3]}` : c.phone;
    }
    document.getElementById('vSub').innerText = displayPhone;
    // -----------------------------------------
    document.getElementById('vFormula').innerText = c.formula || "No cut formula saved.";
    
    // --- NEW: DISPLAY LAST ADD-ONS ---
    const addonDiv = document.getElementById('vLastAddons');
    if (c.lastAddons && c.lastAddons.length > 0) {
        addonDiv.innerText = "Last Setup: " + c.lastAddons.join(', ');
        addonDiv.style.display = 'block';
    } else {
        addonDiv.style.display = 'none';
    }
    
    // --- NEW: LEDGER DISPLAY ---
    const ledgerBox = document.getElementById('vLedgerBox');
    const feeBox = document.getElementById('vPendingFee');
    const depBox = document.getElementById('vDeposit');
    
    if ((c.pendingFee && c.pendingFee > 0) || (c.deposit && c.deposit > 0)) {
        ledgerBox.style.display = 'block';
        if (c.pendingFee && c.pendingFee > 0) {
            feeBox.style.display = 'block';
            feeBox.innerText = `⚠️ Pending Fee: $${c.pendingFee.toFixed(2)} (${c.feeReason || 'Penalty'})`;
        } else feeBox.style.display = 'none';
        
        if (c.deposit && c.deposit > 0) {
            depBox.style.display = 'block';
            depBox.innerText = `✅ Deposit Paid: $${c.deposit.toFixed(2)}`;
        } else depBox.style.display = 'none';
    } else {
        ledgerBox.style.display = 'none';
    }
    // -----------------------------------------
    
    // --- NEW: Instagram Quick-Copy Logic ---
    const instaDisp = document.getElementById('vInstaDisplay');
    if(c.insta && c.insta.trim() !== '') {
        // This forces an @ symbol just in case you forgot to type it
        let handle = c.insta.startsWith('@') ? c.insta : '@' + c.insta;
        document.getElementById('vInstaText').innerText = handle;
        instaDisp.style.display = 'block';
        instaDisp.dataset.handle = handle; // Saves it invisibly for the copy function
    } else { 
        instaDisp.style.display = 'none'; 
    }

    // --- NEW: Expandable Notes Logic ---
    const notesCont = document.getElementById('vNotesContainer');
    if(c.notes && c.notes.trim() !== '') {
        document.getElementById('vNotesBox').innerText = c.notes;
        document.getElementById('vNotesBox').classList.remove('expanded'); // Resets it to collapsed
        notesCont.style.display = 'block';
    } else {
        notesCont.style.display = 'none';
    }
    
    let b = '';
    if(c.dob && isMonth(c.dob)) b += `<span style="background:var(--p-pink); color:black; padding:5px 10px; border-radius:10px; font-size:0.8rem; font-weight:bold;">🎂 Birthday Month</span>`;
    if(c.first && isAnniversary(c.first)) b += `<span style="background:var(--p-purple); color:black; padding:5px 10px; border-radius:10px; font-size:0.8rem; font-weight:bold;">🏅 Anniversary Month</span>`;
    document.getElementById('vBadges').innerHTML = b;

    const iceBox = document.getElementById('vIcebreaker');
    if(c.icebreaker && c.icebreaker.trim() !== '') {
        document.getElementById('vIceText').innerText = "Ask about: " + c.icebreaker;
        iceBox.style.display = 'flex';
    } else { iceBox.style.display = 'none'; }

    const tagDiv = document.getElementById('vTags');
    tagDiv.innerHTML = '';
    if(c.tags && c.tags.length > 0) {
        c.tags.forEach(t => { tagDiv.innerHTML += `<span class="tag-badge" data-vibe="${t}">${t}</span>`; });
    }

    document.getElementById('vLoyalty').innerText = getLoyaltyVisual(c.loyalty);
    document.getElementById('vCredit').innerText = `$${(c.credit||0).toFixed(2)}`;
    
    // --- NEW: Top Promoter Tracker ---
    // Scans the whole list to see who typed this client's name as a referral
    const refCount = clients.filter(x => x.refBy && x.refBy.toLowerCase() === c.name.toLowerCase()).length;
    const refDiv = document.getElementById('vRefCount');
    
    if (refCount > 0) {
        refDiv.innerText = `🏆 ${refCount} REFERRED`;
        refDiv.style.display = 'block';
    } else {
        refDiv.style.display = 'none';
    }
    document.getElementById('vTotalCuts').innerText = c.cuts||0;
    document.getElementById('vLTV').innerText = `$${(c.spent||0).toFixed(2)}`;
    
    document.getElementById('btnCall').href = `tel:${c.phone}`;
    document.getElementById('btnInsta').style.display = c.insta ? 'block' : 'none';
    document.getElementById('btnRemStrike').style.display = (c.strikes > 0) ? 'flex' : 'none';

    const emBtn = document.getElementById('btnEmail');
    if(c.email) { emBtn.style.display = 'flex'; emBtn.href = `mailto:${c.email}`; } else { emBtn.style.display = 'none'; }

    const navBtn = document.getElementById('btnNav');
    if (navBtn) {
        if (c.address && c.address.trim() !== '') {
            navBtn.style.display = 'flex';
            navBtn.href = `maps://?q=${encodeURIComponent(c.address)}`;
        } else { navBtn.style.display = 'none'; }
    }
    
    const arcBtn = document.getElementById('btnArchive');
    arcBtn.innerHTML = c.archived ? '<i class="fas fa-box-open"></i> Restore' : '<i class="fas fa-archive"></i> Archive';

    const blBtn = document.getElementById('btnBlacklist');
    blBtn.innerHTML = c.blacklisted ? '<i class="fas fa-undo"></i> Remove Blacklist' : '<i class="fas fa-skull"></i> Blacklist';
    
    // --- SECURITY SHUTDOWN IF BLACKLISTED ---
    const contactLinks = document.querySelectorAll('.c-btn');
    const chkBtn = document.getElementById('btnCheckout');
    const formulaBox = document.getElementById('vFormula');
    
    if (c.blacklisted) {
        contactLinks.forEach(link => { link.style.pointerEvents = 'none'; link.style.opacity = '0.3'; });
        if(chkBtn) chkBtn.style.display = 'none';
        
        // NEW: Shows the exact reason they were banned
        const reason = c.blacklistReason ? `\nReason: ${c.blacklistReason}` : '';
        formulaBox.innerText = `💀 BLACKLISTED${reason}`;
        
        formulaBox.style.color = "#d32f2f";
        formulaBox.style.borderColor = "#d32f2f";
    } else {
        contactLinks.forEach(link => { link.style.pointerEvents = 'auto'; link.style.opacity = '1'; });
        if(chkBtn) chkBtn.style.display = 'flex';
        formulaBox.style.color = "var(--p-blue-dark)";
        formulaBox.style.borderColor = "var(--p-blue)";
    }
    // -----------------------------------------

    openModal('viewModal');
}

async function toggleBlacklist() {
    const c = getClient(activeId);
    
    if (c.blacklisted) {
        if(await customConfirm("Remove from Blacklist?")) {
            c.blacklisted = false;
            c.blacklistReason = "";
            saveAll(); 
            closeModal('viewModal'); 
            render();
        }
    } else {
        if(await customConfirm("💀 BLACKLIST this client?\n\nThey will be painted red, moved to archives, and all checkout/text buttons will be disabled.")) {
            // NEW: Asks for the reason right before banning them
            const reason = await customPrompt("Why are they being blacklisted? (Optional)", "Reason...");
            if (reason === null) return; // Stop if they hit cancel

            c.blacklisted = true;
            c.archived = false; 
            c.blacklistReason = reason || "No reason provided.";
            saveAll(); 
            closeModal('viewModal'); 
            render();
        }
    }
}


// --- CHECKOUT & REVENUE ---

// Future-proof toggle function for when you start charging
function toggleAddon(el, priceBump) {
    el.classList.toggle('active');
    /* WHEN YOU ARE READY TO CHARGE: Delete the /* and * / around this block!
       let currentBase = parseFloat(document.getElementById('payPrice').value) || 0;
       if(el.classList.contains('active')) document.getElementById('payPrice').value = currentBase + priceBump;
       else document.getElementById('payPrice').value = currentBase - priceBump;
       calcTotal();
    */
}

function openCheckout() { 
    const c = getClient(activeId); 
    document.getElementById('payPrice').value = c.price || 35; 
    document.getElementById('payTip').value = 0; 
    document.getElementById('payDate').value = getTodayIso(); 
    document.getElementById('customDiscBox').style.display = 'none'; 
    
    // --- NEW: Reset and Auto-Select past Add-ons ---
    document.querySelectorAll('#checkoutAddons .addon-pill').forEach(p => {
        p.classList.remove('active');
        if (c.lastAddons && c.lastAddons.includes(p.innerText)) {
            p.classList.add('active'); // Smart memory!
        }
    });
    
    // NEW: Clears any extra cuts from the last person's checkout
    document.getElementById('multiCutBox').innerHTML = '';
    
    // --- NEW: LEDGER INTERCEPT UI ---
    const chkLedger = document.getElementById('chkLedgerBox');
    const chkFeeBox = document.getElementById('chkFeeBox');
    const chkDepBox = document.getElementById('chkDepBox');
    
    if ((c.pendingFee && c.pendingFee > 0) || (c.deposit && c.deposit > 0)) {
        chkLedger.style.display = 'block';
        if (c.pendingFee && c.pendingFee > 0) {
            chkFeeBox.style.display = 'flex';
            document.getElementById('chkFeeText').innerText = `⚠️ Fee: $${c.pendingFee.toFixed(2)} (${c.feeReason || 'Penalty'})`;
        } else chkFeeBox.style.display = 'none';
        
        if (c.deposit && c.deposit > 0) {
            chkDepBox.style.display = 'block';
            chkDepBox.innerText = `✅ Deposit Paid: -$${c.deposit.toFixed(2)}`;
        } else chkDepBox.style.display = 'none';
    } else {
        chkLedger.style.display = 'none';
    }
    // --------------------------------
    
    selectedDisc = 'none';
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + ((c.freq || 4) * 7));
    document.getElementById('sbDate').innerText = nextDate.toLocaleDateString(undefined, {month:'short', day:'numeric'});
    
    const opts = document.getElementById('discountList'); 
    opts.innerHTML = ''; 
    addOpt(opts, 'none', 'No Discount', true); 
    if((c.banked || 0) > 0) addOpt(opts, 'free', `Redeem 1 Free Cut (Banked: ${c.banked})`); 
    if((c.credit || 0) > 0) addOpt(opts, 'credit', `Redeem $5 Credit (Bal: $${c.credit})`); 
    
    const currentYear = new Date().getFullYear();
    
    // --- NEW: Separate checks for Birthday and Anniversary ---
    if (c.dob && isMonth(c.dob) && c.lastBdayYear !== currentYear) {
        addOpt(opts, 'bdayHalf', `Redeem 50% Off (Birthday)`);
    }
    if (c.first && isAnniversary(c.first) && c.lastAnniYear !== currentYear) {
        addOpt(opts, 'anniHalf', `Redeem 50% Off (Anniversary)`);
    }
    // -------------------------------------------------------- 
    
    addOpt(opts, 'custom', 'Custom % Discount'); 
    openModal('checkoutModal'); 
    calcTotal(); 
}

function addMultiCut() {
    const box = document.getElementById('multiCutBox');
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.innerHTML = `
        <input type="number" class="extra-cut-price" value="30" onchange="calcTotal()" inputmode="decimal" onfocus="this.select()" style="margin-bottom:0;">
        <button class="btn btn-red" style="width: auto; margin-bottom: 0; padding: 0 15px;" onclick="this.parentElement.remove(); calcTotal();"><i class="fas fa-trash"></i></button>
    `;
    box.appendChild(div);
    calcTotal();
}

function calcTotal() { 
    const c = getClient(activeId);
    const primary = parseFloat(document.getElementById('payPrice').value) || 0; 
    const tip = parseFloat(document.getElementById('payTip').value) || 0; 
    
    // --- NEW: Grab LEDGER Amounts ---
    const fee = c.pendingFee || 0;
    const dep = c.deposit || 0;
    
    // Sum up the adjustable extra cuts
    let extraTotal = 0;
    document.querySelectorAll('.extra-cut-price').forEach(input => {
        extraTotal += parseFloat(input.value) || 0;
    });
    
    const totalBase = primary + extraTotal;
    
    let discount = 0; 
    // Discounts apply to the primary cut specifically so you don't lose money on multi-cuts!
    if(selectedDisc === 'free') discount = primary; 
    if(selectedDisc === 'bdayHalf' || selectedDisc === 'anniHalf') discount = primary * 0.5; 
    if(selectedDisc === 'credit') discount = Math.min(totalBase, 5); 
    if(selectedDisc === 'custom') { 
        const pct = parseFloat(document.getElementById('payCustomPct').value) || 0; 
        discount = totalBase * (pct / 100); 
    } 
    
    const giveback = discount; 
    
    // Calculate final total including fees and deposits (preventing negative totals)
    const total = Math.max(0, (totalBase - discount) + tip + fee - dep); 
    
    const totEl = document.getElementById('payTotal');
    totEl.innerText = `$${total.toFixed(2)}`; 
    
    // Make total green if their deposit covered the whole cost
    if (dep > ((totalBase - discount) + tip + fee)) totEl.style.color = 'var(--p-green)';
    else totEl.style.color = 'var(--p-green-dark)';
    
    document.getElementById('givebackDisplay').innerText = `Giveback: $${giveback.toFixed(2)}`; 
    return { total, giveback };
}

// --- NEW: WAIVE FEE ---
function waiveFee() {
    const c = getClient(activeId);
    c.pendingFee = 0;
    c.feeReason = "";
    document.getElementById('chkFeeBox').style.display = 'none';
    if (!c.deposit || c.deposit <= 0) document.getElementById('chkLedgerBox').style.display = 'none';
    calcTotal();
    saveAll(); // Ensure it actually saves the waiver to the database
}

async function finalizeCut() {
    const c = getClient(activeId);
    const totals = calcTotal(); 

    let wasFreeFlag = false;
    let wasCreditFlag = false;

    if(selectedDisc === 'free') {
        c.banked = (c.banked || 0) - 1;
        wasFreeFlag = true;
    }
    if(selectedDisc === 'credit') {
        c.credit = Math.max(0, (c.credit || 0) - 5);
        wasCreditFlag = true;
    }
    
    // --- NEW: Locks the specific 50% discount so it can't be used twice a year ---
    const cutYear = parseInt(document.getElementById('payDate').value.split('-')[0]); // Safe Year extraction prevents UTC Timezone bugs
    // Must force 'null' instead of 'undefined' so JSON stringify doesn't erase the key!
    const prevBday = c.lastBdayYear === undefined ? null : c.lastBdayYear; 
    const prevAnni = c.lastAnniYear === undefined ? null : c.lastAnniYear;
    const prevLastDate = c.last === undefined ? null : c.last;
    
    if(selectedDisc === 'bdayHalf') {
        c.lastBdayYear = cutYear;
    }
    if(selectedDisc === 'anniHalf') {
        c.lastAnniYear = cutYear;
    }

   // Calculate how many cuts happened in this one transaction
    const extraCuts = document.querySelectorAll('.extra-cut-price').length;
    const totalCutsThisSession = 1 + extraCuts;
    
    // --- NEW: Grab selected Add-ons and save to profile ---
    const activeAddons = Array.from(document.querySelectorAll('#checkoutAddons .addon-pill.active')).map(x => x.innerText);
    c.lastAddons = activeAddons;

    c.spent = (c.spent || 0) + totals.total;
    c.giveback = (c.giveback || 0) + totals.giveback;
    c.cuts = (c.cuts || 0) + totalCutsThisSession;
    c.last = document.getElementById('payDate').value;

  // Calculate exactly how much money is exchanging hands BEFORE we wipe it
    const primary = parseFloat(document.getElementById('payPrice').value) || 0;
    const tip = parseFloat(document.getElementById('payTip').value) || 0;
    let extraTotal = 0;
    document.querySelectorAll('.extra-cut-price').forEach(inp => extraTotal += parseFloat(inp.value) || 0);
    
    const totalBase = primary + extraTotal;
    const discount = totals.giveback;
    
    const feeClearedAmt = c.pendingFee || 0;
    const originalDeposit = c.deposit || 0;
    const cutCostWithFees = (totalBase - discount) + tip + feeClearedAmt;
    const depositUsed = originalDeposit > cutCostWithFees ? cutCostWithFees : originalDeposit;

    // --- SMART UNDO TRACKING ---
    const txnId = Date.now().toString(); // Create a unique footprint
    history.push({
        txnId: txnId, 
        clientId: c.id,
        clientName: c.name + (extraCuts > 0 ? ` (+${extraCuts})` : ''),
        date: c.last,
        amount: totals.total,
        wasFree: wasFreeFlag,
        wasCredit: wasCreditFlag,
        givebackAmt: totals.giveback,
        cutsLogged: totalCutsThisSession, 
        feeCleared: feeClearedAmt, // Saves exactly what was waived
        clearedFeeReason: c.feeReason || "",
        depositUsed: depositUsed, // Saves exactly what was spent
        restoredBdayYear: prevBday,
        restoredAnniYear: prevAnni,
        restoredLastDate: prevLastDate
    });
    
    // --- CLEAR LEDGER ---
    c.pendingFee = 0;
    c.feeReason = "";
    c.deposit = originalDeposit - depositUsed;
    // -------------------------

    // Loyalty logic handling multiple cuts at once
    let earnedLoyalty = totalCutsThisSession;
    if(selectedDisc === 'free') earnedLoyalty -= 1; // The free cut doesn't earn a point, but the extra cuts do!

    if(earnedLoyalty > 0) {
        c.loyalty = (c.loyalty || 0) + earnedLoyalty;
        // Use a loop just in case they log enough cuts to bank multiple freebies at once
        while(c.loyalty >= APP_CONFIG.cutsRequiredForFree) {
            c.banked = (c.banked || 0) + 1;
            c.loyalty -= APP_CONFIG.cutsRequiredForFree;
            await customConfirm(`🎉 High Five! Client reached ${APP_CONFIG.cutsRequiredForFree} cuts. Free Cut banked.`);
        }
    }
    
    saveAll();
    closeModal('checkoutModal');
    closeModal('viewModal');
    render();
    
   // --- NEW: TRIGGER THE FLASH UNDO ---
    triggerFlashUndo(c.id, txnId);
}

async function smartBook() {
    await finalizeCut(); 
    const c = getClient(activeId);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + ((c.freq || 4) * 7));
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    const d = String(nextDate.getDate()).padStart(2, '0');
    document.getElementById('schedDate').value = `${y}-${m}-${d}T10:00`;
    openModal('schedModal');
}

function openWalkIn() {
    document.getElementById('wPrice').value = 35;
    document.getElementById('wTip').value = 0;
    openModal('walkInModal');
}

let lastWalkInObj = null;

function saveWalkIn() {
    const price = parseFloat(document.getElementById('wPrice').value) || 0;
    const tip = parseFloat(document.getElementById('wTip').value) || 0;
    const total = price + tip;

    if (total <= 0) return alert("Please enter an amount.");

   // 1. Log the temporary walk-in revenue
    const walkInTempId = 'walkin_' + Date.now();
    history.push({
        txnId: Date.now().toString(), // Added for data consistency
        clientId: walkInTempId,
        clientName: '🚶 Walk-In Client',
        date: getTodayIso(),
        amount: total,
        wasFree: false,
        wasCredit: false,
        givebackAmt: 0
    });
    saveAll();
    
    // 2. Clear out the converter boxes
    document.getElementById('wcName').value = '';
    document.getElementById('wcPhone').value = '';
    
   // 3. Save the exact ID AND txnId so we can overwrite it safely if they convert
    lastWalkInObj = {
        tempId: walkInTempId,
        txnId: history[history.length - 1].txnId, // Grabs the ID we just generated
        spent: total,
        basePrice: price
    };

    closeModal('walkInModal');
    render();
    
    // 4. Pop open the converter screen!
    openModal('walkInConvertModal');
}

async function convertWalkIn() {
    let rawName = document.getElementById('wcName').value.trim();
    const phone = document.getElementById('wcPhone').value.trim();
    
    if (!rawName) {
        await customConfirm("Please enter a name to convert.");
        return;
    }
    
    const cleanName = rawName.replace(/\b\w/g, char => char.toUpperCase());
    const newId = Date.now().toString();
    const todayStr = getTodayIso();
    
   // Grab the checkbox state BEFORE creating the profile
    const includeOffer = document.getElementById('wcOffer').checked;
    
    const newClient = {
        id: newId,
        name: cleanName,
        phone: phone,
        price: lastWalkInObj.basePrice || 35,
        cuts: 1,
        spent: lastWalkInObj.spent,
        first: todayStr,
        last: todayStr,
        freq: 4,
        loyalty: 1,
        banked: 0,
        strikes: 0,
        giveback: 0,
        credit: includeOffer ? 5 : 0, // Gives them the actual money
        archived: false
    };
    clients.push(newClient);
    
    // Retroactively rewrite the receipt to show their real name using the exact txnId!
    const histIndex = history.findIndex(h => h.txnId === lastWalkInObj.txnId);
    if (histIndex > -1) {
        history[histIndex].clientId = newId;
        history[histIndex].clientName = cleanName;
    }
    
    saveAll();
    closeModal('walkInConvertModal');
    render();
    
   if (phone) {
        const first = cleanName.split(' ')[0];
        const includeOffer = document.getElementById('wcOffer').checked;
        
        let msg = `Yo ${first}, welcome to MAS Barbery! Appreciate you stopping in today. Save this number, and let me know when you need your next cut. 💈`;
        
        // --- NEW: Appends the $5 Offer if the box is checked ---
        if (includeOffer) {
            msg = `Yo ${first}, welcome to MAS Barbery! Appreciate you stopping in today. Save this number. Hit me up for your next cut and I'll knock $5 off to welcome you to the roster. 💈`;
        }
        
        const ua = navigator.userAgent.toLowerCase();
        const isApple = ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1;
        const sep = isApple ? '&' : '?';
        
        window.location.href = `sms:${phone}${sep}body=${encodeURIComponent(msg)}`;
    }
}

// --- NEW: FLASH UNDO LOGIC ---
let undoTimer = null;
let lastTxnId = null;

function triggerFlashUndo(clientId, txnId) {
    lastTxnId = txnId;
    const banner = document.getElementById('flashUndoBanner');
    banner.style.display = 'flex';
    
    if(undoTimer) clearTimeout(undoTimer);
    
    // Hides the banner automatically after 5 seconds
    undoTimer = setTimeout(() => {
        banner.style.display = 'none';
    }, 5000);
}

function executeFlashUndo() {
    if(undoTimer) clearTimeout(undoTimer);
    document.getElementById('flashUndoBanner').style.display = 'none';
    
    // Securely find the exact transaction no matter how the array shifts
    const histIndex = history.findIndex(h => h.txnId === lastTxnId);
    
    if (histIndex > -1 && history[histIndex]) {
        const h = history[histIndex];
        const c = getClient(h.clientId);
        
        if(c) {
           // Silently reverse the money and cuts
            c.spent = Math.max(0, (c.spent || 0) - h.amount);
            c.giveback = Math.max(0, (c.giveback || 0) - (h.givebackAmt || 0));
            
            // Safely handles 0 cuts (like deposits) without JS reading 0 as false
            const cutsToReverse = h.cutsLogged !== undefined ? h.cutsLogged : 1;
            c.cuts = Math.max(0, (c.cuts || 0) - cutsToReverse);

            // If this was a standalone deposit, pull it out of their balance
            if (h.depositAdded) {
                c.deposit = Math.max(0, (c.deposit || 0) - h.depositAdded);
            }
            
            if (h.wasFree) {
                c.banked = (c.banked || 0) + 1;
            }
            if (h.wasCredit) {
                c.credit = (c.credit || 0) + 5;
            }
            // Reverse loyalty points cleanly
            let pointsToReverse = cutsToReverse;
            if (h.wasFree) pointsToReverse -= 1; // Free cut didn't give a point
           while(pointsToReverse > 0) {
                if (c.loyalty === 0 && (c.banked || 0) > 0) {
                    c.banked--;
                    c.loyalty = APP_CONFIG.cutsRequiredForFree - 1; // Dynamically loops back to max points
                } else {
                    c.loyalty = Math.max(0, (c.loyalty || 0) - 1);
                }
                pointsToReverse--;
            }
            
           // --- NEW: RESTORE LEDGER SAFELY ON UNDO ---
            if (h.feeCleared) {
                c.pendingFee = (c.pendingFee || 0) + h.feeCleared; // Safely adds the old fee back
                c.feeReason = h.clearedFeeReason || "Restored Fee";
            }
            if (h.depositUsed) c.deposit = (c.deposit || 0) + h.depositUsed; // Safely refunds the spent deposit without erasing newer ones
            if (h.restoredBdayYear !== undefined) c.lastBdayYear = h.restoredBdayYear;
            if (h.restoredAnniYear !== undefined) c.lastAnniYear = h.restoredAnniYear;
            if (h.restoredLastDate !== undefined) c.last = h.restoredLastDate;
        }
        // Erase the receipt from history
        history.splice(histIndex, 1);
        saveAll();
        render();
        
        // Immediately pop the checkout screen back open!
        activeId = h.clientId;
        openCheckout();
    }
}

// --- SMART UNDO FEATURE ---
async function deleteTransaction(idx) {
    const h = history[idx];
    if(await customConfirm(`Delete $${h.amount.toFixed(2)} entry for ${h.clientName}?\n\nThis will reverse their stats and loyalty.`)) {
        const c = getClient(h.clientId);
        if(c) {
            // Silently reverse the money and cuts
            c.spent = Math.max(0, (c.spent || 0) - h.amount);
            c.giveback = Math.max(0, (c.giveback || 0) - (h.givebackAmt || 0));
            
            // Safely handles 0 cuts (like deposits) without JS reading 0 as false
            const cutsToReverse = h.cutsLogged !== undefined ? h.cutsLogged : 1;
            c.cuts = Math.max(0, (c.cuts || 0) - cutsToReverse);

            // If this was a standalone deposit, pull it out of their balance
            if (h.depositAdded) {
                c.deposit = Math.max(0, (c.deposit || 0) - h.depositAdded);
            }
            
            if (h.wasFree) {
                c.banked = (c.banked || 0) + 1;
            }
            if (h.wasCredit) {
                c.credit = (c.credit || 0) + 5;
            }
            // Reverse loyalty points cleanly
            let pointsToReverse = cutsToReverse;
            if (h.wasFree) pointsToReverse -= 1; // Free cut didn't give a point
           while(pointsToReverse > 0) {
                if (c.loyalty === 0 && (c.banked || 0) > 0) {
                    c.banked--;
                    c.loyalty = APP_CONFIG.cutsRequiredForFree - 1; // Dynamically loops back to max points
                } else {
                    c.loyalty = Math.max(0, (c.loyalty || 0) - 1);
                }
                pointsToReverse--;
            }
            
            // --- NEW: RESTORE LEDGER SAFELY ON UNDO ---
            if (h.feeCleared) {
                c.pendingFee = (c.pendingFee || 0) + h.feeCleared; // Safely adds the old fee back
                c.feeReason = h.clearedFeeReason || "Restored Fee";
            }
            if (h.depositUsed) c.deposit = (c.deposit || 0) + h.depositUsed; // Safely refunds the spent deposit without erasing newer ones
            if (h.restoredBdayYear !== undefined) c.lastBdayYear = h.restoredBdayYear;
            if (h.restoredAnniYear !== undefined) c.lastAnniYear = h.restoredAnniYear;
            if (h.restoredLastDate !== undefined) c.last = h.restoredLastDate;
        }
        history.splice(idx, 1);
        saveAll();
        render();
        openHistory();
    }
}

function openStats() {
    closeModal('settingsModal');
    const div = document.getElementById('statsContent');
    div.innerHTML = '';

    const currentYear = new Date().getFullYear().toString();
    let currentYearTotal = 0;
    const months = new Array(12).fill(0);
    const pastYears = {};

    // Sort data into this year's months vs past years
    history.forEach(h => {
        const [y, m, d] = h.date.split('-');
        if (y === currentYear) {
            currentYearTotal += h.amount;
            months[parseInt(m) - 1] += h.amount;
        } else {
            if(!pastYears[y]) pastYears[y] = 0;
            pastYears[y] += h.amount;
        }
    });

    // --- NEW: INJECT PRUNED REVENUE ---
    if (settings.archivedRevenue) {
        Object.keys(settings.archivedRevenue).forEach(y => {
            if(!pastYears[y]) pastYears[y] = 0;
            pastYears[y] += settings.archivedRevenue[y];
        });
    }
    // ----------------------------------

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();

    // 1. Big Current Year Header
    let html = `<div style="text-align:center; margin-bottom:20px;">
        <span style="font-size:0.8rem; color:var(--text-sub); text-transform:uppercase; font-weight:800;">${currentYear} YTD Revenue</span><br>
        <span style="font-size:2.5rem; font-weight:900; color:var(--p-green-dark);">$${currentYearTotal.toFixed(2)}</span>
    </div>`;

    // 2. The 12-Month Grid (3 columns, 4 rows)
    html += '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom: 25px;">';
    months.forEach((amt, i) => {
        // Highlights the current month box
        const isCurrent = (i === currentMonthIndex) ? 'border-color:var(--p-blue-dark); background:rgba(162,210,255,0.1);' : 'border-color:var(--border);';
        // Dims future months that have $0
        const valColor = amt > 0 ? 'color:var(--text-main);' : 'color:var(--text-sub); opacity:0.4;';
        
        html += `<div style="background:var(--input-bg); padding:12px 5px; border-radius:12px; text-align:center; border: 2px solid transparent; ${isCurrent}">
            <span style="font-size:0.7rem; color:var(--text-sub); text-transform:uppercase; font-weight:800;">${monthNames[i]}</span><br>
            <span style="font-size:1rem; font-weight:800; ${valColor}">$${amt.toFixed(0)}</span>
        </div>`;
    });
    html += '</div>';

   // 3. Past Years Summary (Only shows if you have data from last year)
    if (Object.keys(pastYears).length > 0) {
        html += `<h4 style="margin-bottom:10px; color:var(--text-main);">Past Years</h4><div class="v-grid">`;
        Object.keys(pastYears).sort().reverse().forEach(y => {
            html += `<div class="v-box" style="padding:10px;"><span class="v-big" style="font-size:1.1rem;">$${pastYears[y].toFixed(2)}</span><span style="font-size:0.7rem;">${y}</span></div>`;
        });
        html += `</div>`;
    }

    // --- NEW: ACQUISITION ROI HEATMAP ---
    let sources = { 'Instagram': 0, 'Word of Mouth': 0, 'Google': 0, 'Unknown': 0, 'Other': 0 };
    clients.forEach(c => {
        if (c.archived || c.blacklisted) return;
        const src = c.source || 'Unknown';
        if (sources[src] !== undefined) sources[src] += (c.spent || 0);
        else sources['Other'] += (c.spent || 0);
    });
    
    html += `<h4 style="margin-top:25px; margin-bottom:10px; color:var(--text-main);">🎯 Marketing ROI (LTV)</h4>`;
    html += `<div class="v-grid" style="grid-template-columns: 1fr 1fr; gap:10px;">`;
    // Sorts them so your highest money-maker is always top left
    Object.keys(sources).sort((a,b) => sources[b] - sources[a]).forEach(s => {
        if (sources[s] > 0) {
            html += `<div class="v-box" style="padding:12px 5px;"><span class="v-big" style="font-size:1.1rem; color:var(--p-blue-dark);">$${sources[s].toFixed(0)}</span><span style="font-size:0.7rem;">${s}</span></div>`;
        }
    });
    html += `</div>`;
    // ------------------------------------

    // --- NEW: TOP PROMOTERS LEADERBOARD ---
    let refCounts = {};
    clients.forEach(c => {
        if(c.refBy && c.refBy.trim() !== '') {
            // Lowercase to prevent "John" and "john" from being counted twice
            let refName = c.refBy.trim().toLowerCase();
            if(!refCounts[refName]) refCounts[refName] = { name: c.refBy.trim(), count: 0 };
            refCounts[refName].count++;
        }
    });

    // Sort them from highest to lowest and grab the top 5
    let topRefs = Object.values(refCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    if (topRefs.length > 0) {
        html += `<h4 style="margin-top:25px; margin-bottom:10px; color:var(--text-main);">🏆 Top Promoters (Referrals)</h4>`;
        html += `<div style="background:var(--input-bg); border-radius:12px; border:1px solid var(--border); overflow:hidden; margin-bottom: 20px;">`;
        
        topRefs.forEach((ref, index) => {
            let medal = '';
            if(index === 0) medal = '🥇';
            else if(index === 1) medal = '🥈';
            else if(index === 2) medal = '🥉';
            else medal = `<span style="color:var(--text-sub); font-size:0.8rem; margin-left:5px;">#${index+1}</span>`;

            html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; border-bottom:1px solid var(--border);">
                <div style="font-weight:700; text-transform:capitalize;">${medal} ${ref.name}</div>
                <div style="background:rgba(183, 228, 199, 0.2); color:var(--p-green-dark); padding:4px 10px; border-radius:12px; font-size:0.8rem; font-weight:800;">
                    ${ref.count} Refs
                </div>
            </div>`;
        });
        html += `</div>`;
    }
    // --------------------------------------

    div.innerHTML = html;
    openModal('statsModal');
}

async function toggleArchive() {
    const c = getClient(activeId);
    const action = c.archived ? "Restore" : "Archive";
    if(await customConfirm(`${action} this client?`)) {
        c.archived = !c.archived;
        saveAll(); 
        closeModal('viewModal'); 
        render();
    }
}
function toggleArchiveMode() {
    viewArchives = !viewArchives;
    document.getElementById('archiveLabel').innerText = viewArchives ? "Back to Active Clients" : "View Archived Clients";
    closeModal('settingsModal'); render();
}

function exportHistoryCSV() {
    let csv = "Date,Client,Amount\n";
    history.forEach(h => { 
        const safeName = `"${(h.clientName || '').replace(/"/g, '""')}"`;
        csv += `${h.date},${safeName},${h.amount}\n`; 
    });
    downloadCSV(csv, 'BlackBook_Transactions.csv');
}
function exportSimpleCSV() {
    let csv = "Name,Phone,Email,Status,Strikes,Total_Spent,Last_Cut\n";
    clients.forEach(c => {
        if (c.archived || c.blacklisted) return; 
        const safePhone = `\t${c.phone}`;
        const safeName = `"${(c.name || '').replace(/"/g, '""')}"`;
        csv += `${safeName},${safePhone},${c.email || ''},${getStatus(c)},${c.strikes||0},${c.spent},${c.last}\n`;
    });
    downloadCSV(csv, 'BlackBook_Clients.csv');
}
function downloadCSV(content, name) {
    const blob = new Blob([content], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
}

function formatPretty(dateStr) {
    if(!dateStr) return 'Never';
    const [y, m, d] = dateStr.split('-'); 
    const date = new Date(y, m-1, d); 
    const mon = date.toLocaleString('default', { month: 'short' });
    const day = parseInt(d);
    let suff = 'th';
    if(day === 1 || day === 21 || day === 31) suff = 'st';
    if(day === 2 || day === 22) suff = 'nd';
    if(day === 3 || day === 23) suff = 'rd';
    return `${mon} ${day}${suff}, ${y}`;
}

function insertDate() {
    const txt = document.getElementById('eNotes');
    const now = new Date();
    txt.value += `\n[${now.getMonth()+1}/${now.getDate()}]: `;
    txt.focus();
}

function getClient(id) { return clients.find(x => x.id === id); }
function setTab(t, btn) { 
    activeFilter = t; 
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); 
    btn.classList.add('active'); 
    
    // Clear the search bar when switching tabs so the UI isn't confusingly locked
    const searchInput = document.querySelector('.search-input');
    if(searchInput.value) {
        searchInput.value = '';
        document.getElementById('clearSearchIcon').style.display = 'none';
    }
    
    render(''); 
}
function isMonth(d) { if(!d) return false; const [y, m] = d.split('-'); return parseInt(m) - 1 === new Date().getMonth(); }
function isAnniversary(d) { if(!d) return false; const [y, m] = d.split('-'); const now = new Date(); return parseInt(m) - 1 === now.getMonth() && parseInt(y) !== now.getFullYear(); }
function openInsta() { const c = getClient(activeId); if(c.insta) window.open(`https://instagram.com/${c.insta.replace('@','')}`); }

function copyInsta() {
    const instaDisp = document.getElementById('vInstaDisplay');
    const handle = instaDisp.dataset.handle;
    if (handle && navigator.clipboard) {
        navigator.clipboard.writeText(handle).then(() => {
            alert("Instagram handle copied!");
        }).catch(err => console.error("Clipboard failed", err));
    }
}

function copyRoster() {
    const activeClients = clients.filter(c => !c.archived && !c.blacklisted);
    if (activeClients.length === 0) return alert("No active clients to copy.");
    
    const rosterList = activeClients.map(c => c.name).join('\n');
    if (navigator.clipboard) {
        navigator.clipboard.writeText(rosterList).then(() => {
            alert("Client roster copied to clipboard!");
        });
    } else {
        alert("Clipboard API not supported on this browser.");
    }
}

let isConfirmOpen = false;
function customConfirm(msg) { 
    if (isConfirmOpen) return Promise.resolve(false);
    isConfirmOpen = true;
    return new Promise((resolve) => { 
        document.getElementById('cMsg').innerText = msg; 
        document.getElementById('confirmModal').style.display = 'block'; 
        
        document.getElementById('cYes').onclick = () => { 
            document.getElementById('confirmModal').style.display = 'none'; 
            isConfirmOpen = false;
            resolve(true); 
        }; 
        document.getElementById('cNo').onclick = () => { 
            document.getElementById('confirmModal').style.display = 'none'; 
            isConfirmOpen = false;
            resolve(false); 
        }; 
    }); 
}

// --- NEW: Custom Input Prompt Logic ---
let isPromptOpen = false;
function customPrompt(msg, placeholder = "", inputMode = "text") {
    if (isPromptOpen) return Promise.resolve(null);
    isPromptOpen = true;
    return new Promise((resolve) => {
        document.getElementById('pMsg').innerText = msg;
        const inputEl = document.getElementById('pInput');
        inputEl.inputMode = inputMode; 
        inputEl.type = inputMode === "decimal" ? "number" : "text";
        inputEl.placeholder = placeholder;
        inputEl.value = '';
        document.getElementById('promptModal').style.display = 'block';
        inputEl.focus();

        document.getElementById('pSubmit').onclick = () => {
            document.getElementById('promptModal').style.display = 'none';
            isPromptOpen = false;
            resolve(inputEl.value);
        };
        document.getElementById('pCancel').onclick = () => {
            document.getElementById('promptModal').style.display = 'none';
            isPromptOpen = false;
            resolve(null); // Returns null if they cancel
        };
    });
}

function searchRef(val) { 
    const div = document.getElementById('refResults'); 
    if(!val) { div.style.display='none'; return; } 
    const matches = clients.filter(c => c.name.toLowerCase().includes(val.toLowerCase())); 
    div.innerHTML = ''; 
    if(matches.length){ 
        div.style.display='block'; 
        matches.forEach(m => { 
            const d = document.createElement('div'); 
            d.innerText = m.name; 
            d.style.padding='8px'; 
            d.style.borderBottom='1px solid #444'; 
            d.onclick = () => { document.getElementById('eRef').value = m.name; div.style.display='none'; }; 
            div.appendChild(d); 
        }); 
    } else div.style.display='none'; 
}

function openSchedule() { 
    // Pre-fills with today's date/time to prevent Invalid Date crash
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('schedDate').value = `${y}-${m}-${d}T${h}:${min}`;
    openModal('schedModal'); 
}
function openSettings() { openModal('settingsModal'); }

function openHistory() { 
    closeModal('settingsModal'); 
    const div = document.getElementById('historyList'); 
    div.innerHTML = ''; 
    const revHist = [...history].reverse(); 
    if(revHist.length === 0) div.innerHTML = "No transactions yet."; 
    revHist.forEach((h, i) => { 
        const originalIndex = (history.length - 1) - i;
        const row = document.createElement('div'); 
        row.className = 'hist-item'; 
        row.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <span style="font-weight:700;">${h.clientName}</span>
                <span style="font-size:0.7rem; color:var(--text-sub);">${formatPretty(h.date)}</span>
            </div>
            <div style="display:flex; align-items:center; gap:15px;">
                <b>$${h.amount.toFixed(2)}</b>
                <i class="fas fa-trash-alt" style="color:#ff6b6b; cursor:pointer;" onclick="deleteTransaction(${originalIndex})"></i>
            </div>
        `; 
        div.appendChild(row); 
    }); 
    openModal('historyModal'); 
}

function addToCalendar() { 
    const c = getClient(activeId); 
    const cutTime = new Date(document.getElementById('schedDate').value); 
    const isHouseCall = document.getElementById('schedLoc').value === 'client';
    const loc = isHouseCall ? c.address : settings.location; 
    
    // --- TIME MATH ---
    const minMs = 60000; 
    const selectedMins = parseInt(document.getElementById('schedService').value) || 120;
    const cutDuration = selectedMins * minMs; 
    
    const bufferAfter = 15 * minMs;
    const bufferBefore = isHouseCall ? (45 * minMs) : (15 * minMs);
    
    const start = new Date(cutTime.getTime() - bufferBefore);
    const end = new Date(cutTime.getTime() + cutDuration + bufferAfter); 
    
    const fmt = (x) => x.toISOString().replace(/-|:|\.\d\d\d/g,""); 
    
    const displayTime = cutTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    const formulaTxt = c.formula ? `📝 Formula: ${c.formula}` : '📝 Formula: None saved';
    const icebreakerTxt = c.icebreaker ? `💡 Ask about: ${c.icebreaker}` : '';
    const desc = `${formulaTxt}\\n${icebreakerTxt}`.trim();

    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:Cut - ${c.name} (${displayTime})\nLOCATION:${loc}\nDESCRIPTION:${desc}\nEND:VEVENT\nEND:VCALENDAR`; 
    
    const blob = new Blob([ics], {type:'text/calendar;charset=utf-8'}); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = `${c.name.replace(/\s+/g, '_')}_appt.ics`; 
    a.click(); 
    
    closeModal('schedModal'); 
}

function saveSettings() { 
    settings.location = document.getElementById('setLoc').value; 
    saveAll(); 
    closeModal('settingsModal'); 
}

async function massPriceUpdate() {
    const newPrice = parseFloat(document.getElementById('setNewPrice').value);
    if (!newPrice || newPrice <= 0) return alert("Please enter a valid new price.");
    
    const protectVips = document.getElementById('setGrandfather').checked;
    
    if(await customConfirm(`Update base price to $${newPrice} for all active clients?\n\n${protectVips ? "(VIPs with $200+ LTV will be protected)" : "(NO EXCLUSIONS - Everyone updates)"}`)) {
        let updatedCount = 0;
        let protectedCount = 0;
        
        clients.forEach(c => {
            if (c.archived || c.blacklisted) return; 
            
            if (protectVips && (c.spent || 0) >= 200) {
                protectedCount++;
                return; 
            }
            
            c.price = newPrice;
            updatedCount++;
        });
        
        saveAll();
        render();
        document.getElementById('setNewPrice').value = '';
        alert(`Success! Updated ${updatedCount} clients to $${newPrice}.\nProtected VIPs: ${protectedCount}`);
    }
}

function exportData() { 
    const s = JSON.stringify({clients, settings, history}); 
    const blob = new Blob([s], {type: 'application/json'}); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a'); 
    a.href = url; a.download = 'backup.json'; a.click(); 
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function toggleTheme() { document.body.classList.toggle('dark-mode'); isDark = document.body.classList.contains('dark-mode'); localStorage.setItem('theme', isDark ? 'dark' : 'light'); }
function getStatus(c) { const refDate = c.last || c.first; if(!refDate) return 'good'; const last = new Date(refDate + 'T00:00:00'); const today = new Date(); const days = (today - last)/(1000*60*60*24); const freqDays = (c.freq || 4) * 7; if(days >= 56) return 'overdue'; if(days >= freqDays) return 'due'; return 'good'; }
function getDueStr(c) { const refDate = c.last || c.first; if(!refDate) return 'Today'; const last = new Date(refDate + 'T00:00:00'); last.setDate(last.getDate() + ((c.freq||4)*7)); return last.toLocaleDateString(undefined, {month:'short', day:'numeric'}); }
function getLoyaltyVisual(n) { n = n || 0; let s = ''; for(let i=0; i<APP_CONFIG.cutsRequiredForFree; i++) { s += (i < n) ? '✂️' : '⚪'; } return s; } 

function exportRobustExcel() {
    let html = '<html><head><style>body{font-family:sans-serif; padding:20px;} table{width:100%; border-collapse:collapse; margin-bottom:40px;} th{background:#4472C4; color:white; padding:10px; text-align:left;} td{border:1px solid #ddd; padding:8px;} .due{color:#e67e22;} .overdue{color:#e74c3c;}</style></head><body>';
    html += '<h1>Black Book Report</h1><p>Generated: ' + new Date().toLocaleDateString() + '</p>';
    html += '<h2>Active Clients</h2><table><tr><th>Name</th><th>Phone</th><th>Status</th><th>Strikes</th><th>LTV</th><th>Last Cut</th></tr>';
    clients.forEach(c => { 
        if(c.archived || c.blacklisted) return; // Keeps graveyard guys out of the export

        const stat = getStatus(c); 
        html += `<tr><td><b>${c.name}</b></td><td>${c.phone || ''}</td><td>${stat.toUpperCase()}</td><td>${c.strikes || 0}</td><td>$${(c.spent||0).toFixed(2)}</td><td>${formatPretty(c.last)||''}</td></tr>`; 
    });
    html += '</table><h2>Transaction History</h2><table><tr><th>Date</th><th>Client</th><th>Amount</th></tr>';
    history.forEach(h => { html += `<tr><td>${formatPretty(h.date)}</td><td>${h.clientName}</td><td>$${h.amount.toFixed(2)}</td></tr>`; });
    html += '</table></body></html>';
    const blob = new Blob([html], {type: 'text/html'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'BlackBook_Report.html'; a.click();
}

function showCrashScreen(msg) { const m = document.getElementById('crashModal'); document.getElementById('crashMsg').innerText = msg; m.style.display = 'flex'; }
function emergencyCopy() { 
    const c = localStorage.getItem('bbClients') || '[]'; 
    const h = localStorage.getItem('bbHistory') || '[]'; 
    const s = localStorage.getItem('bbSettings') || '{}'; 
    const raw = JSON.stringify({clients: JSON.parse(c), history: JSON.parse(h), settings: JSON.parse(s)}); 
    if(navigator.clipboard) { navigator.clipboard.writeText(raw).then(() => alert("Full Backup Copied!")); } else { prompt("Copy Full Backup:", raw); } 
}
function factoryReset() { if(confirm("This deletes everything. Sure?")) { localStorage.clear(); location.reload(); } }

function addOpt(parent, val, label, selected = false) { 
    const div = document.createElement('div'); 
    div.className = `discount-opt ${selected ? 'selected' : ''}`; 
    div.innerText = label; 
    div.onclick = () => { 
        document.querySelectorAll('.discount-opt').forEach(d => d.classList.remove('selected')); 
        div.classList.add('selected'); 
        selectedDisc = val; 
        document.getElementById('customDiscBox').style.display = val === 'custom' ? 'block' : 'none'; 
        calcTotal(); 
    }; 
    parent.appendChild(div); 
}

function captureEditState() {
    const fields = ['eName', 'ePhone', 'eInsta', 'eEmail', 'eAddr', 'ePrice', 'eFreq', 'eFirst', 'eDob', 'eRef', 'eNotes', 'eIcebreaker', 'eFormula', 'eBanked', 'eLoyalty', 'eSource'];
    let state = "";
    fields.forEach(f => {
        const el = document.getElementById(f);
        if (el) state += el.value;
    });
    state += document.getElementById('eComedy').checked ? "yes" : "no";
    state += Array.from(document.querySelectorAll('#eTags .tag-pill.active')).map(x => x.innerText).join("");
    return state;
}

async function cancelEdit() {
    const currentState = captureEditState();
    if (currentState !== editInitialState) {
        if (!await customConfirm("Discard unsaved changes?")) return;
    }
    closeModal('editModal');
}

function openAddModal() { 
    document.getElementById('eTitle').innerText = 'New Client'; 
    document.getElementById('eId').value = ''; 
    document.getElementById('eName').value = ''; 
    document.getElementById('ePhone').value = ''; 
    document.getElementById('eInsta').value = ''; 
    document.getElementById('eEmail').value = ''; 
    document.getElementById('eAddr').value = ''; 
    document.getElementById('eRef').value = ''; 
    document.getElementById('eSource').value = 'Unknown'; // Default for new guys
    document.getElementById('eComedy').checked = false; // Default for new guys
    document.getElementById('eNotes').value = ''; 
    document.getElementById('eIcebreaker').value = ''; 
    document.getElementById('eFormula').value = ''; 
    document.getElementById('ePrice').value = 35; 
    document.getElementById('eFreq').value = 4; 
    document.getElementById('eDob').value = ''; 
    document.getElementById('eBanked').value = 0;
    document.getElementById('eLoyalty').value = 0;
    document.getElementById('eFirst').value = getTodayIso(); 
    const tagBox = document.getElementById('eTags'); tagBox.innerHTML = ''; 
    VIBE_TAGS.forEach(t => { 
        const pill = document.createElement('div'); 
        pill.className = 'tag-pill'; 
        pill.textContent = t; 
        pill.onclick = () => pill.classList.toggle('active'); 
        tagBox.appendChild(pill); 
    });
    editInitialState = captureEditState();
    openModal('editModal'); 
}

function editClient() { 
    closeModal('viewModal'); 
    const c = getClient(activeId); 
    document.getElementById('eTitle').innerText = 'Edit Client'; 
    document.getElementById('eId').value = c.id; 
    document.getElementById('eName').value = c.name; 
    document.getElementById('ePhone').value = c.phone; 
    document.getElementById('eInsta').value = c.insta; 
    document.getElementById('eEmail').value = c.email || ''; 
    document.getElementById('ePrice').value = c.price || 35; 
    document.getElementById('eAddr').value = c.address || ''; 
    document.getElementById('eFreq').value = c.freq || 4; 
    document.getElementById('eFirst').value = c.first || ''; 
    document.getElementById('eDob').value = c.dob || ''; 
    document.getElementById('eSource').value = c.source || 'Unknown';
    document.getElementById('eComedy').checked = c.comedyList || false;
    document.getElementById('eRef').value = c.refBy || ''; 
    document.getElementById('eNotes').value = c.notes; 
    document.getElementById('eIcebreaker').value = c.icebreaker || '';
    document.getElementById('eFormula').value = c.formula || ''; 
    document.getElementById('eBanked').value = c.banked || 0;
    document.getElementById('eLoyalty').value = c.loyalty || 0;
    const tagBox = document.getElementById('eTags');
    tagBox.innerHTML = '';
    const myTags = c.tags || [];
    VIBE_TAGS.forEach(t => {
        const pill = document.createElement('div');
        pill.className = `tag-pill ${myTags.includes(t) ? 'active' : ''}`;
        pill.textContent = t;
        pill.onclick = () => pill.classList.toggle('active');
        tagBox.appendChild(pill);
    });
    editInitialState = captureEditState();
    openModal('editModal'); 
}

async function saveClient() { 
    const id = document.getElementById('eId').value || Date.now().toString(); 
    const isNew = !document.getElementById('eId').value; 
    const refName = document.getElementById('eRef').value.trim(); 
    let creditAdd = 0; 

    // Check if referral is newly added (works for new clients AND existing ones being updated)
    const existingClient = isNew ? null : getClient(id);
    // Only trigger referral rewards if they didn't already have one! Prevents infinite farming.
    const isNewReferral = refName && (isNew || !existingClient.refBy);
    
    if(isNewReferral) { 
        const referee = clients.find(x => x.name.toLowerCase() === refName.toLowerCase()); 
        if(referee) { 
            referee.credit = (referee.credit || 0) + 5; 
            creditAdd = 5; 
            alert(`✅ Linked to ${referee.name}! $5 added to both accounts.`); 
        } else {
            alert(`Note: No client found named "${refName}". No referral credit applied.`);
        }
    }
    const selectedTags = Array.from(document.querySelectorAll('#eTags .tag-pill.active')).map(x => x.innerText);
    const formFirst = document.getElementById('eFirst').value; 
    
    // --- NEW: Auto-Capitalize First and Last Name ---
    let cleanName = document.getElementById('eName').value.trim();
    cleanName = cleanName.replace(/\b\w/g, char => char.toUpperCase());
    // ------------------------------------------------

    const data = { 
        id: id, name: cleanName, phone: document.getElementById('ePhone').value, 
        insta: document.getElementById('eInsta').value, email: document.getElementById('eEmail').value, 
        address: document.getElementById('eAddr').value, price: parseFloat(document.getElementById('ePrice').value), 
        freq: parseInt(document.getElementById('eFreq').value), first: formFirst, dob: document.getElementById('eDob').value, 
        refBy: refName, notes: document.getElementById('eNotes').value, icebreaker: document.getElementById('eIcebreaker').value,
        formula: document.getElementById('eFormula').value, tags: selectedTags,
        source: document.getElementById('eSource').value || 'Unknown', // NEW: Saves where they came from
        comedyList: document.getElementById('eComedy').checked, // NEW: Saves Comedy VIP status
        credit: isNew ? creditAdd : ((getClient(id).credit || 0) + creditAdd), 
        banked: Math.max(0, parseInt(document.getElementById('eBanked').value) || 0), 
        loyalty: Math.min(APP_CONFIG.cutsRequiredForFree - 1, Math.max(0, parseInt(document.getElementById('eLoyalty').value) || 0)),
        spent: isNew ? 0 : getClient(id).spent, 
        giveback: isNew ? 0 : getClient(id).giveback, cuts: isNew ? 0 : getClient(id).cuts, 
        // --- LAST CUT SYNC FIX ---
        last: isNew ? formFirst : getClient(id).last, 
        strikes: isNew ? 0 : (getClient(id).strikes || 0), 
        archived: isNew ? false : (getClient(id).archived || false),
        // --- NEW: PREVENT HIDDEN DATA WIPE ---
        blacklisted: isNew ? false : (getClient(id).blacklisted || false),
        blacklistReason: isNew ? "" : (getClient(id).blacklistReason || ""),
        lastAddons: isNew ? [] : (getClient(id).lastAddons || []),
        pendingFee: isNew ? 0 : (getClient(id).pendingFee || 0),
        feeReason: isNew ? "" : (getClient(id).feeReason || ""),
        deposit: isNew ? 0 : (getClient(id).deposit || 0),
        lastCheckIn: isNew ? "" : (getClient(id).lastCheckIn || ""),
        lastBdayYear: isNew ? null : (getClient(id).lastBdayYear ?? null),
        lastAnniYear: isNew ? null : (getClient(id).lastAnniYear ?? null)
    };
    if(isNew) clients.push(data); 
    else { const idx = clients.findIndex(x => x.id === id); clients[idx] = data; } 
    saveAll(); closeModal('editModal'); render(); 
}

async function deleteClient() { 
    if(await customConfirm("Permanently delete this client?\n\nThis will also erase their transaction history.")) { 
        const idToDelete = document.getElementById('eId').value;
        clients = clients.filter(c => c.id !== idToDelete); 
        history = history.filter(h => h.clientId !== idToDelete); 
        saveAll(); 
        closeModal('editModal'); 
        render(); 
    } 
}

async function addStrike() {
    const c = getClient(activeId); 
    if(await customConfirm(`Mark ${c.name} as a No-Show? \n\nAdds a Strike 🚩.`)) { 
        c.strikes = (c.strikes || 0) + 1; 
        
        // --- NEW: STRIKE-TO-FEE LINK ---
        if(await customConfirm(`Add a Penalty Fee to their next cut for this No-Show?`)) {
            const feeAmt = await customPrompt("Enter the penalty fee amount:", "e.g. 15", "decimal");
            if (feeAmt !== null && (feeAmt.trim() === '' || isNaN(feeAmt))) {
                alert("Invalid fee amount. Strike saved, but no fee was added.");
            } else if(feeAmt !== null && feeAmt.trim() !== '' && !isNaN(feeAmt)) {
                c.pendingFee = (c.pendingFee || 0) + parseFloat(feeAmt);
                c.feeReason = "No-Show / Late Cancel";
            }
        }
        
        saveAll(); 
        render(); 
        showClient(activeId); // Refreshes the UI to immediately show the new fee
    } 
}

// --- NEW: LOG DEPOSIT ---
async function promptDeposit() {
    const c = getClient(activeId);
    const depAmt = await customPrompt(`Log a pre-paid deposit for ${c.name}:`, "e.g. 20", "decimal");
    
    if (depAmt === null) return; // They clicked cancel
    if (depAmt.trim() === '' || isNaN(depAmt)) return alert("Please enter a valid number.");
    
    if(depAmt !== null && depAmt.trim() !== '' && !isNaN(depAmt)) {
        const amt = parseFloat(depAmt);
        c.deposit = (c.deposit || 0) + amt;
        c.spent = (c.spent || 0) + amt; // Adds to their lifetime value immediately
        
        // Log the revenue so it shows up in today's take!
        history.push({
            txnId: Date.now().toString(),
            clientId: c.id,
            clientName: c.name + ' (Pre-Paid Deposit)',
            date: getTodayIso(),
            amount: amt,
            wasFree: false,
            wasCredit: false,
            givebackAmt: 0,
            cutsLogged: 0, // Special case: doesn't count as a haircut
            depositAdded: amt // Flag so Undo knows how to reverse it
        });

        saveAll(); 
        render(); 
        showClient(activeId);
    }
}

async function removeStrike() { const c = getClient(activeId); if(await customConfirm("Remove one Strike 🚩?")) { c.strikes = Math.max(0, (c.strikes || 0) - 1); saveAll(); closeModal('viewModal'); render(); } }

function openSmsMenu() { 
    const c = getClient(activeId);
    const btn48 = document.getElementById('btn48hr');
    
    // Default to hidden
    btn48.style.display = 'none';
    
    // Check if they had a cut within the last 2 days
    if(c.last) {
        // We use your getTodayIso() function to make sure timezones don't mess up the math
        const lastDate = new Date(c.last + 'T00:00:00');
        const today = new Date(getTodayIso() + 'T00:00:00');
        const diffTime = today - lastDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if(diffDays >= 0 && diffDays <= 2) {
            btn48.style.display = 'flex';
        }
    }
    
    openModal('smsModal'); 
}

function sendSms(type) { 
    const c = getClient(activeId); if(!c || !c.phone) return alert('No phone saved.'); 
    const first = c.name.split(' ')[0]; let msg = ''; 
    if(type === 'late') msg = `Hey ${first}, running about 15 mins late. So sorry!`; 
    if(type === 'confirm') msg = `Yo ${first}, just confirming our cut. You still good?`; 
    if(type === 'longtime') msg = `Hey ${first}, been a while! Time to clean up that cut?`; 
    if(type === 'followup') msg = `Appreciate you coming through ${first}! How's the cut treating you?`; 
    if(type === 'review') msg = `Yo ${first}, appreciate the cut! If you have a sec, rate it here:\n\nhttps://mannyserrano4-oss.github.io/crispy-enigma/reviews`;
    
    // --- NEW TEXT TEMPLATES ---
    if(type === 'checkin') msg = `Yo ${first}, just checking in to make sure that cut is still sitting right and styling easy for you.`;
    if(type === 'bday') msg = `Yo ${first}, saw it's your birthday month! 🎂 Hit me up to claim that half-off cut.`;
    if(type === 'noshow') msg = `Hey ${first}, had you down for a cut today. Let me know if we need to reschedule.`;
    
   // --- NEW DYNAMIC LOYALTY TEXT ---
    if(type === 'loyalty') {
        const banked = c.banked || 0;
        const points = c.loyalty || 0;
        const cutsLeft = APP_CONFIG.cutsRequiredForFree - points;
        
        if (banked > 0) {
            msg = `Yo ${first}, you've got a FREE cut banked and ready to use! Let me know when you want to cash it in.`;
        } else if (cutsLeft === 1) {
            msg = `Yo ${first}, you are exactly ONE cut away from a freebie! Let's get you in the chair and finish off that punch card.`;
        } else {
            msg = `Yo ${first}, just checking in! You're ${cutsLeft} cuts away from earning your free one. Hit me up when you need a fresh fade.`;
        }
    }
    
    // --- NEW AFTERCARE TEXT ---
    if(type === 'aftercare') {
        msg = `Yo ${first}, here is the link to my aftercare guide to keep everything looking fresh until the next cut: https://mannyserrano4-oss.github.io/crispy-enigma/aftercare/`;
    }
    
    if(type === 'custom') msg = `Hey ${first}, `;
    
    const ua = navigator.userAgent.toLowerCase();
    const isApple = ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1;
    const sep = isApple ? '&' : '?';
    
    window.location.href = `sms:${c.phone}${sep}body=${encodeURIComponent(msg)}`; 
    closeModal('smsModal'); 
}

// --- NEW SOS RADAR LOGIC ---
function openSos() {
    const listDiv = document.getElementById('sosList');
    listDiv.innerHTML = '';
    
    // 1. Find targets who are Due/Overdue AND have a phone number
    let targets = clients.filter(c => !c.archived && c.phone && (getStatus(c) === 'due' || getStatus(c) === 'overdue'));
    
    // 2. Sort them by biggest spenders (LTV) first so you hit your best clients first
    targets.sort((a, b) => (b.spent || 0) - (a.spent || 0));

    if (targets.length === 0) {
        listDiv.innerHTML = '<div style="padding:15px; text-align:center; color:var(--text-sub);">Everyone is caught up! No prime targets right now.</div>';
    } else {
        targets.forEach(c => {
            const first = c.name.split(' ')[0];
            
            // --- NEW: Calculate True Average Spend ---
            let trueAvg = c.price || 35; // Default to base price
            if (c.cuts && c.cuts > 0 && c.spent) {
                trueAvg = (c.spent / c.cuts).toFixed(0); // Actual math: Total spent divided by number of cuts
            }
            // -----------------------------------------

            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '10px';
            div.style.borderBottom = '1px solid var(--border)';
            
            div.innerHTML = `
                <div>
                    <div style="font-weight:700;">${c.name}</div>
                    <div style="font-size:0.7rem; color:var(--text-sub);">${getStatus(c).toUpperCase()} • Avg $${trueAvg}</div>
                </div>
                <button class="btn btn-primary" style="width:auto; padding:8px 15px; margin:0; font-size:0.8rem;" onclick="fireSos('${c.phone}', '${first}')">Text</button>
            `;
            listDiv.appendChild(div);
        });

    }
    openModal('sosModal');
}

function fireSos(phone, firstName) {
    let msg = document.getElementById('sosMsg').value;
    // Personalize the message with their name if you put [Name] in it, or just leave it as-is
    msg = msg.replaceAll('[Name]', firstName);
    
    const ua = navigator.userAgent.toLowerCase();
    const isApple = ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1;
    const sep = isApple ? '&' : '?';
    
    window.location.href = `sms:${phone}${sep}body=${encodeURIComponent(msg)}`;
}

// --- NEW PROMO BLAST LOGIC ---
function openPromo() {
    const select = document.getElementById('promoTarget');
    select.innerHTML = `
        <option value="all">All Active Clients</option>
        <option value="smart_overdue">⏰ Overdue (Lost Clients)</option>
        <option value="smart_ghost">👻 Ghosts (90+ Days MIA)</option>
        <option value="smart_vip">👑 VIPs (High Spenders)</option>
        <option value="smart_bday">🎂 Birthdays This Month (50% Off)</option>
        <option value="smart_anni">🏅 Anniversaries This Month (50% Off)</option>
       <option value="smart_housecall">🚗 Mobile / House Call Clients</option>
        <option value="smart_1away">🎟️ 1 Cut Away from Free</option>
        <option value="smart_wrapped">🎁 End of Year 'Wrapped' Text</option>
        <option value="smart_comedy">🎙️ Comedy Show Invites</option>
    `;

    
    buildPromoList();
    openModal('promoModal');
}

function buildPromoList() {
    const listDiv = document.getElementById('promoList');
    listDiv.innerHTML = '';
    const target = document.getElementById('promoTarget').value;
    const msgBox = document.getElementById('promoMsg');
    
    // --- NEW: AUTO-CHANGING TEXT TEMPLATES ---
    if (target === 'smart_overdue') {
        msgBox.value = "Yo [Name]! It's been a minute since you were in the chair. Got a few spots open this week if you want to get fresh. Let me know! 💈";
    } else if (target === 'smart_ghost') {
        msgBox.value = "Yo [Name]! It's been a minute. If you've been looking for a reason to get fresh, I'm knocking $10 off your cut if you book this week. Let's get you back in the chair! 💈";
    } else if (target === 'smart_bday') {
        msgBox.value = "Yo [Name], happy birthday month! 🎂 Let me know when you want to slide in this month to claim your 50% off birthday cut.";
    } else if (target === 'smart_anni') {
        msgBox.value = "Yo [Name], happy anniversary! 🏅 It's been another year since you first sat in my chair. Hit me up this month to claim your 50% off loyalty cut.";
    } else if (target === 'smart_vip') {
        msgBox.value = "Yo [Name], giving my top guys first dibs on the schedule for the week. Let me know if you need to lock in a prime spot!";
    } else if (target === 'smart_housecall') {
        msgBox.value = "Hey [Name], mapping out my mobile cut routes for the week. Let me know if you need me to pull up and get you right! 🚗";
    } else if (target === 'smart_1away') {
        msgBox.value = "Yo [Name]! You are exactly ONE cut away from earning a freebie. Hit me up to grab a spot this week so we can finish off that punch card! 🏆";
    } else if (target === 'smart_wrapped') {
        msgBox.value = "Yo [Name], crazy year! You sat in the chair [Cuts] times, got the '[Formula]' down to a science, and were my #[Rank] top client of the year. Appreciate your loyalty, here's $10 off your first cut in January. 💈";
    } else if (target === 'smart_comedy') {
        msgBox.value = "Yo [Name]! I'm hopping on stage this [Day] at [Venue]. I'm [Hosting / Doing a Guest Spot], would love to see you in the crowd! Let me know if you want the ticket link. 🎤";
    } else {
        msgBox.value = "Got a few spots open later this week! Let me know if you need to lock one in. 💈";
    }
    // ------------------------------------------

    // --- NEW: Excludes both archives AND blacklisted guys ---
    let targets = clients.filter(c => !c.archived && !c.blacklisted && c.phone);
    
    // Apply Smart Filters
    if (target === 'smart_wrapped') {
        // Do nothing! We want everyone active to be in the Wrapped list.
    } else if (target === 'smart_comedy') {
        targets = targets.filter(c => c.comedyList === true);
    } else if (target === 'smart_overdue') {
        targets = targets.filter(c => getStatus(c) === 'overdue');
    } else if (target === 'smart_ghost') {
        const today = new Date();
        targets = targets.filter(c => {
            if (!c.last) return false;
            const daysMIA = (today - new Date(c.last)) / (1000 * 60 * 60 * 24);
            return daysMIA >= 90; // Filters for guys missing for 3+ months
        });
    } else if (target === 'smart_bday') {
        // Uses your existing isMonth() helper
        targets = targets.filter(c => c.dob && isMonth(c.dob));
    } else if (target === 'smart_anni') {
        // Uses your existing isAnniversary() helper
        targets = targets.filter(c => c.first && isAnniversary(c.first));
    } else if (target === 'smart_vip') {
        targets = targets.filter(c => (c.spent || 0) >= 200);
    } else if (target === 'smart_housecall') {
        targets = targets.filter(c => c.address && c.address.trim() !== '');
    } else if (target === 'smart_1away') {
        targets = targets.filter(c => (c.loyalty || 0) === (APP_CONFIG.cutsRequiredForFree - 1));
    } else if (target !== 'all') {
        targets = targets.filter(c => c.tags && c.tags.includes(target));
    }
    
    if (targets.length === 0) {
        listDiv.innerHTML = '<div style="padding:15px; text-align:center; color:var(--text-sub);">No clients found for this target.</div>';
        return;
    }

    targets.forEach(c => {
        const first = c.name.split(' ')[0];
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '8px 10px';
        div.style.borderBottom = '1px solid var(--border)';
        div.style.transition = 'opacity 0.3s ease'; // Smooth fade out
        
        div.innerHTML = `
            <div style="font-weight:700;">${c.name}</div>
            <button class="btn btn-primary" style="background:var(--p-purple); color:black; width:auto; padding:6px 12px; margin:0; font-size:0.8rem;" onclick="firePromo('${c.phone}', '${first}', this, '${c.id}')">Send Text</button>
        `;
        listDiv.appendChild(div);

    });
}

function firePromo(phone, firstName, btn, clientId) {
    let msg = document.getElementById('promoMsg').value;
    msg = msg.replaceAll('[Name]', firstName); 
    
    // --- NEW: INJECT SPOTIFY WRAPPED STATS ---
    if (clientId && msg.includes('[Rank]')) {
        const c = getClient(clientId);
        if (c) {
            // 1. Calculate their rank (Sorts all active clients by LTV)
            const activeSpenders = clients.filter(x => !x.archived && !x.blacklisted).sort((a,b) => (b.spent||0) - (a.spent||0));
            const rank = activeSpenders.findIndex(x => x.id === c.id) + 1;
            
            // 2. Format their formula (or fallback if blank)
            const formulaText = (c.formula && c.formula.trim() !== '') ? c.formula.toLowerCase() : 'signature look';
            
            // 3. Swap the tags
            msg = msg.replace('[Cuts]', c.cuts || 1);
            msg = msg.replace('[Formula]', formulaText);
            msg = msg.replace('[Rank]', rank);
        }
    }
    // ------------------------------------------

    // --- Visual Anti-Double Send Feedback ---
    btn.innerText = 'Sent ✓';
    btn.style.background = 'var(--bg-card)';
    btn.style.color = 'var(--text-sub)';
    btn.style.border = '1px solid var(--border)';
    btn.style.boxShadow = 'none';
    btn.onclick = null; 
    btn.parentElement.style.opacity = '0.4'; 
    // ----------------------------------------
    
    const ua = navigator.userAgent.toLowerCase();
    const isApple = ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1;
    const sep = isApple ? '&' : '?';
    
    window.location.href = `sms:${phone}${sep}body=${encodeURIComponent(msg)}`;
}

// --- NEW QR HUB LOGIC ---
function openQrMenu() {
    openModal('qrMenuModal');
}

function showQr(type) {
    closeModal('qrMenuModal');
    
    const titleMap = {
        'review': 'Leave a Review',
        'card': 'MAS Barbery Card',
        'save': 'Save Contact',
        'book': 'Book Appointment'
    };
    
    // These are the exact filenames you need to use when you save your images!
    const imgMap = {
        'review': 'qr-review.png',
        'card': 'qr-card.png',
        'save': 'qr-save.png',
        'book': 'qr-book.png'
    };
    
    document.getElementById('qrTitle').innerText = titleMap[type];
    document.getElementById('qrImage').src = imgMap[type];
    
    openModal('qrDisplayModal');
}

function backToQrMenu() {
    closeModal('qrDisplayModal');
    openModal('qrMenuModal');
}

function restoreData(input) {
    if (!input.files || input.files.length === 0) return;
    const r = new FileReader();
    r.onload = (e) => {
        try {
            const d = JSON.parse(e.target.result);
            if(d.clients) { clients = d.clients; settings = d.settings || settings; history = d.history || []; saveAll(); render(); alert('Database Restored Successfully!'); closeModal('settingsModal'); }
        } catch(err) { alert("Error loading file: " + err); }
    };
    r.readAsText(input.files[0]);
    input.value = ''; // Resets the file input so it can trigger again
}

// --- DATA MANAGEMENT: PRUNE OLD HISTORY ---
async function pruneOldHistory() {
    const currentYear = new Date().getFullYear().toString();
    
    // Find all receipts that are NOT from this year
    const oldHistory = history.filter(h => !h.date.startsWith(currentYear));
    
    if (oldHistory.length === 0) {
        return alert("Your history is already clean! No old transactions to delete.");
    }

    // Calculate total money about to be pruned
    const totalPrunedMoney = oldHistory.reduce((sum, h) => sum + h.amount, 0);

    if(!await customConfirm(`⚠️ STORAGE CLEANUP\n\nYou are about to delete ${oldHistory.length} old receipts from before ${currentYear}.\n\nClient profiles, LTVs, and loyalty will NOT be affected.\n\nReady to begin backup?`)) {
        return;
    }

    // Step 1: Force User-Initiated JSON Download
    if(await customConfirm("STEP 1: DOWNLOAD FULL BACKUP\n\nClick 'Yes' to save your .json database file. (Required)")) {
        exportData(); 
    } else {
        return alert("Cleanup canceled. You must download your backup first.");
    }

    // Short pause so the UI modals don't glitch on top of each other
    await new Promise(r => setTimeout(r, 400));

    // Step 2: Force User-Initiated CSV Download
    if(await customConfirm("STEP 2: DOWNLOAD TAX CSV\n\nClick 'Yes' to save your readable .csv receipt history. (Required)")) {
        exportHistoryCSV();
    } else {
        return alert("Cleanup canceled. You must download your CSV first.");
    }

    await new Promise(r => setTimeout(r, 400));

    // Step 3: The Safety Lock
    const typed = await customPrompt(`Both backups triggered!\n\nTo permanently delete ${oldHistory.length} old receipts and free up space, type PRUNE below:`, "Type PRUNE here");
    
    if (typed !== "PRUNE") {
        return alert("Cleanup canceled. Your data was not touched.");
    }

    // 4. Tally up the old revenue so your Stats page doesn't break
    if (!settings.archivedRevenue) settings.archivedRevenue = {};
    
    oldHistory.forEach(h => {
        const year = h.date.split('-')[0];
        if (!settings.archivedRevenue[year]) settings.archivedRevenue[year] = 0;
        settings.archivedRevenue[year] += h.amount;
    });

    // 5. Keep ONLY this year's history
    history = history.filter(h => h.date.startsWith(currentYear));
    
    // 6. Save and reload
    saveAll();
    alert(`Success! Removed ${oldHistory.length} old receipts and secured $${totalPrunedMoney.toFixed(2)} in your stats archive. Your app is running light and fast.`);
    render();
}
// ------------------------------------------

// --- SERVICE WORKER REGISTRATION (PWA) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registered successfully with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
