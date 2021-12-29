<script setup lang="ts">
import courseData from '~/data/courses.json'
import lecturerData from '~/data/lecturers.json'
import { useCourseStore } from '~/stores/course'
import { useLecturerstore } from '~/stores/lecturer'
import type { Filter, PartialCourse, TimetableGenerationResult } from '~/types'
import { gogogogogo } from '~/workers/timetable-generator'
import Worker from '~/workers/timetable-generator?worker'
import { isDark } from '~/composables'

const { courses, addCourse, removeCourse } = useCourseStore()
const { lecturers, addLecturer, removeLecturer } = useLecturerstore()

const haveWorker = window.Worker !== undefined
const result = ref<TimetableGenerationResult>({
  totalCases: 0,
  validCases: 0,
  expectedCases: 0,
  timetables: [],
})
const filter = reactive<Filter>({
  day: {
    numberOfRelaxationDays: 1,
    specificDays: [],
  },
})
const filterState = reactive({
  specificDays: [
    { name: 'Mon', selected: false },
    { name: 'Tue', selected: false },
    { name: 'Wed', selected: false },
    { name: 'Thu', selected: false },
    { name: 'Fri', selected: false },
    { name: 'Sat', selected: false },
    { name: 'Sun', selected: false },
  ],
})
const displayedTimetables = ref<PartialCourse[][][]>([])
const generated = ref<null | boolean>(null)
const batch = 5

function updateSpecificDays(day: number, isInserted: boolean) {
  if (!filter.day.specificDays) return

  const index = filter.day.specificDays.indexOf(day)

  if (isInserted && index === -1)
    filter.day.specificDays.push(day)
  else if (!isInserted && index !== -1)
    filter.day.specificDays.splice(index, 1)
}

function loadMoreTimetables() {
  const currentLength = displayedTimetables.value.length

  displayedTimetables.value.push(
    ...result.value.timetables.slice(currentLength, currentLength + batch))
}

function gogogoggo() {
  generated.value = false

  if (haveWorker) {
    const worker = new Worker()

    worker.postMessage([JSON.stringify(courses), JSON.stringify(filter)])

    worker.onmessage = (e) => {
      const r = JSON.parse(e.data[0]) as TimetableGenerationResult

      generated.value = true
      result.value = r
      displayedTimetables.value = result.value.timetables.slice(0, batch)
    }
  }
  // If browser do not support Web Workers (may be crashed)
  else {
    const r = gogogogogo(courses, filter)

    generated.value = true
    result.value = r
    displayedTimetables.value = result.value.timetables.slice(0, batch)
  }
}
</script>

<template>
  <div grid="~ cols-2 gap-10">
    <div grid="col-span-2">
      <p text="xl" font="bold">
        Courses
      </p>

      <c-selection :items="courses" :storage="courseData" @add="addCourse" @remove="removeCourse" />
    </div>
    <div grid="~ col-span-2 cols-1 gap-8" lg="grid-cols-2">
      <div>
        <p text="xl" font="bold">
          Number of relaxation days
        </p>

        <q-input
          v-model="filter.day.numberOfRelaxationDays"
          outlined
          dense
          type="number"
          min="1"
          max="5"
          :dark="isDark"
        />
      </div>
      <div class="flex justify-center items-center">
        <p text="xl" font="bold">
          Specific relaxation days
        </p>

        <div w="full" class="flex justify-around items-center gap-y-4">
          <q-checkbox
            v-for="(day, i) in filterState.specificDays"
            :key="i"
            v-model="filterState.specificDays[i].selected"
            dense
            keep-color
            :label="day.name"
            color="primary"
            @click="updateSpecificDays(i, filterState.specificDays[i].selected)"
          />
        </div>
      </div>
    </div>
    <div grid="~ col-span-2 gap-8">
      <div>
        <p text="xl" font="bold">
          Except Lecturers
        </p>

        <c-selection :items="lecturers" :storage="lecturerData" @add="addLecturer" @remove="removeLecturer" />
      </div>
    </div>
  </div>

  <q-btn outline label="Generate" m="t-8" @click="gogogoggo" />

  <div v-if="generated !== null" m="t-10">
    <div v-if="generated">
      <div grid="~ cols-3 gap-2" lg="gap-6">
        <div
          grid="~"
          text="md"
          lg="text-lg"
          border="1 rounded gray-400"
          p="y-2"
          shadow="sm gray-300"
          dark="shadow-none"
        >
          <span class="font-bold">Total cases</span>
          <span>{{ result.totalCases }}</span>
        </div>
        <div
          grid="~"
          text="md"
          lg="text-lg"
          border="1 rounded gray-400"
          p="y-2"
          shadow="sm gray-300"
          dark="shadow-none"
        >
          <span class="font-bold">Valid cases</span>
          <span>{{ result.validCases }}</span>
        </div>
        <div
          grid="~"
          text="md"
          lg="text-lg"
          border="1 rounded gray-400"
          p="y-2"
          shadow="sm gray-300"
          dark="shadow-none"
        >
          <span class="font-bold">Expected cases</span>
          <span>{{ result.expectedCases }}</span>
        </div>
      </div>
      <div class="mt-10 lg:mt-28">
        <c-timetable-wrapper :timetables="displayedTimetables" :load-more="loadMoreTimetables" />
      </div>
    </div>
    <div v-else>
      <img src="/gif/thinking.gif" alt="Thinking..." class="mx-auto">
    </div>
  </div>
</template>
