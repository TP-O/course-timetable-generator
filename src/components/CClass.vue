<script setup lang="ts">
import type { CClass } from '~/types'

defineProps<{ cclass: CClass | null }>()
</script>

<template>
  <div
    grid="~ cols-1"
    text="3xs"
    border="1 gray-400 t-transparent l-transparent"
    md="text-xs"
    lg="text-sm"
    :class="cclass?.period ? `row-span-${cclass.period} bg-gray-200 dark:bg-gray-800` : ''"
  >
    <template v-if="cclass !== null">
      <div font="bold" class="flex justify-center items-center">
        {{ cclass.name }}
      </div>
      <div class="flex justify-center items-center">
        {{ cclass.lecturer }}
      </div>
      <div class="flex justify-center items-center">
        Room:&nbsp;<b>{{ cclass.room }}</b>
      </div>
    </template>
  </div>
</template>
