// --- COLORS & DATA ---
const neonColors = [
    '#ff0055', '#00f3ff', '#bc13fe', '#ffd700', '#00ff00', '#ff6600', '#ffffff', '#ff00ff'
];

const words = {
    "mix": ["ვაშლი", "მანქანა", "სახლი", "მზე", "თვითმფრინავი", "ყვავილი", "ხე", "ჭიქა", "საათი", "გული", "ვარსკვლავი", "ნავი"],
    "objects": ["ტელეფონი", "სკამი", "საათი", "სათვალე", "ქუდი", "ბურთი", "წიგნი", "ლამპა", "გასაღები", "ფანქარი"],
    "animals": ["კატა", "ძაღლი", "სპილო", "ჟირაფი", "თევზი", "პეპელა", "ობობა", "გველი", "ჩიტი", "კუ"],
    "places": ["მთა", "ზღვა", "ტყე", "პარკი", "სკოლა", "საავადმყოფო", "მაღაზია", "ხიდი", "ციხესიმაგრე"]
};

// --- STATE ---
let players = [];
let roles = [];
let currentIndex = 0;
let currentLap = 1;
const totalLaps = 2; // სულ 2 წრე
let canvas, ctx;
let isDrawing = false;
let secretWord = "";
let categoryName = "";
let savedCanvasData = null; // სეივისთვის

// --- INITIALIZATION ---
window.onload = function() {
    createParticles();
    loadPersistentData(); // ვტვირთავთ მოთამაშეებს
    initCanvas();
    setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("readyScreen").style.display = "flex";
    }, 1000);
};

function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Mouse
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);
    
    // Touch
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e.touches[0]); }, {passive: false});
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); }, {passive: false});
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); stopDraw(); }, {passive: false});
}

function resizeCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper');
    if(wrapper) {
        // ვიმახსოვრებთ სურათს რესაიზამდე
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        // ვცვლით ზომას
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;

        // ვაბრუნებთ სურათს
        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
        
        // თუ შენახული იყო და ახლა ჩაიტვირთა
        if(savedCanvasData && players.length > 0) {
            const img = new Image();
            img.src = savedCanvasData;
            img.onload = () => ctx.drawImage(img, 0, 0);
        }
    }
}

// --- DRAWING ---
function startDraw(e) {
    if(!document.getElementById("drawingSection").classList.contains('active')) return;
    isDrawing = true;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;
    ctx.moveTo(x, y);
    
    // Style
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = players[currentIndex].color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = players[currentIndex].color;
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDraw() {
    if (isDrawing) {
        isDrawing = false;
        ctx.closePath();
        // ავტო-სეივი ხაზის გავლის შემდეგ
        savedCanvasData = canvas.toDataURL();
        savePersistentData();
    }
}

// --- GAME LOGIC ---
function startGame() {
    if (players.length < 3) { alert("მინიმუმ 3 მოთამაშე!"); return; }
    
    const catSelect = document.getElementById("wordCategory").value;
    const pool = words[catSelect];
    secretWord = pool[Math.floor(Math.random() * pool.length)];
    
    // Category name for display
    const catMap = { "mix": "შერეული", "objects": "ნივთები", "animals": "ცხოველები", "places": "ადგილები" };
    categoryName = catMap[catSelect];

    // Assign Colors & Roles
    players.forEach((p, i) => p.color = neonColors[i % neonColors.length]);
    roles = Array(players.length).fill("Artist");
    roles[Math.floor(Math.random() * players.length)] = "Fake";

    // Reset Flow
    currentIndex = 0;
    currentLap = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    savedCanvasData = null;

    setActiveSection("roleSection");
    updateTurnDisplay();
    // არ ვინახავთ მიმდინარე თამაშს, რომ რეფრეშზე თავიდან დაიწყოს
}

function updateTurnDisplay() {
    document.getElementById("playerTurn").innerHTML = `
        <div style="font-size:1.2rem; color:#888; margin-bottom:5px;">წრე ${currentLap} / ${totalLaps}</div>
        <div style="color:${players[currentIndex].color}">${players[currentIndex].name}-ის ჯერია</div>
    `;
    
    const card = document.getElementById("roleCard");
    card.classList.remove("flipped");
    document.getElementById("roleCardFront").innerHTML = `<div class="role-icon"><i class="fas fa-fingerprint"></i></div><div class="role-text" style="font-size:1rem; margin-top:10px">დააჭირე დავალების სანახავად</div>`;
    document.getElementById("goToDrawBtn").style.display = "none";
}

function revealRole() {
    const card = document.getElementById("roleCard");
    card.classList.add("flipped");
    const back = document.getElementById("roleCardBack");
    const role = roles[currentIndex];
    
    if (navigator.vibrate) navigator.vibrate(50);

    if (role === "Fake") {
        back.innerHTML = `
            <div class="role-info-title">შენი როლი</div>
            <div class="role-info-value role-secret">მატყუარა</div>
            <div class="role-info-title">კატეგორია</div>
            <div class="role-info-value">${categoryName}</div>
            <div style="font-size:0.9rem; color:#aaa;">არ იცი სიტყვა, მაგრამ უნდა დახატო!</div>
        `;
    } else {
        back.innerHTML = `
            <div class="role-info-title">შენი როლი</div>
            <div class="role-info-value" style="color:var(--neon-blue)">მხატვარი</div>
            <div class="role-info-title">სიტყვა</div>
            <div class="role-info-value">${secretWord}</div>
        `;
    }
    document.getElementById("goToDrawBtn").style.display = "block";
}

function goToDrawing() {
    setActiveSection("drawingSection");
    const p = players[currentIndex];
    document.getElementById("drawerName").textContent = p.name;
    document.getElementById("drawerName").style.color = p.color;
    
    const ind = document.getElementById("colorIndicator");
    ind.style.backgroundColor = p.color;
    ind.style.color = (p.color === '#ffffff' || p.color === '#ffd700') ? 'black' : 'white';
    
    setTimeout(resizeCanvas, 100); // Ensure size
}

function finishTurn() {
    currentIndex++;
    if (currentIndex >= players.length) {
        currentIndex = 0;
        currentLap++;
    }
    
    if (currentLap > totalLaps) {
        endGame();
    } else {
        setActiveSection("roleSection");
        updateTurnDisplay();
    }
}

function endGame() {
    setActiveSection("resultSection");
    
    // Show final art
    const img = document.getElementById("finalImage");
    img.src = canvas.toDataURL();
    
    // Populate select
    const select = document.getElementById("findSpySelect");
    select.innerHTML = `<option value="" disabled selected>აირჩიეთ...</option>`;
    players.forEach((p, i) => {
        select.innerHTML += `<option value="${i}">${p.name}</option>`;
    });
    
    document.getElementById("votingArea").style.display = "block";
    document.getElementById("finalResult").style.display = "none";
}

function revealResult() {
    const guessIdx = document.getElementById("findSpySelect").value;
    if(guessIdx === "") return;
    
    const fakeIdx = roles.indexOf("Fake");
    const fakeName = players[fakeIdx].name;
    
    document.getElementById("votingArea").style.display = "none";
    document.getElementById("finalResult").style.display = "block";
    
    document.getElementById("fakeArtistName").textContent = fakeName;
    document.getElementById("wordReveal").textContent = `სიტყვა იყო: ${secretWord}`;
}

// --- PLAYERS & NAVIGATION ---
function showMainPage() {
    document.getElementById("readyScreen").style.display = "none";
    document.getElementById("mainContent").style.display = "flex";
    showPlayerInput();
}

function setActiveSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    const logoArea = document.getElementById("logoArea");
    // Show logo only on input screen
    if (id === 'playerInput') {
        logoArea.style.display = "block";
    } else {
        logoArea.style.display = "none";
    }
}

function showPlayerInput() { setActiveSection("playerInput"); updatePlayerList(); }

function addPlayer() {
    const name = document.getElementById("playerName").value.trim();
    if(name && !players.some(p => p.name === name)) {
        players.push({name});
        updatePlayerList();
        document.getElementById("playerName").value = "";
        savePersistentData();
    }
}

function updatePlayerList() {
    const list = document.getElementById("playerList");
    list.innerHTML = "";
    players.forEach((p, i) => {
        list.innerHTML += `
            <div class="player-item">
                <span>${p.name}</span>
                <button class="remove-btn" onclick="removePlayer(${i})"><i class="fas fa-times"></i></button>
            </div>
        `;
    });
}

function removePlayer(i) { players.splice(i, 1); updatePlayerList(); savePersistentData(); }

function restartGame() {
    currentIndex = 0;
    currentLap = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    savedCanvasData = null;
    showPlayerInput();
}

// --- DATA SAVE (Only players) ---
function savePersistentData() {
    localStorage.setItem('cyberArtistPlayers', JSON.stringify(players));
}

function loadPersistentData() {
    const data = localStorage.getItem('cyberArtistPlayers');
    if(data) {
        players = JSON.parse(data);
        updatePlayerList();
    }
}

function createParticles() {
    const c = document.getElementById("particles");
    for(let i=0; i<20; i++) {
        let p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random()*100 + "%";
        p.style.animationDuration = (5 + Math.random()*10) + "s";
        p.style.width = p.style.height = (2+Math.random()*4)+"px";
        c.appendChild(p);
    }
}
