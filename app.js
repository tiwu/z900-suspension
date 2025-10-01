// Presentation Navigation and Interaction Script

class SuspensionGuidePresentation {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.slideSelector = document.getElementById('slideSelector');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.slideCounter = document.getElementById('slideCounter');
        this.progressFill = document.getElementById('progressFill');
        this.navDots = document.getElementById('navDots');

        this.init();
    }

    init() {
        this.createNavigationDots();
        this.bindEvents();
        this.updateNavigation();
        this.updateProgress();
        this.setupCheckboxTracking();
        // build history slide dynamically and update slide list
        buildHistorySlide();
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.createNavigationDots();
        // Rebuild slide selector to match current slides
        if (this.slideSelector) {
            this.slideSelector.innerHTML = '';
            this.slides.forEach((s, idx) => {
                const opt = document.createElement('option');
                opt.value = String(idx);
                opt.textContent = `${idx + 1}. ${s.querySelector('.slide-title') ? s.querySelector('.slide-title').textContent : 'Slide ' + (idx+1)}`;
                this.slideSelector.appendChild(opt);
            });
        }
    }

    createNavigationDots() {
        this.navDots.innerHTML = '';
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.navDots.appendChild(dot);
        }
    }

    bindEvents() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Dropdown selector
        this.slideSelector.addEventListener('change', (e) => {
            this.goToSlide(parseInt(e.target.value));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;
            }
        });

        // Touch/swipe support for mobile
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only trigger if horizontal swipe is more significant than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }

            startX = 0;
            startY = 0;
        });
    }

    goToSlide(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.totalSlides) return;

        // Before removing active class, allow save-on-leave to capture the state of the slide we're leaving
        try {
            if (typeof window.__z900_saveOnLeave === 'function') {
                window.__z900_saveOnLeave(this.currentSlide, slideIndex);
            }
        } catch (e) { /* ignore */ }

        // Remove active class from current slide
        this.slides[this.currentSlide].classList.remove('active');
        
        // Update current slide
        this.currentSlide = slideIndex;
        
        // Add active class to new slide
        this.slides[this.currentSlide].classList.add('active');
        
        // Update all navigation elements
        this.updateNavigation();
        this.updateProgress();
        this.updateNavigationDots();
        
        // Scroll to top of new slide
        this.slides[this.currentSlide].scrollTop = 0;
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    updateNavigation() {
        // Update button states
        this.prevBtn.disabled = this.currentSlide === 0;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        
        // Update button text for last slide
        if (this.currentSlide === this.totalSlides - 1) {
            this.nextBtn.textContent = 'Complete ✓';
            this.nextBtn.classList.add('btn--success');
        } else {
            this.nextBtn.textContent = 'Next →';
            this.nextBtn.classList.remove('btn--success');
        }

        // Update dropdown selection
        this.slideSelector.value = this.currentSlide;
        
        // Update slide counter
        this.slideCounter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
    }

    updateProgress() {
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    updateNavigationDots() {
        const dots = this.navDots.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    setupCheckboxTracking() {
        // Track checkbox progress on verification slide
        const checkboxes = document.querySelectorAll('.progress-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateCheckboxProgress();
                this.saveProgress();
            });
        });

        // Load saved progress
        this.loadProgress();
    }

    updateCheckboxProgress() {
        const checkboxes = document.querySelectorAll('.progress-checkbox');
        const checkedBoxes = document.querySelectorAll('.progress-checkbox:checked');
        const completionPercentage = (checkedBoxes.length / checkboxes.length) * 100;

        // Update any progress indicators if needed
    if (window.__Z900_DEBUG) console.log(`Verification progress: ${completionPercentage.toFixed(0)}%`);
        
        // Could add visual feedback here
        if (completionPercentage === 100) {
            this.showCompletionFeedback();
        }
    }

    showCompletionFeedback() {
        // Show completion feedback when all checkboxes are checked
        const completionNote = document.querySelector('.completion-note');
        if (completionNote) {
            completionNote.style.animation = 'pulse 1s ease-in-out';
            setTimeout(() => {
                completionNote.style.animation = '';
            }, 1000);
        }
    }

    saveProgress() {
        try {
            const progress = {
                currentSlide: this.currentSlide,
                checkboxStates: {}
            };

            // Save checkbox states
            const checkboxes = document.querySelectorAll('.progress-checkbox');
            checkboxes.forEach((checkbox, index) => {
                progress.checkboxStates[index] = checkbox.checked;
            });

            // Note: localStorage is disabled in the environment, so we'll just keep this for potential future use
            // localStorage.setItem('suspensionGuideProgress', JSON.stringify(progress));
        } catch (error) {
            if (window.__Z900_DEBUG) console.log('Progress saving not available in this environment');
        }
    }

    loadProgress() {
        try {
            // Note: localStorage is disabled, so this won't work but kept for structure
            // const savedProgress = localStorage.getItem('suspensionGuideProgress');
            // if (savedProgress) {
            //     const progress = JSON.parse(savedProgress);
            //     // Restore checkbox states
            //     const checkboxes = document.querySelectorAll('.progress-checkbox');
            //     checkboxes.forEach((checkbox, index) => {
            //         if (progress.checkboxStates[index]) {
            //             checkbox.checked = true;
            //         }
            //     });
            //     this.updateCheckboxProgress();
            // }
        } catch (error) {
            if (window.__Z900_DEBUG) console.log('Progress loading not available in this environment');
        }
    }

    // Utility method to jump to specific sections
    jumpToSection(sectionName) {
        const sectionMap = {
            'introduction': 0,
            'components': 1,
            'tools': 2,
            'baseline': 3,
            'rear-sag': 4,
            'front-sag': 5,
            'rebound': 6,
            'compression': 7,
            'testing': 8,
            'verification': 9,
            'troubleshooting': 10,
            'reference': 11
        };

        if (sectionMap.hasOwnProperty(sectionName)) {
            this.goToSlide(sectionMap[sectionName]);
        }
    }
}

// Enhanced Features Class
class PresentationEnhancements {
    constructor(presentation) {
        this.presentation = presentation;
        this.init();
    }

    init() {
        this.setupImageLightbox();
        this.setupExpandableDetails();
        this.setupPrintFunction();
        this.setupAutoSaveNotes();
        // After auto-save notes created inputs, map final-record inputs
        this.mapFinalRecordInputs();
        this.addKeyboardShortcutsHelp();
    }

    // Small toast helper
    showToastContainer() {
        if (document.getElementById('toastContainer')) return;
        const toast = document.createElement('div');
        toast.id = 'toastContainer';
        toast.className = 'toast toast--success';
        toast.style.display = 'none';
        document.body.appendChild(toast);
    }

    mapFinalRecordInputs() {
        // Map inputs in final-record area to data-role attributes if possible
        const finalRecord = document.querySelector('.final-record .record-template');
        if (!finalRecord) return;

        const paras = finalRecord.querySelectorAll('p');
        paras.forEach(p => {
            const text = p.textContent || '';
            if (/Final Sag/i.test(text) && /F:/.test(text) && /R:/.test(text)) {
                // find the inputs inside this paragraph
                const inputs = p.querySelectorAll('input');
                if (inputs.length >= 2) {
                    inputs[0].dataset.role = 'sag-F';
                    inputs[1].dataset.role = 'sag-R';
                }
            }
            if (/Final Rear Preload/i.test(text) || /Final Rear Rebound/i.test(text)) {
                const inp = p.querySelector('input');
                if (inp) inp.dataset.role = 'rear-settings';
            }
        });
    }

    setupImageLightbox() {
        // Simple lightbox for images
        const images = document.querySelectorAll('.component-image, .procedure-image, .inline-image');
        
        images.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                this.showImageLightbox(e.target);
            });
        });
    }

    showImageLightbox(img) {
        // Create lightbox overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;

        const enlargedImg = document.createElement('img');
        enlargedImg.src = img.src;
        enlargedImg.alt = img.alt;
        enlargedImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        overlay.appendChild(enlargedImg);
        document.body.appendChild(overlay);

        // Close on click
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        // Close on escape key
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }

    setupExpandableDetails() {
        // Add expandable sections for detailed information
        const detailSections = document.querySelectorAll('.component-specs, .trouble-solutions');
        
        detailSections.forEach(section => {
            const header = section.querySelector('h4, h5');
            if (header) {
                header.style.cursor = 'pointer';
                header.style.userSelect = 'none';
                header.innerHTML += ' <span style="float: right; font-size: 0.8em;">▼</span>';
                
                header.addEventListener('click', () => {
                    const content = section.querySelector('ul, p');
                    const arrow = header.querySelector('span');
                    
                    if (content.style.display === 'none') {
                        content.style.display = '';
                        arrow.textContent = '▼';
                    } else {
                        content.style.display = 'none';
                        arrow.textContent = '▶';
                    }
                });
            }
        });
    }

    setupPrintFunction() {
        // Add print button to header
        const navControls = document.querySelector('.nav-controls');
        const printBtn = document.createElement('button');
        printBtn.className = 'btn btn--outline btn--sm';
        printBtn.innerHTML = '🖨️';
        printBtn.title = 'Print guide';
        printBtn.setAttribute('aria-label', 'Print guide');
        printBtn.addEventListener('click', () => {
            window.print();
        });
        
        navControls.appendChild(printBtn);
    }

    setupAutoSaveNotes() {
        // Add note-taking capability to record templates
        const recordTemplates = document.querySelectorAll('.record-template');
        // More robust placeholder replacement: walk text nodes and replace exact '_____' tokens
        // Helper: determine role from nearby text tokens (prefer explicit 'F:' or 'R:')
        const detectRoleFromParagraph = (paragraph, placeholderNode) => {
            // Search for explicit tokens in the paragraph text near the placeholder
            const paragraphText = paragraph.textContent || '';
            // If paragraph contains both F: and R: we will assign by order of placeholders
            if (/F:\s*$/i.test(paragraphText) || /F:\s*/i.test(paragraphText)) return 'sag-F';
            if (/R:\s*$/i.test(paragraphText) || /R:\s*/i.test(paragraphText)) return 'sag-R';
            // fallback: look at previous and next sibling text around the placeholderNode
            let prev = placeholderNode.previousSibling;
            while (prev) {
                if (prev.nodeType === Node.TEXT_NODE && /F:\s*$|F:\s+/i.test(prev.textContent)) return 'sag-F';
                if (prev.nodeType === Node.TEXT_NODE && /R:\s*$|R:\s+/i.test(prev.textContent)) return 'sag-R';
                prev = prev.previousSibling;
            }
            let next = placeholderNode.nextSibling;
            while (next) {
                if (next.nodeType === Node.TEXT_NODE && /^\s*F:\b|^\s*F:/i.test(next.textContent)) return 'sag-F';
                if (next.nodeType === Node.TEXT_NODE && /^\s*R:\b|^\s*R:/i.test(next.textContent)) return 'sag-R';
                next = next.nextSibling;
            }
            return '';
        };

        recordTemplates.forEach((template, tIndex) => {
            const paras = template.querySelectorAll('p');
            paras.forEach((p, pIndex) => {
                // walk text nodes within this paragraph
                const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null, false);
                const textNodes = [];
                let node;
                while (node = walker.nextNode()) {
                    textNodes.push(node);
                }

                // For each text node, replace occurrences of runs of underscores (3 or more) with a single input node
                let placeholderCount = 0;
                textNodes.forEach(textNode => {
                    // split on runs of 3 or more underscores so long placeholders aren't broken into many
                    const parts = textNode.nodeValue.split(/_{3,}/);
                    if (parts.length > 1) {
                        const frag = document.createDocumentFragment();
                        for (let i = 0; i < parts.length; i++) {
                            if (parts[i]) frag.appendChild(document.createTextNode(parts[i]));
                            if (i < parts.length - 1) {
                                const input = document.createElement('input');
                                input.type = 'text';
                                input.className = 'record-input form-control';
                                input.setAttribute('tabindex', '0');
                                input.style.cssText = 'background: transparent; border: none; border-bottom: 1px solid var(--color-border); font-family: inherit; font-size: inherit; color: inherit; width: 100px; margin: 0 4px; padding: 2px 4px;';

                                // assign dataset identifiers
                                input.dataset.template = tIndex;
                                input.dataset.paragraph = pIndex;
                                input.dataset.index = placeholderCount;

                                // Determine if this is a Date field (paragraph contains 'Date:')
                                const paraTextFull = (p.textContent || '');
                                const isDateField = /\bDate\b\s*:/i.test(paraTextFull) || /^Date\b/i.test(paraTextFull);
                                if (isDateField) {
                                    input.type = 'date';
                                    input.style.width = '160px';
                                    input.dataset.role = 'date';
                                }

                                // determine role more deterministically using paragraph context and surrounding nodes
                                let role = detectRoleFromParagraph(p, textNode);
                                // If paragraph contains both F: and R:, assign by placeholder order (first -> F, second -> R)
                                if (/F:\s*/i.test(paraTextFull) && /R:\s*/i.test(paraTextFull)) {
                                    role = (placeholderCount === 0) ? 'sag-F' : 'sag-R';
                                }
                                if (role) input.dataset.role = role;

                                // mark which slide this input belongs to so we can sync baseline -> final
                                const slideEl = p.closest('.slide');
                                if (slideEl && slideEl.dataset && slideEl.dataset.slide) {
                                    input.dataset.slide = slideEl.dataset.slide;
                                    if (slideEl.dataset.slide === '3') input.dataset.origin = 'baseline';
                                    else if (slideEl.dataset.slide === '9') input.dataset.origin = 'final';
                                }

                                frag.appendChild(input);

                                // debug log removed in production

                                placeholderCount++;
                            }
                        }
                        // replace the original text node with the fragment
                        textNode.parentNode.replaceChild(frag, textNode);
                    }
                });
            });
        });

        // Listen for sag updates to prefill any matching inputs
        document.addEventListener('sagUpdated', (e) => {
            const { type, sag, unloaded, loaded } = e.detail || {};
            if (!type) return;

            // Update any inputs with matching data-role
            const role = type === 'front' ? 'sag-F' : (type === 'rear' ? 'sag-R' : null);
            if (!role) return;

            const targets = document.querySelectorAll(`.record-input[data-role="${role}"]`);
            targets.forEach(inp => {
                inp.value = sag;
                // trigger input event if needed
                inp.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });

            // Sync baseline date to final date fields when changed
            document.addEventListener('input', (e) => {
                const tgt = e.target;
                if (!tgt || tgt.dataset.role !== 'date') return;
                // only sync when a baseline date changed
                if (tgt.dataset.origin === 'baseline') {
                    const val = tgt.value;
                    const finalDates = document.querySelectorAll('.record-input[data-role="date"][data-origin="final"]');
                    finalDates.forEach(fd => {
                        // only copy if final field is empty (one-time copy)
                        if (!fd.value) {
                            fd.value = val;
                            fd.dispatchEvent(new Event('input', { bubbles: true }));
                            // show a subtle toast to indicate autofill
                            showToast('Final date auto-filled from baseline');
                        }
                    });
                }
            });

            // After initial creation, store a canonical key on inputs for later saving and remove temporary dataset attributes
            const canonicalizeInputs = () => {
                const inputs = document.querySelectorAll('.record-input');
                inputs.forEach(inp => {
                    const slideEl = inp.closest('.slide');
                    const slideId = (slideEl && slideEl.dataset && slideEl.dataset.slide) ? slideEl.dataset.slide : null;

                    // Determine canonical field id
                    let canonicalId = null;
                    const role = inp.dataset && inp.dataset.role ? inp.dataset.role : null;
                    if (role) {
                        // roles like sag-F / sag-R map to canonical ids
                        if (role === 'sag-F') canonicalId = 'front-sag';
                        else if (role === 'sag-R') canonicalId = 'rear-sag';
                    }

                    if (!canonicalId) {
                        // try to infer from paragraph label text
                        const p = inp.closest('p');
                        if (p) {
                            const label = p.textContent.replace(/\s+/g, ' ').trim();
                            const labelNorm = label.toLowerCase();
                            const fieldCandidates = (typeof CANONICAL_FIELDS !== 'undefined') ? CANONICAL_FIELDS : [];
                            for (const f of fieldCandidates) {
                                for (const alias of f.keys) {
                                    if (labelNorm.indexOf(String(alias).toLowerCase()) !== -1) { canonicalId = f.id; break; }
                                }
                                if (canonicalId) break;
                            }
                            if (!canonicalId) {
                                // fallback to kebabified short id of the first few words
                                canonicalId = label.toLowerCase().split(':')[0].replace(/[^a-z0-9]+/g, '-').slice(0, 32) || ('input-' + Math.random().toString(36).slice(2,6));
                            }
                        } else {
                            canonicalId = 'input-' + Math.random().toString(36).slice(2,6);
                        }
                    }

                    // position prefix: baseline or final
                    let pos = 'final';
                    // avoid referencing constants that may be declared later; use literal slide ids
                    if (slideId === '3') pos = 'baseline';
                    else if (slideId === '9') pos = 'final';
                    else if (inp.dataset && inp.dataset.origin) {
                        pos = inp.dataset.origin === 'baseline' ? 'baseline' : 'final';
                    }

                    inp.dataset.key = `${pos}::${canonicalId}`;

                    // remove temporary attributes we used during setup
                    delete inp.dataset.template;
                    delete inp.dataset.paragraph;
                    delete inp.dataset.index;
                    // keep role and origin for behavior
                });
            };

            canonicalizeInputs();

            // Monitor date and notes fields for first-time fill (empty -> non-empty). When that happens,
            // append a historical snapshot (__append=true). We mark inputs with data-snapshotted to avoid duplicates.
            const setupAutoAppendOnFirstFill = () => {
                const dateInputs = document.querySelectorAll('.record-input[data-role="date"]');
                const noteInputs = Array.from(document.querySelectorAll('.record-input')).filter(i => {
                    const k = i.dataset && i.dataset.key ? i.dataset.key : '';
                    return /Notes?$/.test(k.split('::')[1] || k);
                });

                const watch = (inp) => {
                    // store initial state
                    inp.dataset._initialValue = inp.value || '';
                    inp.addEventListener('input', (e) => {
                        // If a programmatic change is underway (Reset), ignore this event
                        if (window.__z900_programmaticChange) return;

                        const prev = inp.dataset._initialValue || '';
                        const now = inp.value || '';
                        if (!prev && now) {
                            // transitioned empty -> non-empty
                            if (!inp.dataset.snapshotted) {
                                // collect combined snapshot and append
                                const slides = document.querySelectorAll('.slide');
                                const baselineSlide = Array.from(slides).find(s => s.dataset.slide === BASELINE_SLIDE_ID);
                                const finalSlide = Array.from(slides).find(s => s.dataset.slide === FINAL_SLIDE_ID);
                                const combined = { timestamp: Date.now(), slide: FINAL_SLIDE_ID, values: {}, __append: true };
                                if (baselineSlide) baselineSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
                                if (finalSlide) finalSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });

                                // Only append if the combined snapshot has at least one non-empty value
                                const hasValues = Object.values(combined.values).some(v => v !== null && String(v).trim() !== '');
                                if (hasValues) {
                                    pushRecord(combined);
                                    inp.dataset.snapshotted = '1';
                                }
                            }
                        }
                        // if field emptied again, clear snapshotted flag so it can append again when refilled
                        if (!now) {
                            inp.dataset._initialValue = '';
                            delete inp.dataset.snapshotted;
                        }
                    });
                };

                dateInputs.forEach(watch);
                noteInputs.forEach(watch);
            };

            setupAutoAppendOnFirstFill();

            // persistence helpers are defined in global scope

            // Previously we auto-saved on every input change which produced many redundant records.
            // New behavior: only save snapshots when the user navigates away from key slides
            // (baseline slide index 3 and final slide index 9 in 0-based numbering).
            const SLIDES_TO_SAVE = new Set(['3', '9']); // dataset.slide values to persist on leave

            const collectSlideSnapshot = (slideEl) => {
                const record = { timestamp: Date.now(), slide: slideEl.dataset.slide || null, values: {} };
                const inputs = slideEl.querySelectorAll('.record-input');
                inputs.forEach(i => {
                    if (i.dataset && i.dataset.key) record.values[i.dataset.key] = i.value || '';
                });
                return record;
            };

            // Hook into presentation navigation: when a slide is deactivated (we leave it), save if it's one of the watched slides.
            // We monkey-patch the presentation.goToSlide method in the presentation init flow; to be safe, expose a helper that can be set later.
            window.__z900_saveOnLeave = (fromIndex, toIndex) => {
                try {
                    // Only save when leaving baseline or final slides
                    const fromSlideId = String(fromIndex);
                    if (fromSlideId !== BASELINE_SLIDE_ID && fromSlideId !== FINAL_SLIDE_ID) return;

                    const slides = document.querySelectorAll('.slide');
                    const baselineSlide = Array.from(slides).find(s => s.dataset.slide === BASELINE_SLIDE_ID);
                    const finalSlide = Array.from(slides).find(s => s.dataset.slide === FINAL_SLIDE_ID);
                    if (!baselineSlide && !finalSlide) return;

                    // collect combined snapshot (use canonical baseline/final keys)
                    const combined = { timestamp: Date.now(), slide: FINAL_SLIDE_ID, values: {} };
                    if (baselineSlide) {
                        baselineSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
                    }
                    if (finalSlide) {
                        finalSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
                    }

                    // compare with the most recent saved record (if any) — compare the values object
                    const history = loadHistory();
                    const last = history.length ? history[history.length - 1] : null;
                    const lastValuesJSON = last ? JSON.stringify(last.values || {}) : null;
                    const combinedValuesJSON = JSON.stringify(combined.values || {});
                    if (lastValuesJSON === combinedValuesJSON) return; // no changes

                    // push combined record and update UI
                    pushRecord(combined);
                    showToast('Saved baseline & final snapshot');
                } catch (e) {
                    console.error('saveOnLeave error', e);
                }
            };

        // (date-sync handler centralized earlier in setupAutoSaveNotes)
    }

    addKeyboardShortcutsHelp() {
        // Add keyboard shortcuts help next to print button in nav-controls
        const navControls = document.querySelector('.nav-controls');
        const helpButton = document.createElement('button');
        helpButton.className = 'btn btn--outline btn--sm';
        // icon-only with tooltip
        helpButton.innerHTML = '⌨️';
        helpButton.title = 'Keyboard shortcuts';
        helpButton.setAttribute('aria-label', 'Keyboard shortcuts');
        helpButton.addEventListener('click', () => { this.showKeyboardHelp(); });
        // Insert after the print button if present
        const printBtn = navControls.querySelector('button');
        if (printBtn) {
            printBtn.insertAdjacentElement('afterend', helpButton);
        } else {
            navControls.appendChild(helpButton);
        }
        // add Start over button next to help/print
        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn btn--outline btn--sm';
        restartBtn.innerHTML = '🔄';
        restartBtn.title = 'Reset fields';
        restartBtn.setAttribute('aria-label', 'Reset fields');
        restartBtn.addEventListener('click', () => {
            // clear all record inputs
            const inputs = document.querySelectorAll('.record-input');
            inputs.forEach(i => {
                i.value = '';
                delete i.dataset.snapshotted;
                delete i.dataset._initialValue;
                i.dispatchEvent(new Event('input', { bubbles: true }));
            });
            // append a new empty combined snapshot
            const slides = document.querySelectorAll('.slide');
            const baselineSlide = Array.from(slides).find(s => s.dataset.slide === BASELINE_SLIDE_ID);
            const finalSlide = Array.from(slides).find(s => s.dataset.slide === FINAL_SLIDE_ID);
            const combined = { timestamp: Date.now(), slide: FINAL_SLIDE_ID, values: {}, __append: true };
            if (baselineSlide) baselineSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
            if (finalSlide) finalSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
            pushRecord(combined);
            showToast('Fields cleared — new snapshot created');
            const savedSlide = document.querySelector('.slide[data-history="true"]');
            if (savedSlide) {
                savedSlide.parentNode.removeChild(savedSlide);
                buildHistorySlide();
                refreshPresentationSlidesUI();
            }
        });
        if (helpButton && helpButton.parentNode) helpButton.insertAdjacentElement('afterend', restartBtn);
    }

    showKeyboardHelp() {
        const helpOverlay = document.createElement('div');
        helpOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1001;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;

        const helpContent = document.createElement('div');
        helpContent.style.cssText = `
            background: var(--color-surface);
            padding: 2rem;
            border-radius: 12px;
            max-width: 400px;
            color: var(--color-text);
            cursor: default;
        `;

        helpContent.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: var(--color-primary);">Keyboard Shortcuts</h3>
            <ul style="list-style: none; padding: 0; line-height: 1.8;">
                <li><strong>← →</strong> Navigate slides</li>
                <li><strong>Home</strong> First slide</li>
                <li><strong>End</strong> Last slide</li>
                <li><strong>Esc</strong> Close dialogs</li>
                <li><strong>Ctrl+P</strong> Print guide</li>
            </ul>
            <p style="margin-top: 1rem; font-size: 0.9em; opacity: 0.8;">
                You can also swipe on mobile devices or use the navigation controls.
            </p>
        `;

        helpContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        helpOverlay.appendChild(helpContent);
        document.body.appendChild(helpOverlay);

        helpOverlay.addEventListener('click', () => {
            document.body.removeChild(helpOverlay);
        });

        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(helpOverlay);
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }
}

// Slide Specific Interactions
class SlideInteractions {
    constructor(presentation) {
        this.presentation = presentation;
        this.init();
    }

    init() {
        this.setupSagCalculator();
        this.setupSettingsValidator();
        this.setupProgressTracker();
    }

    setupSagCalculator() {
        // Add interactive sag calculator to sag setup slides
        const sagSlides = document.querySelectorAll('[data-slide="4"], [data-slide="5"]');
        
        sagSlides.forEach(slide => {
            const calculator = this.createSagCalculator(slide.dataset.slide);
            const procedureSection = slide.querySelector('.sag-procedure, .front-sag-procedure');
            if (procedureSection) {
                procedureSection.appendChild(calculator);
            }
        });
    }

    createSagCalculator(slideId) {
        const calculator = document.createElement('div');
        calculator.style.cssText = `
            background: var(--color-bg-3);
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            border-left: 4px solid var(--color-success);
        `;

        calculator.innerHTML = `
            <h4 style="margin-bottom: 1rem;">🧮 Sag Calculator</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Unloaded (mm):</label>
                    <input type="number" id="unloaded-${slideId}" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Loaded (mm):</label>
                    <input type="number" id="loaded-${slideId}" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 4px;">
                </div>
            </div>
            <div id="sagResult" style="font-weight: 600; font-size: 1.1em; text-align: center; padding: 0.5rem; border-radius: 4px;"></div>
        `;

    const unloadedInput = calculator.querySelector(`#unloaded-${slideId}`);
    const loadedInput = calculator.querySelector(`#loaded-${slideId}`);
        const resultDiv = calculator.querySelector('#sagResult');

        const calculate = () => {
            const unloaded = parseFloat(unloadedInput.value);
            const loaded = parseFloat(loadedInput.value);

            if (unloaded && loaded && unloaded > loaded) {
                const sag = unloaded - loaded;
                let resultClass = '';
                let resultText = '';

                if (sag < 30) {
                    resultClass = 'color: var(--color-warning);';
                    resultText = `${sag}mm - Too Little Sag ⚠️`;
                } else if (sag > 35) {
                    resultClass = 'color: var(--color-error);';
                    resultText = `${sag}mm - Too Much Sag ❌`;
                } else {
                    resultClass = 'color: var(--color-success);';
                    resultText = `${sag}mm - Perfect! ✅`;
                }

                resultDiv.style.cssText = resultClass;
                resultDiv.textContent = resultText;
                resultDiv.style.display = 'block';
                // Dispatch a custom event so other parts of the app can listen and autofill
                const evt = new CustomEvent('sagUpdated', { detail: { type: slideId === '4' ? 'rear' : 'front', sag, unloaded: unloaded, loaded: loaded } });
                document.dispatchEvent(evt);
            } else {
                resultDiv.style.display = 'none';
            }
        };

        unloadedInput.addEventListener('input', calculate);
        loadedInput.addEventListener('input', calculate);

        return calculator;
    }

    setupSettingsValidator() {
        // Add settings validation for extreme values
        const troubleshootingSlide = document.querySelector('[data-slide="10"]');
        if (troubleshootingSlide) {
            const validator = this.createSettingsValidator();
            troubleshootingSlide.querySelector('.slide-content').appendChild(validator);
        }
    }

    createSettingsValidator() {
        const validator = document.createElement('div');
        validator.style.cssText = `
            background: var(--color-bg-1);
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2rem;
            border-left: 4px solid var(--color-primary);
        `;

        validator.innerHTML = `
            <h3 style="margin-bottom: 1rem;">⚙️ Settings Validator</h3>
            <p style="margin-bottom: 1rem; font-size: 0.9em;">Check if your settings are within reasonable ranges:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem;">Front Preload (turns):</label>
                    <input type="number" id="frontPreload" min="0" max="30" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem;">Front Rebound (clicks):</label>
                    <input type="number" id="frontRebound" min="0" max="19" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem;">Rear Sag (mm):</label>
                    <input type="number" id="rearSag" min="20" max="50" style="width: 100%; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 4px;">
                </div>
            </div>
            <div id="validationResult" style="margin-top: 1rem; padding: 1rem; border-radius: 4px; display: none;"></div>
        `;

        const inputs = validator.querySelectorAll('input');
        const resultDiv = validator.querySelector('#validationResult');

        const validate = () => {
            const frontPreload = parseFloat(validator.querySelector('#frontPreload').value);
            const frontRebound = parseFloat(validator.querySelector('#frontRebound').value);
            const rearSag = parseFloat(validator.querySelector('#rearSag').value);

            const warnings = [];

            if (frontPreload < 5 || frontPreload > 25) {
                warnings.push('Front preload may be at extreme - consider spring rate change');
            }
            if (frontRebound < 2 || frontRebound > 17) {
                warnings.push('Front rebound at extreme - check spring rate or service shock');
            }
            if (rearSag < 25 || rearSag > 40) {
                warnings.push('Rear sag outside target range - adjust preload or spring rate');
            }

            if (warnings.length > 0) {
                resultDiv.style.cssText = 'background: var(--color-bg-4); border-left: 4px solid var(--color-warning);';
                resultDiv.innerHTML = '<strong>⚠️ Warnings:</strong><ul style="margin: 0.5rem 0; padding-left: 1.5rem;">' + 
                    warnings.map(w => `<li>${w}</li>`).join('') + '</ul>';
                resultDiv.style.display = 'block';
            } else if (frontPreload || frontRebound || rearSag) {
                resultDiv.style.cssText = 'background: var(--color-bg-3); border-left: 4px solid var(--color-success);';
                resultDiv.innerHTML = '<strong>✅ Settings look good!</strong> All values are within normal ranges.';
                resultDiv.style.display = 'block';
            } else {
                resultDiv.style.display = 'none';
            }
        };

        inputs.forEach(input => {
            input.addEventListener('input', validate);
        });

        return validator;
    }

    setupProgressTracker() {
        // Overall setup progress tracker
        const progressTracker = this.createProgressTracker();
        document.querySelector('.nav-header').appendChild(progressTracker);
    }

    createProgressTracker() {
        const tracker = document.createElement('div');
        tracker.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8em;
            color: var(--color-text-secondary);
        `;

        tracker.innerHTML = `
            <span>Setup Progress:</span>
            <div style="width: 60px; height: 6px; background: var(--color-secondary); border-radius: 3px; overflow: hidden;">
                <div id="overallProgress" style="height: 100%; background: var(--color-success); width: 0%; transition: width 0.3s ease;"></div>
            </div>
            <span id="progressPercent">0%</span>
        `;

        // Update progress based on slide completion
        const updateOverallProgress = () => {
            const currentProgress = (this.presentation.currentSlide / (this.presentation.totalSlides - 1)) * 100;
            const progressBar = tracker.querySelector('#overallProgress');
            const progressPercent = tracker.querySelector('#progressPercent');
            
            progressBar.style.width = `${Math.min(currentProgress, 100)}%`;
            progressPercent.textContent = `${Math.round(currentProgress)}%`;
        };

        // Listen for slide changes
        const originalGoToSlide = this.presentation.goToSlide.bind(this.presentation);
        this.presentation.goToSlide = (slideIndex) => {
            originalGoToSlide(slideIndex);
            setTimeout(updateOverallProgress, 100);
        };

        return tracker;
    }
}

// --- Global helpers ---
function showToast(message, duration = 2200) {
    // create container if needed
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast toast--success';
        // position top-right below header so it doesn't overlap navigation or bottom controls
        // explicitly clear bottom so CSS doesn't stretch the element between top and bottom
        container.style.cssText = 'position:fixed; top:72px; right:1rem; bottom:auto; z-index:1002; background:var(--color-surface); padding:0.5rem 0.75rem; border-radius:8px; box-shadow:var(--shadow-md); max-width:360px;';
        document.body.appendChild(container);
    }
    container.textContent = message;
    container.style.display = 'flex';
    // hide after duration
    setTimeout(() => {
        container.classList.add('toast-hide');
        setTimeout(() => {
            container.style.display = 'none';
            container.classList.remove('toast-hide');
        }, 300);
    }, duration);
}

// Persistence helpers (single-array storage) - moved to global scope so multiple modules can use them
const HISTORY_KEY = 'z900-suspension-history';

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch (e) { return []; }
}

function saveHistory(history) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history || []));
    } catch (e) { /* ignore */ }
}

function pushRecord(record) {
    // compress keys to canonical short keys before saving
    try { record = compressRecordValues(record); } catch (e) { /* ignore */ }
    const history = loadHistory();
    // Defensive: if record has a values object but all values are empty, treat as no-op
    if (record && record.values) {
        const hasValues = Object.values(record.values).some(v => v !== null && String(v).trim() !== '');
        if (!hasValues) {
            // replacing with an empty record isn't useful; skip saving unless explicitly appending and forced
            if (record.__append) {
                // skip appending empty
                return;
            } else {
                // if replacing, but empty, still replace last to keep state consistent
                if (history.length) {
                    history[history.length - 1] = record;
                    saveHistory(history);
                }
                return;
            }
        }
    }
    // By default, we treat the latest combined snapshot as the single current state.
    // If record.__append === true, append as a new historical entry; otherwise replace the last entry with the new state.
    const append = record && record.__append === true;
    if (append) {
        history.push(record);
    } else {
        // replace last entry (or push if none)
        if (history.length) history[history.length - 1] = record;
        else history.push(record);
    }
    // cap history to HISTORY_MAX entries
    if (typeof HISTORY_MAX !== 'undefined' && history.length > HISTORY_MAX) {
        const removeCount = history.length - HISTORY_MAX;
        history.splice(0, removeCount);
        saveHistory(history);
        showToast(`History trimmed to last ${HISTORY_MAX} entries`);
    } else {
        saveHistory(history);
    }
    // if history slide is present, rebuild it so UI updates immediately
    const savedSlide = document.querySelector('.slide[data-history="true"]');
    if (savedSlide) {
        savedSlide.parentNode.removeChild(savedSlide);
        buildHistorySlide();
        // refresh presentation UI after rebuilding slides
        refreshPresentationSlidesUI();
    }
}

// Refresh presentation internal slide list, nav dots and selector when slides change
function refreshPresentationSlidesUI() {
    try {
        const pg = window && window.suspensionGuide && window.suspensionGuide.presentation;
        if (!pg) return;
        pg.slides = document.querySelectorAll('.slide');
        pg.totalSlides = pg.slides.length;
        // rebuild nav dots and selector
        if (pg.createNavigationDots) pg.createNavigationDots();
        // rebuild selector
        if (pg.slideSelector) {
            pg.slideSelector.innerHTML = '';
            pg.slides.forEach((s, idx) => {
                const opt = document.createElement('option');
                opt.value = String(idx);
                opt.textContent = `${idx + 1}. ${s.querySelector('.slide-title') ? s.querySelector('.slide-title').textContent : 'Slide ' + (idx+1)}`;
                pg.slideSelector.appendChild(opt);
            });
            // ensure currentSlide is within bounds
            if (pg.currentSlide >= pg.totalSlides) pg.currentSlide = Math.max(0, pg.totalSlides - 1);
            if (pg.currentSlide < 0) pg.currentSlide = 0;
            pg.slideSelector.value = pg.currentSlide;
        }
        // ensure one slide is active
        try {
            pg.slides.forEach((s, idx) => s.classList.toggle('active', idx === pg.currentSlide));
        } catch (e) { /* ignore */ }
        pg.updateNavigation();
        pg.updateProgress();
    } catch (e) {
        console.error('refreshPresentationSlidesUI error', e);
    }
}

// Friendly label mapping: map key suffixes (roles or label starts) to human-readable labels
const FRIENDLY_LABELS = {
    'sag-F': 'Sag (Front)',
    'sag-R': 'Sag (Rear)',
    'date': 'Date',
    'Notes': 'Notes',
    'Front Preload': 'Front Preload',
    'Rear Preload': 'Rear Preload',
    'Front Rebound': 'Front Rebound',
    'Front Compression': 'Front Compression',
    'Rear Rebound': 'Rear Rebound',
    // fallback: any key part matching one of these prefixes will be replaced with friendly label
};

// History cap (keep this many most-recent records)
const HISTORY_MAX = 100;

// Canonical fields used in history table and storage (id, label, aliases)
const CANONICAL_FIELDS = [
    { id: 'date', label: 'Date', keys: ['date','Date'] },
    { id: 'front-compression', label: 'Front Compression', keys: ['front-compression','Front Compression'] },
    { id: 'front-preload', label: 'Front Preload', keys: ['front-preload','Front Preload'] },
    { id: 'front-rebound', label: 'Front Rebound', keys: ['front-rebound','Front Rebound'] },
    { id: 'rear-preload', label: 'Rear Preload', keys: ['rear-preload','Rear Preload'] },
    { id: 'rear-rebound', label: 'Rear Rebound', keys: ['rear-rebound','Rear Rebound'] },
    { id: 'front-sag', label: 'Front Sag', keys: ['front-sag','sag-F','Sag (Front)','Front Sag'] },
    { id: 'rear-sag', label: 'Rear Sag', keys: ['rear-sag','sag-R','Sag (Rear)','Rear Sag'] },
    { id: 'notes', label: 'Notes', keys: ['notes','Notes'] },
];

// Helper: compress record.values keys into canonical short keys: 'slide-<n>::<canonical-id>'
function compressRecordValues(record) {
    if (!record || !record.values) return record;
    const newVals = {};
    for (const origKey in record.values) {
        const val = record.values[origKey];
        // try to extract slide id
        const parts = origKey.split('::');
        let slidePart = parts[0] || '';
        let suffix = (parts[1] || parts[0] || '').trim();

        // friendly label from existing key (handles older verbose keys)
        const friendly = friendlyLabelForKey(origKey).replace(/^Baseline — |^Final — /, '').trim();
    // determine slide id number or explicit head
    const slideMatch = slidePart.match(/slide-(\d+)/);
    let slideId = slideMatch ? slideMatch[1] : (parts[0] && /^\d+$/.test(parts[0]) ? parts[0] : 's');
    // If the original key used explicit 'baseline' or 'final' as head, respect that
    const headLower = String(slidePart || '').toLowerCase();
    let explicitHead = null;
    if (headLower === 'baseline' || headLower === 'final') explicitHead = headLower;

        // find canonical field id
        let matched = null;
        const normalized = friendly.toLowerCase();
        for (const f of CANONICAL_FIELDS) {
            for (const alias of f.keys) {
                if (String(alias).toLowerCase() === normalized || normalized.startsWith(String(alias).toLowerCase())) {
                    matched = f.id; break;
                }
            }
            if (matched) break;
        }
        if (!matched) {
            // fallback: normalize suffix to a kebab id
            matched = String(suffix || friendly).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g,'') || 'notes';
        }

    // use baseline:: or final:: prefix for storage to make intent explicit
    const posPrefix = explicitHead ? explicitHead : ((slideId === BASELINE_SLIDE_ID) ? 'baseline' : (slideId === FINAL_SLIDE_ID ? 'final' : (slideId === '3' ? 'baseline' : (slideId === '9' ? 'final' : 'final'))));
    const newKey = `${posPrefix}::${matched}`;
        newVals[newKey] = val;
    }
    record.values = newVals;
    return record;
}

// Slide dataset ids for baseline and final (0-based index -> dataset.slide values)
const BASELINE_SLIDE_ID = '3'; // slide 4 in UI
const FINAL_SLIDE_ID = '9';    // slide 10 in UI

function friendlyLabelForKey(key) {
    // key formats: 'slide-3::sag-F' or 'slide-3::Front Preload: turns from full soft'
    const parts = key.split('::');
    const slidePart = parts[0] || '';
    const suffixRaw = (parts[1] || parts[0] || '').trim();
    // derive slide role (baseline/final) from slidePart
    const slideMatch = slidePart.match(/slide-(\d+)/);
    let slideId = slideMatch ? slideMatch[1] : null;
    let prefix = '';
    if (slideId === BASELINE_SLIDE_ID) prefix = 'Baseline — ';
    else if (slideId === FINAL_SLIDE_ID) prefix = 'Final — ';
    else if (String(slidePart).toLowerCase() === 'baseline') prefix = 'Baseline — ';
    else if (String(slidePart).toLowerCase() === 'final') prefix = 'Final — ';

    let suffix = suffixRaw;
    if (suffix.indexOf(':') !== -1) suffix = suffix.split(':')[0].trim();

    // exact match
    if (FRIENDLY_LABELS[suffix]) return prefix + FRIENDLY_LABELS[suffix];

    // prefix match
    for (const fk in FRIENDLY_LABELS) {
        if (suffix.startsWith(fk)) return prefix + FRIENDLY_LABELS[fk];
    }

    // role-based (sag-F/sag-R)
    if (suffix === 'sag-F') return prefix + FRIENDLY_LABELS['sag-F'];
    if (suffix === 'sag-R') return prefix + FRIENDLY_LABELS['sag-R'];

    // fallback to cleaned suffix
    return prefix + suffix.replace(/\s+/g,' ').trim();
}

// Build a history slide from localStorage records
function buildHistorySlide() {
    const records = loadHistory();
    // create a slide element
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.dataset.history = 'true';
    slide.dataset.slide = String(document.querySelectorAll('.slide').length);

    const content = document.createElement('div');
    content.className = 'slide-content';
    content.innerHTML = '<h2 class="slide-title">Saved Records</h2>';

    // Add a small action bar with Start over button
    const actionBar = document.createElement('div');
    actionBar.style.cssText = 'display:flex; gap:0.5rem; margin-bottom:1rem;';
    const startOverBtn = document.createElement('button');
    startOverBtn.className = 'btn btn--outline';
    startOverBtn.textContent = 'Start over (clear fields)';
    startOverBtn.title = 'Clear all fields and create a new blank snapshot';
    startOverBtn.addEventListener('click', () => {
        // clear all record inputs
        const inputs = document.querySelectorAll('.record-input');
        inputs.forEach(i => {
            i.value = '';
            // remove snapshotted markers and initial value flag
            delete i.dataset.snapshotted;
            delete i.dataset._initialValue;
            // trigger input events so any UI sync (date copy) runs
            i.dispatchEvent(new Event('input', { bubbles: true }));
        });
        // append a new empty combined snapshot (represents a fresh start)
        const slides = document.querySelectorAll('.slide');
        const baselineSlide = Array.from(slides).find(s => s.dataset.slide === BASELINE_SLIDE_ID);
        const finalSlide = Array.from(slides).find(s => s.dataset.slide === FINAL_SLIDE_ID);
        const combined = { timestamp: Date.now(), slide: FINAL_SLIDE_ID, values: {}, __append: true };
        if (baselineSlide) baselineSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
        if (finalSlide) finalSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
        pushRecord(combined);
        showToast('Cleared fields and created new snapshot');
        // rebuild history UI
        const savedSlide = document.querySelector('.slide[data-history="true"]');
        if (savedSlide) {
            savedSlide.parentNode.removeChild(savedSlide);
            buildHistorySlide();
            refreshPresentationSlidesUI();
        }
    });
    actionBar.appendChild(startOverBtn);
    content.appendChild(actionBar);

    const list = document.createElement('div');
    list.className = 'saved-records';
    if (!records.length) {
        // show a friendly placeholder card
        const emptyCard = document.createElement('div');
        emptyCard.className = 'record-card record-card--empty';
        emptyCard.innerHTML = `
            <h4>No saved records</h4>
            <p>When you finish a baseline (slide 4) and final (slide 10) setup, a single latest snapshot will be stored here. Use the button below to commit a new historical entry.</p>
        `;
        const emptyActions = document.createElement('div');
        emptyActions.className = 'record-actions';
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn--primary';
        saveBtn.textContent = 'Save snapshot';
        saveBtn.addEventListener('click', () => {
            // build combined snapshot from baseline + final slides and append
            const slides = document.querySelectorAll('.slide');
            const baselineSlide = Array.from(slides).find(s => s.dataset.slide === BASELINE_SLIDE_ID);
            const finalSlide = Array.from(slides).find(s => s.dataset.slide === FINAL_SLIDE_ID);
            const combined = { timestamp: Date.now(), slide: FINAL_SLIDE_ID, values: {}, __append: true };
            if (baselineSlide) baselineSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
            if (finalSlide) finalSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });

            // Only append if some meaningful fields exist
            const hasValues = Object.values(combined.values).some(v => v !== null && String(v).trim() !== '');
            if (hasValues) {
                pushRecord(combined);
                showToast('Saved snapshot');
            } else {
                showToast('No values to save');
            }

            // rebuild history UI
            const savedSlide = document.querySelector('.slide[data-history="true"]');
            if (savedSlide) {
                savedSlide.parentNode.removeChild(savedSlide);
                buildHistorySlide();
                refreshPresentationSlidesUI();
            }
        });
        emptyCard.appendChild(emptyActions);
        emptyActions.appendChild(saveBtn);
        list.appendChild(emptyCard);
    } else {
        // render with delete buttons
        records.slice().reverse().forEach((r, idxReversed) => {
            // compute original index in history array
            const idx = records.length - 1 - idxReversed;
            const card = document.createElement('div');
            card.className = 'record-card';
            const when = new Date(r.timestamp).toLocaleString();
            card.innerHTML = `<h4>Saved: ${when}</h4>`;
            // build a two-column body: baseline (left) and final (right)
            const body = document.createElement('div');
            body.className = 'record-card__body';
            const colLeft = document.createElement('div');
            colLeft.className = 'record-card__col';
            const colRight = document.createElement('div');
            colRight.className = 'record-card__col';

            // Normalize r.values into baseline/final mapping by using the global CANONICAL_FIELDS
            const fields = {};
            CANONICAL_FIELDS.forEach(f => fields[f.id] = { label: f.label, baseline: '', final: '' });

            for (const k in r.values) {
                const parts = k.split('::');
                const head = (parts[0] || '').trim().toLowerCase();
                const suffix = (parts[1] || parts[0] || '').trim();
                const suffixNorm = String(suffix).toLowerCase();
                // find matching canonical field by id or alias
                let matched = null;
                for (const f of CANONICAL_FIELDS) {
                    if (f.id === suffixNorm) { matched = f.id; break; }
                    for (const alias of f.keys) {
                        if (String(alias).toLowerCase() === suffixNorm || suffixNorm.startsWith(String(alias).toLowerCase())) { matched = f.id; break; }
                    }
                    if (matched) break;
                }
                if (!matched) matched = 'notes';

                // determine whether this key represents baseline or final
                if (head === 'baseline') fields[matched].baseline = r.values[k];
                else fields[matched].final = r.values[k];
            }

            // Create a table with columns: Field | Baseline | Final
            const table = document.createElement('table');
            table.className = 'record-table';
            const thead = document.createElement('thead');
            thead.innerHTML = '<tr><th>Field</th><th>Baseline</th><th>Final</th></tr>';
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            // preserve canonical order
            CANONICAL_FIELDS.forEach(f => {
                const row = document.createElement('tr');
                const tdLabel = document.createElement('td');
                tdLabel.className = 'field-label';
                tdLabel.textContent = fields[f.id].label;
                const tdBase = document.createElement('td');
                tdBase.className = 'baseline-val';
                tdBase.textContent = fields[f.id].baseline || '';
                const tdFinal = document.createElement('td');
                tdFinal.className = 'final-val';
                tdFinal.textContent = fields[f.id].final || '';
                row.appendChild(tdLabel);
                row.appendChild(tdBase);
                row.appendChild(tdFinal);
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            body.appendChild(table);
            const actions = document.createElement('div');
            actions.className = 'record-actions';
            const delBtn = document.createElement('button');
            delBtn.className = 'btn btn--outline btn--danger';
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', () => {
                deleteRecord(idx);
                showToast('Record deleted');
            });
            actions.appendChild(delBtn);
            const restoreBtn = document.createElement('button');
            restoreBtn.className = 'btn btn--outline';
            restoreBtn.textContent = 'Restore';
            restoreBtn.addEventListener('click', () => {
                // restore values into slides (baseline and final)
                const slides = document.querySelectorAll('.slide');
                const baselineSlide = Array.from(slides).find(s => s.dataset.slide === BASELINE_SLIDE_ID);
                const finalSlide = Array.from(slides).find(s => s.dataset.slide === FINAL_SLIDE_ID);
                for (const k in r.values) {
                    const el = document.querySelector(`.record-input[data-key="${k}"]`);
                    if (el) el.value = r.values[k];
                }
                showToast('Snapshot restored to slides 4 & 10');
                // update in-place latest state to match restored values (replace last)
                const combined = { timestamp: Date.now(), slide: FINAL_SLIDE_ID, values: {} };
                // collect current baseline and final inputs after restore
                if (baselineSlide) baselineSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
                if (finalSlide) finalSlide.querySelectorAll('.record-input').forEach(i => { if (i.dataset && i.dataset.key) combined.values[i.dataset.key] = i.value || ''; });
                pushRecord(combined);
                // refresh UI
                const savedSlide = document.querySelector('.slide[data-history="true"]');
                if (savedSlide) {
                    savedSlide.parentNode.removeChild(savedSlide);
                    buildHistorySlide();
                    refreshPresentationSlidesUI();
                }
            });
            actions.appendChild(restoreBtn);
            card.appendChild(actions);
            card.appendChild(body);
            list.appendChild(card);
        });
    }

    content.appendChild(list);
    slide.appendChild(content);

    // append to slides container if not already present
    const container = document.getElementById('slidesContainer');
    if (container) container.appendChild(slide);
}


// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const presentation = new SuspensionGuidePresentation();
    const enhancements = new PresentationEnhancements(presentation);
    const interactions = new SlideInteractions(presentation);

    // Make presentation globally accessible for debugging
    window.suspensionGuide = {
        presentation,
        enhancements,
        interactions,
        jumpTo: (section) => presentation.jumpToSection(section)
    };

    if (window.__Z900_DEBUG) {
        console.log('2025 Kawasaki Z900 SE Suspension Guide loaded successfully!');
        console.log('Use suspensionGuide.jumpTo("section-name") to navigate programmatically');
    }
});