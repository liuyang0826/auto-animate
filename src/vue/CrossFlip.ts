import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import { update as defaultUpdate, duration as defaultDuration, easing as defaultEasing } from '../defaults'
import { Options } from '../types'

const rectMap = /* @__PURE__ */ new Map<string, DOMRect>()

export const CrossFlip = /* @__PURE__ */ defineComponent({
  props: {
    id: { type: String as PropType<string>, required: true },
    duration: { type: Number as PropType<number>, default: defaultDuration },
    easing: { type: String as PropType<Options['easing']>, default: defaultEasing },
    tag: { type: String as PropType<string>, default: 'div' },
    update: Function as PropType<Options['update']>,
  },
  setup(props, { slots }) {
    const rootRef = ref<Element | null>(null)

    onMounted(() => {
      const root = rootRef.value
      if (!root) return
      const oldRect = rectMap.get(props.id)
      if (!oldRect) return
      const effect = (props.update || defaultUpdate)(root, oldRect, props.duration, props.easing as string)
      if (!effect) return
      const animation = new Animation(effect)
      animation.play()
    })

    onBeforeUnmount(async () => {
      const rect = rootRef.value?.getBoundingClientRect()
      if (!rect) return
      rectMap.set(props.id, rect)
      await nextTick()
      rectMap.delete(props.id)
    })

    return () => h(props.tag, { ref: rootRef }, slots.default?.())
  },
})
