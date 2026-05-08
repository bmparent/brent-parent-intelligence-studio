import { services } from '../data/services'
import { SectionShell } from '../components/layout/SectionShell'
import { ServiceNode } from '../components/ui/ServiceNode'

export function Services() {
  return (
    <SectionShell
      id="services"
      eyebrow="Services"
      title="Client-facing modules for better sites, cleaner workflows, and smarter systems."
      intro="Each service is scoped around the business outcome first, then shaped into the right technical system."
      className="services-section"
    >
      <div className="service-pipeline">
        {services.map((service, index) => (
          <ServiceNode key={service.id} service={service} index={index} />
        ))}
      </div>
    </SectionShell>
  )
}
