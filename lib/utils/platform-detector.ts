export type Platform = 'windows' | 'macos' | 'android' | 'ios' | 'linux' | 'unknown';

export function detectPlatform(): Platform {
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform?.toLowerCase() || '';

    // iOS detection
    if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
    }

    // Android detection
    if (/android/.test(userAgent)) {
        return 'android';
    }

    // macOS detection
    if (/mac/.test(platform) || /macintosh/.test(userAgent)) {
        return 'macos';
    }

    // Windows detection
    if (/win/.test(platform) || /windows/.test(userAgent)) {
        return 'windows';
    }

    // Linux detection
    if (/linux/.test(platform) || /linux/.test(userAgent)) {
        return 'linux';
    }

    return 'unknown';
}

export function isPWAInstalled(): boolean {
    if (typeof window === 'undefined') return false;

    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // Check for iOS standalone
    const isIOSStandalone = (window.navigator as any).standalone === true;

    return isStandalone || isIOSStandalone;
}

export function canInstallPWA(): boolean {
    if (typeof window === 'undefined') return false;

    const platform = detectPlatform();

    // iOS Safari doesn't support beforeinstallprompt
    if (platform === 'ios') {
        // Check if it's Safari and not already installed
        const isSafari = /safari/.test(window.navigator.userAgent.toLowerCase()) &&
            !/chrome|crios|fxios/.test(window.navigator.userAgent.toLowerCase());
        return isSafari && !isPWAInstalled();
    }

    // For other platforms, we'll check for beforeinstallprompt event
    // This will be set dynamically in the component
    return true;
}

export function isTablet(): boolean {
    if (typeof window === 'undefined') return false;

    const userAgent = window.navigator.userAgent.toLowerCase();

    // Check for tablet-specific keywords
    const isTabletUA = /ipad|android(?!.*mobile)|tablet|kindle|playbook|silk/.test(userAgent);

    // Check screen size (tablets typically > 768px width)
    const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;

    return isTabletUA || isTabletSize;
}

export function getPlatformDisplayName(platform: Platform): string {
    const names: Record<Platform, string> = {
        windows: 'ПК',
        macos: 'Mac',
        android: 'Android',
        ios: 'iPhone/iPad',
        linux: 'Linux',
        unknown: 'устройство'
    };

    return names[platform];
}

export function getPlatformIcon(platform: Platform): string {
    const icons: Record<Platform, string> = {
        windows: '💻',
        macos: '🍎',
        android: '📱',
        ios: '🍏',
        linux: '🐧',
        unknown: '📱'
    };

    return icons[platform];
}
