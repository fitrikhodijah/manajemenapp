<!-- src/views/EditTask.vue -->
<template>
  <div>
    <h1>Edit Tugas</h1>
    <form @submit.prevent="updateTask">
      <div>
        <label for="title">Judul Tugas:</label><br />
        <input
          id="title"
          v-model="task.title"
          type="text"
          required
        />
      </div>
      <div>
        <label for="description">Deskripsi:</label><br />
        <textarea
          id="description"
          v-model="task.description"
        ></textarea>
      </div>
      <button type="submit">Update Tugas</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Data tugas yang diedit
const task = reactive({
  title: '',
  description: '',
})

// Simulasi data tugas (seharusnya dari API/store)
const fakeTasks = [
  { id: '1', title: 'Belajar Vue.js', description: 'Pelajari routing dan komponen' },
  { id: '2', title: 'Buat tugas', description: 'Implementasi Vue Router' },
]

onMounted(() => {
  // Ambil id dari route param
  const taskId = route.params.id

  // Cari tugas berdasarkan id (simulasi)
  const found = fakeTasks.find(t => t.id === taskId)

  if (found) {
    task.title = found.title
    task.description = found.description
  } else {
    alert('Tugas tidak ditemukan!')
    router.push('/tasks')
  }
})

function updateTask() {
  // Simulasi update tugas
  alert(`Tugas "${task.title}" berhasil diperbarui!`)

  // Kembali ke daftar tugas
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
