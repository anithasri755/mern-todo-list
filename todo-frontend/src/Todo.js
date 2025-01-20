import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2"; // Import Pie Chart component
import "chart.js/auto"; // Automatically register necessary Chart.js components

const formatDateIndian = (dateString) => {
  if (!dateString) return "Unknown date";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

export default function Todo() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(-1);
  const apiUrl = "http://localhost:8000";

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleSubmit = () => {
    setError("");
    if (title.trim() !== "" && description.trim() !== "") {
      fetch(apiUrl + "/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, completed: true }),
      })
        .then((res) => res.json())
        .then((newTodo) => {
          if (newTodo && newTodo._id) {
            setTodos([...todos, newTodo]);
            setTitle("");
            setDescription("");
            setMessage("Item added successfully");
            setTimeout(() => setMessage(""), 3000);
          } else {
            setError("Unable to Create Todo item");
          }
        })
        .catch(() => {
          setError("Unable to create Todo item");
        });
    }
  };

  useEffect(() => {
    getItems();
  }, []);

  const getItems = () => {
    fetch(apiUrl + "/todos")
      .then((res) => res.json())
      .then((res) => {
        setTodos(res);
      });
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const handleUpdate = () => {
    setError("");
    if (editTitle.trim() !== "" && editDescription.trim() !== "") {
      fetch(apiUrl + "/todos/" + editId, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      })
        .then((res) => {
          if (res.ok) {
            const updatedTodos = todos.map((item) => {
              if (item._id === editId) {
                item.title = editTitle;
                item.description = editDescription;
              }
              return item;
            });
            setTodos(updatedTodos);
            setEditTitle("");
            setEditDescription("");
            setMessage("Item updated successfully");
            setTimeout(() => setMessage(""), 3000);
            setEditId(-1);
          } else {
            setError("Unable to update Todo item");
          }
        })
        .catch(() => {
          setError("Unable to update Todo item");
        });
    }
  };

  const handleEditcancel = () => setEditId(-1);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      fetch(apiUrl + "/todos/" + id, { method: "DELETE" }).then(() => {
        const updatedTodos = todos.filter((item) => item._id !== id);
        setTodos(updatedTodos);
      });
    }
  };

  const completedTasks = todos.length;

  const pieChartData = {
    labels: ["Completed"],
    datasets: [
      {
        data: [completedTasks],
        backgroundColor: ["#4CAF50"],
        hoverOffset: 4,
      },
    ],
  };

  const pieChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <>
      <div className="row p-3 bg-dark text-light">
        <h1>Todo list with MERN stack</h1>
      </div>
      <br />
      <div className="row">
        <h3>Add Item</h3>
        {message && <p className="text-success">{message}</p>}
        <div className="form-group d-flex gap-2">
          <input
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            className="form-control"
            type="text"
          />
          <input
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            className="form-control"
            type="text"
          />
          <button className="btn btn-dark" onClick={handleSubmit}>
            Submit
          </button>
        </div>
        {error && <p className="text-danger">{error}</p>}
      </div>
      <div className="row mt-3">
        <h3>Tasks</h3>
        <div className="col-md-6">
          <ul className="list-group">
            {todos.length > 0 ? (
              todos.map((item) => (
                <li
                  key={item._id}
                  className="list-group-item bg-info d-flex justify-content-between align-items-center my-2"
                >
                  <div className="d-flex flex-column me-2">
                    {editId === -1 || editId !== item._id ? (
                      <>
                        <span className="fw-bold">{item.title}</span>
                        <span>{item.description}</span>
                        <span
                          className="text-muted"
                          style={{ fontSize: "0.8em" }}
                        >
                          Added on: {formatDateIndian(item.createdAt)}
                        </span>
                      </>
                    ) : (
                      <div className="form-group d-flex gap-2">
                        <input
                          placeholder="Title"
                          onChange={(e) => setEditTitle(e.target.value)}
                          value={editTitle}
                          className="form-control"
                          type="text"
                        />
                        <input
                          placeholder="Description"
                          onChange={(e) => setEditDescription(e.target.value)}
                          value={editDescription}
                          className="form-control"
                          type="text"
                        />
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    {editId === -1 ? (
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button className="btn btn-warning" onClick={handleUpdate}>
                        Update
                      </button>
                    )}
                    {editId === -1 ? (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="btn btn-danger"
                        onClick={handleEditcancel}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <div
                className="text-muted text-center my-3"
                style={{ fontSize: "1.2em" }}
              >
                No tasks available
              </div>
            )}
          </ul>
        </div>
        <div className="col-md-6" style={{ height: "280px" }}>
          <h3>Task Completion Status</h3>
          {todos.length > 0 ? (
            <Pie data={pieChartData} options={pieChartOptions} />
          ) : (
            <div
              className="text-muted text-center"
              style={{ fontSize: "1.2em" }}
            >
              No data found
            </div>
          )}
        </div>
      </div>
    </>
  );
}