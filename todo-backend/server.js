const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Create an instance of express
const app = express();
app.use(express.json());
app.use(cors());

// Connecting to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('DB connected!');
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });

// Creating schema with createdAt
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdAt: { type: Date, default: Date.now }, // Automatically adds creation date
});

// Creating Model
const todoModel = mongoose.model('Todo', todoSchema);

// Create a new todo item
app.post('/todos', async (req, res) => {
  const { title, description } = req.body;
  try {
    const newTodo = new todoModel({ title, description });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all items
app.get('/todos', async (req, res) => {
  try {
    const todos = await todoModel.find();
    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update item
app.put('/todos/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const id = req.params.id;
    const updatedTodo = await todoModel.findByIdAndUpdate(
      id,
      { title, description },
      { new: true } // Return the updated document
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Delete item
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await todoModel.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Start the server using environment variable PORT
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
