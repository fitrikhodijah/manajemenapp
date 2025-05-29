<template>
  <div class="task-list-container">
    <h1>Manajemen Tugas</h1>
    <router-link to="/tasks/add">
      <button class="add-btn">+ Tambah Tugas</button>
    </router-link>

    <ul class="task-list">
      <li v-for="task in tasks" :key="task.id">
        <span>{{ task.title }}</span>
        <router-link :to="`/tasks/${task.id}/edit`">
          <button class="edit-btn">Edit</button>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tasks = ref([
  { id: 1, title: 'Belajar Vue Router' },
  { id: 2, title: 'Kerjakan tugas PBK' },
  { id: 3, title: 'Push ke GitHub' },
])
</script>

<style scoped>
.task-list-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 1.5rem;
}
.add-btn, .edit-btn {
  margin-left: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
.task-list {
  list-style: none;
  padding: 0;
}
.task-list li {
  margin: 10px 0;
  font-size: 1.1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
