const express = require("express");
const fs = require("fs");
const multer = require("multer");
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: multerStorage });

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.get('script.js', function (req, res) {
  res.sendFile(__dirname + "/public/script.js");
});

app.post("/newTodo", upload.single('todoFile') ,function (req, res) {
  const newTodo = {
    id: Date.now().toString(),
    todoText: req.body.todoText,
    priority: req.body.priority,
    todoFile: req.file.originalname,
    completed: false,
  }

  saveTodoInFile(newTodo, function (err) {
    if (err) {
      res.status(500).send("Error saving todo.");
      return;
    }
    res.redirect("/");
  });

});

app.get("/todo-data", function (req, res) {
    readAllTodos(function (err, data) {
      if (err) {
        res.status(500).json({ error: "Error reading todos." });
        return;
      }
      res.status(200).json(data);
    });
  });

app.patch("/todo/:id", function (req, res) {
  const todoId = req.params.id;
  const completed = req.body.completed;
  updateTodoStatus(todoId, completed, function (err) {
    if (err) {
      res.status(500).send("Error updating todo status.");
      return;
    }
    res.status(200).send("Todo status updated successfully.");
  });
});

app.delete("/todo/:id", function (req, res) {
  const todoId = req.params.id;
  deleteTodo(todoId, function (err) {
    if (err) {
      res.status(500).send("Error deleting todo.");
      return;
    }
    res.status(200).send("Todo deleted successfully.");
  });
});

function readAllTodos(callback) {
  fs.readFile(__dirname +"/data/todoData.json", "utf-8", function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    try {
      data = JSON.parse(data);
      
      if (!Array.isArray(data) || data.length === 0 || (data.length === 1 && Object.keys(data[0]).length === 0)) {
        data = [];     
      }
      callback(null, data);
    } catch (err) {
      callback(err);
    }

  });
}

function saveTodoInFile(todo, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    data.push(todo);

    fs.writeFile(__dirname + "/data/todoData.json", JSON.stringify(data), function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
  });
}

function updateTodoStatus(todoId, completed, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const todo = data.find((item) => item.id === todoId);
    if (todo) {
      todo.completed = completed;
      fs.writeFile(__dirname +"/data/todoData.json", JSON.stringify(data), function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback(null);
      });
    } else {
      callback(new Error("Todo not found."));
    }
  });
}

function deleteTodo(todoId, callback) {
  readAllTodos(function (err, data) {
    if (err) {
      callback(err);
      return;
    }

    const updatedData = data.filter((item) => item.id !== todoId);

    fs.writeFile(__dirname +"/data/todoData.json", JSON.stringify(updatedData), function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null);
    });
  });
}

app.listen(3000, function () {
  console.log("Server on port 3000");
});
