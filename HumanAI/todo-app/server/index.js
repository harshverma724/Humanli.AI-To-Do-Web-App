require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Database Schemas
const TodoSchema = new mongoose.Schema({
    text: String,
    completed: { type: Boolean, default: false }
});

const BoardSchema = new mongoose.Schema({
    userEmail: String,
    title: String,
    todos: [TodoSchema]
});

const Board = mongoose.model('Board', BoardSchema);

// Routes
app.get('/boards/:email', async (req, res) => {
    const boards = await Board.find({ userEmail: req.params.email });
    res.json(boards);
});

app.post('/boards', async (req, res) => {
    const newBoard = new Board(req.body);
    await newBoard.save();
    res.json(newBoard);
});

app.delete('/boards/:id', async (req, res) => {
    await Board.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

app.post('/boards/:id/todos', async (req, res) => {
    const board = await Board.findById(req.params.id);
    board.todos.push(req.body);
    await board.save();
    res.json(board);
});

app.put('/boards/:boardId/todos/:todoId', async (req, res) => {
    const board = await Board.findById(req.params.boardId);
    const todo = board.todos.id(req.params.todoId);
    todo.completed = !todo.completed;
    await board.save();
    res.json(board);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));