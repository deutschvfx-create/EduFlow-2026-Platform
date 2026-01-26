'use client';

import { useState, useEffect } from 'react';
import { ModulesState, defaultModulesState, ModuleKey } from '@/lib/config/modules';

const STORAGE_KEY = 'eduflow-modules-config';

export function useModules() {
    const [modulesConfig, setModulesConfig] = useState<ModulesState>(defaultModulesState);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const load = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setModulesConfig(JSON.parse(stored));
                }
            } catch (e) {
                console.error("Failed to load modules config", e);
            }
        };

        load(); // Initial load
        setIsLoaded(true);

        const handleUpdate = () => load();
        window.addEventListener('modules-updated', handleUpdate);
        return () => window.removeEventListener('modules-updated', handleUpdate);
    }, []);

    const toggleModule = (key: ModuleKey) => {
        const newState = { ...modulesConfig, [key]: !modulesConfig[key] };
        setModulesConfig(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        window.dispatchEvent(new Event('modules-updated'));
    };

    const setAllModules = (state: ModulesState) => {
        setModulesConfig(state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        window.dispatchEvent(new Event('modules-updated'));
    }

    const resetModules = () => {
        setModulesConfig(defaultModulesState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultModulesState));
        window.dispatchEvent(new Event('modules-updated'));
    };

    return {
        modules: modulesConfig,
        toggleModule,
        setAllModules,
        resetModules,
        isLoaded
    };
}
