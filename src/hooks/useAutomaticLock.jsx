import { useEffect, useRef } from "react";
import { useSettings } from "../contexts/SettingsContext";

export function useAutomaticLock({
    setActiveSection,
    currentPlayback
}){
    const {settings} = useSettings();
    const prevPlaybackState = useRef(currentPlayback);
    
    const getNextNavigation = (isPlaying) => {
        return isPlaying ? "nowPlaying" : "lock";
    }
    
    useEffect(() => {
        debugger;
        if(!settings.autoLockType == "disabled")
            return;

        if(settings.autoLockType == "is_playing"
            && prevPlaybackState.current?.is_playing != currentPlayback?.is_playing
            && currentPlayback)
        {
            setActiveSection(getNextNavigation(currentPlayback?.is_playing ?? false));
        }
        else if(settings.autoLockType == "is_active"
            && ((prevPlaybackState.current == null) != (currentPlayback == null)))
        {
            setActiveSection(getNextNavigation(currentPlayback != null));
        }

        prevPlaybackState.current = currentPlayback;
    }, [currentPlayback]);
}