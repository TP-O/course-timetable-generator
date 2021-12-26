<script setup lang="ts">
import type { CClass, PartialCourse } from '~/types'

const props = defineProps<{ timetable: PartialCourse[][] }>()

const daysOfWeek = ['', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const periods = 16
let myClasses: CClass[][]

function generateClasses() {
  myClasses = props.timetable.map((day) => {
    return day.reverse().map((course, i, arr) => {
      const myClass: CClass = { ...course, row: 0 }
      const sum = arr.slice(i + 1).reduce((pre, { period }) => pre + period - 1, 0)

      myClass.row = course.start - sum

      return myClass
    })
  })
}

function calculateCells(day: number) {
  return periods - myClasses[day].reduce((pre, course) => pre + course.period - 1, 0)
}

function getClass(day: number, row: number) {
  const cclasses = myClasses[day]

  for (const cclass of cclasses) {
    if (cclass.row === row)
      return cclass
  }

  return null
}

generateClasses()
</script>

<template>
  <div>
    <div grid="~ cols-8">
      <div
        v-for="(day, key) in daysOfWeek"
        :key="key"
        border="1 gray-400 t-transparent l-transparent"
        p="y-1"
        :class="key === daysOfWeek.length - 1 ? 'border-r-transparent' : ''"
      >
        <span text="gray-400 xs uppercase" lg="text-base">
          {{ day }}
        </span>
      </div>
    </div>

    <div grid="~ cols-8" h="md" lg="h-lg">
      <div grid="~ cols-1">
        <div
          v-for="i in periods"
          :key="i"
          text="2xs"
          border="1 gray-400 t-transparent l-transparent"
          lg="text-base"
          class="flex items-center justify-center"
        >
          <span text="gray-400 capitalize">
            {{ `perioid ${i}` }}
          </span>
        </div>
      </div>

      <div grid="~ col-span-7 cols-7">
        <div v-for="i in daysOfWeek.length - 1" :key="i" grid="~ rows-16">
          <c-class
            v-for="j in calculateCells(i - 1)"
            :key="j"
            :cclass="getClass(i - 1, j)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
