
import { useEffect, useRef } from "react";

// ==========================================
// Focusable elements inside a modal
// ==========================================

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

// ==========================================
// Global scroll-lock management
// ==========================================

let scrollLockCount = 0;
let originalBodyOverflow = "";

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    originalBodyOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";
  }

  scrollLockCount += 1;
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(
    0,
    scrollLockCount - 1
  );

  if (scrollLockCount === 0) {
    document.body.style.overflow =
      originalBodyOverflow;
  }
}

// ==========================================
// Modal focus management hook
// ==========================================

function useModalFocus({
  isOpen,
  isTopmost = true,
  dialogRef,
  initialFocusRef,
  onClose,
}) {
  const onCloseRef = useRef(onClose);
  const isTopmostRef = useRef(isTopmost);

  // ==========================================
  // Synchronize callback and modal state
  //
  // Avoid accessing or modifying refs
  // directly during React rendering.
  // ==========================================

  useEffect(() => {
    onCloseRef.current = onClose;
    isTopmostRef.current = isTopmost;
  }, [onClose, isTopmost]);

  // ==========================================
  // Focus trapping and keyboard management
  // ==========================================

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement =
      document.activeElement;

    lockBodyScroll();

    const dialog = dialogRef.current;

    if (!dialog) {
      unlockBodyScroll();
      return;
    }

    // ========================================
    // Find available focusable elements
    // ========================================

    const getFocusableElements = () =>
      Array.from(
        dialog.querySelectorAll(
          FOCUSABLE_SELECTOR
        )
      ).filter(
        (element) =>
          !element.closest("[inert]") &&
          element.getAttribute("aria-hidden") !==
            "true"
      );

    // ========================================
    // Set initial focus
    // ========================================

    const initialElement =
      initialFocusRef?.current ||
      getFocusableElements()[0] ||
      dialog;

    initialElement.focus();

    // ========================================
    // Handle Escape and Tab navigation
    // ========================================

    const handleKeyDown = (event) => {
      // Only the topmost modal handles
      // keyboard events.
      if (!isTopmostRef.current) {
        return;
      }

      // ======================================
      // Escape: request modal closure
      // ======================================

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();

        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements =
        getFocusableElements();

      // ======================================
      // No focusable elements
      // ======================================

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement =
        focusableElements[0];

      const lastElement =
        focusableElements[
          focusableElements.length - 1
        ];

      const activeElement =
        document.activeElement;

      const focusIsOutside =
        !dialog.contains(activeElement);

      // ======================================
      // Shift + Tab: reverse navigation
      // ======================================

      if (event.shiftKey) {
        if (
          activeElement === firstElement ||
          focusIsOutside
        ) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // ====================================
        // Tab: forward navigation
        // ====================================

        if (
          activeElement === lastElement ||
          focusIsOutside
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // ========================================
    // Register keyboard listener
    // ========================================

    document.addEventListener(
      "keydown",
      handleKeyDown,
      true
    );

    // ========================================
    // Cleanup on modal closure/unmount
    // ========================================

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
        true
      );

      unlockBodyScroll();

      // Restore focus to the element that
      // was active before opening the modal.
      if (
        previouslyFocusedElement instanceof
          HTMLElement &&
        previouslyFocusedElement.isConnected
      ) {
        previouslyFocusedElement.focus();
      }
    };
  }, [
    isOpen,
    dialogRef,
    initialFocusRef,
  ]);
}

export default useModalFocus;
