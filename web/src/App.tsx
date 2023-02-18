import { useEffect, useState } from "react";

type ApiResponse<R> = {
  data: R;
  error: ApiError;
};

type ApiError = {
  code: string;
  message: string;
};

// Development server proxy.
// TODO: configurable for deployment.
const API_BASE_URL = "/api";

async function apiRequest<R>(
  method: string,
  endpoint: string,
  body?: Record<string, any>
): Promise<R> {
  let req: RequestInit = { method };
  if (body) {
    req = {
      ...req,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  const url = API_BASE_URL + endpoint;
  const res = await fetch(url, req);

  const resDecoded: ApiResponse<R> = await res.json();
  if (resDecoded.error) {
    const { code, message } = resDecoded.error;
    throw new Error(`API error: ${code} - ${message}`);
  }

  return resDecoded.data;
}

type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

function getNotes(): Promise<Note[]> {
  return apiRequest("GET", "/notes");
}

function getNoteById(id: number): Promise<Note[]> {
  return apiRequest("GET", `/notes/${id}`);
}

type NoteCreateParams = {
  title: string;
  content: string;
};

function postNote(params: NoteCreateParams): Promise<Note> {
  return apiRequest("POST", "/notes", params);
}

export const App: React.FC = () => {
  return (
    <main>
      <h1>Notes App</h1>
      <Notes />
    </main>
  );
};

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>();
  const [error, setError] = useState<Error>();

  const loadNotes = () => {
    getNotes()
      .then((notes) => setNotes(notes.reverse())) // Descending order.
      .catch((err) => setError(err));
  };

  useEffect(loadNotes, []);

  if (error) {
    return <p className="text-red">Error loading notes: {error.message}</p>;
  }

  if (!notes) {
    return <p className="text-gray">Loading...</p>;
  }

  return (
    <div className="notes">
      <NotesList notes={notes} />
      <NoteCreate onCreate={loadNotes} />
    </div>
  );
};

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export const NotesList: React.FC<{ notes: Note[] }> = ({ notes }) => {
  if (!notes.length) {
    return <p>No notes yet, create your first!</p>;
  }

  return (
    <ul className="notes-list">
      {notes.map((note) => (
        <li key={note.id}>
          <p className="text-bold">
            #{note.id} {note.title}
          </p>
          <p className="text-italic">{note.content}</p>
          <p className="text-gray">{formatDate(note.createdAt)}</p>
        </li>
      ))}
    </ul>
  );
};

export const NoteCreate: React.FC<{ onCreate: () => void }> = ({
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [note, setNote] = useState<Note>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  return (
    <div className="note-create">
      <h3>New note</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          postNote({
            title,
            content,
          })
            .then((note) => {
              setNote(note);
              setTitle("");
              setContent("");
              onCreate();
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
        }}
      >
        <label htmlFor="note-title">Title</label>
        <input
          type="text"
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label htmlFor="note-content">Content</label>
        <textarea
          id="note-content"
          cols={20}
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <button type="submit">Submit</button>

        {note && <p className="text-green">Created note #{note.id}</p>}
        {loading && <p className="text-gray">Loading...</p>}
        {error && (
          <p className="text-red">Error creating note: {error.message}</p>
        )}
      </form>
    </div>
  );
};
