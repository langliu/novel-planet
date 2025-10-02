import { Fragment } from 'react'
import { useBreadcrumb } from '@/app/(admin)/admin/breadcrumb-provider'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function HeaderBreadcrumb() {
  const { items } = useBreadcrumb()

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const itemKey = `${item.label}-${index}`
          return (
            <Fragment key={itemKey}>
              <BreadcrumbItem className={index === 0 ? 'hidden md:block' : ''}>
                {index < items.length - 1 ? (
                  <BreadcrumbLink href={item.href || '#'}>
                    {item.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
