<script setup lang="ts">
import courseData from '~/data/courses-searching.json'
import lecturerData from '~/data/lecturers-with-major-searching.json'
import { useCourseStore } from '~/stores/course'
import type { PartialCourse, TimetableGenerationResult } from '~/types'
import { gogogogogo } from '~/workers/timetable-generator'
import Worker from '~/workers/timetable-generator?worker'
import { isDark } from '~/composables'
import { useFilterStore } from '~/stores/filter'

const {
  courses,
  addCourse,
  removeCourse,
} = useCourseStore()
const {
  filters,
  filterState,
  updateSpecificDays,
  addLecturer,
  removeLecturer,
  cleanFilter,
} = useFilterStore()

const haveWorker = window.Worker !== undefined
const result = ref<TimetableGenerationResult>({
  totalCases: 0,
  validCases: 0,
  expectedCases: 0,
  timetables: [],
})
const displayedTimetables = ref<PartialCourse[][][]>([])
const generated = ref<null | boolean>(null)
const batch = 5

function loadMoreTimetables() {
  const currentLength = displayedTimetables.value.length

  displayedTimetables.value.push(
    ...result.value.timetables.slice(currentLength, currentLength + batch))
}

function gogogoggo() {
  generated.value = false

  if (haveWorker) {
    const worker = new Worker()

    worker.postMessage([JSON.stringify(courses), JSON.stringify(filters)])

    worker.onmessage = (e) => {
      const r = JSON.parse(e.data[0]) as TimetableGenerationResult

      generated.value = true
      result.value = r
      displayedTimetables.value = result.value.timetables.slice(0, batch)
    }
  }
  // If browser do not support Web Workers (may be crashed)
  else {
    const r = gogogogogo(courses, filters)

    generated.value = true
    result.value = r
    displayedTimetables.value = result.value.timetables.slice(0, batch)
  }

  cleanFilter()

  setTimeout(() => {
    window.scrollTo(0, document.body.scrollHeight)
  }, 50)
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
    <div grid="~ col-span-2 gap-8" lg="grid-cols-2">
      <div>
        <p text="xl" font="bold">
          Number of relaxation days
        </p>

        <q-input
          v-model="filters.day.numberOfRelaxationDays"
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
    <div grid="col-span-2">
      <p text="xl" font="bold" m="b-0">
        Lecturers
      </p>
      <div class="flex justify-around">
        <div
          v-for="(course, key) in courses"
          :key="key"
          w="full"
          p="x-2"
          m="t-8"
          lg="w-1/2"
          xl="w-1/4"
        >
          <p font="bold" mb="2" md="col-span-2" lg="col-span-4">
            {{ course }}
          </p>
          <c-selection
            :tag="`expected.${course}`"
            :items="filters.lecturer.expected[course]"
            :storage="lecturerData[course as keyof typeof lecturerData]"
            label="Expect"
            color="secondary"
            class="mb-4"
            @add="addLecturer"
            @remove="removeLecturer"
          />
          <c-selection
            :tag="`unexpected.${course}`"
            :items="filters.lecturer.unexpected[course]"
            :storage="lecturerData[course as keyof typeof lecturerData]"
            label="Unexpect"
            color="negative"
            @add="addLecturer"
            @remove="removeLecturer"
          />
        </div>
      </div>
    </div>
  </div>

  <q-btn outline label="Generate" :dark="isDark" m="t-8" @click="gogogoggo" />

  <div v-if="generated !== null" m="t-10">
    <div v-if="generated">
      <div grid="~ cols-3 gap-2" lg="gap-6">
        <div
          grid="~"
          text="md"
          lg="text-lg"
          border="1 rounded gray-200"
          p="y-2"
          shadow="sm gray-300"
          dark="border-true-gray-400 shadow-none"
        >
          <span class="font-bold">Total cases</span>
          <span>{{ result.totalCases }}</span>
        </div>
        <div
          grid="~"
          text="md"
          lg="text-lg"
          border="1 rounded gray-200"
          p="y-2"
          shadow="sm gray-300"
          dark="border-true-gray-400 shadow-none"
        >
          <span class="font-bold">Valid cases</span>
          <span>{{ result.validCases }}</span>
        </div>
        <div
          grid="~"
          text="md"
          lg="text-lg"
          border="1 rounded gray-200"
          p="y-2"
          shadow="sm gray-300"
          dark="border-true-gray-400 shadow-none"
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
      <img src="/images/thinking.jpeg" alt="Thinking..." class="mx-auto">
    </div>
  </div>
</template>
