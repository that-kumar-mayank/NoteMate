
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, NotebookPen } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Fetch all notes from MongoDB
  async function loadNotes() {
    try {
      const response = await fetch(`${API}/api/notes`);

      if (!response.ok) {
        throw new Error("Failed to load notes");
      }

      const data = await response.json();
      setNotes(data);
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setFetching(false);
    }
  }

  // Load notes when the application opens
  useEffect(() => {
    loadNotes();
  }, []);

  // Create or update a note
  async function saveNote(e) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = editingId
        ? `${API}/api/notes/${editingId}`
        : `${API}/api/notes`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save note");
      }

      setTitle("");
      setContent("");
      setEditingId(null);

      await loadNotes();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Fill the form with the selected note
  function editNote(note) {
    setTitle(note.title);
    setContent(note.content);
    setEditingId(note._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // Delete a note from MongoDB
  async function deleteNote(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API}/api/notes/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      if (editingId === id) {
        setEditingId(null);
        setTitle("");
        setContent("");
      }

      await loadNotes();
    } catch (error) {
      setError(error.message);
    }
  }

  // Cancel editing
  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setContent("");
  }

  // Search notes by title or content
  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase();

    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-5 flex items-center gap-3">
          <NotebookPen
            className="text-indigo-600"
            size={30}
          />

          <h1 className="text-2xl font-bold">
            NoteMate
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-5 py-8">

        <h2 className="text-3xl font-bold mb-2">
          My Notes
        </h2>

        <p className="text-slate-500 mb-8">
          Capture your thoughts and ideas in one place.
        </p>

        {/* Create / Edit Note Form */}
        <form
          onSubmit={saveNote}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8"
        >
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Note" : "Create a Note"}
          </h3>

          {/* Title */}
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="w-full border border-slate-300 rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          {/* Content */}
          <textarea
            placeholder="Write your note here..."
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          {/* Buttons */}
          <div className="flex gap-3">

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus size={18} />

              {loading
                ? "Saving..."
                : editingId
                ? "Update Note"
                : "Add Note"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-slate-200 hover:bg-slate-300 px-5 py-3 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            )}

          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">

          <Search
            size={20}
            className="absolute left-3 top-3.5 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search your notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-400"
          />

        </div>

        {/* Notes Count */}
        <p className="text-sm text-slate-500 mb-5">
          Total Notes: {notes.length}
        </p>

        {/* Loading */}
        {fetching ? (
          <p className="text-center text-slate-500 py-12">
            Loading notes...
          </p>
        ) : (
          <>
            {/* Notes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col"
                >

                  {/* Note Title */}
                  <h3 className="font-bold text-lg mb-2 break-words">
                    {note.title}
                  </h3>

                  {/* Note Content */}
                  <p className="text-slate-600 whitespace-pre-wrap break-words flex-1">
                    {note.content}
                  </p>

                  {/* Date */}
                  <p className="text-xs text-slate-400 mt-5">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100">

                    <button
                      onClick={() => editNote(note)}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteNote(note._id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>

            {/* Empty State */}
            {filteredNotes.length === 0 && !error && (
              <p className="text-center text-slate-500 py-12">
                {search
                  ? "No matching notes found."
                  : "No notes found. Create your first note!"}
              </p>
            )}
          </>
        )}

      </main>

    </div>
  );
}

export default App;
