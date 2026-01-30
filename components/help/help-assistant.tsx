'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
    Sparkles, Search, X, MapPin, Bot, Lightbulb, PlayCircle,
    ChevronRight, ChevronLeft, CheckCircle2, FastForward,
    ChevronDown, ChevronUp, Info, Volume2, VolumeX
} from "lucide-react";
import { helpSections, HelpSection } from "@/lib/help-content";
import { Mascot } from "@/components/shared/mascot";
import { useModules } from "@/hooks/use-modules";
import { ModuleKey } from "@/lib/config/modules";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { CursorPuppet } from './cursor-puppet';
import { FloatingBotTrigger } from './floating-bot-trigger';

export function HelpAssistant() {
    const pathname = usePathname();
    const router = useRouter(); // [SMART NAV]
    const { modules } = useModules(); // [SMART NAV]
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [activeSection, setActiveSection] = useState<HelpSection | null>(null);

    // Sequential Tour State
    const [isTouring, setIsTouring] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Discovery State
    const [discoveredFeatures, setDiscoveredFeatures] = useState<string[]>([]);
    const [hasNewFeatures, setHasNewFeatures] = useState(false);

    // Voice / TTS State
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Smart Navigation State
    const [blockedModule, setBlockedModule] = useState<ModuleKey | null>(null);
    const [pendingTourSection, setPendingTourSection] = useState<HelpSection | null>(null);

    // Puppet State
    const [puppetRect, setPuppetRect] = useState<DOMRect | null>(null);
    const [isPuppetClicking, setIsPuppetClicking] = useState(false);
    const [isPuppetVisible, setIsPuppetVisible] = useState(false);

    // UI/Mount State
    const [componentMounted, setComponentMounted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setComponentMounted(true);
    }, []);

    const triggerConfetti = useCallback(() => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    }, []);

    const sidebarLinkId = (section: HelpSection) => `sidebar-item-${section.route}`;

    // ============================================================================
    // HUMAN-LIKE INTERACTION SYSTEM
    // ============================================================================

    /**
     * Ensures the window has focus before performing actions
     * Critical for reliable click events
     */
    const ensureFocus = useCallback(async (): Promise<boolean> => {
        if (typeof window === 'undefined') return false;

        if (!document.hasFocus()) {
            window.focus();
            // Wait for focus to be acquired
            await new Promise(resolve => setTimeout(resolve, 300));

            // Verify focus was acquired
            if (!document.hasFocus()) {
                console.warn('[Bot] Failed to acquire window focus');
                return false;
            }
        }
        return true;
    }, []);

    /**
     * Generates a random human-like delay between min and max ms
     */
    const randomDelay = useCallback((min: number = 300, max: number = 800): Promise<void> => {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }, []);

    /**
     * Checks if element is truly visible and interactable
     */
    const isElementInteractable = useCallback((element: HTMLElement): boolean => {
        if (!element) return false;

        // Check if element exists in DOM
        if (!document.body.contains(element)) return false;

        // Check offsetParent (null means display:none or not in DOM)
        if (element.offsetParent === null) return false;

        // Check computed style
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }

        // Check dimensions
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;

        // Check if disabled
        if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
            return false;
        }

        return true;
    }, []);

    /**
     * Checks if element is in viewport
     */
    const isInViewport = useCallback((element: HTMLElement): boolean => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }, []);

    /**
     * Comprehensive element validation with retries
     */
    const validateElement = useCallback(async (
        selector: string | ((el: Element) => boolean),
        options: {
            timeout?: number;
            mustBeVisible?: boolean;
            mustBeEnabled?: boolean;
            mustBeInViewport?: boolean;
        } = {}
    ): Promise<HTMLElement | null> => {
        const {
            timeout = 5000,
            mustBeVisible = true,
            mustBeEnabled = true,
            mustBeInViewport = false
        } = options;

        const start = Date.now();

        while (Date.now() - start < timeout) {
            let element: HTMLElement | null = null;

            // Find element with prioritized logical identifiers
            if (typeof selector === 'string') {
                // Priority 1: Direct selector (could be a complex selector)
                element = document.querySelector(selector) as HTMLElement;
            } else {
                // Priority 2: Function-based search (legacy)
                const allWithHelpId = document.querySelectorAll('[data-help-id]');
                element = Array.from(allWithHelpId).find(selector) as HTMLElement;
            }

            if (!element) {
                await new Promise(resolve => requestAnimationFrame(resolve));
                continue;
            }

            // Validate interactability
            if (mustBeVisible && !isElementInteractable(element)) {
                await new Promise(resolve => requestAnimationFrame(resolve));
                continue;
            }

            // Validate viewport position if required
            if (mustBeInViewport && !isInViewport(element)) {
                await new Promise(resolve => requestAnimationFrame(resolve));
                continue;
            }

            // All checks passed
            return element;
        }

        return null;
    }, [isElementInteractable, isInViewport]);

    /**
     * Safely scrolls element into view and waits for scroll to complete
     */
    const scrollIntoViewSafe = useCallback(async (element: HTMLElement): Promise<void> => {
        if (!element) return;

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });

        // Wait for element's position to stabilize relative to viewport
        // This is much more robust than checking window.scrollY as it works for container scrolls too
        await new Promise<void>(resolve => {
            let lastX = element.getBoundingClientRect().left;
            let lastY = element.getBoundingClientRect().top;
            let sameCount = 0;
            const startTime = Date.now();

            const checkPos = () => {
                const rect = element.getBoundingClientRect();
                const currentX = rect.left;
                const currentY = rect.top;

                // Check if position changed
                if (Math.abs(currentX - lastX) < 0.5 && Math.abs(currentY - lastY) < 0.5) {
                    sameCount++;
                    if (sameCount > 10) { // Stable for ~160ms (at 60fps)
                        resolve();
                        return;
                    }
                } else {
                    sameCount = 0;
                }

                lastX = currentX;
                lastY = currentY;

                // Safety timeout
                if (Date.now() - startTime > 2500) {
                    resolve();
                    return;
                }
                requestAnimationFrame(checkPos);
            };

            requestAnimationFrame(checkPos);
        });

        // Additional settling time
        await new Promise(resolve => setTimeout(resolve, 150));
    }, []);

    /**
     * Hovers over element to trigger :hover states
     */
    const hoverElement = useCallback(async (element: HTMLElement): Promise<void> => {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Dispatch mouse events
        const mouseEnter = new MouseEvent('mouseenter', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        });

        const mouseOver = new MouseEvent('mouseover', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        });

        element.dispatchEvent(mouseEnter);
        element.dispatchEvent(mouseOver);

        // Wait for hover effects to apply
        await new Promise(resolve => setTimeout(resolve, 100));
    }, []);

    /**
     * Performs a realistic human interaction (Touch/Pointer sequence)
     * Critical: Bypasses overlays and verifies the target is actually hit
     */
    const performHumanInteraction = useCallback(async (element: HTMLElement): Promise<boolean> => {
        try {
            // 1. Ensure window focus
            const hasFocus = await ensureFocus();
            if (!hasFocus) {
                console.error('[Bot] Cannot interact: window focus failed');
                return false;
            }

            // 2. Scroll into view safely
            await scrollIntoViewSafe(element);

            // SYNC PUPPET: After scroll, the element position changed.
            // We must update the visual puppet to stay on top of the real target.
            const initialRect = element.getBoundingClientRect();
            setPuppetRect(initialRect);
            // Small pause for the hand to actually move there visually
            await new Promise(resolve => setTimeout(resolve, 250));

            // 3. Get target coordinates (re-calculate in case of minor shifts)
            const rect = element.getBoundingClientRect();
            // Add small random offset from center for realism
            const offsetX = (Math.random() - 0.5) * 6;
            const offsetY = (Math.random() - 0.5) * 6;
            const clientX = rect.left + rect.width / 2 + offsetX;
            const clientY = rect.top + rect.height / 2 + offsetY;

            // 4. PREPARE ENVIRONMENT: Bypass multiple potential overlay layers
            // We bypass z-100 (backdrop), z-50 (our trigger), and potentially z-101 (drawer structure if needed)
            const overlays = document.querySelectorAll('.z-\\[100\\], .z-\\[50\\]');
            const originalStates = Array.from(overlays).map(el => (el as HTMLElement).style.pointerEvents);

            overlays.forEach(el => {
                (el as HTMLElement).style.pointerEvents = 'none';
            });

            // 5. VERIFY TARGET through all layers
            // Wait a frame for style application and potential layout stabilization
            await new Promise(resolve => requestAnimationFrame(resolve));

            const topElement = document.elementFromPoint(clientX, clientY);
            const isTargetOrChild = topElement && (element === topElement || element.contains(topElement) || topElement.contains(element));

            if (!isTargetOrChild) {
                console.warn('[Bot] Target blocked by:', topElement);
                // If it's the drawer content itself (z-101), we might need to click deeper or bypass its container
                if (topElement?.classList.contains('z-[101]') || topElement?.closest('.z-\\[101\\]')) {
                    console.log('[Bot] Blocked by drawer container, trying to click through');
                    (topElement as HTMLElement).style.pointerEvents = 'none';
                    // Re-verify after bypassing one more layer
                    await new Promise(resolve => requestAnimationFrame(resolve));
                    const nextTop = document.elementFromPoint(clientX, clientY);
                    console.log('[Bot] Next top element:', nextTop);
                    if (topElement) (topElement as HTMLElement).style.pointerEvents = 'auto'; // Will be restored anyway by loop but for safety
                }
            }

            // 6. EXECUTE INPUT SEQUENCE (Pointer -> Touch -> Mouse)
            const bubbles = true;
            const cancelable = true;
            const view = window;

            // Common event init
            const eventInit = {
                bubbles, cancelable, view,
                clientX, clientY,
                screenX: clientX + (window.screenX || 0),
                screenY: clientY + (window.screenY || 0),
                pointerId: 1,
                width: 1, height: 1,
                pressure: 0.5,
                isPrimary: true
            };

            // A. Hover / Move to target
            element.dispatchEvent(new PointerEvent('pointermove', eventInit));
            element.dispatchEvent(new MouseEvent('mousemove', eventInit));
            await new Promise(resolve => setTimeout(resolve, 100));

            // B. Press Down
            setIsPuppetClicking(true);
            element.dispatchEvent(new PointerEvent('pointerdown', eventInit));
            element.dispatchEvent(new MouseEvent('mousedown', eventInit));

            // Touch events require specific TouchList interface
            const touchObj = new Touch({ identifier: 1, target: element, clientX, clientY });
            const touchList = [touchObj];

            element.dispatchEvent(new TouchEvent('touchstart', {
                bubbles, cancelable, view,
                touches: touchList as any,
                targetTouches: touchList as any,
                changedTouches: touchList as any
            }));

            // C. Hold (Human press duration)
            await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 80) + 120));

            // D. Release
            element.dispatchEvent(new PointerEvent('pointerup', eventInit));
            element.dispatchEvent(new MouseEvent('mouseup', eventInit));
            element.dispatchEvent(new TouchEvent('touchend', {
                bubbles, cancelable, view,
                touches: [] as any,
                targetTouches: [] as any,
                changedTouches: touchList as any
            }));

            setIsPuppetClicking(false);

            // E. Click (The final trigger)
            element.dispatchEvent(new MouseEvent('click', eventInit));

            // F. Fallback: Native click if the element didn't react
            if (typeof element.click === 'function') {
                element.click();
            }

            // G. Focus if needed
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLButtonElement) {
                element.focus();
            }

            // 7. RESTORE ENVIRONMENT
            overlays.forEach((el, i) => {
                (el as HTMLElement).style.pointerEvents = originalStates[i];
            });

            console.log('[Bot] Interaction executed on:', element);
            return true;

        } catch (error) {
            console.error('[Bot] Interaction failed:', error);
            // Restore overlays in case of error
            const tourOverlay = document.querySelector('.fixed.inset-0.z-\\[100\\]') as HTMLElement;
            if (tourOverlay) tourOverlay.style.pointerEvents = 'auto'; // Reset to default usually
            return false;
        }
    }, [ensureFocus, scrollIntoViewSafe]);

    /**
     * Verifies that a click produced the expected result
     */
    const verifyClickResult = useCallback(async (
        verification: {
            type: 'modal_open' | 'route_change' | 'element_appear' | 'element_disappear' | 'state_change';
            selector?: string;
            route?: string;
            timeout?: number;
        }
    ): Promise<boolean> => {
        const { type, selector, route, timeout = 3000 } = verification;
        const start = Date.now();

        while (Date.now() - start < timeout) {
            switch (type) {
                case 'modal_open':
                case 'element_appear':
                    if (selector) {
                        const element = document.querySelector(selector);
                        if (element && isElementInteractable(element as HTMLElement)) {
                            return true;
                        }
                    }
                    break;

                case 'element_disappear':
                    if (selector) {
                        const element = document.querySelector(selector);
                        if (!element || !isElementInteractable(element as HTMLElement)) {
                            return true;
                        }
                    }
                    break;

                case 'route_change':
                    if (route && window.location.pathname === route) {
                        return true;
                    }
                    break;

                case 'state_change':
                    // Generic state change - just wait a bit
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return true;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.warn(`[Bot] Verification failed: ${type}`, { selector, route });
        return false;
    }, [isElementInteractable]);

    /**
     * Performs a click with automatic retries and verification
     */
    /**
     * Performs a click with automatic retries and verification
     */
    const retryableClick = useCallback(async (
        element: HTMLElement,
        verification?: {
            type: 'modal_open' | 'route_change' | 'element_appear' | 'element_disappear' | 'state_change';
            selector?: string;
            route?: string;
            timeout?: number;
        },
        maxRetries: number = 3
    ): Promise<boolean> => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            if (attempt > 0) {
                console.log(`[Bot] Retry attempt ${attempt + 1}/${maxRetries}`);
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
            }

            // Use the new human interaction system
            const clickSuccess = await performHumanInteraction(element);
            if (!clickSuccess) {
                continue;
            }

            // If no verification needed, consider it successful
            if (!verification) {
                return true;
            }

            // Verify the click produced expected result
            const verified = await verifyClickResult(verification);
            if (verified) {
                return true;
            }
        }

        console.error('[Bot] All retry attempts failed');
        return false;
    }, [performHumanInteraction, verifyClickResult]);

    // Legacy compatibility: keep waitForElement as alias to validateElement
    const waitForElement = useCallback(async (selector: string | ((el: Element) => boolean), timeout = 5000): Promise<HTMLElement | null> => {
        return validateElement(selector, { timeout });
    }, [validateElement]);

    const markAsDiscovered = useCallback((id: string) => {
        if (!id || discoveredFeatures.includes(id)) return;
        setDiscoveredFeatures(prev => {
            if (prev.includes(id)) return prev;
            const next = [...prev, id];
            localStorage.setItem('eduflow_discovered_features', JSON.stringify(next));
            return next;
        });
    }, [discoveredFeatures]);

    const updateHighlight = useCallback((targetId: string) => {
        const el = document.querySelector(`[data-help-id="${targetId}"]`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                setHighlightRect(el.getBoundingClientRect());
            }, 400);
        } else {
            console.warn(`Element with data-help-id="${targetId}" not found.`);
            // If target missing, still set null to avoid stale highlights
            setHighlightRect(null);
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

        // Cancel previous speech
        try {
            window.speechSynthesis.cancel();
        } catch (e) {
            console.warn("Speech synthesis cancel failed", e);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // Slightly faster natural usage
        utterance.pitch = 1.0;

        // Try to find a Russian voice
        const voices = window.speechSynthesis.getVoices();
        const ruVoice = voices.length > 0 ? (voices.find(v => v.lang.includes('ru')) || voices[0]) : null;
        if (ruVoice) utterance.voice = ruVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [isVoiceEnabled]);

    const toggleVoice = useCallback(() => {
        const next = !isVoiceEnabled;
        setIsVoiceEnabled(next);
        localStorage.setItem('eduflow_voice_enabled', JSON.stringify(next));
        if (!next) {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            setIsSpeaking(false);
        } else if (activeSection && isTouring) {
            const step = activeSection.steps[tourStep];
            if (step) speak(step.title + ". " + step.text);
        }
    }, [isVoiceEnabled, activeSection, isTouring, tourStep, speak]);

    // Cleanup speech on unmount or tour end
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Speak when step changes
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        const handleStepAction = async () => {
            if (!isTouring || !activeSection) return;

            const step = activeSection.steps[tourStep];
            if (!step) return;

            // [INTERACTIVE STEP]
            if (step.action) {
                // 1. ACTION VALIDATION
                const allowedActions = ['click', 'wait', 'type'];
                if (!allowedActions.includes(step.action)) {
                    console.error(`[Bot] Action "${step.action}" is not allowed.`);
                    return;
                }

                // 2. VERSION & TEMPLATE VALIDATION
                const currentSystemVersion = "2.0.0"; // Should be synced with app version
                if (step.version && step.version !== currentSystemVersion) {
                    console.warn(`[Bot] Version mismatch: Step version ${step.version} vs System version ${currentSystemVersion}. Proceeding with caution.`);
                }

                const targetId = step.actionTargetId || step.targetId;
                if (targetId) {
                    // 3. PRIORITIZED ELEMENT SELECTION
                    // Priority order: accessibilityId > dataAction > data-help-id
                    const selectors = [
                        step.accessibilityId ? `[accessibilityId="${step.accessibilityId}"]` : null,
                        step.dataAction ? `[data-action="${step.dataAction}"]` : null,
                        `[data-help-id="${targetId}"]`
                    ].filter(Boolean) as string[];

                    let el: HTMLElement | null = null;
                    for (const selector of selectors) {
                        el = await validateElement(selector, {
                            timeout: selectors.indexOf(selector) === 0 ? 3000 : 500, // Longer for first, fast for fallbacks
                            mustBeVisible: true,
                            mustBeEnabled: true
                        });
                        if (el) break;
                    }

                    if (el) {
                        setIsPuppetVisible(true);

                        // Update puppet position
                        await new Promise(resolve => setTimeout(resolve, 100));
                        setPuppetRect(el.getBoundingClientRect());

                        // Perform Action
                        if (step.action === 'click') {
                            const actionDelay = step.actionDelay || 800;
                            await new Promise(resolve => setTimeout(resolve, actionDelay));

                            if (!step.preventInteraction) {
                                // Use the unified interaction system (handles scroll, visual state, and events)
                                const verification = step.targetId === 'students-table-row'
                                    ? {
                                        type: 'modal_open' as const,
                                        selector: '[role="dialog"]',
                                        timeout: 2000
                                    }
                                    : undefined;

                                const success = await retryableClick(el, verification, 2);

                                if (!success) {
                                    console.warn('[Bot] Click action failed for step:', step.title);
                                }
                            }
                        } else if (step.action === 'wait') {
                            // Just hover - already done by showing puppet
                        }
                    } else {
                        console.warn('[Bot] Element not found for step:', targetId);
                    }
                }
            } else {
                // Hide puppet if no action
                setIsPuppetVisible(false);
            }

            // Speak after action
            timer = setTimeout(() => {
                speak(step.title + ". " + step.text);
            }, 500);
        };

        handleStepAction();

        return () => {
            if (timer) clearTimeout(timer);
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            setIsSpeaking(false);
        };
    }, [tourStep, isTouring, activeSection, speak, validateElement, retryableClick]);

    useEffect(() => {
        const saved = localStorage.getItem('eduflow_discovered_features');
        if (saved) setDiscoveredFeatures(JSON.parse(saved));
    }, []);

    useEffect(() => {
        // Auto-scan for data-help-id on the current page to detect "new" things
        const elements = document.querySelectorAll('[data-help-id]');
        const idsOnPage = Array.from(elements).map(el => el.getAttribute('data-help-id')!);

        // Find if any ID is in helpSections but not in discoveredFeatures
        const allTargetIds = helpSections.flatMap(s => [
            s.highlightId,
            ...s.steps.map(step => step.targetId)
        ]).filter(Boolean) as string[];

        const unseenAvailable = idsOnPage.filter(id =>
            allTargetIds.includes(id) && !discoveredFeatures.includes(id)
        );

        setHasNewFeatures(unseenAvailable.length > 0);
    }, [pathname, discoveredFeatures, open]);

    // [NAVIGATION FIX] Persist tour intention across route changes
    useEffect(() => {
        const savedTour = sessionStorage.getItem('eduflow_pending_tour');
        if (savedTour) {
            const { sectionId, step } = JSON.parse(savedTour);
            const section = helpSections.find(s => s.id === sectionId);
            if (section) {
                // Wait for page to stabilize
                setTimeout(() => {
                    sessionStorage.removeItem('eduflow_pending_tour');
                    setActiveSection(section);
                    setIsTouring(true);
                    setTourStep(step || 0);

                    // Trigger highlight for current step
                    const targetId = section.steps[step || 0]?.targetId || section.highlightId;
                    if (targetId) {
                        updateHighlight(targetId);
                    }
                }, 1000);
            }
        }
    }, [pathname, updateHighlight]);

    // Auto-select section based on route
    useEffect(() => {
        if (open) {
            const exactMatch = helpSections.find(s => s.route === pathname);
            if (exactMatch) {
                setActiveSection(exactMatch);
            } else {
                setActiveSection(null);
            }
        }
    }, [pathname, open]);

    // Global toggle listener
    // Global toggle listener & Hardware Back Button
    useEffect(() => {
        const handleOpenHelp = () => setOpen(true);
        window.addEventListener('open-help', handleOpenHelp);

        return () => window.removeEventListener('open-help', handleOpenHelp);
    }, []);

    // Handle Back Button to Close Sheet
    useEffect(() => {
        if (open) {
            // Push state when opened
            window.history.pushState({ helpOpen: true }, '');

            const handlePopState = (event: PopStateEvent) => {
                // If user presses back, close the sheet
                setOpen(false);
            };

            window.addEventListener('popstate', handlePopState);
            return () => {
                window.removeEventListener('popstate', handlePopState);
                // Clean up state if needed, though browser handles pop
            };
        }
    }, [open]);

    const endTour = () => {
        setIsTouring(false);
        setHighlightRect(null);
        setTourStep(0);
        setIsExpanded(false);
    };

    const startTour = async (section: HelpSection, force = false) => {
        // [SMART NAV] Check Module Lock
        if (!force && section.moduleKey && !modules[section.moduleKey as ModuleKey]) {
            // Module is locked!
            const text = "Этот раздел сейчас отключен в настройках. Я покажу вам, где его включить.";
            if (isVoiceEnabled) speak(text);

            setBlockedModule(section.moduleKey as ModuleKey);
            setPendingTourSection(section);

            setOpen(false); // Close main sheet
            router.push('/app/settings');

            // Highlight the toggle after navigation (using a delay since we don't have route completion event easily)
            setTimeout(() => {
                updateHighlight(`module-toggle-${section.moduleKey}`);
                // Maybe show a small bubble or speak again?
                if (isVoiceEnabled) speak("Включите этот переключатель, чтобы активировать модуль.");
            }, 800);

            return;
        }

        // Standard Tour Start
        if (!force && section.route !== "all" && section.route !== pathname && section.route.startsWith('/app')) {
            const sidebarLinkId = `sidebar-item-${section.route}`;

            // [HELPER] Function to execute the click with puppet and verification
            const executeNavigationClick = async (element: HTMLElement): Promise<boolean> => {
                setOpen(false);
                setIsPuppetVisible(true);
                const rect = element.getBoundingClientRect();
                setPuppetRect(rect);
                if (isVoiceEnabled) speak("Переходим в нужный раздел...");

                // Store intent before click
                sessionStorage.setItem('eduflow_pending_tour', JSON.stringify({
                    sectionId: section.id,
                    step: 0
                }));

                // Perform reliable click with route change verification
                // This now handles the visual click state, scrolling, and events in one go
                const success = await retryableClick(element, {
                    type: 'route_change',
                    route: section.route,
                    timeout: 4000
                }, 2);

                return success;
            };

            // [ALWAYS SHOW HAND] Start by showing hand in center
            setOpen(false);
            setIsPuppetVisible(true);
            setPuppetRect(null); // Triggers center position in CursorPuppet

            // Wait a moment for "Arrival" animation
            await new Promise(resolve => setTimeout(resolve, 500));

            // 1. Try direct click (Desktop/Visible Link)
            const targetEl = await validateElement(`[data-help-id="${sidebarLinkId}"]`, {
                timeout: 500,
                mustBeVisible: true
            });

            if (targetEl) {
                const success = await executeNavigationClick(targetEl);
                if (success) return;
                console.warn('[Bot] Direct navigation click failed, trying mobile menu');
            }

            // 2. Try Mobile Menu Macro
            const mobileMenuTrigger = await validateElement('[data-help-id="mobile-nav-menu"]', {
                timeout: 500,
                mustBeVisible: true
            });

            if (mobileMenuTrigger) {
                // Step 1: Click Menu
                const menuRect = mobileMenuTrigger.getBoundingClientRect();
                setPuppetRect(menuRect);

                if (isVoiceEnabled) speak("Открываю меню...");

                await randomDelay(600, 800);
                setIsPuppetClicking(true);
                await new Promise(resolve => setTimeout(resolve, 400));
                setIsPuppetClicking(false);

                // Click menu with drawer opening verification
                const menuSuccess = await retryableClick(mobileMenuTrigger, {
                    type: 'element_appear',
                    selector: '[data-help-id="mobile-drawer"]',
                    timeout: 2000
                }, 2);

                if (menuSuccess) {
                    // Critical: Wait for drawer animation to finish (at least partially)
                    // so coordinates are stable
                    await new Promise(resolve => setTimeout(resolve, 600));
                } else {
                    console.warn('[Bot] Mobile menu click failed');
                    // Fallback to direct navigation
                    setIsPuppetVisible(false);
                    sessionStorage.setItem('eduflow_pending_tour', JSON.stringify({
                        sectionId: section.id,
                        step: 0
                    }));
                    router.push(section.route);
                    return;
                }

                // Step 2: Wait for Drawer and Link
                if (isVoiceEnabled) speak("Ищу нужный раздел...");

                // Scan animation
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                setPuppetRect({
                    left: windowWidth / 2,
                    top: windowHeight / 3,
                    width: 0,
                    height: 0,
                    right: windowWidth / 2,
                    bottom: windowHeight / 3,
                    x: windowWidth / 2,
                    y: windowHeight / 3,
                    toJSON: () => { }
                } as DOMRect);

                const drawerTarget = await validateElement(`[data-help-id="${sidebarLinkId}"]`, {
                    timeout: 3000,
                    mustBeVisible: true
                });

                if (drawerTarget) {
                    // Scroll into view safely
                    await scrollIntoViewSafe(drawerTarget);

                    // Update puppet position
                    await new Promise(resolve => setTimeout(resolve, 300));
                    setPuppetRect(drawerTarget.getBoundingClientRect());

                    // Execute click with verification
                    const success = await executeNavigationClick(drawerTarget);
                    if (success) return;

                    console.warn('[Bot] Drawer link click failed');
                }

                // If drawer target not found or click failed
                console.warn("Target link not found or click failed in drawer:", sidebarLinkId);
                if (isVoiceEnabled) speak("Не вижу кнопку. Перехожу автоматически.");
                setIsPuppetVisible(false);

                sessionStorage.setItem('eduflow_pending_tour', JSON.stringify({
                    sectionId: section.id,
                    step: 0
                }));
                router.push(section.route);
                return;
            }

            // Fallback: If nothing works
            console.warn('[Bot] All navigation methods failed, using router.push');
            if (isVoiceEnabled) speak("Перехожу в раздел.");
            setIsPuppetVisible(false);

            sessionStorage.setItem('eduflow_pending_tour', JSON.stringify({
                sectionId: section.id,
                step: 0
            }));
            router.push(section.route);
            return;
        }

        // Already on correct page - start tour immediately
        setOpen(false);
        setIsTouring(true);
        setTourStep(0);
        setIsExpanded(false);

        const firstStep = section.steps[0];
        const targetId = firstStep?.targetId || section.highlightId;

        if (targetId) {
            updateHighlight(targetId);
            markAsDiscovered(targetId);
        }
    };

    // Watch for module enablement
    useEffect(() => {
        if (blockedModule && pendingTourSection && modules[blockedModule as ModuleKey]) {
            // Module just enabled!
            if (isVoiceEnabled) {
                speak("Отлично! Модуль включен. Переходим к нему.");
            }

            setBlockedModule(null);

            // Navigate back and start tour
            if (pendingTourSection.route !== pathname) {
                router.push(pendingTourSection.route);
                setTimeout(() => {
                    startTour(pendingTourSection, true);
                }, 800);
            } else {
                startTour(pendingTourSection, true);
            }
            setPendingTourSection(null);
        }
    }, [modules, blockedModule, pendingTourSection, pathname, isVoiceEnabled, speak, startTour]);



    const nextStep = () => {
        if (!activeSection) return;
        const nextIdx = tourStep + 1;
        setIsExpanded(false);
        if (nextIdx < activeSection.steps.length) {
            setTourStep(nextIdx);
            const targetId = activeSection.steps[nextIdx].targetId;
            if (targetId) {
                updateHighlight(targetId);
                markAsDiscovered(targetId);
            }
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (!activeSection || tourStep === 0) return;
        const prevIdx = tourStep - 1;
        setTourStep(prevIdx);
        setIsExpanded(false);
        const targetId = activeSection.steps[prevIdx].targetId;
        if (targetId) updateHighlight(targetId);
    };


    useEffect(() => {
        const handleUpdate = () => {
            if (isTouring && activeSection) {
                const targetId = activeSection.steps[tourStep]?.targetId || activeSection.highlightId;
                if (targetId) {
                    const el = document.querySelector(`[data-help-id="${targetId}"]`);
                    if (el) {
                        const rect = el.getBoundingClientRect();
                        setHighlightRect(rect);
                        // [REALISM FIX] Update puppet position too if it's visible and tied to this element
                        if (isPuppetVisible) {
                            setPuppetRect(rect);
                        }
                    }
                }
            }
        };
        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, true);
        return () => {
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
        };
    }, [isTouring, activeSection, tourStep, isPuppetVisible]);

    const filteredSections = useMemo(() => {
        return search
            ? helpSections.filter(s =>
                s.title.toLowerCase().includes(search.toLowerCase()) ||
                s.steps.some(step => step.title.toLowerCase().includes(search.toLowerCase()) || step.text.toLowerCase().includes(search.toLowerCase()))
            )
            : helpSections;
    }, [search]);

    // Calculate spotlight CSS variables with Glow intensity
    const spotlightVars = useMemo(() => {
        if (!highlightRect) return {};
        const x = highlightRect.left + highlightRect.width / 2;
        const y = highlightRect.top + highlightRect.height / 2;
        const r = Math.max(highlightRect.width, highlightRect.height) / 2 + 15;
        const glow = r + 40; // Soft transition area
        return {
            '--x': `${x}px`,
            '--y': `${y}px`,
            '--r': `${r}px`,
            '--glow': `${glow}px`
        } as React.CSSProperties;
    }, [highlightRect]);

    if (!componentMounted) return null;

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="w-[85vw] sm:w-[540px] bg-zinc-950/98 backdrop-blur-2xl border-l border-zinc-900 text-zinc-100 p-0 flex flex-col z-[100] md:rounded-l-3xl shadow-2xl h-full"
                >
                    <div className="absolute top-4 right-4 z-20">
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full bg-zinc-900/50 hover:bg-zinc-800 transition-colors h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <SheetHeader className="p-4 md:p-8 border-b border-zinc-900/50 bg-zinc-950/50 relative overflow-hidden flex-none">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full -mr-32 -mt-32" />

                        <div className="flex items-center gap-3 md:gap-6 mb-4 md:mb-6 relative z-10">
                            <div className="relative w-12 h-12 md:w-20 md:h-20 flex-none group">
                                <div className={`absolute inset-0 blur-2xl rounded-full transition-all duration-500 ${hasNewFeatures ? 'bg-indigo-500/40 animate-discovery-glow' : 'bg-indigo-500/20 group-hover:bg-indigo-500/30'}`} />
                                <Mascot status={open ? "thinking" : (hasNewFeatures ? "surprised" : "idle")} className="w-12 h-12 md:w-full md:h-full relative z-10" />
                                {hasNewFeatures && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-zinc-950 flex items-center justify-center animate-bounce z-20">
                                        <Sparkles className="h-3 w-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] md:text-[10px] font-black uppercase text-indigo-400">
                                    <Bot className="h-3 w-3" /> Online Assistant
                                </div>
                                <SheetTitle className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                                    Edu-Bot Guide
                                </SheetTitle>
                                <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-none">Как я могу помочь?</p>
                            </div>
                        </div>


                        <AnimatePresence mode="wait">
                            <motion.div
                                key="search-bar"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="relative z-10 px-4 md:px-8 pb-4"
                            >
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <Search className="h-4 w-4 text-zinc-600" />
                                    </div>
                                    <Input
                                        placeholder="Поиск по разделам помощи..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-12 pl-11 bg-zinc-900/50 border-zinc-900 focus:bg-zinc-900 transition-all rounded-2xl text-sm placeholder:text-zinc-700"
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </SheetHeader>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto min-h-0 bg-zinc-950/30">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key="tours-content"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-4 md:p-8"
                            >
                                <div className="space-y-8">
                                    {/* FEATURED / ACTIVE SECTION */}
                                    {!search && activeSection && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="relative group/card"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover/card:blur-2xl transition-all" />
                                            <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-xl">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                            <Sparkles className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Активный раздел</div>
                                                            <h4 className="text-base font-bold text-white leading-none">{activeSection.title}</h4>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="h-8 text-[10px] px-4 font-black uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                                                        onClick={() => startTour(activeSection)}
                                                    >
                                                        <PlayCircle className="h-3.5 w-3.5" />
                                                        {activeSection.highlightText || "Запустить гид"}
                                                    </Button>
                                                </div>

                                                <div className="space-y-3 relative z-10">
                                                    {activeSection.steps.map((step, idx) => (
                                                        <div key={idx} className="flex gap-3 items-start group/step">
                                                            <div className="flex-none flex items-center justify-center w-5 h-5 rounded-md bg-zinc-900 text-[10px] font-bold text-indigo-400 border border-zinc-800 mt-0.5 group-hover/step:border-indigo-500/50 transition-colors">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-zinc-200 mb-0.5">{step.title}</h4>
                                                                <p className="text-[11px] text-zinc-500 leading-relaxed">{step.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* ALL SECTIONS */}
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-1">
                                            {search ? "Результаты поиска" : "Все разделы помощи"}
                                        </h3>
                                        <div className="grid gap-2">
                                            {filteredSections.map(section => (
                                                <button
                                                    key={section.id}
                                                    onClick={() => setActiveSection(section)}
                                                    className={`group w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-center justify-between ${activeSection?.id === section.id
                                                        ? "bg-indigo-950/20 border-indigo-500/30 text-indigo-300"
                                                        : "bg-zinc-900/30 border-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50 hover:text-zinc-200"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeSection?.id === section.id ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-zinc-700"}`} />
                                                        <span className="text-sm font-medium">{section.title}</span>
                                                        {section.moduleKey && !modules[section.moduleKey as ModuleKey] && (
                                                            <span className="text-[9px] uppercase font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Выкл</span>
                                                        )}
                                                    </div>
                                                    {section.route === pathname && (
                                                        <MapPin className="h-3.5 w-3.5 text-indigo-500/50" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        {filteredSections.length === 0 && (
                                            <div className="text-zinc-600 text-center py-12 flex flex-col items-center gap-3">
                                                <Search className="h-8 w-8 opacity-20" />
                                                <p className="text-sm font-medium">Ничего не найдено</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom Status */}
                    <div className="p-4 border-t border-zinc-900/50 bg-zinc-950 flex items-center justify-between flex-none">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">Edu-Bot Online</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-700">v1.2.5</span>
                    </div>
                </SheetContent>
            </Sheet>

            {/* TOUR OVERLAY */}
            <AnimatePresence>
                {
                    isTouring && highlightRect && activeSection && (
                        <div className="fixed inset-0 z-[100] pointer-events-none">
                            {/* Premium Spotlight Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-[1px] pointer-events-auto cursor-crosshair"
                                style={{
                                    ...spotlightVars,
                                    maskImage: `radial-gradient(circle at var(--x) var(--y), transparent var(--r), black var(--glow))`
                                } as any}
                                onClick={endTour}
                            />

                            {/* Highlight Border with Pulse */}
                            <motion.div
                                layoutId="tour-highlight"
                                className="absolute rounded-2xl border-[3px] border-indigo-400 z-10 animate-pulse-indigo shadow-[0_0_30px_rgba(129,140,248,0.4)] pointer-events-none"
                                style={{
                                    top: highlightRect.top - 12,
                                    left: highlightRect.left - 12,
                                    width: highlightRect.width + 24,
                                    height: highlightRect.height + 24,
                                }}
                            />

                            {/* Tooltip Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="absolute z-20 pointer-events-auto flex flex-col items-center max-w-[90vw] sm:max-w-none"
                                style={{
                                    top: highlightRect.bottom + 40 > (typeof window !== 'undefined' ? window.innerHeight : 800) - 250
                                        ? highlightRect.top - (isExpanded ? 380 : 280)
                                        : highlightRect.bottom + 40,
                                    left: Math.max(10, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1000) - 310, highlightRect.left + highlightRect.width / 2 - 150)),
                                    width: 300
                                }}
                            >
                                <div className="w-full bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.1)] p-6 overflow-hidden relative group">
                                    {/* Top Glow */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                                    {/* Progress Indicator */}
                                    <div className="absolute top-0 left-0 h-[2px] bg-indigo-500 transition-all duration-500"
                                        style={{ width: `${((tourStep + 1) / activeSection.steps.length) * 100}%` }} />

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full" />
                                                <Mascot status={isSpeaking ? "speaking" : "thinking"} className="w-10 h-10 relative z-10" />
                                                {isSpeaking && (
                                                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex gap-0.5 h-3 items-center">
                                                        <div className="sound-bar" style={{ animationDelay: '0s' }} />
                                                        <div className="sound-bar" style={{ animationDelay: '0.2s' }} />
                                                        <div className="sound-bar" style={{ animationDelay: '0.4s' }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-tighter self-start mb-1">
                                                    Шаг {tourStep + 1} из {activeSection.steps.length}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={toggleVoice}
                                                className={`p-1.5 rounded-full transition-colors ${isVoiceEnabled ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                                                title={isVoiceEnabled ? "Выключить озвучку" : "Включить озвучку"}
                                            >
                                                {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                            </button>
                                            <button onClick={endTour} className="text-zinc-600 hover:text-white transition-colors p-1.5 rounded-full hover:bg-zinc-800">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <motion.div
                                        key={tourStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h4 className="text-sm font-black text-white uppercase mb-1.5 tracking-tight flex items-center gap-2">
                                            {activeSection.steps[tourStep]?.title || activeSection.title}
                                            <Sparkles className="h-3 w-3 text-amber-400" />
                                        </h4>
                                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                                            {activeSection.steps[tourStep]?.text}
                                        </p>

                                        {activeSection.steps[tourStep]?.tip && (
                                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 mb-4 flex gap-2">
                                                <Lightbulb className="h-3.5 w-3.5 text-emerald-500 flex-none mt-0.5" />
                                                <p className="text-[10px] font-medium text-emerald-400 italic">
                                                    {activeSection.steps[tourStep].tip}
                                                </p>
                                            </div>
                                        )}

                                        {activeSection.steps[tourStep]?.details && (
                                            <div className="mb-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsExpanded(!isExpanded)}
                                                    className="w-full justify-between h-8 text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 p-0"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Info className="h-3 w-3" />
                                                        {isExpanded ? "Свернуть" : "Подробнее"}
                                                    </span>
                                                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                </Button>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pt-2 pb-1 border-t border-zinc-800/50 mt-2">
                                                                <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                                                                    {activeSection.steps[tourStep].details}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </motion.div>

                                    <div className="flex items-center justify-between gap-3 pt-2">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={prevStep}
                                                disabled={tourStep === 0}
                                                className="h-9 w-9 text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-0 rounded-xl"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={endTour}
                                                className="h-9 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white hover:bg-zinc-800/50 rounded-xl px-3"
                                            >
                                                Пропустить
                                            </Button>
                                        </div>

                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => {
                                                if (tourStep === activeSection.steps.length - 1) {
                                                    triggerConfetti();
                                                    setTimeout(endTour, 1000);
                                                } else {
                                                    nextStep();
                                                }
                                            }}
                                            className="h-9 text-[11px] font-black uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 min-w-[110px] rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                                        >
                                            {tourStep === activeSection.steps.length - 1 ? (
                                                <>Готово <CheckCircle2 className="h-3.5 w-3.5" /></>
                                            ) : (
                                                <>Далее <ChevronRight className="h-3.5 w-3.5" /></>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Confetti Burst Overlay */}
                                {showConfetti && (
                                    <div className="absolute inset-0 pointer-events-none z-30">
                                        {[...Array(12)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: 150, y: 150, opacity: 1, scale: 1 }}
                                                animate={{
                                                    x: 150 + (Math.random() - 0.5) * 300,
                                                    y: 150 + (Math.random() - 0.5) * 300,
                                                    opacity: 0,
                                                    scale: 0.5
                                                }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="absolute w-2 h-2 rounded-full"
                                                style={{
                                                    backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#10b981'][i % 4],
                                                    left: 0,
                                                    top: 0
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Arrow Indicator */}
                                <div className={`w-5 h-5 bg-zinc-900 border-l border-t border-zinc-800/50 rotate-45 -mt-2.5 relative z-10 ${highlightRect.bottom + 40 > (typeof window !== 'undefined' ? window.innerHeight : 800) - 250 ? 'mt-[238px] rotate-[225deg]' : ''}`} />
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* FLOATING TRIGGER */}
            <AnimatePresence>
                {
                    !open && !isTouring && (
                        <FloatingBotTrigger
                            onClick={() => setOpen(true)}
                            hasNewFeatures={hasNewFeatures}
                        />
                    )
                }
            </AnimatePresence >

            {/* CURSOR PUPPET */}
            < CursorPuppet
                targetRect={puppetRect}
                isClicking={isPuppetClicking}
                isVisible={isPuppetVisible}
            />
        </>
    );
}
