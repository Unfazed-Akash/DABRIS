document.addEventListener('DOMContentLoaded', () => {
    // --- UI ELEMENTS ---
    const chatMessages = document.getElementById('chat-messages');
    const messageForm = document.getElementById('message-form');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const uploadButton = document.getElementById('upload-button');
    const csvUploadInput = document.getElementById('csv-upload');
    const toastContainer = document.getElementById('toast-container');
    const preloader = document.querySelector('.preloader');
    const themeToggle = document.getElementById('theme-toggle');
    const contactForm = document.getElementById('contact-form');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section');
    const yearSpan = document.getElementById('year');

    // --- HELPER FUNCTIONS ---
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    };

    const addMessage = (content, sender) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        messageDiv.appendChild(contentDiv);
        if (chatMessages) {
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        return messageDiv;
    };

    const setInputDisabled = (disabled) => {
        if (userInput) userInput.disabled = disabled;
        if (sendButton) sendButton.disabled = disabled;
    };

    // --- PRELOADER ---
    window.addEventListener('load', () => {
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => { preloader.style.display = 'none'; }, 500);
        }
    });

    // --- THEME TOGGLER ---
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

        themeToggle.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggle.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        });
    }

    // --- ACTIVE NAV HIGHLIGHT ---
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // --- FOOTER YEAR ---
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- UPDATED: WORKING CONTACT FORM ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');
            
            // Set your email address here
            const yourEmail = 'unfazedakash@gmail.com';
            
            const subject = `Message from ${name} via DABRIS Website`;
            const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
            
            // Create and trigger the mailto link
            window.location.href = `mailto:${yourEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            showToast('Opening your email client...', 'success');
            contactForm.reset();
        });
    }

    // --- SCROLL REVEAL ANIMATION ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        for (let i = 0; i < revealElements.length; i++) {
            const elementTop = revealElements[i].getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                revealElements[i].classList.add('show');
            }
        }
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // --- CHATBOT LOGIC (UNCHANGED) ---
    if (messageForm) {
        addMessage("Welcome to <strong>DABRIS</strong>! Please upload a CSV file to begin your analysis.", "bot");

        uploadButton.addEventListener('click', () => csvUploadInput.click());

        csvUploadInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const uploadMessage = addMessage("Uploading and processing your file...", "bot");
            const formData = new FormData();
            formData.append('csvFile', file);
            try {
                const response = await fetch('/upload', { method: 'POST', body: formData });
                if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
                const data = await response.json();
                if (data.status === 'success') {
                    uploadMessage.remove();
                    addMessage(`Successfully loaded <strong>${data.filename}</strong>. You can now ask questions.`, "bot");
                    showToast(`File loaded: ${data.filename}`, 'success');
                    setInputDisabled(false);
                    userInput.focus();
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                uploadMessage.remove();
                addMessage(`Error: ${error.message}`, 'bot');
                showToast(error.message, 'error');
            } finally {
                csvUploadInput.value = '';
            }
        });

        messageForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const query = userInput.value.trim();
            if (!query) return;
            addMessage(query, 'user');
            userInput.value = '';
            setInputDisabled(true);
            const typingIndicator = addMessage('<div class="typing-indicator"><span></span><span></span><span></span></div>', 'bot');
            try {
                const response = await fetch('/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query }),
                });
                if (!response.ok) throw new Error(`Analysis error: ${response.statusText}`);
                const data = await response.json();
                typingIndicator.querySelector('.message-content').innerHTML = data.response || 'Sorry, I could not process that.';
            } catch (error) {
                typingIndicator.querySelector('.message-content').textContent = `An error occurred. Please try again.`;
                showToast(error.message, 'error');
            } finally {
                setInputDisabled(false);
                userInput.focus();
            }
        });
    }
});