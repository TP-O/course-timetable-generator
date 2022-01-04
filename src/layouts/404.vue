<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <main class="px-4 py-10 text-center text-blue-700 dark:text-gray-200">
    <div>
      <p class="text-4xl">
        <carbon-warning class="inline-block" />
      </p>
    </div>
    <router-view />
    <div>
      <button
        class="btn m-3 text-sm mt-8"
        @click="router.back()"
      >
        Home
      </button>
    </div>
  </main>
</template>
