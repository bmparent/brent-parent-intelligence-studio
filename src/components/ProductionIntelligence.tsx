import { productionDashboardUrl } from '../data/portfolio';
import { externalLinkProps } from '../utils';
import { SectionHeader } from './SectionHeader';

const dashboardSignals = [
  'Custom date range',
  'Department filter',
  'Late / due status counters',
  'Searchable production table',
  'Include-completed toggle',
  'CSV export',
  'Admin refresh path'
];

const tableColumns = ['Prod Due', 'Dept', 'Invoice', 'Customer', 'Job / Nickname', 'Qty', 'Status', 'Tags'];

export function ProductionIntelligence() {
  return (
    <section id="production" className="section-shell section-block production" aria-labelledby="production-title">
      <SectionHeader
        id="production-title"
        eyebrow="Production intelligence / reporting case study"
        title="DG Printavo Production Reports — operational visibility for daily planning."
        summary="A grounded reporting dashboard case study focused on production schedule visibility, department-level filtering, date-range review, work-order scanning, and business decision support."
      />

      <div className="production-layout">
        <article className="production-copy" data-reveal>
          <p className="section-kicker">Operational system, not a marketing mockup</p>
          <h3>From production schedule data to planning-ready views.</h3>
          <p>
            The dashboard is framed around practical production questions: what is late, what is due soon, which department is involved, and how quickly a team can search, filter, export, or refresh the current view.
          </p>
          <div className="insight-list" aria-label="Verified dashboard functionality">
            {dashboardSignals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
          <a className="btn btn--primary" href={productionDashboardUrl} {...externalLinkProps('Open DG Printavo Production Reports dashboard')}>
            Open live dashboard
          </a>
        </article>

        <article className="dashboard-card" aria-label="Production report interface preview" data-reveal>
          <div className="dashboard-card__topbar">
            <span />
            <span />
            <span />
            <strong>Printavo Production Reports</strong>
          </div>
          <div className="dashboard-card__metrics">
            {['Late', 'Due Today', 'Due Tomorrow', 'This Week'].map((metric) => (
              <div key={metric}>
                <small>{metric}</small>
                <strong>—</strong>
              </div>
            ))}
          </div>
          <div className="dashboard-card__filters" aria-label="Dashboard filter controls preview">
            {['Range: Custom', 'Department: ALL', 'From', 'To', 'Search', 'Export CSV'].map((filter) => (
              <span key={filter}>{filter}</span>
            ))}
          </div>
          <div className="dashboard-card__table" aria-label="Dashboard table columns preview">
            {tableColumns.map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>
          <p>
            Built to help production teams see the schedule as a working system: statuses, due dates, departments, quantities, links, and notes in one scannable view.
          </p>
        </article>
      </div>
    </section>
  );
}
