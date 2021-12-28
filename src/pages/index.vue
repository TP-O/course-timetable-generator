<script setup lang="ts">
import Generate from '~/pages/generate.vue'
import Authenticate from '~/pages/authenticate.vue'
import Share from '~/pages/share.vue'

const route = useRoute()
const router = useRouter()
const currentPage = shallowRef(Generate)

function switchPages(page: string) {
  router.replace(window.location.pathname)

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

function switchToSpecialPage() {
  const query = route.query

  if (query.share !== undefined)
    currentPage.value = Share
}

switchToSpecialPage()
</script>

<template>
  <main class="min-h-screen px-4 pb-10 text-center text-gray-700 dark:text-gray-200">
    <c-app-bar :switch-page="switchPages" />

    <div class="mt-10">
      <keep-alive>
        <component :is="currentPage" />
      </keep-alive>
    </div>
  </main>
</template>
