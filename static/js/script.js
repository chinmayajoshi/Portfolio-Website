document.addEventListener('DOMContentLoaded', () => {

    // --- Reveal on Scroll ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    const sections = document.querySelectorAll('section');
    sections.forEach(section => observer.observe(section));


    // --- Theme Switch Logic ---
    const themeToggle = document.getElementById('checkbox');
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') themeToggle.checked = true;
    }
    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode');
        let theme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        localStorage.setItem('theme', theme);
        if (window.updateParticleColor) window.updateParticleColor();
    });

    // --- Animated Mascot Logic ---
    const mascot = document.getElementById('animated-mascot');
    const sparkleContainer = mascot.querySelector('.sparkle-container');
    let mascotTimeout;

    function showMascot() {
        mascot.classList.remove('glittering');
        const positions = [
            { top: '10%', left: '-120px', transform: 'translateX(120px)' },
            { top: '50%', right: '-120px', transform: 'translateX(-120px) scaleX(-1)' },
            { bottom: '5%', left: '-120px', transform: 'translateX(120px)' },
        ];
        const randomPos = positions[Math.floor(Math.random() * positions.length)];
        
        Object.keys(randomPos).forEach(key => mascot.style[key] = randomPos[key] === 'auto' ? '' : randomPos[key]);
        mascot.style.removeProperty('right'); mascot.style.removeProperty('left'); mascot.style.removeProperty('top'); mascot.style.removeProperty('bottom');
        Object.assign(mascot.style, randomPos);

        setTimeout(() => mascot.style.transform += ' rotate(-5deg)', 1000);
        setTimeout(() => mascot.style.transform = mascot.style.transform.replace(' rotate(-5deg)', ''), 4000);
        
        mascotTimeout = setTimeout(hideMascot, 8000);
    }

    function hideMascot() {
        mascot.style.transform = mascot.style.transform.split(' ')[0]; // Reset rotation
        mascotTimeout = setTimeout(showMascot, 15000); // Wait before reappearing
    }

    mascot.addEventListener('click', () => {
        if (mascot.classList.contains('glittering')) return;
        clearTimeout(mascotTimeout);
        mascot.classList.add('glittering');

        for(let i=0; i<10; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.animationDelay = `${Math.random() * 0.2}s`;
            sparkleContainer.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 600);
        }

        mascotTimeout = setTimeout(showMascot, 5000); // Reappear after some time
    });

    showMascot(); // Initial call

    // --- Interactive Terminal Logic ---
    const terminalPopup = document.getElementById('terminal-popup');
    const terminalToggle = document.getElementById('terminal-toggle');
    const terminalClose = document.getElementById('terminal-close');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const commandHistory = [];
    let historyIndex = -1;

    const commands = {
        help: "Available commands:\n[help] - Show this message\n[motd] - Display the message of the day\n[skills] - List technical skills\n[contact] - Show contact information\n[clear] - Clear the terminal",
        motd: "Specialization: Data Science & ML\nCore Strengths: Python, PyTorch, SQL, AWS\nCurrent Status: Seeking new challenges",
        skills: `{{ skills|join(', ') }}`, // This will be rendered by Flask
        contact: "[email] - mailto:[your-email@example.com]\n[github] - https://github.com/[your-github-username]",
        clear: () => { terminalOutput.innerHTML = ''; return ''; }
    };
    
    function toggleTerminal(show) {
        if(show) {
            terminalPopup.classList.remove('hidden');
            terminalInput.focus();
        } else {
            terminalPopup.classList.add('hidden');
        }
    }
    
    terminalToggle.addEventListener('click', () => toggleTerminal(true));
    terminalClose.addEventListener('click', () => toggleTerminal(false));

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && terminalInput.value) {
            const input = terminalInput.value.trim().toLowerCase();
            commandHistory.unshift(input);
            historyIndex = -1;
            
            printToTerminal(`$&nbsp;<span class="command">${input}</span>`);
            const output = commands[input] ? (typeof commands[input] === 'function' ? commands[input]() : commands[input]) : `command not found: ${input}`;
            if(output) printToTerminal(output, 'output');
            
            terminalInput.value = '';
            terminalPopup.querySelector('.terminal-body').scrollTop = terminalPopup.querySelector('.terminal-body').scrollHeight;
        } else if (e.key === 'ArrowUp') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                terminalInput.value = '';
            }
        }
    });
    
    function printToTerminal(text, className = 'prompt') {
        terminalOutput.innerHTML += `<div class="${className}">${text}</div>`;
    }

    printToTerminal("Welcome to my portfolio's interactive shell.\nType 'help' for a list of commands.", "output");

    // --- Project Filtering Logic (no changes from previous version) ---
    const filterContainer = document.querySelector('.project-filters');
    if (filterContainer) {
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const projectTiles = document.querySelectorAll('.project-tile');
        const allButton = filterContainer.querySelector('[data-filter="all"]');
        let activeFilters = [];

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                if (filter === 'all') {
                    activeFilters = [];
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                } else {
                    allButton.classList.remove('active');
                    if (activeFilters.includes(filter)) {
                        activeFilters = activeFilters.filter(f => f !== filter);
                        button.classList.remove('active');
                    } else {
                        activeFilters.push(filter);
                        button.classList.add('active');
                    }
                }
                if (activeFilters.length === 0) {
                    allButton.classList.add('active');
                }
                projectTiles.forEach(tile => {
                    const category = tile.dataset.category;
                    if (activeFilters.length === 0 || activeFilters.includes(category)) {
                        tile.style.display = 'block';
                    } else {
                        tile.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- Background Canvas Animation (no changes from previous version) ---
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles = [];
        let mouse = { x: null, y: null };
        let particleColor = document.body.classList.contains('dark-mode') ? '#eeeeee' : '#3d3d3d';

        window.updateParticleColor = () => { particleColor = document.body.classList.contains('dark-mode') ? '#eeeeee' : '#3d3d3d'; };
        class Particle { constructor() { this.x = mouse.x; this.y = mouse.y; this.size = Math.random() * 2 + 1; this.speedX = Math.random() * 3 - 1.5; this.speedY = Math.random() * 3 - 1.5; this.life = 0; this.maxLife = 50; } update() { this.x += this.speedX; this.y += this.speedY; this.life++; if (this.size > 0.1) this.size -= 0.05; } draw() { ctx.fillStyle = particleColor; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
        function handleParticles() { for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); if (particles[i].life > particles[i].maxLife || particles[i].size <= 0.1) { particles.splice(i, 1); i--; } } }
        function animate() { ctx.clearRect(0, 0, width, height); handleParticles(); requestAnimationFrame(animate); }
        animate();
        window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; for (let i = 0; i < 3; i++) { particles.push(new Particle()); } });
        window.addEventListener('resize', () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });
    }
});
