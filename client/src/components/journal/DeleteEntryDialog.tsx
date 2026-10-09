export default function DeleteEntryDialog({
  busy,
  error,
  onKeep,
  onDelete,
}: {
  busy: boolean;
  error: string;
  onKeep: () => void;
  onDelete: () => Promise<void>;
}) {
  return (
    <div className="release-thought">
      <div className="notebook-art" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <h2 id="entry-dialog-title">Let this thought go?</h2>
      <p>
        This will remove the entry from your journal and its plant from your
        garden.
      </p>
      <p className="preview-copy">This cannot be undone.</p>
      {error && (
        <p role="alert" className="check-in-error">
          {error}
        </p>
      )}
      <div className="entry-actions">
        <button className="primary-button" disabled={busy} onClick={onKeep}>
          Keep it
        </button>
        <button
          className="text-button release-button"
          disabled={busy}
          onClick={() => void onDelete()}
        >
          {busy ? "Releasing..." : "Let it go"}
        </button>
      </div>
    </div>
  );
}
