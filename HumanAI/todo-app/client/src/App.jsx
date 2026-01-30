import { useState, useEffect } from 'react';
// We import Firebase directly here to avoid "configuration-not-found" errors
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import axios from 'axios';
import './App.css';

// --- YOUR CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCnhzxYUnJAy_MfGdv6Pl1cTk3JxhNEO_0", // Corrected Key
  authDomain: "humanai-51533.firebaseapp.com",
  projectId: "humanai-51533",
  storageBucket: "humanai-51533.firebasestorage.app",
  messagingSenderId: "570957260295",
  appId: "1:570957260295:web:ea60337483b950e43caca2",
  measurementId: "G-WW7NRVGLSF"
};

// Initialize Firebase immediately
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [boards, setBoards] = useState([]);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [loading, setLoading] = useState(true); // Added loading state

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) fetchBoards(currentUser.email);
    });
    return () => unsubscribe();
  }, []);

  const fetchBoards = async (email) => {
    try {
      const res = await axios.get(`${API_URL}/boards/${email}`);
      setBoards(res.data);
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // If user not found, try registering
      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (createErr) {
        alert("Error: " + createErr.message);
      }
    }
  };

  const createBoard = async () => {
    if (!newBoardTitle) return;
    await axios.post(`${API_URL}/boards`, {
      userEmail: user.email,
      title: newBoardTitle,
      todos: []
    });
    setNewBoardTitle("");
    fetchBoards(user.email);
  };

  const deleteBoard = async (id) => {
    await axios.delete(`${API_URL}/boards/${id}`);
    fetchBoards(user.email);
  };

  const addTodo = async (boardId, text) => {
    if (!text) return;
    await axios.post(`${API_URL}/boards/${boardId}/todos`, { text });
    fetchBoards(user.email);
  };

  const toggleTodo = async (boardId, todoId) => {
    await axios.put(`${API_URL}/boards/${boardId}/todos/${todoId}`);
    fetchBoards(user.email);
  };

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="container login-container">
        <h1>To-Do App</h1>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Login / Register</button>
        </form>
        <p>Enter any email/password to create an account.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h2>My Boards</h2>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={() => signOut(auth)} className="logout-btn">Logout</button>
        </div>
      </header>
      
      <div className="add-board-section">
        <input value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} placeholder="New Board Name..." />
        <button onClick={createBoard}>+ Create Board</button>
      </div>

      <div className="boards-grid">
        {boards.map(board => (
          <div key={board._id} className="board-card">
            <div className="board-header">
              <h3>{board.title}</h3>
              <button onClick={() => deleteBoard(board._id)} className="delete-btn">x</button>
            </div>
            <ul className="todo-list">
              {board.todos.map(todo => (
                <li key={todo._id} className={todo.completed ? 'completed' : ''}>
                  <span onClick={() => toggleTodo(board._id, todo._id)}>
                    {todo.completed ? "☑" : "☐"} {todo.text}
                  </span>
                </li>
              ))}
            </ul>
            <input className="add-todo-input" placeholder="Add task + Enter" onKeyDown={(e) => {
                if(e.key === 'Enter') { addTodo(board._id, e.target.value); e.target.value = ''; }
              }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;