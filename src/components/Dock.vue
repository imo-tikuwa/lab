<script setup lang="ts">
import { useMotionValue, useSpring, useTransform } from 'motion-v'

export type SpringOptions = NonNullable<Parameters<typeof useSpring>[1]>

export type DockItemData = {
  icon: unknown
  label: unknown
  onClick: () => void
  className?: string
}

type DockProps = {
  items: DockItemData[]
  className?: string
  distance?: number
  panelHeight?: number
  baseItemSize?: number
  dockHeight?: number
  magnification?: number
  spring?: SpringOptions
}

const props = withDefaults(defineProps<DockProps>(), {
  className: '',
  distance: 200,
  panelHeight: 64,
  baseItemSize: 50,
  dockHeight: 256,
  magnification: 70,
  spring: () => ({ mass: 0.1, stiffness: 150, damping: 12 }),
})

// ── サブコンポーネント ─────────────────────────────────────────────

const DockIcon = defineComponent({
  name: 'DockIcon',
  render() {
    return h('div', { class: 'flex items-center justify-center' }, this.$slots.default?.())
  },
})

const DockLabel = defineComponent({
  name: 'DockLabel',
  props: {
    isHovered: {
      type: Object as () => ReturnType<typeof useMotionValue<number>>,
      required: true,
    },
  },
  setup(labelProps) {
    const isVisible = ref(false)
    let unsubscribe: (() => void) | null = null

    onMounted(() => {
      unsubscribe = labelProps.isHovered.on('change', (latest: number) => {
        isVisible.value = latest === 1
      })
    })
    onUnmounted(() => {
      if (unsubscribe) unsubscribe()
    })

    return { isVisible }
  },
  render() {
    return h(
      'div',
      {
        class: 'absolute -top-9 left-1/2 w-fit whitespace-pre rounded-md border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-950 px-2 py-0.5 text-xs text-surface-700 dark:text-surface-200 transition-all duration-200',
        role: 'tooltip',
        style: {
          transform: 'translateX(-50%)',
          opacity: this.isVisible ? 1 : 0,
          visibility: this.isVisible ? 'visible' : 'hidden',
        },
      },
      this.$slots.default?.(),
    )
  },
})

const DockItem = defineComponent({
  name: 'DockItem',
  props: {
    className: { type: String, default: '' },
    onClick: { type: Function, default: () => {} },
    mouseX: {
      type: Object as () => ReturnType<typeof useMotionValue<number>>,
      required: true,
    },
    spring: { type: Object as () => SpringOptions, required: true },
    distance: { type: Number, required: true },
    baseItemSize: { type: Number, required: true },
    magnification: { type: Number, required: true },
    item: { type: Object as () => DockItemData, required: true },
  },
  setup(itemProps) {
    const itemRef = ref<HTMLDivElement>()
    const itemIsHovered = useMotionValue(0)
    const currentSize = ref(itemProps.baseItemSize)

    const mouseDistance = useTransform(itemProps.mouseX, (val: number) => {
      const rect = itemRef.value?.getBoundingClientRect() ?? { x: 0, width: itemProps.baseItemSize }
      return val - rect.x - itemProps.baseItemSize / 2
    })

    const targetSize = useTransform(
      mouseDistance,
      [-itemProps.distance, 0, itemProps.distance],
      [itemProps.baseItemSize, itemProps.magnification, itemProps.baseItemSize],
    )
    const size = useSpring(targetSize, itemProps.spring)

    let unsubscribeSize: (() => void) | null = null
    onMounted(() => {
      unsubscribeSize = size.on('change', (latest: number) => {
        currentSize.value = latest
      })
    })
    onUnmounted(() => {
      if (unsubscribeSize) unsubscribeSize()
    })

    const handleHoverStart = () => itemIsHovered.set(1)
    const handleHoverEnd = () => itemIsHovered.set(0)
    const handleFocus = () => itemIsHovered.set(1)
    const handleBlur = () => itemIsHovered.set(0)

    return { itemRef, currentSize, itemIsHovered, handleHoverStart, handleHoverEnd, handleFocus, handleBlur }
  },
  render() {
    const icon =
      typeof this.item.icon === 'function'
        ? (this.item.icon as () => unknown)()
        : this.item.icon
    const label =
      typeof this.item.label === 'function'
        ? (this.item.label as () => unknown)()
        : this.item.label

    return h(
      'div',
      {
        ref: 'itemRef',
        style: { width: this.currentSize + 'px', height: this.currentSize + 'px' },
        onMouseenter: this.handleHoverStart,
        onMouseleave: this.handleHoverEnd,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
        onClick: this.onClick,
        class: `relative cursor-pointer inline-flex items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-md transition-shadow ${this.className ?? ''}`,
        tabindex: 0,
        role: 'button',
        'aria-haspopup': 'true',
      },
      [
        h(DockIcon, {}, () => [icon]),
        h(DockLabel, { isHovered: this.itemIsHovered }, () => [label]),
      ],
    )
  },
})

// ── メインコンポーネントのロジック ─────────────────────────────────

const mouseX = useMotionValue(Infinity)
const dockIsHovered = useMotionValue(0)
const currentHeight = ref(props.panelHeight)

const maxHeight = computed(() =>
  Math.max(props.dockHeight, props.magnification + props.magnification / 2 + 4),
)

const heightRow = useTransform(dockIsHovered, [0, 1], [props.panelHeight, maxHeight.value])
const height = useSpring(heightRow, props.spring)

let unsubscribeHeight: (() => void) | null = null

onMounted(() => {
  unsubscribeHeight = height.on('change', (latest: number) => {
    currentHeight.value = latest
  })
})

onUnmounted(() => {
  if (unsubscribeHeight) unsubscribeHeight()
})

const handleMouseMove = (event: MouseEvent) => {
  dockIsHovered.set(1)
  mouseX.set(event.pageX)
}

const handleMouseLeave = () => {
  dockIsHovered.set(0)
  mouseX.set(Infinity)
}
</script>

<template>
  <div
    :style="{ height: currentHeight + 'px', scrollbarWidth: 'none' }"
    class="relative flex items-center mx-2 max-w-full"
  >
    <div
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      :class="`${props.className} absolute bottom-2 left-1/2 -translate-x-1/2 flex items-end w-fit gap-4 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-950/80 backdrop-blur-sm pb-2 px-4`"
      :style="{ height: props.panelHeight + 'px' }"
      role="toolbar"
      aria-label="ナビゲーション"
    >
      <DockItem
        v-for="(item, index) in props.items"
        :key="index"
        :onClick="item.onClick"
        :className="item.className"
        :mouseX="mouseX"
        :spring="props.spring"
        :distance="props.distance"
        :magnification="props.magnification"
        :baseItemSize="props.baseItemSize"
        :item="item"
      />
    </div>
  </div>
</template>
