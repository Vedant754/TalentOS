import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  InboxIcon,
  TrendingUpIcon,
} from '../icons';

export const DashboardHero = ({ eyebrow, title, description, children }) => (
  <section className="dashboard-hero">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="hero-copy">{description}</p>}
    </div>
    {children && <div className="hero-actions">{children}</div>}
  </section>
);

export const MetricCard = ({ icon: Icon = TrendingUpIcon, label, value, detail, tone = 'blue' }) => (
  <article className={`metric-card metric-${tone}`}>
    <div className="metric-icon">
      <Icon />
    </div>
    <div>
      <p>{label}</p>
      <strong>{value}</strong>
      {detail && <span>{detail}</span>}
    </div>
  </article>
);

export const Panel = ({ title, description, action, children, className = '' }) => (
  <section className={`panel ${className}`.trim()}>
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const EmptyState = ({ title = 'Nothing here yet', description, icon: Icon = InboxIcon }) => (
  <div className="empty-state">
    <Icon />
    <strong>{title}</strong>
    {description && <p>{description}</p>}
  </div>
);

export const InlineAlert = ({ type = 'error', children }) => (
  <div className={`inline-alert inline-alert-${type}`}>
    {type === 'success' ? <CheckCircleIcon /> : <AlertCircleIcon />}
    <span>{children}</span>
  </div>
);

export const LoadingRows = ({ rows = 4 }) => (
  <div className="loading-stack" aria-label="Loading content">
    {Array.from({ length: rows }).map((_, index) => (
      <div className="skeleton-row" key={index} />
    ))}
  </div>
);

export const StatusPill = ({ status }) => {
  const normalisedStatus = status || 'pending';
  return (
    <span className={`status-pill status-${normalisedStatus}`}>
      <ClockIcon />
      {normalisedStatus}
    </span>
  );
};
