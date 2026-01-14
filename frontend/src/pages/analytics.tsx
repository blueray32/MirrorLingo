import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import { usePhrasesApi } from '../hooks/usePhrasesApi';
import styles from './analytics.module.css';

const UnifiedAnalyticsDashboard = dynamic(() =>
  import('../components/UnifiedAnalyticsDashboard').then(mod => mod.UnifiedAnalyticsDashboard),
  { ssr: false }
);

const IdiolectAnalysis = dynamic(() =>
  import('../components/IdiolectAnalysis').then(mod => mod.IdiolectAnalysis),
  { ssr: false }
);

const DEMO_USER_ID = 'demo-user-123';

export default function AnalyticsPage() {
  const { phrases, profile, isLoading, loadPhrases } = usePhrasesApi(DEMO_USER_ID);

  useEffect(() => {
    loadPhrases();
  }, [loadPhrases]);

  return (
    <Layout currentPage="analytics">
      <div className={styles.container}>
        {phrases.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No phrases yet</h2>
            <p>Record some phrases on the Home page to see your analysis.</p>
          </div>
        ) : (
          <div className={styles.analyticsContent}>
            <UnifiedAnalyticsDashboard />
            
            <div className={styles.detailedAnalysis}>
              <h3>Detailed Idiolect Analysis</h3>
              <IdiolectAnalysis
                phrases={phrases}
                profile={profile}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
