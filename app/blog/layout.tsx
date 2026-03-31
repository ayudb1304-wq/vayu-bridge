import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </>
  )
}
