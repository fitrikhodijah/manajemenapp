// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Import komponen halaman
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import TaskList from '../views/TaskList.vue'
import AddTask from '../views/AddTask.vue'
import EditTask from '../views/EditTask.vue'
import TaskHistory from '../views/TaskHistory.vue'
import Profile from '../views/Profile.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard },
  { path: '/tasks', component: TaskList },
  { path: '/tasks/add', component: AddTask },
  { path: '/tasks/:id/edit', component: EditTask },
  { path: '/history', component: TaskHistory },
  { path: '/profile', component: Profile },
  { path: '/:pathMatch(.*)*', component: NotFound }, // fallback 404
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
