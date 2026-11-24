# 🚀 Nexus | Social Media Manager

A modern, fully interactive social media management dashboard built entirely with **Vanilla HTML, CSS, and JavaScript**. Nexus allows you to compose, schedule, and track your social media posts across Twitter, Instagram, LinkedIn, and Facebook from a single, beautiful dark-mode interface.

## 🚀 Live Demo
👉 **[View the Live Nexus Dashboard](https://kgosana950.github.io/Nexus_Social-Media-Manager/)**

## ✨ Features

*   **Multi-Platform Composer:** Create posts and select which platforms to publish them to (Twitter, Instagram, LinkedIn, Facebook).
*   **Interactive Dashboard:** View real-time stats for your posts, including total Likes, Comments, and Shares.
*   **Analytics Chart:** A dynamically updating bar chart (via Chart.js) that visualizes your engagement metrics.
*   **GitHub Activity Simulation:** A simulated GitHub contribution heatmap and commit history line chart to visualize coding activity.
*   **Full CRUD Operations:** Create, Read, Update (Edit), and Delete scheduled posts. All data is saved to `localStorage` so it persists on refresh.
*   **Animations:** 
    *   **Confetti Explosion:** Fires when a new post is successfully scheduled.
    *   **Count-Up Numbers:** Stat cards animate from 0 to the final count.
    *   **Smooth Page Transitions:** Views fade in and slide up when switching tabs.
*   **Fully Responsive:** Works perfectly on desktop, tablet, and mobile.

## 🛠️ Tech Stack

*   **HTML5:** Semantic structure.
*   **CSS3:** Custom variables, Flexbox, CSS Grid, and keyframe animations.
*   **Vanilla JavaScript (ES6+):** DOM manipulation, state management, and LocalStorage API.
*   **Chart.js:** For rendering the Analytics bar chart and GitHub line chart.
*   **Canvas Confetti:** For the post-scheduling celebration animation.
*   **Font Awesome:** For icons.
*   **Google Fonts:** `Inter` typeface.

## 📂 Project Structure

```text
/nexus
│── index.html       # Main HTML structure
│── style.css        # All styling, layout, and CSS animations
│── script.js        # Logic for posts, charts, and JS animations
└── README.md        # Project documentation
