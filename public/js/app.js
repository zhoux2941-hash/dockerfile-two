// Task Manager API Client
const API_BASE_URL = '/api';

// State Management
const state = {
    currentSection: 'dashboard',
    users: [],
    projects: [],
    tasks: [],
    notifications: []
};

// Utility Functions
function showLoading() {
    document.getElementById('loadingSpinner').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.remove('active');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</span><span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        throw error;
    }
}

// Navigation Functions
function navigateTo(section) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });
    
    // Update sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}Section`).classList.add('active');
    
    // Update header
    const titles = {
        dashboard: { title: '仪表盘', description: '系统概览和统计信息' },
        users: { title: '用户管理', description: '管理系统用户' },
        projects: { title: '项目管理', description: '管理项目进度' },
        tasks: { title: '任务管理', description: '管理任务和待办事项' },
        notifications: { title: '通知中心', description: '查看系统通知' }
    };
    
    document.getElementById('sectionTitle').textContent = titles[section].title;
    document.getElementById('sectionDescription').textContent = titles[section].description;
    
    state.currentSection = section;
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'notifications':
            loadNotifications();
            break;
    }
}

// Dashboard Functions
async function loadDashboard() {
    showLoading();
    try {
        const [usersRes, projectsRes, tasksRes] = await Promise.all([
            apiCall('/users'),
            apiCall('/projects'),
            apiCall('/tasks')
        ]);
        
        document.getElementById('totalUsers').textContent = usersRes.count;
        document.getElementById('totalProjects').textContent = projectsRes.count;
        document.getElementById('totalTasks').textContent = tasksRes.count;
        
        const overdueTasks = tasksRes.data.filter(t => {
            if (!t.due_date || t.status === 'completed') return false;
            return new Date(t.due_date) < new Date();
        });
        document.getElementById('overdueTasks').textContent = overdueTasks.length;
        
        // Load recent tasks
        const recentTasksContainer = document.getElementById('recentTasks');
        const recentTasks = tasksRes.data.slice(0, 5);
        recentTasksContainer.innerHTML = recentTasks.map(task => `
            <div class="task-item">
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <p>${task.project_name || '无项目'} • ${task.assignee_name || '未分配'}</p>
                </div>
                <span class="task-status ${task.status}">${getStatusText(task.status)}</span>
            </div>
        `).join('');
        
        // Load active projects
        const activeProjectsContainer = document.getElementById('activeProjects');
        const activeProjects = projectsRes.data.filter(p => p.status === 'active').slice(0, 5);
        activeProjectsContainer.innerHTML = activeProjects.map(project => `
            <div class="project-item">
                <div class="project-info">
                    <h4>${project.name}</h4>
                    <p>负责人: ${project.owner_name}</p>
                </div>
                <span class="task-status ${project.priority}">${getPriorityText(project.priority)}</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Dashboard load error:', error);
    } finally {
        hideLoading();
    }
}

// Users Functions
async function loadUsers() {
    showLoading();
    try {
        const response = await apiCall('/users');
        state.users = response.data;
        
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = response.data.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${getRoleText(user.role)}</td>
                <td>${formatDate(user.created_at)}</td>
                <td class="actions">
                    <button class="btn btn-secondary btn-small" onclick="editUser('${user.id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deleteUser('${user.id}')">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Users load error:', error);
    } finally {
        hideLoading();
    }
}

// Projects Functions
async function loadProjects() {
    showLoading();
    try {
        const response = await apiCall('/projects');
        state.projects = response.data;
        
        const tbody = document.getElementById('projectsTableBody');
        tbody.innerHTML = response.data.map(project => `
            <tr>
                <td>${project.name}</td>
                <td>${project.owner_name}</td>
                <td><span class="task-status ${project.status}">${getProjectStatusText(project.status)}</span></td>
                <td><span class="task-status ${project.priority}">${getPriorityText(project.priority)}</span></td>
                <td>${project.tasks ? project.tasks.length : 0}</td>
                <td class="actions">
                    <button class="btn btn-secondary btn-small" onclick="viewProject('${project.id}')">查看</button>
                    <button class="btn btn-secondary btn-small" onclick="editProject('${project.id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deleteProject('${project.id}')">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Projects load error:', error);
    } finally {
        hideLoading();
    }
}

// Tasks Functions
async function loadTasks() {
    showLoading();
    try {
        const status = document.getElementById('taskStatusFilter').value;
        const priority = document.getElementById('taskPriorityFilter').value;
        
        let endpoint = '/tasks?';
        if (status) endpoint += `status=${status}&`;
        if (priority) endpoint += `priority=${priority}`;
        
        const response = await apiCall(endpoint);
        state.tasks = response.data;
        
        const tbody = document.getElementById('tasksTableBody');
        tbody.innerHTML = response.data.map(task => `
            <tr>
                <td>${task.title}</td>
                <td>${task.project_name || '-'}</td>
                <td>${task.assignee_name || '未分配'}</td>
                <td><span class="task-status ${task.status}">${getStatusText(task.status)}</span></td>
                <td><span class="task-status ${task.priority}">${getPriorityText(task.priority)}</span></td>
                <td>${task.due_date || '-'}</td>
                <td class="actions">
                    <button class="btn btn-secondary btn-small" onclick="viewTask('${task.id}')">查看</button>
                    <button class="btn btn-secondary btn-small" onclick="editTask('${task.id}')">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="deleteTask('${task.id}')">删除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Tasks load error:', error);
    } finally {
        hideLoading();
    }
}

// Notifications Functions
async function loadNotifications() {
    showLoading();
    try {
        const response = await apiCall('/notifications/user-001'); // Using first user for demo
        state.notifications = response.data;
        
        const container = document.getElementById('notificationsList');
        container.innerHTML = response.data.map(notif => `
            <div class="notification-item ${notif.read ? '' : 'unread'}" data-id="${notif.id}">
                <div class="notification-content">
                    <h4>${notif.title}</h4>
                    <p>${notif.message || ''}</p>
                    <small>${formatDate(notif.created_at)}</small>
                </div>
                ${notif.read ? '' : '<button class="btn btn-secondary btn-small" onclick="markAsRead(\'' + notif.id + '\')">标记已读</button>'}
            </div>
        `).join('');
    } catch (error) {
        console.error('Notifications load error:', error);
    } finally {
        hideLoading();
    }
}

async function markAllNotificationsRead() {
    try {
        await apiCall('/notifications/user-001/read-all', { method: 'PUT' });
        showToast('所有通知已标记为已读');
        loadNotifications();
    } catch (error) {
        console.error('Mark all read error:', error);
    }
}

async function markAsRead(notificationId) {
    try {
        await apiCall(`/notifications/${notificationId}/read`, { method: 'PUT' });
        showToast('通知已标记为已读');
        loadNotifications();
    } catch (error) {
        console.error('Mark as read error:', error);
    }
}

// Modal Functions
function showCreateModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    
    switch(state.currentSection) {
        case 'users':
            modalTitle.textContent = '新建用户';
            modalBody.innerHTML = `
                <div class="form-group">
                    <label>用户名</label>
                    <input type="text" id="newUsername" placeholder="输入用户名">
                </div>
                <div class="form-group">
                    <label>邮箱</label>
                    <input type="email" id="newEmail" placeholder="输入邮箱">
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" id="newPassword" placeholder="输入密码">
                </div>
                <div class="form-group">
                    <label>角色</label>
                    <select id="newRole">
                        <option value="user">用户</option>
                        <option value="manager">经理</option>
                        <option value="admin">管理员</option>
                    </select>
                </div>
            `;
            modalFooter.innerHTML = `
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="createUser()">创建</button>
            `;
            break;
            
        case 'projects':
            modalTitle.textContent = '新建项目';
            modalBody.innerHTML = `
                <div class="form-group">
                    <label>项目名称</label>
                    <input type="text" id="newProjectName" placeholder="输入项目名称">
                </div>
                <div class="form-group">
                    <label>描述</label>
                    <textarea id="newProjectDesc" placeholder="输入项目描述"></textarea>
                </div>
                <div class="form-group">
                    <label>负责人</label>
                    <select id="newProjectOwner">
                        ${state.users.map(u => `<option value="${u.id}">${u.username}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>优先级</label>
                    <select id="newProjectPriority">
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                        <option value="urgent">紧急</option>
                    </select>
                </div>
            `;
            modalFooter.innerHTML = `
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="createProject()">创建</button>
            `;
            break;
            
        case 'tasks':
            modalTitle.textContent = '新建任务';
            modalBody.innerHTML = `
                <div class="form-group">
                    <label>任务标题</label>
                    <input type="text" id="newTaskTitle" placeholder="输入任务标题">
                </div>
                <div class="form-group">
                    <label>描述</label>
                    <textarea id="newTaskDesc" placeholder="输入任务描述"></textarea>
                </div>
                <div class="form-group">
                    <label>项目</label>
                    <select id="newTaskProject">
                        <option value="">无项目</option>
                        ${state.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>负责人</label>
                    <select id="newTaskAssignee">
                        <option value="">未分配</option>
                        ${state.users.map(u => `<option value="${u.id}">${u.username}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>优先级</label>
                    <select id="newTaskPriority">
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                        <option value="urgent">紧急</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>截止日期</label>
                    <input type="date" id="newTaskDueDate">
                </div>
            `;
            modalFooter.innerHTML = `
                <button class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button class="btn btn-primary" onclick="createTask()">创建</button>
            `;
            break;
            
        default:
            return;
    }
    
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal(event) {
    if (!event || event.target.id === 'modalOverlay') {
        document.getElementById('modalOverlay').classList.remove('active');
    }
}

// CRUD Operations
async function createUser() {
    const username = document.getElementById('newUsername').value;
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    
    if (!username || !email || !password) {
        showToast('请填写所有必填字段', 'error');
        return;
    }
    
    try {
        await apiCall('/users', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, role })
        });
        showToast('用户创建成功');
        closeModal();
        loadUsers();
    } catch (error) {
        console.error('Create user error:', error);
    }
}

async function createProject() {
    const name = document.getElementById('newProjectName').value;
    const description = document.getElementById('newProjectDesc').value;
    const owner_id = document.getElementById('newProjectOwner').value;
    const priority = document.getElementById('newProjectPriority').value;
    
    if (!name || !owner_id) {
        showToast('请填写所有必填字段', 'error');
        return;
    }
    
    try {
        await apiCall('/projects', {
            method: 'POST',
            body: JSON.stringify({ name, description, owner_id, priority })
        });
        showToast('项目创建成功');
        closeModal();
        loadProjects();
    } catch (error) {
        console.error('Create project error:', error);
    }
}

async function createTask() {
    const title = document.getElementById('newTaskTitle').value;
    const description = document.getElementById('newTaskDesc').value;
    const project_id = document.getElementById('newTaskProject').value || null;
    const assignee_id = document.getElementById('newTaskAssignee').value || null;
    const priority = document.getElementById('newTaskPriority').value;
    const due_date = document.getElementById('newTaskDueDate').value;
    
    if (!title) {
        showToast('请填写任务标题', 'error');
        return;
    }
    
    try {
        await apiCall('/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description,
                project_id,
                assignee_id,
                reporter_id: 'user-001', // Using first user as reporter
                priority,
                due_date
            })
        });
        showToast('任务创建成功');
        closeModal();
        loadTasks();
    } catch (error) {
        console.error('Create task error:', error);
    }
}

async function deleteUser(id) {
    if (!confirm('确定要删除这个用户吗?')) return;
    
    try {
        await apiCall(`/users/${id}`, { method: 'DELETE' });
        showToast('用户删除成功');
        loadUsers();
    } catch (error) {
        console.error('Delete user error:', error);
    }
}

async function deleteProject(id) {
    if (!confirm('确定要删除这个项目吗? 相关任务也会被删除.')) return;
    
    try {
        await apiCall(`/projects/${id}`, { method: 'DELETE' });
        showToast('项目删除成功');
        loadProjects();
    } catch (error) {
        console.error('Delete project error:', error);
    }
}

async function deleteTask(id) {
    if (!confirm('确定要删除这个任务吗?')) return;
    
    try {
        await apiCall(`/tasks/${id}`, { method: 'DELETE' });
        showToast('任务删除成功');
        loadTasks();
    } catch (error) {
        console.error('Delete task error:', error);
    }
}

// Edit Functions (simplified for demo)
function editUser(id) {
    showToast('编辑功能开发中...', 'warning');
}

function editProject(id) {
    showToast('编辑功能开发中...', 'warning');
}

function editTask(id) {
    showToast('编辑功能开发中...', 'warning');
}

function viewProject(id) {
    showToast('查看功能开发中...', 'warning');
}

function viewTask(id) {
    showToast('查看功能开发中...', 'warning');
}

// Search Functions
async function searchTasks(event) {
    if (event.key === 'Enter') {
        const query = document.getElementById('taskSearch').value;
        if (!query) return;
        
        try {
            const response = await apiCall(`/tasks/search?q=${encodeURIComponent(query)}`);
            state.tasks = response.data;
            
            const tbody = document.getElementById('tasksTableBody');
            tbody.innerHTML = response.data.map(task => `
                <tr>
                    <td>${task.title}</td>
                    <td>${task.project_name || '-'}</td>
                    <td>${task.assignee_name || '未分配'}</td>
                    <td><span class="task-status ${task.status}">${getStatusText(task.status)}</span></td>
                    <td><span class="task-status ${task.priority}">${getPriorityText(task.priority)}</span></td>
                    <td>${task.due_date || '-'}</td>
                    <td class="actions">
                        <button class="btn btn-secondary btn-small" onclick="viewTask('${task.id}')">查看</button>
                        <button class="btn btn-secondary btn-small" onclick="editTask('${task.id}')">编辑</button>
                        <button class="btn btn-danger btn-small" onclick="deleteTask('${task.id}')">删除</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Search tasks error:', error);
        }
    }
}

// Utility Functions
function getStatusText(status) {
    const statusMap = {
        'pending': '待处理',
        'in_progress': '进行中',
        'completed': '已完成',
        'cancelled': '已取消',
        'on_hold': '暂停'
    };
    return statusMap[status] || status;
}

function getPriorityText(priority) {
    const priorityMap = {
        'low': '低',
        'medium': '中',
        'high': '高',
        'urgent': '紧急'
    };
    return priorityMap[priority] || priority;
}

function getRoleText(role) {
    const roleMap = {
        'admin': '管理员',
        'manager': '经理',
        'user': '用户',
        'guest': '访客'
    };
    return roleMap[role] || role;
}

function getProjectStatusText(status) {
    const statusMap = {
        'planning': '规划中',
        'active': '进行中',
        'completed': '已完成',
        'cancelled': '已取消',
        'on_hold': '暂停'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

function refreshData() {
    navigateTo(state.currentSection);
    showToast('数据已刷新');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Navigation click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            navigateTo(section);
        });
    });
    
    // Load initial dashboard
    loadDashboard();
});

// Export for debugging
window.app = {
    state,
    apiCall,
    navigateTo,
    loadDashboard,
    loadUsers,
    loadProjects,
    loadTasks,
    loadNotifications
};