import React, {useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type ApiResponse<R> = {
  data: R;
  error: ApiError;
};

type ApiError = {
  code: string;
  message: string;
};

// Android Emulator Host IP.
// TODO: configurable with config file.
const API_BASE_URL = 'http://10.0.2.2:4000';

async function apiRequest<R>(
  method: string,
  endpoint: string,
  body?: Record<string, any>,
): Promise<R> {
  let req: RequestInit = {method};
  if (body) {
    req = {
      ...req,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  const url = API_BASE_URL + endpoint;
  const res = await fetch(url, req);

  const resDecoded: ApiResponse<R> = await res.json();
  if (resDecoded.error) {
    const {code, message} = resDecoded.error;
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
  return apiRequest('GET', '/notes');
}

function getNoteById(id: number): Promise<Note[]> {
  return apiRequest('GET', `/notes/${id}`);
}

type NoteCreateParams = {
  title: string;
  content: string;
};

function postNote(params: NoteCreateParams): Promise<Note> {
  return apiRequest('POST', '/notes', params);
}

export const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scroll}>
        <Text style={styles.title}>Notes App</Text>
        <Notes />
      </ScrollView>
    </SafeAreaView>
  );
};

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>();
  const [error, setError] = useState<Error>();

  const loadNotes = () => {
    getNotes()
      .then(notes => setNotes(notes.reverse())) // Descending order.
      .catch(err => setError(err));
  };

  useEffect(loadNotes, []);

  if (error) {
    return (
      <Text style={styles.textRed}>Error loading notes: {error.message}</Text>
    );
  }

  if (!notes) {
    return <Text style={styles.textGray}>Loading...</Text>;
  }

  return (
    <View>
      <NoteCreate onCreate={loadNotes} />
      <NotesList notes={notes} />
    </View>
  );
};

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export const NotesList: React.FC<{notes: Note[]}> = ({notes}) => {
  if (!notes.length) {
    return <Text>No notes yet, create your first!</Text>;
  }

  return (
    <View>
      {notes.map(note => (
        <View key={note.id} style={styles.note}>
          <Text style={[styles.noteTitle, styles.textBold]}>
            #{note.id} {note.title}
          </Text>
          <Text style={styles.textItalic}>{note.content}</Text>
          <Text style={styles.textGray}>{formatDate(note.createdAt)}</Text>
        </View>
      ))}
    </View>
  );
};

export const NoteCreate: React.FC<{onCreate: () => void}> = ({onCreate}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [note, setNote] = useState<Note>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const onSubmit = () => {
    setLoading(true);
    postNote({
      title,
      content,
    })
      .then(note => {
        setNote(note);
        setTitle('');
        setContent('');
        onCreate();
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  };

  return (
    <View>
      <Text style={styles.noteCreateTitle}>New note</Text>

      <Text>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={text => setTitle(text)}
      />

      <Text>Content</Text>
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={text => setContent(text)}
      />

      <Button title="Submit" onPress={onSubmit} color="#0891b2" />

      <View style={styles.noteCreateStatus}>
        {note && <Text style={styles.textGreen}>Created note #{note.id}</Text>}
        {loading && <Text style={styles.textGray}>Loading...</Text>}
        {error && (
          <Text style={styles.textRed}>
            Error creating note: {error.message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#171717',
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    lineHeight: 80,
  },
  noteCreateStatus: {
    marginTop: 10,
    marginBottom: 20,
  },
  noteCreateTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  note: {
    paddingBottom: 10,
  },
  noteTitle: {
    fontSize: 20,
  },
  input: {
    height: 40,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#303030',
    borderColor: '#525252',
    padding: 10,
  },
  textBold: {
    fontWeight: 'bold',
  },
  textItalic: {
    fontStyle: 'italic',
  },
  textGray: {
    color: '#a8a29e',
  },
  textRed: {
    color: ' #dc2626',
  },
  textGreen: {
    color: '#65a30d',
  },
});
