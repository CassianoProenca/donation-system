import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between gap-4 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <ModeToggle />
      </div>
    </header>
  )
}
