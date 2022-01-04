<script setup lang="ts">
import { isDark, toggleDark } from '~/composables'
</script>

<template>
  <q-toolbar>
    <q-toolbar-title class="text-left">
      <a title="Owner" href="https://github.com/TP-O" target="_blank">
        TP-O
      </a>
    </q-toolbar-title>
    <q-btn
      round
      title="Timetable"
      class="mx-2"
      to="/"
    >
      <mdi-timetable />
    </q-btn>
    <q-btn
      round
      title="Authenticate"
      class="mx-2"
      to="/auth"
    >
      <ph-user-circle />
    </q-btn>
    <q-btn
      round
      title="Theme"
      class="mx-2"
      @click="toggleDark()"
    >
      <carbon-moon v-if="isDark" />
      <carbon-sun v-else />
    </q-btn>
    <q-btn
      round
      type="a"
      href="https://github.com/hcmiu-project/course-timetable-generator"
      target="_blank"
      class="mx-2"
    >
      <carbon-logo-github title="Github" />
    </q-btn>
  </q-toolbar>
</template>
