'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbContextType = {
  items: BreadcrumbItem[]
  setBreadcrumb: (items: BreadcrumbItem[]) => void
  updateBreadcrumb: (index: number, item: BreadcrumbItem) => void
  addBreadcrumb: (item: BreadcrumbItem) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([])

  const setBreadcrumb = useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems)
  }, [])

  const updateBreadcrumb = useCallback(
    (index: number, item: BreadcrumbItem) => {
      const newItems = [...items]
      newItems[index] = item
      setItems(newItems)
    },
    [items]
  )

  const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setItems((prev) => [...prev, item])
  }, [])

  return (
    <BreadcrumbContext.Provider
      value={{
        addBreadcrumb,
        items,
        setBreadcrumb,
        updateBreadcrumb,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext)
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}
