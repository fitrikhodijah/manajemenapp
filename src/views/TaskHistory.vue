<!-- src/views/TaskHistory.vue -->
<template>
  <div>
    <h1>Riwayat Tugas Selesai</h1>
    <ul v-if="completedTasks.length">
      <li v-for="task in completedTasks" :key="task.id">
        <strong>{{ task.title }}</strong> - {{ task.description }}
      </li>
    </ul>
    <p v-else>Tidak ada tugas yang telah selesai.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Simulasi data tugas selesai
const completedTasks = ref([
  { id: '1', title: 'Belajar Vue.js', description: 'Pelajari routing dan komponen' },
  { id: '3', title: 'Selesaikan proyek', description: 'Kirim proyek tepat waktu' },
])
</script>

<style scoped>
ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  background-color: #e0f7fa;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 6px;
}
</style>
