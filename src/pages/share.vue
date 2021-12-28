<script setup lang="ts">import type { PartialCourse } from '~/types'
const route = useRoute()
const valid = ref(true)
let timetable: PartialCourse[][] = []

try {
  timetable = JSON.parse(atob(route.query.timetable as string))
}
catch {
  valid.value = false
}
</script>

<template>
  <template v-if="valid">
    <c-timetable :timetable="timetable" />
  </template>
  <div v-else>
    <q-banner dense inline-actions class="text-white bg-red">
      <span text="xl" class="flex items-center justify-center">
        Invalid
        <noto-v1-frowning-face-with-open-mouth m="l-4" />
      </span>
    </q-banner>
  </div>
</template>
