// --- COLORS (High Contrast) ---
const colors = [
    '#000000', // Black
    '#D50000', // Red
    '#2962FF', // Blue
    '#00C853', // Green
    '#AA00FF', // Purple
    '#FF6D00', // Orange
    '#3E2723', // Brown
    '#C51162'  // Pink
];

const wordData = {
    "mix": [
        // ორიგინალი
        "ვაშლი", "მანქანა", "სახლი", "მზე", "თვითმფრინავი", "ყვავილი", "ხე", "ჭიქა", "გული", "ვარსკვლავი", "ნავი", "ბურთი", "თევზი", "ტელეფონი",
        // დამატებული
        "მთვარე", "ღრუბელი", "ველოსიპედი", "გიტარა", "ნაყინი", "რობოტი", "ცეცხლი", "წყალი", "თოვლი", "წვიმა", "ქოლგა", "კომპიუტერი", "საჩუქარი", "ბუშტი", "ფული", "დროშა", "სანთელი", "ტორტი", "ღიმილი", "თვალი", "ხელი", "მუსიკა", "ზარი", "გვირგვინი", "ბრილიანტი", "ელვა", "ცისარტყელა", "მოჩვენება", "კუდი", "ფრთა"
    ],
    "objects": [
        // ორიგინალი
        "ტელეფონი", "სკამი", "საათი", "სათვალე", "ქუდი", "ბურთი", "წიგნი", "გასაღები", "ლამპა", "ფეხსაცმელი",
        // დამატებული
        "მაგიდა", "კარადა", "სარკე", "სავარცხელი", "მაკრატელი", "კალამი", "ფანქარი", "ჩანთა", "საფულე", "დანა", "ჩანგალი", "კოვზი", "თეფში", "ქვაბი", "ტელევიზორი", "ლეპტოპი", "ყურსასმენი", "საბანი", "ბალიში", "ხალიჩა", "ცოცხი", "ვედრო", "საპონი", "პირსახოცი", "კბილის ჯაგრისი", "ფოტოაპარატი", "ბეჭედი", "ყელსაბამი", "ღილაკი", "სათამაშო"
    ],
    "animals": [
        // ორიგინალი
        "კატა", "ძაღლი", "სპილო", "ჟირაფი", "თევზი", "პეპელა", "ობობა", "გველი", "კუ", "დათვი",
        // დამატებული
        "ლომი", "ვეფხვი", "მგელი", "მელა", "კურდღელი", "ცხენი", "ძროხა", "ღორი", "ცხვარი", "თხა", "მაიმუნი", "ზებრა", "ბეჰემოთი", "ნიანგი", "ზვიგენი", "დელფინი", "ვეშაპი", "რვაფეხა", "არწივი", "ბუ", "თუთიყუში", "მერცხალი", "ქათამი", "იხვი", "ბაყაყი", "ზღარბი", "ციყვი", "ჭიანჭველა", "ფუტკარი", "ლოკოკინა"
    ],
    "places": [
        // ორიგინალი
        "მთა", "ზღვა", "ტყე", "პარკი", "სკოლა", "საავადმყოფო", "მაღაზია", "ხიდი", "პლაჟი", "ქალაქი",
        // დამატებული
        "სოფელი", "მდინარე", "ტბა", "ჩანჩქერი", "უდაბნო", "კუნძული", "გამოქვაბული", "ვულკანი", "კოსმოსი", "მუზეუმი", "თეატრი", "კინოთეატრი", "სტადიონი", "აუზი", "რესტორანი", "კაფე", "ბიბლიოთეკა", "აეროპორტი", "სადგური", "ეკლესია", "ციხესიმაგრე", "სასახლე", "ზოოპარკი", "ცირკი", "ეზო", "ბაღი", "ქუჩა", "სამზარეულო", "საძინებელი", "აბაზანა"
    ]
};


let players = [];
let roles = [];
let currentIndex = 0;
let currentLap = 1;
const totalLaps = 2; 
let canvas, ctx;
let isDrawing = false;
let category = "";
let secretWord = "";
let savedCanvasState = null;

// --- INITIALIZATION ---
window.onload = function() {
    try {
        const saved = localStorage.getItem('fakeArtistState');
        if (saved) {
            const data = JSON.parse(saved);
            // Validation check to prevent crashes
            if (!data.players || !Array.isArray(data.players)) {
                localStorage.removeItem('fakeArtistState');
            }
        }
    } catch(e) {
        localStorage.removeItem('fakeArtistState');
    }

    createParticles();
    loadPersistentData();
    initCanvas();
    preventScreenOff();
    
    setTimeout(() => {
        document.getElementById("loadingScreen").style.display = "none";
        document.getElementById("readyScreen").style.display = "flex";
    }, 800);
};

// --- NAVIGATION ---
function showMainPage() {
    document.getElementById("readyScreen").style.display = "none";
    document.getElementById("mainContent").style.display = "flex";
    showPlayerInput();
}

function setActiveSection(id) {
    document.querySelectorAll('.section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });

    const target = document.getElementById(id);
    if(target) {
        target.style.display = 'flex';
        target.style.flexDirection = 'column'; // Ensure flex layout
        setTimeout(() => target.classList.add('active'), 10);
    }
    
    const logoArea = document.getElementById("logoArea");
    if (id === 'playerInput') {
        logoArea.style.display = "block";
    } else {
        logoArea.style.display = "none";
    }
}

// --- CANVAS & DRAWING ---
function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);
    
    // Passive: false prevents scrolling on iOS/Android while drawing
    canvas.addEventListener('touchstart', (e) => { 
        if(e.target === canvas) e.preventDefault(); 
        startDraw(e.touches[0]); 
    }, {passive: false});
    
    canvas.addEventListener('touchmove', (e) => { 
        if(e.target === canvas) e.preventDefault(); 
        draw(e.touches[0]); 
    }, {passive: false});
    
    canvas.addEventListener('touchend', (e) => { 
        if(e.target === canvas) e.preventDefault(); 
        stopDraw(); 
    }, {passive: false});
}

function resizeCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper');
    if(wrapper && wrapper.offsetParent !== null) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (canvas.width > 0) tempCtx.drawImage(canvas, 0, 0);

        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;

        if (tempCanvas.width > 0) {
            ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
        }
        
        if(savedCanvasState && players.length > 0) {
            const img = new Image();
            img.src = savedCanvasState;
            img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }
}

function startDraw(e) {
    if(!document.getElementById("drawingSection").classList.contains('active')) return;
    
    isDrawing = true;
    ctx.beginPath();
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;
    
    ctx.moveTo(x, y);
    
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = players[currentIndex].color;
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
        savedCanvasState = canvas.toDataURL();
        savePersistentData();
    }
}

// --- GAME FLOW ---
function startGame() {
    if (players.length < 3) { alert("მინიმუმ 3 მოთამაშე!"); return; }
    
    const catSelect = document.getElementById("wordCategory").value;
    const pool = wordData[catSelect] || wordData["mix"];
    secretWord = pool[Math.floor(Math.random() * pool.length)];
    
    const catMap = { "mix": "შერეული", "objects": "ნივთები", "animals": "ცხოველები", "places": "ადგილები" };
    category = catMap[catSelect];

    players.forEach((p, i) => p.color = colors[i % colors.length]);
    roles = Array(players.length).fill("Artist");
    roles[Math.floor(Math.random() * players.length)] = "Fake";

    currentIndex = 0;
    currentLap = 1;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    savedCanvasState = null;

    setActiveSection("roleSection");
    updateTurnDisplay();
    savePersistentData();
}

function updateTurnDisplay() {
    document.getElementById("playerTurn").innerHTML = `
        <div style="font-size:1.2rem; color:#888; margin-bottom:5px;">წრე ${currentLap} / ${totalLaps}</div>
        <div style="color:${players[currentIndex].color}; text-shadow:0 0 10px rgba(0,0,0,0.8);">${players[currentIndex].name}</div>
        <div style="font-size:1rem; color:#fff;">-ის ჯერია</div>
    `;
    
    const card = document.getElementById("roleCard");
    card.classList.remove("flipped");
    document.getElementById("roleCardFront").innerHTML = `<div class="role-icon"><i class="fas fa-fingerprint"></i></div><div class="role-text" style="font-size:1rem; margin-top:10px">დააჭირე როლის სანახავად</div>`;
    document.getElementById("goToDrawBtn").style.display = "none";
}

function revealRole() {
    const card = document.getElementById("roleCard");
    card.classList.add("flipped");
    const back = document.getElementById("roleCardBack");
    const role = roles[currentIndex];
    
    if (navigator.vibrate) navigator.vibrate(50);

    // --- LOGIC CHANGE FOR TEXT ---
    if (role === "Fake") {
        back.innerHTML = `
            <div class="role-label">შენი როლი</div>
            <div class="role-value-big role-spy">ჯაშუში</div>
            <div class="role-label">კატეგორია</div>
            <div class="role-value-big" style="font-size:1.8rem; color:white;">${category}</div>
        `;
    } else {
        back.innerHTML = `
            <div class="role-label">დახატე</div>
            <div class="role-value-big">სიტყვა:<br><span style="color:white">${secretWord}</span></div>
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
    ind.style.color = (['#ffffff', '#ffd700'].includes(p.color)) ? 'black' : 'white';
    
    setTimeout(resizeCanvas, 50);
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
        savePersistentData();
    }
}

// --- NEW FEATURE: FORCE END GAME ---
function forceEndGame() {
    if(confirm("ნამდვილად გსურთ თამაშის შეწყვეტა და ჯაშუშის გამოცნობა?")) {
        endGame();
    }
}

function endGame() {
    setActiveSection("resultSection");
    
    const img = document.getElementById("finalImage");
    img.src = canvas.toDataURL();
    
    const select = document.getElementById("findSpySelect");
    select.innerHTML = `<option value="" disabled selected>აირჩიეთ...</option>`;
    players.forEach((p, i) => {
        select.innerHTML += `<option value="${i}">${p.name}</option>`;
    });
    
    document.getElementById("votingArea").style.display = "block";
    document.getElementById("finalResult").style.display = "none";
    savePersistentData();
}

function revealResult() {
    const guessIdx = document.getElementById("findSpySelect").value;
    if(guessIdx === "") return;
    
    const fakeIdx = roles.indexOf("Fake");
    const fakeName = players[fakeIdx].name;
    
    document.getElementById("votingArea").style.display = "none";
    document.getElementById("finalResult").style.display = "block";
    
    document.getElementById("fakeArtistName").textContent = fakeName;
    document.getElementById("wordReveal").innerHTML = `სიტყვა იყო: <span style="color:white; font-weight:bold">${secretWord}</span>`;
}

// --- PLAYERS ---
function showPlayerInput() { setActiveSection("playerInput"); updatePlayerList(); }

function addPlayer() {
    const nameInput = document.getElementById("playerName");
    const name = nameInput.value.trim();
    if(name && !players.some(p => p.name === name)) {
        players.push({name});
        updatePlayerList();
        nameInput.value = "";
        nameInput.focus();
        savePersistentData();
    }
}

function updatePlayerList() {
    const list = document.getElementById("playerList");
    list.innerHTML = "";
    players.forEach((p, i) => {
        list.innerHTML += `
            <div class="player-item">
                <span style="font-weight:bold; letter-spacing:1px;">${p.name}</span>
                <button class="remove-btn" onclick="removePlayer(${i})"><i class="fas fa-times"></i></button>
            </div>
        `;
    });
}

function removePlayer(i) { players.splice(i, 1); updatePlayerList(); savePersistentData(); }

function restartGame() {
    currentIndex = 0;
    currentLap = 1;
    if(ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    savedCanvasState = null;
    showPlayerInput();
}

function savePersistentData() {
    const data = { players, canvasState: savedCanvasState, activeSection: document.querySelector('.section.active')?.id };
    localStorage.setItem('fakeArtistState', JSON.stringify(data));
}

function loadPersistentData() {
    try {
        const data = JSON.parse(localStorage.getItem('fakeArtistState'));
        if(data && data.players) {
            players = data.players;
            updatePlayerList();
        }
    } catch(e) {}
}

function createParticles() {
    const c = document.getElementById("particles");
    for(let i=0; i<15; i++) {
        let p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random()*100 + "%";
        p.style.animationDuration = (8 + Math.random()*10) + "s";
        p.style.width = p.style.height = (2+Math.random()*4)+"px";
        c.appendChild(p);
    }
}

function preventScreenOff() {
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(()=>{});
}
