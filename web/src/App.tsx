import { useEffect } from "react";

const API_BASE_URL = "http://localhost:4000";

async function apiRequest(endpoint: string) {
  const url = API_BASE_URL + endpoint;
  const res = await fetch(url);

  const resDecoded = await res.json();
  console.log(resDecoded);
}

export const App: React.FC = () => {
  useEffect(() => {
    console.log("FETCHING NOTES");
    apiRequest("/notes").then(console.log).catch(console.error);
    // Cross-Origin Request Blocked:
    // The Same Origin Policy disallows reading the remote resource at http://localhost:4000/notes.
    // (Reason: CORS header ‘Access-Control-Allow-Origin’ missing). Status code: 200.
  }, []);

  return <h1>React App!</h1>;
};
