<script setup lang="ts">
const props = defineProps({
  tag: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  storage: {
    type: Array,
    default: () => [],
  },
  maxResult: {
    type: Number,
    default: 10,
  },
  label: {
    type: String,
  },
  color: {
    type: String,
    default: 'primary',
  },
})
const emits = defineEmits(['add', 'remove'])

const input = ref('')
const loading = ref(false)
const selectedItemIndex = ref(-1)

const foundItems = computed(() => {
  if (input.value === '' || input.value === undefined)
    return []

  const tempItems: string[][] = []
  const foundItems: string[] = []

  loading.value = true

  for (const item of (props.storage as string[])) {
    const index = item.toLocaleLowerCase().indexOf(input.value.toLocaleLowerCase())

    if (index === -1)
      continue

    if (!tempItems[index])
      tempItems[index] = []

    tempItems[index].push(item)
  }

  for (const items of tempItems) {
    if (items) {
      for (const item of items) {
        foundItems.push(item)

        if (foundItems.length > props.maxResult)
          break
      }
    }

    if (foundItems.length > props.maxResult)
      break
  }

  loading.value = false

  return foundItems
})

function focusInput(event: any) {
  event.target.querySelector('input').focus()
}

function selectItem(increase: number) {
  if (foundItems.value.length > 0
  && (selectedItemIndex.value > 0
  || (selectedItemIndex.value <= 0 && increase >= 0)))
    selectedItemIndex.value = (selectedItemIndex.value + increase) % foundItems.value.length
}

function insertItem(index?: number) {
  const item = index !== undefined
    ? foundItems.value[index]
    : foundItems.value[selectedItemIndex.value]

  if (item !== undefined && !props.items.includes(item)) {
    emits('add', item, props.tag)

    input.value = ''
    selectedItemIndex.value = -1
  }
}

function deleteItem(index: number) {
  if (input.value === '')
    emits('remove', index, props.tag)
}

// Watch input value
watchEffect(() => {
  const parts = input.value.split(',')

  // Second element of parts exists if input ends with comma character
  if (parts[1] !== undefined && !props.items.includes(parts[0])) {
    emits('add', parts[0], props.tag)

    input.value = ''
  }
})
</script>

<template>
  <div
    flex="~ wrap"
    h="min-8"
    border="1 gray-200 rounded"
    p="4"
    cursor="text"
    shadow="md gray-300"
    dark="border-true-gray-400 shadow-none"
    class="relative"
    @click.self="focusInput"
  >
    <label v-if="label !== undefined" class="flex items-center">
      {{ label }}&#58;
    </label>
    <ul list="none" class="contents">
      <li v-for="(item, key) in items" :key="key" w="max-full" class="float-left">
        <q-chip removable :color="color" text-color="white" @remove="emits('remove', key, tag)">
          {{ item }}
        </q-chip>
      </li>
    </ul>
    <div class="inline">
      <input
        v-model="input"
        type="text"
        h="full"
        border="none"
        p="y-2 l-2"
        bg="transparent"
        class="float-left focus:outline-none"
        @keydown.up="selectItem(-1)"
        @keydown.down="selectItem(1)"
        @keydown.enter="insertItem()"
        @keydown.delete="deleteItem(items.length -1)"
      >
      <ul
        v-if="input !== ''"
        w="full"
        border="1 gray-400"
        p="x-4 y-2"
        bg="white"
        shadow="lg gray-300"
        cursor="pointer"
        z="10"
        transform="~ translate-y-full"
        dark="bg-dark shadow-none"
        class="absolute left-0 bottom-0"
      >
        <template v-if="loading">
          <li p="l-4 py-1" box="content" class="flex items-center justify-center">
            Searching... <noto-v1-thinking-face text="lg" p="l2" />
          </li>
        </template>
        <template v-else-if="foundItems.length !== 0">
          <li
            v-for="(item, key) in foundItems"
            :key="key"
            text="left"
            p="l-4 y-1"
            m="y-2"
            hover="text-black bg-gray-400"
            :class="selectedItemIndex === key ? 'text-black bg-gray-400' : ''"
            class="flex items-center"
            @click="insertItem(key)"
          >
            {{ item }}
            <ion-checkmark-done-circle-outline v-if="items.includes(item)" text="emerald-400" m="l-2" />
          </li>
        </template>
        <template v-else>
          <li p="l-4 y-1" box="content" class="flex items-center justify-center">
            Not found <noto-v1-crying-face text="lg" p="l-2" />
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<style lang="sass">
.q-chip
  .q-chip__content
    @apply max-w-full overflow-hidden
</style>
