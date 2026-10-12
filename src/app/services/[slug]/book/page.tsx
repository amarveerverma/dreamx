import { redirect } from 'next/navigation'

export default function ServiceBookRedirectPage({
  params,
}: {
  params: { slug: string }
}) {
  // Seamlessly route into approved Smart Match booking & reverse bidding workflow
  redirect(`/services/${params.slug}/match`)
}
