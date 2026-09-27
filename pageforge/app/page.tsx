import PageRenderer from '@/features/page-builder/components/renderer/PageRenderer';
import { samplePage } from '@/features/page-builder/domain/sample-page';

export default function HomePage() {
  return <PageRenderer config={samplePage} />;
}
