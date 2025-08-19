let tasks = [];

function saveTask() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  tasks = saved ? JSON.parse(saved) : [];
  allocate();
}

function addTask(text, Quad) {
  const newTask = {
    id: Date.now(),
    text: text,
    quad: Quad || "default",
    done: false,
    pomos: 0,
    doneAt: null
  };
  tasks.push(newTask);
  saveTask();
  allocate();
}

function deleteTask(id) {
  let doneTasks = document.getElementById('quad-done');
  tasks.forEach(task => {
    if (task.id === id) {
      task.quad = "done"
      task.doneAt = Date.now();
      task.done = true;
    }
  });



  saveTask();
  allocate();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id)
  if (task) {
    task.done = !task.done;

    setTimeout(() => {
      if (task.done) {
        task.doneAt = Date.now();
        task.quad = "done"
        saveTask();
        allocate();
      }
    }, 2000);

    if (!task.done) {
      task.quad = "default"
    }
    saveTask();
    allocate();
  }
}

function moveTask(id, newQuad) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.quad = newQuad;
    saveTask();
    allocate();
  }
}

function dropDown() {
  const twoWeeks = 14 * 24 * 60 * 60 * 1000;
  tasks = tasks.filter(task => {
    if (task.done && task.doneAt && (Date.now() - task.doneAt > twoWeeks)) {
      return false; // remove it
    }
    return true; // keep it
  });
  saveTask();

}


function dragStart(ev, id) {
  ev.dataTransfer.setData("text/plain", id)
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drop(ev, quadName) {
  ev.preventDefault();
  const id = Number(ev.dataTransfer.getData("text/plain"));
  moveTask(id, quadName)
}
function addCursorEvents(el) {
  el.addEventListener('dragstart', () => el.style.cursor = 'grabbing');
  el.addEventListener('dragend', () => el.style.cursor = 'grab');
}
function allocate() {
  dropDown(); // remove old done tasks

  const quadrants = {
    do: document.getElementById('quad-do'),
    decide: document.getElementById('quad-decide'),
    delegate: document.getElementById('quad-delegate'),
    delete: document.getElementById('quad-delete'),
    done: document.getElementById('quad-done')
  };

  const defaultDivs = document.querySelectorAll('.quad-default');

  // Clear all quadrants
  Object.values(quadrants).forEach(q => {
    const heading = q.querySelector('h1'); // find the heading
    q.innerHTML = '';                        // clear everything
    if (heading) q.appendChild(heading);     // put the heading back
  });

  defaultDivs.forEach(q => {
    const heading = q.querySelector('h1');
    q.innerHTML = '';
    if (heading) q.appendChild(heading);
  });

  tasks.forEach(task => {
    if (!task.quad || !["do", "decide", "delegate", "delete", "done", "default"].includes(task.quad)) {
      task.quad = "default";
    }

    const taskDiv = document.createElement('div');
    taskDiv.className = 'task div';
    taskDiv.draggable = true;
    taskDiv.ondragstart = (e) => dragStart(e, task.id);
    taskDiv.innerHTML = `
      <span style="${task.done ? 'text-decoration:line-through;' : ''}">
        ${task.text}
      </span>
      <button onclick="deleteTask(${task.id})">X</button>
    `;
    taskDiv.ondblclick = () => toggleDone(task.id);

    addCursorEvents(taskDiv);

    if (task.quad === "default") {
      defaultDivs.forEach((div, i) => {
        const clone = i === 0 ? taskDiv : taskDiv.cloneNode(true);
        addCursorEvents(clone);
        div.appendChild(clone);

      });
    } else {
      quadrants[task.quad].appendChild(taskDiv);
    }

    let cloneNode = document.querySelector('#quad-default-1');

    if (cloneNode) { // only target the clone
      const taskCount = cloneNode.querySelectorAll('.task').length;
      cloneNode.style.display = taskCount ? 'block' : 'none';
    }
  });

  console.log(tasks);
}



loadTasks();


document.getElementById('addTask').onclick = () => {
  const input = document.querySelector('#task');
  const quad = document.querySelector('#quad-select');
  if (input.value.trim()) {
    addTask(input.value.trim(), quad.value)
    input.value = "";
    quad.value = "default"
  }


};


