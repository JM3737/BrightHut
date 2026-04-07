import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './AboutUs.css'

export default function AboutUs() {
  const navigate = useNavigate()
  const [pillar, setPillar] = useState<
    'donors' | 'care' | 'social' | 'security'
  >('donors')
  const [openFaq, setOpenFaq] = useState<string | null>('privacy')

  const pillars = useMemo(
    () => [
      {
        id: 'donors' as const,
        title: 'Donor growth & retention',
        blurb:
          'We help supporters feel seen, understand their impact, and stay connected—without a dedicated marketing team.',
        points: [
          'Understand which campaigns truly move the needle',
          'Spot donors at risk of lapsing and personalize outreach',
          'Connect generosity to outcomes—clearly and respectfully',
        ],
      },
      {
        id: 'care' as const,
        title: 'Case care & resident outcomes',
        blurb:
          'A secure system to help staff manage each resident’s journey: intake → healing → reintegration.',
        points: [
          'Track education, health, counseling, and interventions month by month',
          'See who is progressing, who needs extra support, and why',
          'Keep case work consistent across safehouses and limited staff',
        ],
      },
      {
        id: 'social' as const,
        title: 'Social media that leads to impact',
        blurb:
          'Post with intention—learn what works by platform, timing, and content, then iterate quickly.',
        points: [
          'Analyze which content drives donations vs. vanity metrics',
          'Build a repeatable cadence even with a small team',
          'Turn engagement into informed supporter relationships',
        ],
      },
      {
        id: 'security' as const,
        title: 'Privacy, safety & trust',
        blurb:
          'Because we work with minors who are abuse survivors, we treat privacy as a core feature, not a checkbox.',
        points: [
          'Least-privilege access and restricted fields for sensitive notes',
          'Careful data removal and anonymized reporting',
          'Design choices that protect residents, staff, partners, and donors',
        ],
      },
    ],
    []
  )

  const active = pillars.find((p) => p.id === pillar) ?? pillars[0]

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-tag">About BrightHut</span>
          <h1 className="about-title">
            Building safer futures,
            <span className="about-accent"> one child at a time.</span>
          </h1>
          <p className="about-subtitle">
            BrightHut is inspired by the work of Lighthouse Sanctuary—safe homes for girls who are
            survivors of sexual abuse or sex trafficking in the Philippines. We’re creating the
            technology and systems a new organization needs to serve more regions with the same
            care, accountability, and dignity.
          </p>

          <div className="about-hero-actions">
            <button className="btn-primary" onClick={() => navigate('/#donate')}>
              Donate
            </button>
            <button className="btn-secondary" onClick={() => navigate('/create-account')}>
              Create an account
            </button>
          </div>
        </div>
        <div className="about-hero-visual" aria-hidden="true">
          <div className="about-hero-blob" />
        </div>
      </section>

      <section className="about-section">
        <div className="about-section-header">
          <h2>What we do</h2>
          <p>
            We help mission-driven teams run safehouses, support residents, and communicate impact
            to donors—securely and sustainably.
          </p>
        </div>

        <div className="about-cards">
          <div className="about-card">
            <h3>Protect</h3>
            <p>
              Safe housing and day-to-day operations that prioritize safety, stability, and
              consistent care.
            </p>
          </div>
          <div className="about-card">
            <h3>Rehabilitate</h3>
            <p>
              Structured counseling notes (process recordings), intervention plans, education and
              health tracking, and case conferences.
            </p>
          </div>
          <div className="about-card">
            <h3>Reintegrate</h3>
            <p>
              Home visitation records, readiness signals, and careful follow-up to prevent
              regression and support long-term outcomes.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section about-section--pillars">
        <div className="about-section-header">
          <h2>Our focus areas</h2>
          <p>
            BrightHut is designed around the real-world worries of founders and staff—donor
            retention, resident outcomes, and practical, secure operations.
          </p>
        </div>

        <div className="about-pillars">
          <div className="about-pillars-tabs" role="tablist" aria-label="Focus areas">
            {pillars.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={pillar === p.id}
                className={`about-tab${pillar === p.id ? ' about-tab--active' : ''}`}
                onClick={() => setPillar(p.id)}
              >
                {p.title}
              </button>
            ))}
          </div>

          <div className="about-pillars-panel" role="tabpanel">
            <h3>{active.title}</h3>
            <p className="about-panel-blurb">{active.blurb}</p>
            <ul className="about-panel-list">
              {active.points.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <div className="about-panel-cta">
              <Link className="about-link" to="/donors">
                Explore the Donors Portal →
              </Link>
              <Link className="about-link" to="/social">
                Explore the Social Media Portal →
              </Link>
              <Link className="about-link" to="/participants">
                Explore the Participants Portal →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-section-header">
          <h2>Privacy is paramount</h2>
          <p>
            We work with highly sensitive data involving minors. Our approach is simple: collect
            only what’s needed, protect it by default, and share impact in ways that never
            compromise safety.
          </p>
        </div>

        <div className="about-faq">
          <button
            type="button"
            className={`about-faq-item${openFaq === 'privacy' ? ' open' : ''}`}
            onClick={() => setOpenFaq((v) => (v === 'privacy' ? null : 'privacy'))}
            aria-expanded={openFaq === 'privacy'}
          >
            <span className="about-faq-q">How do we protect resident privacy?</span>
            <span className="about-faq-icon">+</span>
          </button>
          {openFaq === 'privacy' && (
            <div className="about-faq-a">
              We separate restricted notes, limit access by role, and design reporting around
              anonymized aggregates. When details must exist, they are treated as sensitive by
              default—not as ordinary text fields.
            </div>
          )}

          <button
            type="button"
            className={`about-faq-item${openFaq === 'ops' ? ' open' : ''}`}
            onClick={() => setOpenFaq((v) => (v === 'ops' ? null : 'ops'))}
            aria-expanded={openFaq === 'ops'}
          >
            <span className="about-faq-q">How do we keep operations manageable?</span>
            <span className="about-faq-icon">+</span>
          </button>
          {openFaq === 'ops' && (
            <div className="about-faq-a">
              BrightHut is built for small teams: clear data entry, searchable records, and careful
              update/removal workflows. The goal is to reduce “spreadsheet chaos” without creating
              administrative burden.
            </div>
          )}

          <button
            type="button"
            className={`about-faq-item${openFaq === 'impact' ? ' open' : ''}`}
            onClick={() => setOpenFaq((v) => (v === 'impact' ? null : 'impact'))}
            aria-expanded={openFaq === 'impact'}
          >
            <span className="about-faq-q">How do donors see the difference they make?</span>
            <span className="about-faq-icon">+</span>
          </button>
          {openFaq === 'impact' && (
            <div className="about-faq-a">
              We connect donations to program areas and safehouse outcomes using transparent,
              privacy-preserving summaries—so supporters understand what their generosity changes,
              without exposing identities.
            </div>
          )}
        </div>
      </section>

      <section className="about-cta">
        <div className="about-cta-card">
          <h2>Be the steady place a child can count on</h2>
          <p>
            A safe home is built on everyday needs: meals, staff care, education materials, health
            checkups, and patient counseling. Your donation helps make that stability possible.
          </p>
          <div className="about-cta-actions">
            <button className="btn-primary" onClick={() => navigate('/#donate')}>
              Give today
            </button>
            <Link className="btn-secondary btn-secondary--link" to="/privacy">
              Read our privacy approach
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
