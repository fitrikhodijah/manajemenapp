<!-- src/views/AddTask.vue -->
<template>
  <div>
    <h1>Tambah Tugas Baru</h1>
    <form @submit.prevent="submitTask">
      <div>
        <label for="title">Judul Tugas:</label><br />
        <input
          id="title"
          v-model="task.title"
          type="text"
          placeholder="Masukkan judul tugas"
          required
        />
      </div>
      <div>
        <label for="description">Deskripsi:</label><br />
        <textarea
          id="description"
          v-model="task.description"
          placeholder="Masukkan deskripsi tugas"
        ></textarea>
      </div>
      <button type="submit">Simpan Tugas</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const task = reactive({
  title: '',
  description: '',
})

function submitTask() {
  // Simulasi simpan tugas, misal nanti panggil API atau update store
  alert(`Tugas "${task.title}" berhasil ditambahkan!`)

  // Reset form
  task.title = ''
  task.description = ''

  // Redirect ke daftar tugas
  router.push('/tasks')
}
</script>

<style scoped>
form div {
  margin-bottom: 1rem;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  background-color: #42b983;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #369d74;
}
</style>
