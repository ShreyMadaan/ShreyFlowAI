
import { useId, useRef } from "react";
import { createPortal } from "react-dom";

import {
  AlertTriangle,
  HelpCircle,
  X,
} from "lucide-react";

import useModalFocus from "../../hooks/useModalFocus";

function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onClose,
  isLoading = false,
}) {
  const titleId = useId();
  const descriptionId = useId();

  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  useModalFocus({
    isOpen,
    dialogRef,
    initialFocusRef: cancelButtonRef,
    onClose: handleClose,
  });

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  const Icon = isDanger
    ? AlertTriangle
    : HelpCircle;

  const confirmButtonStyles = isDanger
    ? "bg-red-600 hover:bg-red-700"
    : "bg-violet-600 hover:bg-violet-700";

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-app-border bg-surface p-5 text-primary shadow-2xl sm:p-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div
            className={`
              flex h-12 w-12 shrink-0
              items-center justify-center
              rounded-xl
              ${
                isDanger
                  ? "bg-red-500/10 text-red-500"
                  : "bg-violet-500/10 text-accent"
              }
            `}
          >
            <Icon size={24} />
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close confirmation dialog"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-secondary hover:text-primary focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5">
          <h2
            id={titleId}
            className="text-xl font-bold tracking-tight"
          >
            {title}
          </h2>

          <p
            id={descriptionId}
            className="mt-3 text-sm leading-6 text-muted"
          >
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-xl border border-app-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              rounded-xl px-5 py-2.5
              text-sm font-semibold text-white
              transition-colors
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-violet-500
              disabled:cursor-not-allowed
              disabled:opacity-60
              ${confirmButtonStyles}
            `}
          >
            {isLoading
              ? "Please wait..."
              : confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default ConfirmModal;
