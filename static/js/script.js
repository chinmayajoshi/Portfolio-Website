// --- Wait for the entire page to load before running scripts ---
window.onload = () => {

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

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

    // --- Animated Mascot Logic ---
    const mascot = document.getElementById('animated-mascot');
    const clickCounterElement = document.getElementById('owl-click-counter');
    let mascotTimeout;
    let owlClickCount = 0;
    let clickCounterTimeout;


    function showMascot() {
        mascot.classList.add('visible'); // Make it appear
        mascot.classList.remove('vanishing');

        const mascotSize = 100;
        const availableWidth = window.innerWidth - mascotSize;
        const availableHeight = window.innerHeight - mascotSize;

        const randomTop = Math.random() * availableHeight;
        const randomLeft = Math.random() * availableWidth;

        mascot.style.top = `${randomTop}px`;
        mascot.style.left = `${randomLeft}px`;
        mascot.style.transform = Math.random() < 0.5 ? 'scaleX(1)' : 'scaleX(-1)';
        
        mascotTimeout = setTimeout(hideMascot, 12000); 
    }

    function hideMascot() {
        mascot.classList.add('vanishing');
        // This class is removed to ensure it can be made visible again later
        mascot.classList.remove('visible'); 
        mascotTimeout = setTimeout(showMascot, 40000); // 40 seconds to reappear
    }

    mascot.addEventListener('click', () => {
        if (mascot.classList.contains('vanishing') || !mascot.classList.contains('visible')) return;
        
        clearTimeout(mascotTimeout);
        mascot.classList.add('vanishing');
        mascot.classList.remove('visible');

        owlClickCount++;
        clickCounterElement.textContent = `+${owlClickCount}`;
        
        const rect = mascot.getBoundingClientRect();
        clickCounterElement.style.top = `${rect.top + rect.height / 2}px`;
        clickCounterElement.style.left = `${rect.left + rect.width / 2}px`;
        clickCounterElement.classList.add('show');
        
        clearTimeout(clickCounterTimeout); 
        clickCounterTimeout = setTimeout(() => {
            clickCounterElement.classList.remove('show');
        }, 2000);

        mascotTimeout = setTimeout(showMascot, 45000); // 45 seconds to reappear after click
    });

    // FIXED: Initial call is correctly delayed after window has fully loaded.
    // The owl is hidden by CSS by default. This timer makes it appear for the first time.
    setTimeout(showMascot, 30000); // 30 seconds


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

    const allProjectsData = JSON.parse(document.getElementById('projects-data').textContent);
    const aboutData = document.getElementById('about-data').textContent;

    const commands = {
        help: "Available commands:\n[help]   - Show this message\n[about]  - Display a summary about me\n[skills] - List my technical skills\n[projects]- List available personal projects\n[contact]- Show contact information\n[theme]  - Toggle light/dark mode\n[date]   - Display the current date\n[clear]  - Clear the terminal\n[exit]   - Close the terminal",
        about: aboutData,
        motd: "Specialization: Data Science & ML\nCore Strengths: Python, PyTorch, SQL, AWS\nCurrent Status: Seeking new challenges",
        skills: `{{ skills|join(', ') }}`,
        contact: "[email] - mailto:{{ personal_info.email }}\n[github] - https://github.com/{{ personal_info.github_username }}",
        projects: () => allProjectsData.map(p => `- ${p.title} (${p.category})`).join('\n'),
        date: () => new Date().toLocaleString(),
        theme: () => {
            themeToggle.click();
            return `Theme toggled to ${document.body.classList.contains('dark-mode') ? 'Dark' : 'Light'} Mode.`;
        },
        clear: () => { terminalOutput.innerHTML = ''; return ''; },
        exit: () => { toggleTerminal(false); return '';}
    };
    
    function toggleTerminal(show) {
        const isHidden = terminalPopup.classList.contains('hidden');
        if (show === undefined) show = isHidden; 

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
        toggleTerminal();
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
            
            printToTerminal(`$&nbsp;<span class="command">${input}</span>`, 'prompt');
            const commandFn = commands[input];
            const outputText = commandFn ? (typeof commandFn === 'function' ? commandFn() : commandFn) : `command not found: ${input}`;
            
            if(outputText) {
                printToTerminal(outputText, 'output');
            }
            
            terminalInput.value = '';
            terminalPopup.querySelector('.terminal-body').scrollTop = terminalPopup.querySelector('.terminal-body').scrollHeight;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                terminalInput.value = '';
            }
        }
    });
    
    function printToTerminal(text, className = 'output') {
        const line = document.createElement('div');
        line.className = className;
        line.innerHTML = text;
        terminalOutput.appendChild(line);
    }

    printToTerminal("Welcome! Type 'help' for a list of commands.", "output");

    // --- Project Filtering Logic ---
    const filterContainer = document.querySelector('.project-filters');
    if (filterContainer) {
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        const projectTiles = document.querySelectorAll('.project-tile');
        const allButton = filterContainer.querySelector('[data-filter="all"]');
        let activeFilters = [];

        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 
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

    // --- NEW: Project Modal Logic ---
    const projectGrid = document.querySelector('.project-grid');
    const modal = document.getElementById('project-modal');
    const modalBackdrop = document.getElementById('project-modal-backdrop');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalTechStack = document.getElementById('modal-tech-stack');

    function openModal(projectId) {
        const projectData = allProjectsData.find(p => p.id === projectId);
        if (!projectData) return;

        modalTitle.textContent = projectData.title;

        // Populate description
        modalDescription.innerHTML = '';
        const descList = document.createElement('ul');
        projectData.description.forEach(point => {
            const item = document.createElement('li');
            item.textContent = point;
            descList.appendChild(item);
        });
        modalDescription.appendChild(descList);

        // Populate tech stack
        modalTechStack.innerHTML = '';
        projectData.tech_stack.forEach(tech => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = tech;
            modalTechStack.appendChild(tag);
        });

        modal.classList.remove('hidden');
        modalBackdrop.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
        modalBackdrop.classList.add('hidden');
    }

    projectGrid.addEventListener('click', (e) => {
        const actionButton = e.target.closest('.project-action-btn');
        if (!actionButton) return;

        // Check if it's the details button (and not the github link)
        if (actionButton.tagName.toLowerCase() === 'button') {
             const tile = e.target.closest('.project-tile');
             if (tile) {
                openModal(tile.dataset.projectId);
            }
        }
    });

    modalCloseBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);


    // --- Background Canvas Animation ---
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles = [];
        let mouse = { x: null, y: null };
        
        window.updateParticleColor = () => document.body.classList.contains('dark-mode') ? '#eeeeee' : '#3d3d3d';
        let particleColor = window.updateParticleColor();

        class Particle { constructor() { this.x = mouse.x; this.y = mouse.y; this.size = Math.random() * 2 + 1; this.speedX = Math.random() * 3 - 1.5; this.speedY = Math.random() * 3 - 1.5; this.life = 0; this.maxLife = 50; } update() { this.x += this.speedX; this.y += this.speedY; this.life++; if (this.size > 0.1) this.size -= 0.05; } draw() { ctx.fillStyle = particleColor; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
        function handleParticles() { for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); if (particles[i].life > particles[i].maxLife || particles[i].size <= 0.1) { particles.splice(i, 1); i--; } } }
        function animate() { ctx.clearRect(0, 0, width, height); handleParticles(); requestAnimationFrame(animate); }
        animate();
        window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; for (let i = 0; i < 3; i++) { particles.push(new Particle()); } });
        window.addEventListener('resize', () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });
    }
};
