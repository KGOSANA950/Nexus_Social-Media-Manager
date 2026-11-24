// --- STATE & DATABASE ---
let posts = JSON.parse(localStorage.getItem('nexus_posts_final')) || [];
let currentFilter = 'all';
let chartInstance = null;
let githubChartInstance = null;
let currentCalendarDate = new Date();
let selectedDate = null; 

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderPosts();
    updateStats();
    initChart();
    initGitHubWidgets();
});

// --- TAB SWITCHING ---
function switchTab(tabId, navElement) {
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(navElement) navElement.classList.add('active');

    if(tabId === 'dashboard') {
        updateChartData();
    } else if (tabId === 'calendar') {
        renderCalendar();
    }
}

// --- POST CREATION (Composer) ---
document.getElementById('post-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const content = document.getElementById('post-content').value.trim();
    const platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(cb => cb.value);

    if (!content) return alert("Please write some content.");
    if (platforms.length === 0) return alert("Please select at least one platform.");

    const newPost = {
        id: Date.now(),
        content: content,
        platforms: platforms,
        timestamp: Date.now(),
        date: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 50) + 2,
        shares: Math.floor(Math.random() * 100) + 5
    };

    posts.unshift(newPost);
    saveDB();
    
    document.getElementById('post-form').reset();
    switchTab('dashboard', document.querySelectorAll('.nav-item')[0]);
    renderPosts();
    updateStats();
    updateChartData();

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
});

// --- RENDER POSTS ---
function renderPosts() {
    const feed = document.getElementById('posts-feed');
    feed.innerHTML = '';

    let filteredPosts = posts;
    if (currentFilter !== 'all') {
        filteredPosts = posts.filter(p => p.platforms.includes(currentFilter));
    }

    if (filteredPosts.length === 0) {
        feed.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><h3>No posts found</h3><p>Create a new post or change your filter.</p></div>`;
        return;
    }

    filteredPosts.sort((a, b) => b.timestamp - a.timestamp);

    filteredPosts.forEach(post => {
        let iconsHTML = '';
        if (post.platforms.includes('twitter')) iconsHTML += '<i class="fab fa-twitter"></i>';
        if (post.platforms.includes('instagram')) iconsHTML += '<i class="fab fa-instagram"></i>';
        if (post.platforms.includes('linkedin')) iconsHTML += '<i class="fab fa-linkedin"></i>';
        if (post.platforms.includes('facebook')) iconsHTML += '<i class="fab fa-facebook"></i>';

        const postHTML = `
            <div class="post-card" id="post-${post.id}">
                <div class="post-header">
                    <div class="post-platforms">${iconsHTML}</div>
                    <div class="post-date">${post.date}</div>
                </div>
                <div class="post-content" id="content-${post.id}">${post.content}</div>
                <div class="post-actions">
                    <button class="delete-btn" onclick="deletePost(${post.id})"><i class="fas fa-trash"></i> Delete</button>
                    <button onclick="editPost(${post.id})" id="edit-btn-${post.id}"><i class="fas fa-edit"></i> Edit</button>
                </div>
            </div>
        `;
        feed.innerHTML += postHTML;
    });
}

function deletePost(id) {
    if(confirm("Delete this post?")) {
        posts = posts.filter(p => p.id !== id);
        saveDB();
        renderPosts();
        updateStats();
        updateChartData();
        renderCalendar();
    }
}

function editPost(id) {
    const post = posts.find(p => p.id === id);
    const contentDiv = document.getElementById(`content-${id}`);
    const editBtn = document.getElementById(`edit-btn-${id}`);
    contentDiv.innerHTML = `<textarea class="edit-textarea" id="edit-area-${id}">${post.content}</textarea>`;
    editBtn.outerHTML = `<button class="save-btn" onclick="savePost(${id})"><i class="fas fa-save"></i> Save</button>`;
}

function savePost(id) {
    const newContent = document.getElementById(`edit-area-${id}`).value.trim();
    if(!newContent) return alert("Post cannot be empty.");
    const postIndex = posts.findIndex(p => p.id === id);
    posts[postIndex].content = newContent;
    saveDB();
    renderPosts();
}

function filterFeed(platform) { currentFilter = platform; renderPosts(); }

function updateStats() {
    const counts = {
        twitter: posts.filter(p => p.platforms.includes('twitter')).length,
        instagram: posts.filter(p => p.platforms.includes('instagram')).length,
        linkedin: posts.filter(p => p.platforms.includes('linkedin')).length,
        facebook: posts.filter(p => p.platforms.includes('facebook')).length
    };
    animateValue("twitter-count", 0, counts.twitter, 800);
    animateValue("instagram-count", 0, counts.instagram, 800);
    animateValue("linkedin-count", 0, counts.linkedin, 800);
    animateValue("facebook-count", 0, counts.facebook, 800);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    if (start === end) { obj.innerHTML = end; return; }
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function addMedia(type) {
    const textarea = document.getElementById('post-content');
    if (type === 'image') textarea.value += " [📷 Image Attached] ";
    if (type === 'emoji') textarea.value += " 😊 ";
    textarea.focus();
}

function saveDB() { localStorage.setItem('nexus_posts_final', JSON.stringify(posts)); }

// =========================================
// CALENDAR & SCHEDULING LOGIC
// =========================================
function changeMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthDisplay = document.getElementById('currentMonthDisplay');
    grid.innerHTML = '';
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day', 'empty');
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('calendar-day');
        
        const cellDate = new Date(year, month, day);
        
        if (cellDate < today) {
            dayCell.classList.add('past-date');
        } else {
            dayCell.onclick = () => openScheduleModal(cellDate);
        }

        if (cellDate.getTime() === today.getTime()) {
            dayCell.classList.add('today');
        }

        dayCell.innerHTML = `<div class="day-number">${day}</div>`;

        const postsOnThisDay = posts.filter(post => {
            const postDate = new Date(post.timestamp);
            return postDate.getDate() === day && postDate.getMonth() === month && postDate.getFullYear() === year;
        });

        if (postsOnThisDay.length > 0) {
            const postsContainer = document.createElement('div');
            postsContainer.classList.add('day-posts');
            
            postsOnThisDay.forEach(post => {
                const miniPost = document.createElement('div');
                miniPost.classList.add('mini-post');
                miniPost.textContent = post.content;
                miniPost.title = post.content;
                postsContainer.appendChild(miniPost);
            });
            
            dayCell.appendChild(postsContainer);
        }

        grid.appendChild(dayCell);
    }
}

function openScheduleModal(date) {
    selectedDate = date;
    const modal = document.getElementById('scheduleModal');
    const dateDisplay = document.getElementById('modal-date-display');
    
    dateDisplay.textContent = `Scheduling for: ${date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    
    document.getElementById('modal-post-content').value = '';
    document.getElementById('modal-time').value = '';
    document.getElementById('modal-error').style.display = 'none';
    
    modal.classList.add('active');
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.remove('active');
}

function submitScheduledPost() {
    const content = document.getElementById('modal-post-content').value.trim();
    const timeValue = document.getElementById('modal-time').value;
    const platforms = Array.from(document.querySelectorAll('input[name="modal-platform"]:checked')).map(cb => cb.value);
    const errorEl = document.getElementById('modal-error');

    if (!content) return showError("Please write some content.");
    if (!timeValue) return showError("Please select a time.");
    if (platforms.length === 0) return showError("Please select at least one platform.");

    const [hours, minutes] = timeValue.split(':');
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours, minutes, 0, 0);

    if (finalDate < new Date()) {
        return showError("You cannot schedule a post in the past. Please choose a future time.");
    }

    const newPost = {
        id: Date.now(),
        content: content,
        platforms: platforms,
        timestamp: finalDate.getTime(),
        date: finalDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 50) + 2,
        shares: Math.floor(Math.random() * 100) + 5
    };

    posts.push(newPost);
    saveDB();
    
    closeScheduleModal();
    renderCalendar(); 
    updateStats();
    updateChartData();
    
    confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
}

function showError(msg) {
    const errorEl = document.getElementById('modal-error');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
}

// =========================================
// CHART.JS ANALYTICS LOGIC
// =========================================
function initChart() {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Likes', 'Comments', 'Shares'],
            datasets: [{
                label: 'Total Engagement',
                data: [0, 0, 0],
                backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)'],
                borderColor: ['#3b82f6', '#10b981', '#f59e0b'],
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
    });
    updateChartData();
}

function updateChartData() {
    if (!chartInstance) return;
    let totalLikes = 0, totalComments = 0, totalShares = 0;
    posts.forEach(post => { totalLikes += post.likes || 0; totalComments += post.comments || 0; totalShares += post.shares || 0; });
    chartInstance.data.datasets[0].data = [totalLikes, totalComments, totalShares];
    chartInstance.update();
}

// =========================================
// GITHUB WIDGETS (SIMULATED)
// =========================================
function initGitHubWidgets() {
    const heatmap = document.getElementById('githubHeatmap');
    heatmap.innerHTML = '';
    for (let i = 0; i < 96; i++) {
        const cell = document.createElement('div');
        cell.classList.add('heatmap-cell');
        const random = Math.random();
        if (random > 0.8) cell.classList.add('level-4');
        else if (random > 0.6) cell.classList.add('level-3');
        else if (random > 0.4) cell.classList.add('level-2');
        else if (random > 0.2) cell.classList.add('level-1');
        heatmap.appendChild(cell);
    }

    const ctx = document.getElementById('githubChart').getContext('2d');
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        data.push(Math.floor(Math.random() * 12));
    }

    githubChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: 'Commits (Simulated)', data: data, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#10b981', pointBorderColor: '#fff', pointRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', stepSize: 3 } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
    });
}
