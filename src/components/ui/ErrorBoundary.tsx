import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface Props { children: ReactNode }
interface State { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch() {}

  render() {
    if (this.state.failed) {
      return <main className="mx-auto max-w-xl px-6 py-16 text-center" role="alert"><h1 className="text-2xl font-semibold text-fg">This page hit a problem</h1><p className="mt-3 text-muted">Your saved profile and applications are still in this browser. Reload to try again.</p><Button className="mt-6" onClick={() => window.location.reload()}>Reload page</Button></main>;
    }
    return this.props.children;
  }
}
