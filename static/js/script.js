// --- Wait for the entire page to load before running scripts ---
window.onload = () => {

    // --- App State & Element Selectors ---
    const body = document.body;
    const mainContent = document.querySelector('main');
    const sidebarNav = document.querySelector('.sidebar-nav');
    const sectionCloseButtons = document.querySelectorAll('.section-close-btn');

    // --- Navigation Logic ---
    function openSection(targetId) {
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        const targetNavButton = document.querySelector(`.nav-button[data-target="${targetId}"]`);
        if (targetNavButton) {
            targetNavButton.classList.add('is-active');
        }

        // Show main content container if it's the first section being opened
        if (document.querySelectorAll('section.is-visible').length === 0) {
            mainContent.classList.remove('hidden');
        }

        targetSection.classList.add('is-visible');

        setTimeout(() => {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            body.classList.remove('no-scroll');
        }, 100);
    }

    function closeSection(targetId) {
        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        const targetNavButton = document.querySelector(`.nav-button[data-target="${targetId}"]`);
        if (targetNavButton) {
            targetNavButton.classList.remove('is-active');
        }

        targetSection.classList.add('is-closing');
        targetSection.addEventListener('animationend', () => {
            targetSection.classList.remove('is-closing', 'is-visible');
            // If no sections are left open, hide the main container
            if (document.querySelectorAll('section.is-visible').length === 0) {
                mainContent.classList.add('hidden');
                body.classList.add('no-scroll');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, { once: true });
    }

    // --- FIX: Restored multi-section toggle logic ---
    sidebarNav.addEventListener('click', (e) => {
        const navButton = e.target.closest('.nav-button');
        if (!navButton) return;
        e.preventDefault();
        const targetId = navButton.dataset.target;
        const targetSection = document.querySelector(targetId);

        // Toggle the section's visibility based on its current state
        if (targetSection && targetSection.classList.contains('is-visible')) {
            closeSection(targetId);
        } else {
            openSection(targetId);
        }
    });

    // --- Section Close Buttons ---
    sectionCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionToClose = button.closest('section');
            if (sectionToClose) {
                closeSection(`#${sectionToClose.id}`);
            }
        });
    });

    // --- Mobile Navigation ---
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mobileNavPanel = document.getElementById('mobile-nav-panel');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNavLinksContainer = document.querySelector('.mobile-nav-links');

    if (sidebarNav && mobileNavLinksContainer) {
        const navLinks = sidebarNav.querySelectorAll('a.nav-button');
        navLinks.forEach(link => {
            const clonedLink = link.cloneNode(true);
            clonedLink.classList.add('mobile-nav-button');
            clonedLink.querySelector('.nav-button-text').style.opacity = '1';
            mobileNavLinksContainer.appendChild(clonedLink);
        });
    }

    mobileNavToggle.addEventListener('click', () => mobileNavPanel.classList.add('is-open'));
    mobileNavClose.addEventListener('click', () => mobileNavPanel.classList.remove('is-open'));

    mobileNavLinksContainer.addEventListener('click', (e) => {
        const navButton = e.target.closest('.nav-button');
        if (!navButton) return;
        e.preventDefault();
        const targetId = navButton.dataset.target;
        
        // Mobile also uses the toggle logic now
        const targetSection = document.querySelector(targetId);
         if (targetSection && targetSection.classList.contains('is-visible')) {
            closeSection(targetId);
        } else {
            openSection(targetId);
        }
        
        // We can close the panel after any selection
        mobileNavPanel.classList.remove('is-open');
    });

    // --- Theme Switch Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    function applyTheme(theme) {
        body.classList.toggle('dark-mode', theme === 'dark-mode');
        localStorage.setItem('theme', theme);
        if (window.updateParticleColor) window.updateParticleColor();
    }
    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
        applyTheme(newTheme);
    });
    const savedTheme = localStorage.getItem('theme') || 'light-mode';
    applyTheme(savedTheme);

    // --- Animated Mascot Logic ---
    const mascot = document.getElementById('animated-mascot');
    const clickCounterElement = document.getElementById('owl-click-counter');
    let mascotTimeout; let owlClickCount = 0; let clickCounterTimeout;
    function showMascot() {
        mascot.classList.add('visible'); mascot.classList.remove('vanishing');
        const mascotSize = 100; const availableWidth = window.innerWidth - mascotSize; const availableHeight = window.innerHeight - mascotSize;
        const randomTop = Math.random() * availableHeight; const randomLeft = Math.random() * availableWidth;
        mascot.style.top = `${randomTop}px`; mascot.style.left = `${randomLeft}px`; mascot.style.transform = Math.random() < 0.5 ? 'scaleX(1)' : 'scaleX(-1)';
        mascotTimeout = setTimeout(hideMascot, 12000);
    }
    function hideMascot() { mascot.classList.add('vanishing'); mascot.classList.remove('visible'); mascotTimeout = setTimeout(showMascot, 40000); }
    mascot.addEventListener('click', () => {
        if (mascot.classList.contains('vanishing') || !mascot.classList.contains('visible')) return;
        clearTimeout(mascotTimeout); mascot.classList.add('vanishing'); mascot.classList.remove('visible');
        owlClickCount++; clickCounterElement.textContent = `+${owlClickCount}`;
        const rect = mascot.getBoundingClientRect();
        clickCounterElement.style.top = `${rect.top + rect.height / 2}px`; clickCounterElement.style.left = `${rect.left + rect.width / 2}px`;
        clickCounterElement.classList.add('show');
        clearTimeout(clickCounterTimeout);
        clickCounterTimeout = setTimeout(() => { clickCounterElement.classList.remove('show'); }, 2000);
        mascotTimeout = setTimeout(showMascot, 45000);
    });
    setTimeout(showMascot, 30000);

    // --- Interactive Terminal & Chatbot Logic ---
    const terminalPopup = document.getElementById('terminal-popup');
    const terminalToggle = document.getElementById('terminal-toggle');
    const terminalClose = document.getElementById('terminal-close');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    let commandHistory = []; let historyIndex = -1;
    const hasTerminalBeenOpened = sessionStorage.getItem('terminalOpened');
    if (!hasTerminalBeenOpened) { terminalToggle.classList.add('glow'); }
    const allProjectsData = JSON.parse(document.getElementById('projects-data').textContent);
    let conversationHistory = [];
    async function handleChat(userInput) {
        printToTerminal(`> ${userInput}`, 'prompt');
        const thinkingLine = document.createElement('div');
        thinkingLine.className = 'output';
        thinkingLine.innerHTML = 'Thinking...';
        terminalOutput.appendChild(thinkingLine);
        scrollToBottom();
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput, history: conversationHistory })
            });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.error?.message || 'An unknown error occurred.'); }
            const botMessage = data.choices[0]?.message?.content;
            if (botMessage) {
                thinkingLine.innerHTML = botMessage.replace(/\n/g, '<br>');
                conversationHistory.push({ role: 'user', content: userInput });
                conversationHistory.push({ role: 'assistant', content: botMessage });
            } else {
                thinkingLine.innerHTML = 'Sorry, I couldn\'t generate a response.';
            }
        } catch (error) {
            console.error('Chat Error:', error);
            thinkingLine.innerHTML = `<span class="error">Error: Could not connect to the chat service. ${error.message}</span>`;
        }
        scrollToBottom();
    }
    const metaCommands = {
        help: () => `<span class="help-command">Ask me anything about my portfolio, skills, or projects.<br>Meta-commands:<br>help&nbsp;&nbsp;&nbsp;&nbsp;- show this help message<br>theme&nbsp;&nbsp;&nbsp;- toggle light/dark mode<br>clear&nbsp;&nbsp;&nbsp;- clear the terminal screen<br>exit&nbsp;&nbsp;&nbsp;&nbsp;- close the terminal</span>`,
        theme: () => { const newTheme = body.classList.contains('dark-mode') ? 'Light' : 'Dark'; themeToggle.click(); return `Theme toggled to ${newTheme} Mode.`; },
        clear: () => { terminalOutput.innerHTML = ''; return ''; },
        exit: () => { toggleTerminal(false); return ''; }
    };
    function toggleTerminal(show) {
        const isHidden = terminalPopup.classList.contains('hidden');
        if (show === undefined) show = isHidden;
        if (show) {
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
    function scrollToBottom() { terminalPopup.querySelector('.terminal-body').scrollTop = terminalPopup.querySelector('.terminal-body').scrollHeight; }
    terminalToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleTerminal(); });
    terminalClose.addEventListener('click', () => toggleTerminal(false));
    document.addEventListener('click', (e) => {
        if (!terminalPopup.classList.contains('hidden')) {
            const isClickInsideTerminal = terminalPopup.contains(e.target);
            const isClickOnToggle = terminalToggle.contains(e.target);
            if (!isClickInsideTerminal && !isClickOnToggle) { toggleTerminal(false); }
        }
    });
    terminalInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && terminalInput.value) {
            e.preventDefault();
            const input = terminalInput.value.trim();
            terminalInput.value = '';
            if (!input) return;
            commandHistory.unshift(input);
            historyIndex = -1;
            const metaCommandFn = metaCommands[input.toLowerCase()];
            if (metaCommandFn) {
                printToTerminal(`> ${input}`, 'prompt');
                const outputText = metaCommandFn();
                if (outputText) printToTerminal(outputText, 'output');
            } else {
                await handleChat(input);
            }
            scrollToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault(); if (historyIndex < commandHistory.length - 1) { historyIndex++; terminalInput.value = commandHistory[historyIndex]; }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault(); if (historyIndex > 0) { historyIndex--; terminalInput.value = commandHistory[historyIndex]; } else { historyIndex = -1; terminalInput.value = ''; }
        }
    });
    function printToTerminal(text, className = 'output') { const line = document.createElement('div'); line.className = className; line.innerHTML = text; terminalOutput.appendChild(line); }
    printToTerminal("Ask me about my skills, projects, or type 'help'.", "output");

    // --- Multi-select filtering logic ---
    function setupMultiSelectFilter(containerSelector, itemSelector, filterAttribute, paginationFunction) {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        const filterButtons = container.querySelectorAll('.filter-btn');
        const allButton = container.querySelector('[data-filter="all"]');
        const items = Array.from(document.querySelectorAll(itemSelector));
        let activeFilters = new Set();

        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                const filter = button.dataset.filter.toLowerCase();
                if (filter === 'all') {
                    activeFilters.clear();
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    allButton.classList.add('active');
                } else {
                    button.classList.toggle('active');
                    if (activeFilters.has(filter)) { activeFilters.delete(filter); }
                    else { activeFilters.add(filter); }
                    if (activeFilters.size === 0) { allButton.classList.add('active'); }
                    else { allButton.classList.remove('active'); }
                }
                
                items.forEach(item => {
                    const itemCategory = item.dataset[filterAttribute] ? item.dataset[filterAttribute].toLowerCase() : '';
                    const shouldShow = activeFilters.size === 0 || activeFilters.has(itemCategory);
                    item.style.display = shouldShow ? '' : 'none';
                });

                if (paginationFunction) {
                    paginationFunction();
                }
            });
        });
    }

    // --- Pagination Logic ---
    function setupPagination(gridSelector, itemSelector, controlsSelector, itemsPerPage) {
        const grid = document.querySelector(gridSelector);
        const controls = document.querySelector(controlsSelector);
        if (!grid || !controls) return;

        let currentPage = 1;

        const displayPage = (page) => {
            currentPage = page;
            const visibleItems = Array.from(grid.querySelectorAll(itemSelector)).filter(item => item.style.display !== 'none');
            const pageCount = Math.ceil(visibleItems.length / itemsPerPage);
            
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            visibleItems.forEach(item => item.classList.add('hidden-by-pagination'));
            visibleItems.slice(start, end).forEach(item => item.classList.remove('hidden-by-pagination'));

            updateControls(pageCount);
        };

        const updateControls = (pageCount) => {
            controls.innerHTML = '';
            if (pageCount <= 1) return;

            const prevButton = document.createElement('button');
            prevButton.textContent = '‹';
            prevButton.classList.add('pagination-btn');
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener('click', () => displayPage(currentPage - 1));
            controls.appendChild(prevButton);

            for (let i = 1; i <= pageCount; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.classList.add('pagination-btn');
                if (i === currentPage) pageButton.classList.add('active');
                pageButton.addEventListener('click', () => displayPage(i));
                controls.appendChild(pageButton);
            }

            const nextButton = document.createElement('button');
            nextButton.textContent = '›';
            nextButton.classList.add('pagination-btn');
            nextButton.disabled = currentPage === pageCount;
            nextButton.addEventListener('click', () => displayPage(currentPage + 1));
            controls.appendChild(nextButton);
        };

        const runPagination = () => displayPage(1);

        runPagination();
        
        return runPagination;
    }

    const certPagination = setupPagination('.cert-grid', '.cert-tile', '#cert-pagination', 6);
    setupMultiSelectFilter('.project-filters', '.project-tile', 'category');
    setupMultiSelectFilter('.cert-filters', '.cert-tile', 'issuer', certPagination);

    // --- Project Modal Logic ---
    const projectGrid = document.querySelector('.project-grid'); const modal = document.getElementById('project-modal'); const modalBackdrop = document.getElementById('project-modal-backdrop'); const modalCloseBtn = document.getElementById('modal-close-btn'); const modalTitle = document.getElementById('modal-title'); const modalDescription = document.getElementById('modal-description'); const modalTechStack = document.getElementById('modal-tech-stack');
    if (projectGrid) {
        function openModal(projectId) {
            const projectData = allProjectsData.find(p => p.id === projectId); if (!projectData) return;
            modalTitle.textContent = projectData.title;
            modalDescription.innerHTML = '';
            const descList = document.createElement('ul');
            projectData.description.forEach(point => { const item = document.createElement('li'); item.textContent = point; descList.appendChild(item); });
            modalDescription.appendChild(descList);
            modalTechStack.innerHTML = '';
            projectData.tech_stack.forEach(tech => { const tag = document.createElement('span'); tag.className = 'skill-tag'; tag.textContent = tech; modalTechStack.appendChild(tag); });
            modal.classList.remove('hidden');
            modalBackdrop.classList.remove('hidden');
        }
        function closeModal() {
            modal.style.transform = `translate(-50%, -50%) scale(0.95)`;
            modal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            modal.classList.add('hidden');
            modalBackdrop.classList.add('hidden');
        }
        projectGrid.addEventListener('click', (e) => {
            const actionButton = e.target.closest('.project-action-btn'); if (!actionButton) return;
            if (actionButton.tagName.toLowerCase() === 'button') {
                const tile = e.target.closest('.project-tile');
                if (tile) { openModal(tile.dataset.projectId); }
            }
        });
        modalCloseBtn.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', closeModal);
    }

    // --- Background Canvas Animation ---
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth; let height = canvas.height = window.innerHeight;
        let particles = []; let mouse = { x: null, y: null }; let particleColor;
        window.updateParticleColor = () => {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const rootStyles = getComputedStyle(document.documentElement);
            particleColor = isDarkMode ? rootStyles.getPropertyValue('--gold-color').trim() : rootStyles.getPropertyValue('--primary-accent').trim();
        };
        window.updateParticleColor();
        class Particle { constructor() { this.x = mouse.x; this.y = mouse.y; this.size = Math.random() * 2 + 1; this.speedX = Math.random() * 3 - 1.5; this.speedY = Math.random() * 3 - 1.5; this.life = 0; this.maxLife = 50; } update() { this.x += this.speedX; this.y += this.speedY; this.life++; if (this.size > 0.1) this.size -= 0.05; } draw() { ctx.fillStyle = particleColor; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
        function handleParticles() { for (let i = 0; i < particles.length; i++) { particles[i].update(); particles[i].draw(); if (particles[i].life > particles[i].maxLife || particles[i].size <= 0.1) { particles.splice(i, 1); i--; } } }
        function animate() { ctx.clearRect(0, 0, width, height); handleParticles(); requestAnimationFrame(animate); }
        animate();
        window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; for (let i = 0; i < 2; i++) { particles.push(new Particle()); } });
        window.addEventListener('resize', () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });
    }

    // --- Scroll to Top Button Logic ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.remove('hidden');
        } else {
            scrollToTopBtn.classList.add('hidden');
        }
    });
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};
