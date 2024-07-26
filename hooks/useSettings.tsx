import { useState, useEffect } from "react";

// TODO

type Settings = {
    AI: {
        enabled: boolean;
        key: string;
    };
    app: {
        theme: "light" | "dark";
    };
};

export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const response = await fetch("/api/settings");
            const data = await response.json();
            setSettings(data);
        };

        fetchSettings();
    }, []);

    return settings;
}