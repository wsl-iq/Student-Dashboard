let tasks = JSON.parse(localStorage.getItem('studentTasks')) || [];
let currentPriority = 'medium';

document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    setupEventListeners();
    checkDeadlines();
    
    setInterval(checkDeadlines, 60000);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('task-date').valueAsDate = tomorrow;
    
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 2);
    document.getElementById('task-time').value = `${nextHour.getHours().toString().padStart(2, '0')}:${nextHour.getMinutes().toString().padStart(2, '0')}`;
});

function loadTasks() {
    const tasksList = document.getElementById('tasks-list');
    const emptyTasks = document.getElementById('empty-tasks');
    
    if (tasks.length === 0) {
        emptyTasks.classList.remove('hidden');
        tasksList.innerHTML = '';
        tasksList.appendChild(emptyTasks);
        return;
    }
    
    emptyTasks.classList.add('hidden');
    tasksList.innerHTML = '';
    
    tasks.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
    
    tasks.forEach((task, index) => {
        const taskCard = createTaskCard(task, index);
        tasksList.appendChild(taskCard);
    });
    
    updateTaskFilters();
    updateTaskSearch();
}

function createTaskCard(task, index) {
    const now = new Date();
    const deadline = new Date(task.date + 'T' + task.time);
    const timeDiff = deadline - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
    
    let status = 'on-time';
    let statusText = 'باقي وقت';
    let timeLeft = '';
    
    if (timeDiff < 0) {
        status = 'overdue';
        statusText = 'منتهي';
        timeLeft = 'انتهى الموعد';
    } else if (hoursDiff <= 24) {
        status = 'near-deadline';
        statusText = 'قريب من التسليم';
        timeLeft = `باقي ${hoursDiff} ساعة`;
    } else {
        timeLeft = `باقي ${daysDiff} يوم`;
    }
    
    const card = document.createElement('div');
    card.className = `task-card ${status} ${task.priority}-priority`;
    card.dataset.status = status;
    card.dataset.priority = task.priority || 'medium';
    
    const priorityText = {
        'high': 'عالية',
        'medium': 'متوسطة',
        'low': 'منخفضة'
    };
    
    card.innerHTML = `
        <div class="task-header">
            <div>
                <h3 class="task-title">${task.name}</h3>
                <span class="priority-badge priority-${task.priority || 'medium'}">${priorityText[task.priority || 'medium']}</span>
            </div>
            <span class="task-type">${task.type}</span>
        </div>
        <div class="task-details">
            <div class="task-detail">
                <i class="far fa-calendar-alt"></i>
                <span>تاريخ التسليم: ${formatDate(task.date)}</span>
            </div>
            <div class="task-detail">
                <i class="far fa-clock"></i>
                <span>وقت التسليم: ${task.time}</span>
            </div>
            ${task.desc ? `<div class="task-detail">
                <i class="far fa-file-alt"></i>
                <span>${task.desc}</span>
            </div>` : ''}
        </div>
        <div class="task-footer">
            <span class="task-status status-${status}">${statusText}</span>
            <span class="time-left">${timeLeft}</span>
            <button class="btn delete-btn delete-task" data-index="${index}" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                <i class="fas fa-trash"></i>
                حذف
            </button>
        </div>
    `;
    
    return card;
}

function addTask() {
    const name = document.getElementById('task-name').value.trim();
    const type = document.getElementById('task-type').value;
    const date = document.getElementById('task-date').value;
    const time = document.getElementById('task-time').value;
    const desc = document.getElementById('task-desc').value.trim();
    const priority = currentPriority;
    
    if (!name || !date || !time) {
        showNotification('خطأ', 'الرجاء ملء جميع الحقول المطلوبة');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        name,
        type,
        date,
        time,
        desc,
        priority,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    loadTasks();
    
    document.getElementById('task-name').value = '';
    document.getElementById('task-desc').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-time').value = '';
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.priority-btn[data-priority="medium"]`).classList.add('active');
    currentPriority = 'medium';
    
    showNotification('تم بنجاح', 'تمت إضافة الواجب بنجاح');
}

function deleteTask(index) {
    if (!confirm('هل أنت متأكد من حذف هذا الواجب؟')) return;

    const idx = Number(index);
    if (isNaN(idx)) return;

    // Remove from data
    tasks.splice(idx, 1);
    saveTasks();

    // Remove DOM card immediately if present
    const btn = document.querySelector(`.delete-task[data-index="${index}"]`);
    if (btn) {
        const card = btn.closest('.task-card');
        if (card) card.remove();
    }

    // Re-render to fix indices, filters and search
    loadTasks();

    showNotification('تم الحذف', 'تم حذف الواجب بنجاح');
}

// Persist tasks to localStorage
function saveTasks() {
    try {
        localStorage.setItem('studentTasks', JSON.stringify(tasks));
    } catch (e) {
        console.error('Failed to save tasks:', e);
    }
}

function updateTaskFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskCards = document.querySelectorAll('.task-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            taskCards.forEach(card => {
                const status = card.dataset.status;
                const priority = card.dataset.priority;
                
                let shouldShow = false;
                
                if (filter === 'all') {
                    shouldShow = true;
                } else if (filter === 'on-time') {
                    shouldShow = status === 'on-time';
                } else if (filter === 'near-deadline') {
                    shouldShow = status === 'near-deadline';
                } else if (filter === 'overdue') {
                    shouldShow = status === 'overdue';
                } else if (filter === 'high-priority') {
                    shouldShow = priority === 'high';
                }
                
                card.style.display = shouldShow ? 'block' : 'none';
            });
        });
    });
}

function updateTaskSearch() {
    const searchInput = document.getElementById('search-tasks');
    const taskCards = document.querySelectorAll('.task-card');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        taskCards.forEach(card => {
            const title = card.querySelector('.task-title').textContent.toLowerCase();
            const desc = card.querySelector('.task-detail:nth-child(3) span')?.textContent.toLowerCase() || '';
            const type = card.querySelector('.task-type').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || desc.includes(searchTerm) || type.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function checkDeadlines() {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    
    const upcomingTasks = tasks.filter(task => {
        const deadline = new Date(task.date + 'T' + task.time);
        return deadline > now && deadline <= oneDayFromNow;
    });
    
    const urgentTasks = tasks.filter(task => {
        const deadline = new Date(task.date + 'T' + task.time);
        return deadline > now && deadline <= threeHoursFromNow;
    });
    
    if (urgentTasks.length > 0) {
        showNotification('تحذير عاجل', `لديك ${urgentTasks.length} واجب(ات) على وشك الانتهاء خلال 3 ساعات!`);
    } else if (upcomingTasks.length > 0) {
        showNotification('تنبيه', `لديك ${upcomingTasks.length} واجب(ات) على وشك الانتهاء خلال 24 ساعة`);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return 'تاريخ غير معروف';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

function showNotification(title, message) {
    const notification = document.getElementById('notification');
    const notificationTitle = document.getElementById('notification-title');
    const notificationMessage = document.getElementById('notification-message');
    
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 5000);
}

function setupEventListeners() {
    document.getElementById('add-task').addEventListener('click', addTask);
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPriority = this.getAttribute('data-priority');
        });
    });
    
    document.getElementById('tasks-list').addEventListener('click', function(e) {
        if (e.target.closest('.delete-task')) {
            const index = e.target.closest('.delete-task').getAttribute('data-index');
            deleteTask(index);
        }
    });
    
    document.getElementById('close-notification').addEventListener('click', function() {
        document.getElementById('notification').classList.add('hidden');
    });
    
    document.getElementById('task-name').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
}