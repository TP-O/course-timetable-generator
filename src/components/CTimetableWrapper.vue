<script setup lang="ts">
import type { PartialCourse } from '~/types'
defineProps<{
  timetables: PartialCourse[][][]
  loadMore: CallableFunction
}>()
</script>

<template>
  <c-lazy
    v-for="(timetable, key) in timetables"
    :key="key"
    :is-last="key === timetables.length - 1"
    :load-more="loadMore"
    m="t-12 lg:t-24"
  >
    <c-timetable :timetable="timetable" />
  </c-lazy>
</template>
