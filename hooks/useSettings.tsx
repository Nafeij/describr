import { RecursivePartial } from '@/lib/utils';
import * as SecureStore from 'expo-secure-store';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';

// TODO

export type Settings = {
    AI: {
        taggingEnabled: boolean;
        key: string;
    };
    app: {
        theme: "light" | "dark" | "system";
    };
};

const defaultSettings: Settings = {
    AI: {
        taggingEnabled: false,
        key: "",
    },
    app: {
        theme: "system",
    },
};

export function useSettings() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    useEffect(() => {
        SecureStore.getItemAsync("settings").then((settings) => {
            if (settings) {
                setSettings(JSON.parse(settings));
            }
        });
    }, []);

    const updateSettings = useCallback(async (newSettings: RecursivePartial<Settings>) => {
        const updatedSettings = _.merge({}, settings, newSettings);
        setSettings(updatedSettings);
        await SecureStore.setItemAsync("settings", JSON.stringify(updatedSettings));
    }, [settings]);

    return [settings, updateSettings] as const;
}
