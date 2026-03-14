import { defineStore } from 'pinia'
import { ref } from 'vue'

export type PageSection = 'portfolio' | 'timeline' | 'profile' | 'github'

export const PAGE_SECTION_ORDER: Record<PageSection, number> = {
  portfolio: 0,
  timeline: 1,
  profile: 2,
  github: 3,
}

export const usePageNavStore = defineStore(
  'page-nav',
  () => {
    const currentSection = ref<PageSection>('profile')
    const previousSection = ref<PageSection>('profile')

    function navigate(section: PageSection): void {
      if (section === currentSection.value) return
      previousSection.value = currentSection.value
      currentSection.value = section
    }

    return { currentSection, previousSection, navigate }
  },
  {
    persist: {
      pick: ['currentSection'],
    },
  },
)
