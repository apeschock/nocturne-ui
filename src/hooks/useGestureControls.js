import { useEffect, useRef } from "react";
import { useSettings } from "../contexts/SettingsContext";

export function useGestureControls({
  contentRef,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  isActive = true,
}) {
  const { settings } = useSettings();
  const touchStartRef = useRef(null);
  const touchStartXRef = useRef(null);
  const touchTargetRef = useRef(null);

  const isWithinScrollableContainer = (target) => {
    let current = target;
    while (current && current !== contentRef?.current) {
      const computedStyle = window.getComputedStyle(current);
      const isScrollable =
        (computedStyle.overflowY === "auto" ||
          computedStyle.overflowY === "scroll" ||
          computedStyle.overflow === "auto" ||
          computedStyle.overflow === "scroll") &&
        current.scrollHeight > current.clientHeight;

      if (isScrollable) return current;
      current = current.parentElement;
    }
    return null;
  };

  useEffect(() => {
    const element = contentRef?.current;
    if (!element || !isActive) return;

    // ---- TOUCH EVENTS ----
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
      touchStartXRef.current = e.touches[0].clientX;
      touchTargetRef.current = e.target;
    };

    const handleTouchMove = (e) => {
      if (touchStartRef.current === null || touchStartXRef.current === null) return;

      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = touchStartRef.current - touchY;
      const deltaX = touchStartXRef.current - touchX;

      const scrollableContainer = touchTargetRef.current
        ? isWithinScrollableContainer(touchTargetRef.current)
        : null;

      if (
        Math.abs(deltaY) > Math.abs(deltaX) &&
        Math.abs(deltaY) > 20 &&
        settings.showLyricsGestureEnabled &&
        !scrollableContainer
      ) {
        e.preventDefault();
      }

      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > 20 &&
        settings.songChangeGestureEnabled
      ) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (touchStartRef.current === null || touchStartXRef.current === null) return;

      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;

      const deltaY = touchStartRef.current - touchEndY;
      const deltaX = touchStartXRef.current - touchEndX;

      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

      const scrollableContainer = touchTargetRef.current
        ? isWithinScrollableContainer(touchTargetRef.current)
        : null;

      if (isHorizontalSwipe && settings.songChangeGestureEnabled) {
        if (deltaX > 50 && onSwipeLeft) onSwipeLeft();
        else if (deltaX < -50 && onSwipeRight) onSwipeRight();
      } else if (
        !isHorizontalSwipe &&
        settings.showLyricsGestureEnabled &&
        !scrollableContainer
      ) {
        if (deltaY > 50 && onSwipeUp) onSwipeUp();
        else if (deltaY < -50 && onSwipeDown) onSwipeDown();
      }

      touchStartRef.current = null;
      touchStartXRef.current = null;
      touchTargetRef.current = null;
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);

    // ---- 🧭 MOUSE EVENTS (for desktop) ----
    const handleMouseDown = (e) => {
      touchStartRef.current = e.clientY;
      touchStartXRef.current = e.clientX;
      touchTargetRef.current = e.target;
    };

    const handleMouseUp = (e) => {
      if (touchStartRef.current === null || touchStartXRef.current === null) return;

      const mouseEndY = e.clientY;
      const mouseEndX = e.clientX;

      const deltaY = touchStartRef.current - mouseEndY;
      const deltaX = touchStartXRef.current - mouseEndX;

      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontalSwipe && settings.songChangeGestureEnabled) {
        if (deltaX > 50 && onSwipeLeft) onSwipeLeft();
        else if (deltaX < -50 && onSwipeRight) onSwipeRight();
      } else if (
        !isHorizontalSwipe &&
        settings.showLyricsGestureEnabled
      ) {
        if (deltaY > 50 && onSwipeUp) onSwipeUp();
        else if (deltaY < -50 && onSwipeDown) onSwipeDown();
      }

      touchStartRef.current = null;
      touchStartXRef.current = null;
      touchTargetRef.current = null;
    };

    element.addEventListener("mousedown", handleMouseDown);
    element.addEventListener("mouseup", handleMouseUp);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("mousedown", handleMouseDown);
      element.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    contentRef?.current,
    isActive,
    settings.showLyricsGestureEnabled,
    settings.songChangeGestureEnabled,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
  ]);
}

