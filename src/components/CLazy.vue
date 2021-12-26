<script setup lang="ts">
const props = defineProps({
  isLast: {
    type: Boolean,
    default: false,
  },
  loadMore: {
    type: Function,
    default: () => {},
  },
})

const shouldRender = ref(false)
const element = ref()

const { stop } = useIntersectionObserver(element, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    shouldRender.value = true

    if (props.isLast) props.loadMore()

    stop()
  }
})
</script>

<template>
  <div ref="element">
    <slot v-if="shouldRender" />
  </div>
</template>
