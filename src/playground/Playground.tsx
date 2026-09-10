import { lazy, Suspense } from 'react';
import './spatialRelease.css';

const SpatialPlayground = lazy(() => import('../playground-spatial/Playground'));
const ClassicPlayground = lazy(() => import('./ClassicPlayground'));

/** Keep the existing account editor intact while shipping local composition. */
export default function Playground() {
  const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
  const classic = params.get('classic') === '1' || params.has('open');
  const opening = <main className="ew-shell"><h1>Eidos Playground</h1><p>Opening your workspace…</p></main>;
  if (classic) return <Suspense fallback={opening}><ClassicPlayground /></Suspense>;
  return <div className="pg-spatial-shell" data-playground-release="spatial-local-20260910">
    <div className="pg-spatial-release" aria-label="Editor release and storage">
      <strong>Drag &amp; drop · local preview</strong>
      <span>Move labeled hero elements. Add or reorder sections in Your page. Your work stays on this device.</span>
      <a href="/playground/?classic=1">Classic editor / existing projects</a>
    </div>
    <Suspense fallback={opening}><SpatialPlayground /></Suspense>
  </div>;
}
