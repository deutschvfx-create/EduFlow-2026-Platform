'use client';

import { useState, useEffect } from 'react';
import { ModulesState, defaultModulesState, ModuleKey } from '@/lib/config/modules';
import { useAuth } from '@/components/auth/auth-provider';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STORAGE_KEY = 'eduflow-modules-config';

export function useModules() {
    const { userData } = useAuth();
    const [modulesConfig, setModulesConfig] = useState<ModulesState>(defaultModulesState);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const load = () => {
            // 1. Try to load from local storage first for instant render
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setModulesConfig(JSON.parse(stored));
                }
            } catch (e) {
                console.error("Failed to load modules config from storage", e);
            }

            // 2. If valid org, subscribe to Firestore (Source of Truth)
            if (userData?.organizationId && db) {
                const orgRef = doc(db, "organizations", userData.organizationId);

                unsubscribe = onSnapshot(orgRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        if (data && data.modules) {
                            // Valid modules found in DB, update state and local sync
                            setModulesConfig(data.modules as ModulesState);
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.modules));
                        } else {
                            // No modules in DB yet? Initialize them if we have local defaults
                            // Or just wait for the first save. 
                        }
                    }
                    setIsLoaded(true);
                }, (error) => {
                    console.error("Failed to subscribe to modules:", error);
                    setIsLoaded(true);
                });
            } else {
                // No org? Just running locally
                setIsLoaded(true);
            }
        };

        load();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userData?.organizationId]);

    const saveModules = async (newState: ModulesState) => {
        // Optimistic update
        setModulesConfig(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

        // Persist to Firestore
        if (userData?.organizationId && db) {
            try {
                const orgRef = doc(db, "organizations", userData.organizationId);
                await updateDoc(orgRef, {
                    modules: newState
                });
            } catch (e) {
                console.error("Failed to save modules to Firestore", e);
            }
        }
    };

    const toggleModule = (key: ModuleKey) => {
        const newState = { ...modulesConfig, [key]: !modulesConfig[key] };
        saveModules(newState);
    };

    const setAllModules = (state: ModulesState) => {
        saveModules(state);
    }

    const resetModules = () => {
        saveModules(defaultModulesState);
    };

    return {
        modules: modulesConfig,
        toggleModule,
        setAllModules,
        resetModules,
        isLoaded
    };
}
