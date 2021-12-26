<script setup lang="ts">
import Generate from '~/pages/generate.vue'
import Authenticate from '~/pages/authenticate.vue'

const currentPage = shallowRef(Generate)

function switchPage(page: string) {
  switch (page) {
    case 'generate':
      currentPage.value = Generate
      break
    case 'authenticate':
      currentPage.value = Authenticate
      break
    default:
      currentPage.value = Generate
  }
}

</script>

<template>
  <main class="min-h-screen px-4 pb-10 text-center text-gray-700 dark:text-gray-200">
    <c-app-bar :switch-page="switchPage" />

    <div class="mt-10">
      <keep-alive>
        <component :is="currentPage" />
      </keep-alive>
    </div>
  </main>
</template>
