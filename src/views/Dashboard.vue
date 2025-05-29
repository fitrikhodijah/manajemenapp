<template>
  <div class="dashboard-container">
    <h1>Dashboard</h1>
    <p>Selamat datang! Berikut adalah tugas-tugas Anda hari ini:</p>
    
    <ul class="task-list">
      <li v-for="(task, index) in tasks" :key="index">
        <input type="checkbox" :checked="task.completed" disabled />
        <span :class="{ done: task.completed }">{{ task.title }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tasks = ref([
  { title: 'Belajar Vue.js', completed: false },
  { title: 'Mengerjakan tugas PBK', completed: true },
  { title: 'Membaca dokumentasi Vue Router', completed: false },
])
</script>

<style scoped>
.dashboard-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 1.5rem;
}
.task-list {
  list-style: none;
  padding: 0;
}
.task-list li {
  margin: 10px 0;
  font-size: 1.1rem;
}
.done {
  text-decoration: line-through;
  color: #888;
}
</style>
