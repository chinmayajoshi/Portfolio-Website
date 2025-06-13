document.addEventListener('DOMContentLoaded', () => {

    // --- Reveal on Scroll ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1
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

    // --- UPDATED: Animated Mascot Logic ---
    const mascot = document.getElementById('animated-mascot');
    const clickCounterElement = document.getElementById('owl-click-counter');
    let mascotTimeout;
    let owlClickCount = 0;
    let clickCounterTimeout;


    function showMascot() {
        mascot.classList.remove('vanishing');

        const mascotSize = 100;
        const availableWidth = window.innerWidth - mascotSize;
        const availableHeight = window.innerHeight - mascotSize;

        const randomTop = Math.random() * availableHeight;
        const randomLeft = Math.random() * availableWidth;

        mascot.style.top = `${randomTop}px`;
        mascot.style.left = `${randomLeft}px`;
        mascot.style.transform = Math.random() < 0.5 ? 'scaleX(1)' : 'scaleX(-1)';
        
        // UPDATED: Decreased frequency by increasing timeout
        mascotTimeout = setTimeout(hideMascot, 12000);
    }

    function hideMascot() {
        mascot.classList.add('vanishing');
        mascotTimeout = setTimeout(showMascot, 25000); // It will take longer to reappear
    }

    mascot.addEventListener('click', (e) => {
        if (mascot.classList.contains('vanishing')) return;
        
        clearTimeout(mascotTimeout);
        mascot.classList.add('vanishing');

        owlClickCount++;
        clickCounterElement.textContent = `+${owlClickCount}`;
        
        // UPDATED: Position the counter where the owl was clicked
        const rect = mascot.getBoundingClientRect();
        clickCounterElement.style.top = `${rect.top + rect.height / 2}px`;
        clickCounterElement.style.left = `${rect.left + rect.width / 2}px`;
        clickCounterElement.classList.add('show');
        
        clearTimeout(clickCounterTimeout); 
        clickCounterTimeout = setTimeout(() => {
            clickCounterElement.classList.remove('show');
        }, 2000);

        mascotTimeout = setTimeout(showMascot, 5000);
    });

    // Initial call after a short delay
    setTimeout(showMascot, 3000);


    // --- Interactive Terminal Logic ---
    const terminalPopup = document.getElementById('terminal-popup');
    const terminalToggle = document.getElementById('terminal-toggle');
    const terminalClose = document.getElementById('terminal-close');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const commandHistory = [];
    let historyIndex = -1;

    const hasTerminalBeenOpened = sessionStorage.getItem('terminalOpened');
    if (!hasTerminalBeenOpened) {
        terminalToggle.classList.add('glow');
    }

    // Note: The 'skills' and 'contact' commands are now dynamically populated by Jinja
    const commands = {
        help: "Available commands:\n[help] - Show this message\n[motd] - Display the message of the day\n[skills] - List technical skills\n[contact] - Show contact information\n[clear] - Clear the terminal",
        motd: "Specialization: Data Science & ML\nCore Strengths: Python, PyTorch, SQL, AWS\nCurrent Status: Seeking new challenges",
        skills: `{{ skills|join(', ') }}`,
        contact: "[email] - mailto:{{ personal_info.email }}\n[github] - https://github.com/{{ personal_info.github_username }}",
        clear: () => { terminalOutput.innerHTML = ''; return ''; }
    };
    
    function toggleTerminal(show) {
        if(show) {
            terminalPopup.classList.remove('hidden');
            terminalInput.focus();
            if (terminalToggle.classList.contains('glow')) {
                terminalToggle.classList.remove('glow');
                sessionStorage.setItem('terminalOpened', 'true');
            }
        } else {
            terminalPopup.classList.add('hidden');
        }
    }
    
    terminalToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTerminal(terminalPopup.classList.contains('hidden'));
    });
    terminalClose.addEventListener('click', () => toggleTerminal(false));

    document.addEventListener('click', (event) => {
        if (!terminalPopup.classList.contains('hidden')) {
            const isClickInsideTerminal = terminalPopup.contains(event.target);
            const isClickOnToggle = terminalToggle.contains(event.target);
            
            if (!isClickInsideTerminal && !isClickOnToggle) {
                toggleTerminal(false);
            }
        }
    });

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && terminalInput.value) {
            const input = terminalInput.value.trim().toLowerCase();
            if(input) commandHistory.unshift(input);
            historyIndex = -1;
            
            printToTerminal(`$&nbsp;<span class="command">${input}</span>`);
            const outputText = commands[input] ? (typeof commands[input] === 'function' ? commands[input]() : commands[input]) : `command not found: ${input}`;
            
            // This check prevents empty output from being printed (e.g., after 'clear')
            if(outputText) {
                // Replace Jinja placeholders if they still exist (for presentation)
                const finalOutput = outputText
                    .replace("{{ skills|join(', ') }}", "Python, Scikit-learn, PyTorch, SQL, etc.")
                    .replace("mailto:{{ personal_info.email }}", "mailto:contact@example.com")
                    .replace("https://github.com/{{ personal_info.github_username }}", "https://github.com/example");

                printToTerminal(finalOutput, 'output');
            }
            
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

    printToTerminal("Welcome! Type 'help' for a list of commands.", "output");

    // --- Project Filtering Logic (unchanged) ---
    const filterContainer = document.querySelector('.project-filters');
    if (filterContainer) {
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const projectTiles = document.querySelectorAll('.project-tile');
        const allButton = filterContainer.querySelector('[data-filter="all"]');
        let activeFilters = [];

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                button.classList.toggle('active');

                if (filter === 'all') {
                    activeFilters = [];
                    filterButtons.forEach(btn => { if (btn !== button) btn.classList.remove('active'); });
                } else {
                    allButton.classList.remove('active');
                    if (activeFilters.includes(filter)) {
                        activeFilters = activeFilters.filter(f => f !== filter);
                    } else {
                        activeFilters.push(filter);
                    }
                }
                
                if (activeFilters.length === 0 && !allButton.classList.contains('active')) {
                    allButton.classList.add('active');
                }

                projectTiles.forEach(tile => {
                    const category = tile.dataset.category;
                    if (activeFilters.length === 0 || activeFilters.includes(category)) {
                        tile.style.display = 'flex';
                    } else {
                        tile.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- Background Canvas Animation (unchanged) ---
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
