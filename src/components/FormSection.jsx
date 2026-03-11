import { useState } from 'react'
import './FormSection.css'

export default function FormSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="form-section">
      <h2 className="form-section__title" onClick={() => setOpen(!open)}>
        {title}
        <span className={`form-section__arrow ${open ? 'open' : ''}`}>&#9662;</span>
      </h2>
      {open && <div className="form-section__content">{children}</div>}
    </section>
  )
}
