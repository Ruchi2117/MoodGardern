import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useMoodHistory } from "../../context/MoodHistoryContext";
import type { MoodInput } from "../../services/api";
import JournalEntryDetail from "./JournalEntryDetail";
import JournalEntryEditor from "./JournalEntryEditor";
import DeleteEntryDialog from "./DeleteEntryDialog";
export default function EntryDialog({
  id,
  onClose,
  onNotice,
}: {
  id: string;
  onClose: () => void;
  onNotice: (message: string) => void;
}) {
  const history = useMoodHistory();
  const entry = history.entries.find((value) => value._id === id);
  const dialog = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [reading, setReading] = useState(true),
    [readError, setReadError] = useState("");
  useEffect(() => {
    const opener =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      if (opener?.isConnected) opener.focus();
      else document.getElementById("journal-title")?.focus();
    };
  }, []);
  useEffect(() => {
    let active = true;
    history
      .refreshEntry(id)
      .catch((err) => {
        if (active)
          setReadError(
            err instanceof Error
              ? err.message
              : "We couldn’t open this thought.",
          );
      })
      .finally(() => {
        if (active) setReading(false);
      });
    return () => {
      active = false;
    };
  }, [id, history.refreshEntry]);
  useEffect(() => {
    if (reading || history.loading) return;
    const target =
      mode === "edit"
        ? dialog.current?.querySelector<HTMLElement>("#edit-note")
        : mode === "delete"
          ? dialog.current?.querySelector<HTMLElement>(
              ".release-thought .primary-button",
            )
          : dialog.current?.querySelector<HTMLElement>("#entry-dialog-title");
    if (target) {
      if (target.tagName === "H2") target.tabIndex = -1;
      target.focus();
    }
  }, [mode, reading, history.loading]);
  function changeMode(value: typeof mode) {
    setError("");
    setMode(value);
  }
  async function save(input: MoodInput) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await history.update(id, input);
      setMode("view");
      onNotice("A little change, saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t save that change. Try again?",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function remove() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await history.remove(id);
      onNotice("Thought released.");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn’t release this thought. Try again?",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="entry-dialog"
      aria-labelledby="entry-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <button
        className="dialog-close"
        onClick={onClose}
        disabled={busy}
        aria-label="Close thought"
      >
        <X size={20} />
      </button>
      {reading || history.loading ? (
        <>
          <h2 id="entry-dialog-title">Opening your thought...</h2>
          <p role="status">A little moment.</p>
        </>
      ) : readError ? (
        <>
          <h2 id="entry-dialog-title">This thought couldn’t open.</h2>
          <p role="alert">{readError}</p>
          <button className="text-button" onClick={onClose}>
            Back to my journal
          </button>
        </>
      ) : entry ? (
        mode === "view" ? (
          <JournalEntryDetail
            entry={entry}
            onEdit={() => changeMode("edit")}
            onDelete={() => changeMode("delete")}
          />
        ) : mode === "edit" ? (
          <JournalEntryEditor
            entry={entry}
            busy={busy}
            error={error}
            onSave={save}
            onCancel={() => changeMode("view")}
          />
        ) : (
          <DeleteEntryDialog
            busy={busy}
            error={error}
            onKeep={() => changeMode("view")}
            onDelete={remove}
          />
        )
      ) : (
        <>
          <h2 id="entry-dialog-title">That thought has moved on.</h2>
          <p>It may already have been released.</p>
          <button className="text-button" onClick={onClose}>
            Back to my journal
          </button>
        </>
      )}
    </dialog>
  );
}
