/**
 * Theme Management System
 * A clean, simplified approach to handling light/dark/auto themes
 */

(function() {
    // Theme constants
    const THEME_STORAGE_KEY = 'theme-preference';
    const THEMES = {
        LIGHT: 'light',
        DARK: 'dark',
        AUTO: 'auto'
    };

    // Initialize theme system when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Also initialize on window load to catch any late-loading elements
    window.addEventListener('load', function() {
        // Short delay to ensure all elements are loaded
        setTimeout(function() {
            ensureMountainBackgrounds();
            updateThemeVisuals();
        }, 100);
    });

    /**
     * Initialize the theme system
     */
    function initialize() {
        console.log('Initializing theme system...');

        // Apply the saved theme immediately
        const savedTheme = getSavedTheme();
        applyTheme(savedTheme);

        // Create mountain backgrounds if they don't exist
        ensureMountainBackgrounds();

        // Set up system preference change listener
        setupSystemPreferenceListener();

        // Set up theme toggle buttons
        setupThemeToggleButtons();

        // Watch for dynamically loaded footer
        watchForFooter();
    }

    /**
     * Get the saved theme from localStorage
     * @returns {string} The saved theme (light, dark, or auto)
     */
    function getSavedTheme() {
        return localStorage.getItem(THEME_STORAGE_KEY) || THEMES.AUTO;
    }

    /**
     * Apply the specified theme
     * @param {string} theme - The theme to apply (light, dark, or auto)
     */
    function applyTheme(theme) {
        console.log(`Applying theme: ${theme}`);

        // Validate theme
        if (!Object.values(THEMES).includes(theme)) {
            console.error(`Invalid theme: ${theme}`);
            theme = THEMES.AUTO;
        }

        // Store the theme preference
        localStorage.setItem(THEME_STORAGE_KEY, theme);

        // Apply theme classes to root element
        document.documentElement.classList.remove(
            `${THEMES.LIGHT}-theme`,
            `${THEMES.DARK}-theme`,
            `${THEMES.AUTO}-theme`,
            'visual-light-mode',
            'visual-dark-mode'
        );

        // Add the theme class
        document.documentElement.classList.add(`${theme}-theme`);

        // Determine if dark mode is visually active
        const isVisualDarkMode = isEffectiveDarkMode(theme);

        // Add visual mode class
        document.documentElement.classList.add(
            isVisualDarkMode ? 'visual-dark-mode' : 'visual-light-mode'
        );

        // Update theme visuals
        updateThemeVisuals();

        // Update theme toggle buttons
        updateThemeToggleButtons(theme);

        // Dispatch theme change event
        dispatchThemeChangeEvent(theme);
    }

    /**
     * Determine if dark mode is effectively active based on theme and system preference
     * @param {string} theme - The current theme
     * @returns {boolean} True if dark mode is effectively active
     */
    function isEffectiveDarkMode(theme) {
        if (theme === THEMES.DARK) return true;
        if (theme === THEMES.LIGHT) return false;

        // For auto theme, use system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /**
     * Update theme visuals based on current theme
     */
    function updateThemeVisuals() {
        const isVisualDarkMode = isEffectiveDarkMode(getSavedTheme());

        // Update mountain backgrounds
        updateMountainBackgrounds(isVisualDarkMode);

        // Update space elements
        updateSpaceElements(isVisualDarkMode);
    }

    /**
     * Update mountain backgrounds based on dark mode state
     * @param {boolean} isDarkMode - Whether dark mode is active
     */
    function updateMountainBackgrounds(isDarkMode) {
        const lightMountain = document.querySelector('.light-theme-mountain');
        const darkMountain = document.querySelector('.dark-theme-mountain');

        if (!lightMountain || !darkMountain) {
            console.warn('Mountain backgrounds not found, creating them...');
            ensureMountainBackgrounds();
            return;
        }

        // Set visibility based on theme
        if (isDarkMode) {
            lightMountain.style.display = 'none';
            darkMountain.style.display = 'block';
        } else {
            lightMountain.style.display = 'block';
            darkMountain.style.display = 'none';
        }
    }

    /**
     * Update space elements based on dark mode state
     * @param {boolean} isDarkMode - Whether dark mode is active
     */
    function updateSpaceElements(isDarkMode) {
        // Create space elements if they don't exist in dark mode
        if (isDarkMode && !document.querySelector('.space-elements')) {
            createSpaceElements();
        }

        // Update visibility of extra stars
        const extraStars = document.querySelector('.extra-stars');
        if (extraStars) {
            extraStars.style.display = isDarkMode ? 'block' : 'none';
        }
    }

    /**
     * Create mountain backgrounds if they don't exist
     */
    function ensureMountainBackgrounds() {
        // Create light theme mountain if it doesn't exist
        if (!document.querySelector('.light-theme-mountain')) {
            createLightMountainBackground();
        }

        // Create dark theme mountain if it doesn't exist
        if (!document.querySelector('.dark-theme-mountain')) {
            createDarkMountainBackground();
        }

        // Create mountain SVG if it doesn't exist
        if (!document.querySelector('.mountains-svg')) {
            createMountainSvg();
        }

        // Update mountain visibility
        updateThemeVisuals();
    }

    /**
     * Create light theme mountain background
     */
    function createLightMountainBackground() {
        const lightMountain = document.createElement('div');
        lightMountain.className = 'light-theme-mountain';
        lightMountain.style.position = 'fixed';
        lightMountain.style.top = '0';
        lightMountain.style.left = '0';
        lightMountain.style.width = '100%';
        lightMountain.style.height = '100%';
        lightMountain.style.background = 'linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)';
        lightMountain.style.zIndex = '-2';
        lightMountain.style.pointerEvents = 'none';
        document.body.prepend(lightMountain);
        console.log('Created light theme mountain background');
    }

    /**
     * Create dark theme mountain background
     */
    function createDarkMountainBackground() {
        const darkMountain = document.createElement('div');
        darkMountain.className = 'dark-theme-mountain';
        darkMountain.style.position = 'fixed';
        darkMountain.style.top = '0';
        darkMountain.style.left = '0';
        darkMountain.style.width = '100%';
        darkMountain.style.height = '100%';
        darkMountain.style.background = 'linear-gradient(to bottom, #0f0221 0%, #0c1339 30%, #081c51 70%, #102346 100%)';
        darkMountain.style.zIndex = '-2';
        darkMountain.style.pointerEvents = 'none';
        document.body.prepend(darkMountain);
        console.log('Created dark theme mountain background');
    }

    /**
     * Create mountain SVG with fewer, wider, more unique mountains
     */
    function createMountainSvg() {
        const mountainsContainer = document.createElement('div');
        mountainsContainer.className = 'mountains-container';
        mountainsContainer.style.position = 'fixed';
        mountainsContainer.style.bottom = '0';
        mountainsContainer.style.left = '0';
        mountainsContainer.style.width = '100%';
        mountainsContainer.style.height = '100%';
        mountainsContainer.style.zIndex = '-1';
        mountainsContainer.style.pointerEvents = 'none';

        // Create SVG mountains with taller, steeper, more defined peaks
        mountainsContainer.innerHTML = `
            <svg class="mountains-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                <!-- Background mountains (farthest) - taller with defined peaks -->
                <path class="mountain-layer mountain-bg" d="M0,190 L120,170 L240,140 L360,170 L480,130 L600,160 L720,120 L840,150 L960,110 L1080,140 L1200,100 L1320,130 L1440,110 L1440,320 L0,320 Z"></path>

                <!-- Snow caps for background mountains - on the tallest peaks -->
                <path class="mountain-layer mountain-bg-snow" d="M480,130 L500,140 L480,135 L460,140 Z M720,120 L740,130 L720,125 L700,130 Z M960,110 L980,120 L960,115 L940,120 Z M1200,100 L1220,110 L1200,105 L1180,110 Z"></path>

                <!-- Middle mountain range - steeper, more defined mountains -->
                <!-- Left side - wide mountain with jagged ridges -->
                <path class="mountain-layer mountain-middle-1" d="M0,220 L80,210 L160,180 L200,200 L240,170 L280,190 L320,160 L360,180 L400,150 L440,170 L480,140 L520,160 L560,130 L600,150 L640,120 L680,140 L720,210 L720,320 L0,320 Z"></path>

                <!-- Snow caps for left middle mountain -->
                <path class="mountain-layer mountain-middle-snow-1" d="M320,160 L330,170 L320,165 L310,170 Z M480,140 L490,150 L480,145 L470,150 Z M640,120 L650,130 L640,125 L630,130 Z"></path>

                <!-- Right side - wider mountain with dramatic peaks -->
                <path class="mountain-layer mountain-middle-2" d="M680,200 L720,180 L760,150 L800,170 L840,130 L880,150 L920,110 L960,130 L1000,100 L1040,120 L1080,90 L1120,110 L1160,80 L1200,100 L1240,70 L1280,90 L1320,60 L1360,80 L1400,50 L1440,70 L1440,320 L680,320 Z"></path>

                <!-- Snow caps for right middle mountain -->
                <path class="mountain-layer mountain-middle-snow-2" d="M840,130 L850,140 L840,135 L830,140 Z M920,110 L930,120 L920,115 L910,120 Z M1000,100 L1010,110 L1000,105 L990,110 Z M1080,90 L1090,100 L1080,95 L1070,100 Z M1160,80 L1170,90 L1160,85 L1150,90 Z M1240,70 L1250,80 L1240,75 L1230,80 Z M1320,60 L1330,70 L1320,65 L1310,70 Z M1400,50 L1410,60 L1400,55 L1390,60 Z"></path>

                <!-- Foreground mountains - taller, more dramatic shapes -->
                <!-- Left - wide mountain with sharp ridges -->
                <path class="mountain-layer mountain-near-1" d="M0,260 L60,250 L120,230 L180,245 L240,220 L300,240 L360,210 L420,230 L480,260 L480,320 L0,320 Z"></path>

                <!-- Middle - dramatic sharp peak with ridges -->
                <path class="mountain-layer mountain-near-2" d="M440,250 L480,240 L520,220 L560,235 L600,180 L640,230 L680,210 L720,225 L760,205 L800,220 L840,240 L880,250 L880,320 L440,320 Z"></path>

                <!-- Snow cap for sharp peak -->
                <path class="mountain-layer mountain-near-snow-2" d="M600,180 L610,190 L600,185 L590,190 Z"></path>

                <!-- Right - steep mountain with multiple peaks -->
                <path class="mountain-layer mountain-near-3" d="M840,240 L880,230 L920,210 L960,225 L1000,200 L1040,220 L1080,190 L1120,210 L1160,180 L1200,200 L1240,170 L1280,190 L1320,160 L1360,180 L1400,150 L1440,170 L1440,320 L840,320 Z"></path>

                <!-- Snow caps for right foreground mountain -->
                <path class="mountain-layer mountain-near-snow-3" d="M1080,190 L1090,200 L1080,195 L1070,200 Z M1160,180 L1170,190 L1160,185 L1150,190 Z M1240,170 L1250,180 L1240,175 L1230,180 Z M1320,160 L1330,170 L1320,165 L1310,170 Z M1400,150 L1410,160 L1400,155 L1390,160 Z"></path>

                <!-- Forest/foothills layer - gentle, flowing curves -->
                <path class="mountain-layer forest" d="M0,280 C240,275 480,285 720,280 C960,275 1200,285 1440,280 L1440,320 L0,320 Z"></path>

                <!-- Distinctive standalone peaks - taller and sharper -->
                <!-- Tall sharp peak on the left -->
                <path class="mountain-layer mountain-peak-1" d="M180,250 L240,180 L300,250 Z"></path>
                <path class="mountain-layer mountain-peak-snow-1" d="M240,180 L250,195 L240,190 L230,195 Z"></path>

                <!-- Dramatic tall peak in the middle -->
                <path class="mountain-layer mountain-peak-2" d="M720,240 L760,170 L800,240 Z"></path>
                <path class="mountain-layer mountain-peak-snow-2" d="M760,170 L770,185 L760,180 L750,185 Z"></path>

                <!-- Dramatic tall peak on the right -->
                <path class="mountain-layer mountain-peak-3" d="M1080,220 L1140,140 L1200,220 Z"></path>
                <path class="mountain-layer mountain-peak-snow-3" d="M1140,140 L1150,155 L1140,150 L1130,155 Z"></path>
            </svg>
        `;

        // Add to body
        document.body.appendChild(mountainsContainer);
        console.log('Created mountain SVG with fewer, wider, more unique mountains');

        // Add mountain styles
        addMountainStyles();
    }

    /**
     * Add mountain styles for the new unique mountain design
     */
    function addMountainStyles() {
        if (document.getElementById('mountain-styles')) return;

        const style = document.createElement('style');
        style.id = 'mountain-styles';
        style.textContent = `
            .mountains-container {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
                overflow: hidden;
            }

            .mountains-svg {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 60%;
                z-index: 1;
                filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.1));
            }

            /* Light mode mountain styles - cohesive blue-teal gradient */
            /* Background mountains (farthest) */
            .mountain-bg {
                fill: rgba(56, 189, 248, 0.3); /* Light blue */
            }

            /* Snow caps for background mountains */
            .mountain-bg-snow {
                fill: rgba(255, 255, 255, 0.5);
            }

            /* Middle mountain range */
            .mountain-middle {
                fill: rgba(14, 165, 233, 0.4); /* Medium blue */
            }

            /* Middle mountains - left and right */
            .mountain-middle-1 {
                fill: rgba(14, 165, 233, 0.4); /* Medium blue */
            }

            .mountain-middle-2 {
                fill: rgba(6, 182, 212, 0.35); /* Cyan blue */
            }

            /* Snow caps for middle mountains */
            .mountain-middle-snow, .mountain-middle-snow-1, .mountain-middle-snow-2 {
                fill: rgba(255, 255, 255, 0.6);
            }

            /* Foreground mountains (base layer) */
            .mountain-near {
                fill: rgba(2, 132, 199, 0.5); /* Darker blue */
            }

            /* Foreground mountains - individual mountains */
            .mountain-near-1 {
                fill: rgba(2, 132, 199, 0.45); /* Slightly lighter blue */
            }

            .mountain-near-2 {
                fill: rgba(3, 105, 161, 0.5); /* Deep blue */
            }

            .mountain-near-snow-2, .mountain-near-snow-3 {
                fill: rgba(255, 255, 255, 0.7);
            }

            .mountain-near-3 {
                fill: rgba(8, 145, 178, 0.45); /* Sky blue */
            }

            /* Distinctive peaks with unique colors */
            /* Sharp peak */
            .mountain-peak-1 {
                fill: rgba(3, 105, 161, 0.6); /* Deep blue */
            }

            /* Snow cap for sharp peak */
            .mountain-peak-snow-1 {
                fill: rgba(255, 255, 255, 0.7);
            }

            /* Dramatic tall peak */
            .mountain-peak-2 {
                fill: rgba(13, 148, 136, 0.55); /* Teal */
            }

            /* Snow cap for dramatic peak */
            .mountain-peak-snow-2 {
                fill: rgba(255, 255, 255, 0.7);
            }

            /* Asymmetrical peak */
            .mountain-peak-3 {
                fill: rgba(6, 182, 212, 0.5); /* Cyan */
            }

            /* Snow cap for asymmetrical peak */
            .mountain-peak-snow-3 {
                fill: rgba(255, 255, 255, 0.7);
            }

            /* Sharp tall peak */
            .mountain-peak-4 {
                fill: rgba(8, 145, 178, 0.55); /* Sky blue */
            }

            /* Snow cap for sharp tall peak */
            .mountain-peak-snow-4 {
                fill: rgba(255, 255, 255, 0.7);
            }

            /* Forest/foothills */
            .forest {
                fill: rgba(16, 185, 129, 0.3); /* Green for contrast */
            }

            /* Dark mode mountain styles - cohesive teal-blue gradient */
            /* Background mountains (farthest) */
            .visual-dark-mode .mountain-bg {
                fill: rgba(12, 74, 110, 0.5); /* Dark blue */
            }

            /* Snow caps for background mountains */
            .visual-dark-mode .mountain-bg-snow {
                fill: rgba(226, 232, 240, 0.3);
            }

            /* Middle mountain range */
            .visual-dark-mode .mountain-middle {
                fill: rgba(15, 118, 110, 0.5); /* Dark teal */
            }

            /* Middle mountains - left and right */
            .visual-dark-mode .mountain-middle-1 {
                fill: rgba(15, 118, 110, 0.5); /* Dark teal */
            }

            .visual-dark-mode .mountain-middle-2 {
                fill: rgba(8, 145, 178, 0.45); /* Dark cyan */
            }

            /* Snow caps for middle mountains */
            .visual-dark-mode .mountain-middle-snow,
            .visual-dark-mode .mountain-middle-snow-1,
            .visual-dark-mode .mountain-middle-snow-2 {
                fill: rgba(226, 232, 240, 0.4);
            }

            /* Foreground mountains (base layer) */
            .visual-dark-mode .mountain-near {
                fill: rgba(17, 94, 89, 0.6); /* Darker teal */
            }

            /* Foreground mountains - individual mountains */
            .visual-dark-mode .mountain-near-1 {
                fill: rgba(17, 94, 89, 0.55); /* Slightly lighter teal */
            }

            .visual-dark-mode .mountain-near-2 {
                fill: rgba(7, 89, 133, 0.6); /* Deep blue */
            }

            .visual-dark-mode .mountain-near-snow-2,
            .visual-dark-mode .mountain-near-snow-3 {
                fill: rgba(226, 232, 240, 0.5);
            }

            .visual-dark-mode .mountain-near-3 {
                fill: rgba(5, 150, 105, 0.5); /* Green-teal */
            }

            /* Distinctive peaks with unique colors */
            /* Sharp peak */
            .visual-dark-mode .mountain-peak-1 {
                fill: rgba(7, 89, 133, 0.65); /* Deep blue */
            }

            /* Snow cap for sharp peak */
            .visual-dark-mode .mountain-peak-snow-1 {
                fill: rgba(226, 232, 240, 0.5);
            }

            /* Dramatic tall peak */
            .visual-dark-mode .mountain-peak-2 {
                fill: rgba(5, 150, 105, 0.6); /* Medium green */
            }

            /* Snow cap for dramatic peak */
            .visual-dark-mode .mountain-peak-snow-2 {
                fill: rgba(226, 232, 240, 0.5);
            }

            /* Asymmetrical peak */
            .visual-dark-mode .mountain-peak-3 {
                fill: rgba(8, 145, 178, 0.55); /* Sky blue */
            }

            /* Snow cap for asymmetrical peak */
            .visual-dark-mode .mountain-peak-snow-3 {
                fill: rgba(226, 232, 240, 0.5);
            }

            /* Sharp tall peak */
            .visual-dark-mode .mountain-peak-4 {
                fill: rgba(19, 78, 74, 0.65); /* Deep teal */
            }

            /* Snow cap for sharp tall peak */
            .visual-dark-mode .mountain-peak-snow-4 {
                fill: rgba(226, 232, 240, 0.5);
            }

            /* Forest/foothills */
            .visual-dark-mode .forest {
                fill: rgba(5, 150, 105, 0.4); /* Green for contrast */
            }

            /* Animation for subtle mountain movement - different for each mountain */
            @keyframes mountain-sway-slow {
                0% { transform: translateX(0); }
                50% { transform: translateX(3px); }
                100% { transform: translateX(0); }
            }

            @keyframes mountain-sway-medium {
                0% { transform: translateX(0); }
                50% { transform: translateX(-4px); }
                100% { transform: translateX(0); }
            }

            /* Apply subtle animations to different mountain layers - coordinated for cohesive movement */
            /* Background mountains */
            .mountain-bg, .mountain-bg-snow {
                will-change: transform;
                animation: mountain-sway-slow 200s ease-in-out infinite;
            }

            /* Middle mountains - different animations for left and right */
            .mountain-middle-1, .mountain-middle-snow-1 {
                will-change: transform;
                animation: mountain-sway-medium 180s ease-in-out infinite;
            }

            .mountain-middle-2, .mountain-middle-snow-2 {
                will-change: transform;
                animation: mountain-sway-medium 190s ease-in-out infinite reverse;
            }

            /* Foreground mountains - different animations for each */
            .mountain-near-1 {
                will-change: transform;
                animation: mountain-sway-slow 210s ease-in-out infinite;
            }

            .mountain-near-2, .mountain-near-snow-2 {
                will-change: transform;
                animation: mountain-sway-slow 220s ease-in-out infinite reverse;
            }

            .mountain-near-3, .mountain-near-snow-3 {
                will-change: transform;
                animation: mountain-sway-slow 230s ease-in-out infinite;
            }

            /* Distinctive peaks with subtle independent movement */
            .mountain-peak-1, .mountain-peak-snow-1 {
                will-change: transform;
                animation: mountain-sway-subtle 160s ease-in-out infinite;
            }

            .mountain-peak-2, .mountain-peak-snow-2 {
                will-change: transform;
                animation: mountain-sway-subtle 170s ease-in-out infinite reverse;
            }

            .mountain-peak-3, .mountain-peak-snow-3 {
                will-change: transform;
                animation: mountain-sway-subtle 180s ease-in-out infinite;
            }

            /* Add a very subtle animation for peaks */
            @keyframes mountain-sway-subtle {
                0% { transform: translateX(0); }
                50% { transform: translateX(2px); }
                100% { transform: translateX(0); }
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
                .mountains-svg {
                    height: 40%;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Create space elements for dark mode
     */
    function createSpaceElements() {
        // Create space container if it doesn't exist
        if (document.querySelector('.space-elements')) return;

        const spaceElements = document.createElement('div');
        spaceElements.className = 'space-elements';
        spaceElements.style.position = 'fixed';
        spaceElements.style.top = '0';
        spaceElements.style.left = '0';
        spaceElements.style.width = '100%';
        spaceElements.style.height = '100%';
        spaceElements.style.zIndex = '-3';
        spaceElements.style.pointerEvents = 'none';

        // Create stars
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';

        // Create 100 stars
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;

            // Make some stars brighter
            if (Math.random() > 0.7) {
                star.classList.add('bright');
            }

            starsContainer.appendChild(star);
        }

        spaceElements.appendChild(starsContainer);

        // Create extra stars for dark mode
        const extraStars = document.createElement('div');
        extraStars.className = 'extra-stars';

        // Create 50 extra stars
        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 5}s`;

            // Make some stars brighter
            if (Math.random() > 0.5) {
                star.classList.add('bright');
            }

            extraStars.appendChild(star);
        }

        spaceElements.appendChild(extraStars);

        // Add to body
        document.body.appendChild(spaceElements);
        console.log('Created space elements');

        // Add space styles
        addSpaceStyles();
    }

    /**
     * Add space styles to the document
     */
    function addSpaceStyles() {
        if (document.getElementById('space-styles')) return;

        const style = document.createElement('style');
        style.id = 'space-styles';
        style.textContent = `
            .space-elements {
                opacity: 0;
                transition: opacity 0.5s ease;
            }

            .visual-dark-mode .space-elements {
                opacity: 1;
            }

            .stars-container, .extra-stars {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }

            .star {
                position: absolute;
                width: 2px;
                height: 2px;
                background-color: white;
                border-radius: 50%;
                opacity: 0.7;
                animation: twinkle 5s infinite alternate ease-in-out;
            }

            .star.bright {
                width: 3px;
                height: 3px;
                opacity: 0.9;
            }

            @keyframes twinkle {
                0% { opacity: 0.3; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1.2); }
            }

            .extra-stars {
                display: none;
            }

            .visual-dark-mode .extra-stars {
                display: block;
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Set up system preference change listener
     */
    function setupSystemPreferenceListener() {
        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            // Only update if auto theme is active
            if (getSavedTheme() === THEMES.AUTO) {
                console.log(`System preference changed to ${e.matches ? 'dark' : 'light'} mode`);
                updateThemeVisuals();
            }
        });
    }

    /**
     * Set up theme toggle buttons
     */
    function setupThemeToggleButtons() {
        const lightButton = document.getElementById('light-mode');
        const darkButton = document.getElementById('dark-mode');
        const autoButton = document.getElementById('auto-mode');

        if (!lightButton || !darkButton || !autoButton) {
            console.log('Theme toggle buttons not found, will try again later');
            return false;
        }

        console.log('Setting up theme toggle buttons');

        // Update button states
        updateThemeToggleButtons(getSavedTheme());

        // Add click event listeners
        lightButton.addEventListener('click', function(e) {
            e.preventDefault();
            applyTheme(THEMES.LIGHT);
        });

        darkButton.addEventListener('click', function(e) {
            e.preventDefault();
            applyTheme(THEMES.DARK);
        });

        autoButton.addEventListener('click', function(e) {
            e.preventDefault();
            applyTheme(THEMES.AUTO);
        });

        return true;
    }

    /**
     * Update theme toggle buttons
     * @param {string} theme - The current theme
     */
    function updateThemeToggleButtons(theme) {
        const lightButton = document.getElementById('light-mode');
        const darkButton = document.getElementById('dark-mode');
        const autoButton = document.getElementById('auto-mode');

        if (!lightButton || !darkButton || !autoButton) {
            return;
        }

        // Remove active class from all buttons
        lightButton.classList.remove('active');
        darkButton.classList.remove('active');
        autoButton.classList.remove('active');

        // Add active class to current theme button
        if (theme === THEMES.LIGHT) {
            lightButton.classList.add('active');
        } else if (theme === THEMES.DARK) {
            darkButton.classList.add('active');
        } else {
            autoButton.classList.add('active');
        }
    }

    /**
     * Watch for footer being loaded
     */
    function watchForFooter() {
        // Use MutationObserver to watch for footer being loaded
        const observer = new MutationObserver(function(mutations) {
            // Check if theme buttons exist
            if (document.getElementById('light-mode') &&
                document.getElementById('dark-mode') &&
                document.getElementById('auto-mode')) {
                setupThemeToggleButtons();
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Dispatch theme change event
     * @param {string} theme - The current theme
     */
    function dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('theme-changed', {
            detail: { theme }
        });

        document.dispatchEvent(event);
    }

    // Expose theme API globally
    window.ThemeManager = {
        getTheme: getSavedTheme,
        setTheme: applyTheme,
        isVisualDarkMode: function() {
            return isEffectiveDarkMode(getSavedTheme());
        },
        ensureBackgrounds: ensureMountainBackgrounds
    };
})();
