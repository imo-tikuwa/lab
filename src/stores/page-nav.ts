import { defineStore } from 'pinia'
import { ref } from 'vue'

export type PageSection = 'portfolio' | 'profile' | 'github'

export const PAGE_SECTION_ORDER: Record<PageSection, number> = {
  portfolio: 0,
  profile: 1,
  github: 2,
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
