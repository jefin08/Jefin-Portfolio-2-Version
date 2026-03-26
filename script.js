document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 0. PREMIUM LOADER LOGIC
    // =========================================================
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        const percentEl = document.getElementById('loading-percent');

        let start = null;
        const duration = 3000; // Counter takes exactly 3 seconds

        function updateCounter(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;

            // Ease out cubic function for smooth slowdown at the end
            const easeOutQuart = 1 - Math.pow(1 - Math.min(progress / duration, 1), 4);
            const currentPercent = Math.floor(easeOutQuart * 100);

            if (percentEl) {
                percentEl.textContent = currentPercent.toString().padStart(2, '0');
            }

            if (progress < duration) {
                requestAnimationFrame(updateCounter);
            } else if (percentEl) {
                percentEl.textContent = '100';
            }
        }

        requestAnimationFrame(updateCounter);

        // Reveal the portfolio after exactly 3 seconds
        setTimeout(() => {
            document.body.classList.add('loaded');

            // Auto-scroll a little to the bottom for a dynamic reveal
            window.scrollBy({
                top: 10,
                left: 0,
                behavior: 'smooth'
            });

            // Remove from DOM after transition
            setTimeout(() => {
                if (loader) loader.style.display = 'none';
            }, 1000);
        }, 3000);
    });

    // =========================================================
    // 1. LIVE TIME TRACKER
    // =========================================================
    const timeTracker = document.getElementById('clock');

    function updateLocationTime() {
        const now = new Date();
        const options = {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        const timeString = now.toLocaleTimeString('en-US', options);
        if (timeTracker) {
            timeTracker.textContent = timeString;
        }
    }

    setInterval(updateLocationTime, 1000);
    updateLocationTime();

    // =========================================================
    // 2. SCROLL-DRIVEN REVEAL OBSERVER
    // =========================================================
    const scrollElements = document.querySelectorAll('[data-scroll]');

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const observerMargin = window.innerHeight > 800 ? '0px 0px -100px 0px' : '0px 0px -40px 0px';

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            } else {
                // Keep hero and some important sections revealed
                if (!entry.target.closest('#about') && !entry.target.classList.contains('stay-revealed')) {
                    entry.target.classList.remove('revealed');
                }
            }
        });
    }, {
        root: null,
        rootMargin: observerMargin,
        threshold: 0.1
    });

    scrollElements.forEach(el => revealObserver.observe(el));

    // =========================================================
    // 2.2 AUTO-HOVER / SCROLL-FOCUS (Mobile Specific)
    // =========================================================
    if (isTouchDevice) {
        const focusObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                // Only trigger for interactive rows/cards
                if (el.classList.contains('exp-row') || 
                    el.classList.contains('forge-item') || 
                    el.classList.contains('achv-row')) {
                    
                    if (entry.isIntersecting) {
                        el.classList.add('active-scroll');
                    } else {
                        el.classList.remove('active-scroll');
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '-20% 0px -20% 0px', // Trigger when near the center 60% of screen
            threshold: 0.5
        });

        // Observe interactive elements
        const interactiveElements = document.querySelectorAll('.exp-row, .forge-item, .achv-row');
        interactiveElements.forEach(el => focusObserver.observe(el));
    }

    // Immediately reveal elements already visible on load (e.g. hero)
    requestAnimationFrame(() => {
        scrollElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('revealed');
            }
        });
    });

    // =========================================================
    // 2.1 SMOOTH VELOCITY SKEW EFFECT (CSS Variable Based)
    // =========================================================
    // Completely skip the skew rAF loop on mobile for performance
    if (!(isTouchDevice && window.innerWidth < 1024)) {
        let lastPos = window.pageYOffset;
        let skewValue = 0;
        
        function updateSkew() {
            const newPos = window.pageYOffset;
            const diff = newPos - lastPos;
            
            const targetSkew = Math.max(Math.min(diff * 0.1, 3), -3);
            skewValue += (targetSkew - skewValue) * 0.1;
            
            if (Math.abs(skewValue) > 0.01 || Math.abs(targetSkew) > 0.01) {
                document.documentElement.style.setProperty('--scroll-skew', `${skewValue}deg`);
            } else {
                document.documentElement.style.setProperty('--scroll-skew', `0deg`);
            }

            lastPos = newPos;
            requestAnimationFrame(updateSkew);
        }

        requestAnimationFrame(updateSkew);
    } else {
        document.documentElement.style.setProperty('--scroll-skew', '0deg');
    }

    // =========================================================
    // 3. HERO PARALLAX (scroll-driven depth effect)
    // =========================================================
    const heroParallax = document.getElementById('hero-parallax');
    let ticking = false;

    // Enable parallax transition after entrance animation completes
    if (heroParallax) {
        heroParallax.addEventListener('animationend', (e) => {
            if (e.animationName === 'phantomMaterialize') {
                // Clear animation fill so parallax inline transforms take effect
                heroParallax.style.animation = 'none';
                heroParallax.style.opacity = '1';
                heroParallax.style.clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
                heroParallax.style.transform = 'perspective(2500px) rotateY(0deg) translateX(0) scale(1)';
                heroParallax.style.filter = 'blur(0) grayscale(0)';
                heroParallax.classList.add('parallax-ready');
            }
        });
    }

    function updateParallax() {
        if (!heroParallax || window.innerWidth <= 768) return; // Disable parallax on mobile
        const scrollY = window.scrollY;
        const speed = 0.4;
        heroParallax.style.transform = `translateY(${scrollY * speed}px)`;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });

    // =========================================================
    // 3.1 CURSOR-DRIVEN PORTRAIT PARALLAX (3D Window Effect)
    // =========================================================
    const moodyPortrait = document.querySelector('.moody-portrait');

    if (moodyPortrait) {
        window.addEventListener('mousemove', (e) => {
            // Get percentage of mouse position from center
            const xOffset = (e.clientX / window.innerWidth - 0.5) * 2;
            const yOffset = (e.clientY / window.innerHeight - 0.5) * 2;

            // Move opposite to cursor for "window behind text" feel
            // Max movement of 20px
            const panX = xOffset * -20;
            const panY = yOffset * -20;

            moodyPortrait.style.transform = `translate(${panX}px, ${panY}px) scale(1.1)`;
        });
    }

    // =========================================================
    // 4. FLOATING NAV — AUTO-HIDE ON SCROLL DOWN
    // =========================================================
    const floatingNav = document.querySelector('.floating-nav');
    let lastScrollY = window.scrollY;
    let navTicking = false;
    let scrollStopTimer = null;

    function updateNavVisibility() {
        const currentScrollY = window.scrollY;
        if (!floatingNav) return;

        // Fade whenever actively scrolling (any direction)
        floatingNav.classList.add('nav-faded');

        lastScrollY = currentScrollY;
        navTicking = false;
    }

    window.addEventListener('scroll', () => {
        if (!navTicking) {
            requestAnimationFrame(updateNavVisibility);
            navTicking = true;
        }

        // Restore full opacity after scrolling stops
        clearTimeout(scrollStopTimer);
        scrollStopTimer = setTimeout(() => {
            if (floatingNav) floatingNav.classList.remove('nav-faded');
        }, 400);
    }, { passive: true });

    // Hide nav completely when footer is in view
    const footer = document.querySelector('.massive-footer');
    const mobileNavContainer = document.querySelector('.mobile-nav-container');

    if (footer && (floatingNav || mobileNavContainer)) {
        const footerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (floatingNav) floatingNav.classList.add('nav-at-footer');
                    if (mobileNavContainer) mobileNavContainer.classList.add('nav-at-footer');
                } else {
                    if (floatingNav) floatingNav.classList.remove('nav-at-footer');
                    if (mobileNavContainer) mobileNavContainer.classList.remove('nav-at-footer');
                }
            });
        }, { threshold: 0, rootMargin: '0px' });

        footerObserver.observe(footer);
    }


    // =========================================================
    // 5. SCATTER GALLERY LOGIC (preserved from original)
    // =========================================================
    const scatterGallery = document.getElementById('scatter-gallery');
    const forgeItems = document.querySelectorAll('.forge-item');

    if (scatterGallery && forgeItems.length > 0) {
        const scatterImages = scatterGallery.querySelectorAll('.scatter-img');

        document.addEventListener('mousemove', (e) => {
            scatterGallery.style.left = e.clientX + 'px';
            scatterGallery.style.top = e.clientY + 'px';
        });

        forgeItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (isTouchDevice) return; // Disable popup on mobile
                const scatterData = item.getAttribute('data-scatter');
                if (scatterData) {
                    const imgUrls = scatterData.split(',');
                    scatterImages.forEach((img, index) => {
                        if (imgUrls[index]) {
                            img.src = imgUrls[index].trim();
                        }
                    });

                    const slots = [
                        { x: -160, y: -130, rot: -12 },
                        { x: 170, y: -40, rot: 12 },
                        { x: -80, y: 140, rot: -8 },
                    ];

                    for (let i = slots.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [slots[i], slots[j]] = [slots[j], slots[i]];
                    }

                    scatterGallery.style.setProperty('--tx-1', `${slots[0].x}px`);
                    scatterGallery.style.setProperty('--ty-1', `${slots[0].y}px`);
                    scatterGallery.style.setProperty('--r-1', `${slots[0].rot + (Math.random() * 6 - 3)}deg`);

                    scatterGallery.style.setProperty('--tx-2', `${slots[1].x}px`);
                    scatterGallery.style.setProperty('--ty-2', `${slots[1].y}px`);
                    scatterGallery.style.setProperty('--r-2', `${slots[1].rot + (Math.random() * 6 - 3)}deg`);

                    scatterGallery.style.setProperty('--tx-3', `${slots[2].x}px`);
                    scatterGallery.style.setProperty('--ty-3', `${slots[2].y}px`);
                    scatterGallery.style.setProperty('--r-3', `${slots[2].rot + (Math.random() * 6 - 3)}deg`);

                    scatterGallery.classList.add('active');
                }
            });

            item.addEventListener('mouseleave', () => {
                scatterGallery.classList.remove('active');
            });
        });
    }

    // =========================================================
    // 6. ABOUT ME 3D SCROLL REVEAL (preserved, uses data-scroll now)
    // =========================================================
    const aboutSection = document.getElementById('about-3d');
    if (aboutSection) {
        aboutSection.classList.add('hidden-3d');

        const aboutObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('hidden-3d');
                    entry.target.classList.add('visible-3d');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        });

        aboutObserver.observe(aboutSection);
    }

    // =========================================================
    // 7. SPINNING BADGE LETTER-BY-LETTER HOVER
    // =========================================================
    const textPaths = document.querySelectorAll('.spinning-badge textPath');
    textPaths.forEach(textPath => {
        const text = textPath.textContent;
        textPath.textContent = '';
        for (let char of text) {
            const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            // Use non-breaking space to preserve spacing in SVG
            tspan.textContent = char === ' ' ? '\u00A0' : char;
            tspan.classList.add('hover-char');
            textPath.appendChild(tspan);
        }
    });

    // =========================================================
    // 8. BACK TO TOP BUTTON
    // =========================================================
    const desktopNavSide = document.querySelector('.desktop-nav-side');
    const customScrollThumb = document.querySelector('.custom-scrollbar-thumb');

    if (desktopNavSide) {
        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollPos > 400) {
                desktopNavSide.classList.add('visible');
            } else {
                desktopNavSide.classList.remove('visible');
            }

            if (customScrollThumb && scrollHeight > 0) {
                const progress = scrollPos / scrollHeight;
                customScrollThumb.style.transform = `scaleY(${progress})`;
            }

            // Update red line inside Ascend button if it exists
            const bttRedLine = desktopNavSide.querySelector('.btt-red-line');
            if (bttRedLine && scrollHeight > 0) {
                bttRedLine.style.height = `${(scrollPos / scrollHeight) * 100}%`;
            }
        }, { passive: true });

        const bttClickArea = desktopNavSide.querySelector('.btt-unique');
        if (bttClickArea) {
            bttClickArea.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Custom Scrollbar Interactivity (Drag to Scroll)
        const scrollContainer = desktopNavSide.querySelector('.custom-scrollbar-container');
        if (scrollContainer) {
            let isDragging = false;

            const updateScrollFromEvent = (e) => {
                const rect = scrollContainer.getBoundingClientRect();
                const offsetY = e.clientY - rect.top;
                const percentage = Math.max(0, Math.min(offsetY / rect.height, 1));
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({ top: percentage * totalHeight, behavior: 'auto' });
            };

            scrollContainer.addEventListener('mousedown', (e) => {
                isDragging = true;
                updateScrollFromEvent(e);
                document.body.classList.add('is-scrolling'); // Optional CSS hook
            });

            window.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    updateScrollFromEvent(e);
                }
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    document.body.classList.remove('is-scrolling');
                }
            });
        }
    }



    // =========================================================
    // 9. THEME TOGGLE
    // =========================================================
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Safely check local storage, which can crash on file:/// protocols
    let currentTheme = 'dark';
    try {
        currentTheme = localStorage.getItem('editorial-theme') || 'dark';
    } catch (err) {
        console.warn("Local storage disabled or unavailable. Defaulting to dark theme.");
    }

    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (event) => {

            const performToggle = () => {
                document.body.classList.toggle('light-mode');
                try {
                    if (document.body.classList.contains('light-mode')) {
                        localStorage.setItem('editorial-theme', 'light');
                    } else {
                        localStorage.setItem('editorial-theme', 'dark');
                    }
                } catch (err) {
                    console.warn("Could not save theme preference.");
                }
            };

            // Modern View Transitions API (The bespoke "Geometric Spatial Wipe")
            if (document.startViewTransition) {
                const x = event.clientX;
                const y = event.clientY;
                // Calculate max distance to corner so circle fully covers screen
                const maxRadius = Math.hypot(
                    Math.max(x, window.innerWidth - x),
                    Math.max(y, window.innerHeight - y)
                );

                document.documentElement.style.setProperty('--vt-x', x + 'px');
                document.documentElement.style.setProperty('--vt-y', y + 'px');
                document.documentElement.style.setProperty('--vt-radius', maxRadius + 'px');

                document.startViewTransition(() => {
                    performToggle();
                });
            } else {
                // Fallback for older browsers
                document.body.classList.add('theme-transition');
                performToggle();
                setTimeout(() => {
                    document.body.classList.remove('theme-transition');
                }, 600);
            }
        });
    }

    // =========================================================
    // 11. HACKER/DECRYPTION TEXT REVEAL ON SCROLL
    // =========================================================
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    const decryptElements = document.querySelectorAll('.section-title');

    const decryptObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                if (el.dataset.decrypted === "true") return;

                const targetEl = el.querySelector('.line-under-text') || el;
                const originalText = targetEl.innerText || targetEl.textContent;
                let iterations = 0;

                const interval = setInterval(() => {
                    targetEl.innerText = originalText.split('').map((letter, index) => {
                        if (index < iterations) {
                            return originalText[index];
                        }
                        if (letter === ' ') return ' ';
                        return chars[Math.floor(Math.random() * chars.length)];
                    }).join('');

                    if (iterations >= originalText.length) {
                        clearInterval(interval);
                        el.dataset.decrypted = "true";
                    }
                    iterations += 1 / 3; // Speed of decryption
                }, 30);

                decryptObserver.unobserve(el);
            }
        });
    }, { rootMargin: '0px 0px -100px 0px', threshold: 0.1 });

    decryptElements.forEach(el => decryptObserver.observe(el));

    // =========================================================
    // 12. MOBILE FAB NAV LOGIC
    // =========================================================
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const mobileNavBtt = document.getElementById('mobile-btt');
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');


    if (mobileNavToggle && mobileNavContainer) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavContainer.classList.toggle('menu-active');
        });

        // Close menu when clicking a link
        mobileMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                mobileNavContainer.classList.remove('menu-active');
            });
        });

        // Back to top for mobile
        if (mobileNavBtt) {
            window.addEventListener('scroll', () => {
                const scrollPos = window.scrollY;
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

                if (scrollPos > 400) {
                    mobileNavBtt.classList.add('visible');
                } else {
                    mobileNavBtt.classList.remove('visible');
                }

                // Update mobile scroll tracker (left side)
                const mobileScrollThumb = document.querySelector('.mobile-scroll-thumb');
                if (mobileScrollThumb && scrollHeight > 0) {
                    mobileScrollThumb.style.transform = `scaleY(${scrollPos / scrollHeight})`;
                }
            }, { passive: true });

            mobileNavBtt.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                mobileNavContainer.classList.remove('menu-active');
            });
        }


        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileNavContainer.contains(e.target)) {
                mobileNavContainer.classList.remove('menu-active');
            }
        });
    }
});

