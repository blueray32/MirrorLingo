import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Theme } from '../styles/designSystem';
import { usePhrasesApi } from '../hooks/usePhrasesApi';

export const ProgressScreen = () => {
  const { profile, isLoading, loadPhrases } = usePhrasesApi();

  useEffect(() => {
    loadPhrases();
  }, []);

  const onRefresh = React.useCallback(() => {
    loadPhrases();
  }, [loadPhrases]);

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Analyzing your Spanish...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Fallback to defaults if no profile exists yet
  const displayProfile = profile || {
    overallTone: 'Neutral',
    overallFormality: 'B1',
    analysisCount: 0,
    commonPatterns: []
  };

  // Map backend values to display values
  const complexity = profile ? (profile.overallFormality === 'formal' ? 'C1' : 'B2') : 'B1';
  const tone = profile ? (profile.overallTone.charAt(0).toUpperCase() + profile.overallTone.slice(1)) : 'Neutral';
  const vocabDepth = profile ? Math.min(95, 40 + (profile.analysisCount * 5)) : 30;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
        }
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Idiolect Analysis</Text>
          <Text style={styles.heroSubtitle}>Your linguistic profile in Spanish</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📈</Text>
            <Text style={styles.statValue}>{complexity}</Text>
            <Text style={styles.statLabel}>Complexity</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎭</Text>
            <Text style={styles.statValue}>{tone}</Text>
            <Text style={styles.statLabel}>Detected Tone</Text>
          </View>
        </View>

        <View style={styles.metricSection}>
          <Text style={styles.sectionTitle}>Vocabulary Depth</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${vocabDepth}%` }]} />
          </View>
          <View style={styles.metricLabels}>
            <Text style={styles.metricLabel}>Limited</Text>
            <Text style={styles.metricValue}>{vocabDepth}% Depth</Text>
            <Text style={styles.metricLabel}>Fluent</Text>
          </View>
        </View>

        {displayProfile.commonPatterns.length > 0 ? (
          <View style={styles.connectorSection}>
            <Text style={styles.sectionTitle}>Detected Patterns</Text>
            <View style={styles.connectorChipContainer}>
              {displayProfile.commonPatterns.map((p: any) => (
                <View key={p.type} style={styles.connectorChip}>
                  <Text style={styles.connectorText}>{p.description}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.connectorSection}>
            <Text style={styles.sectionTitle}>Connectors Used</Text>
            <View style={styles.connectorChipContainer}>
              {['Entonces', 'Pero', 'Sin embargo'].map((word) => (
                <View key={word} style={styles.connectorChip}>
                  <Text style={styles.connectorText}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.proTipBox}>
          <Text style={styles.proTipTitle}>💡 Insights</Text>
          <Text style={styles.proTipText}>
            {profile
              ? `Based on ${profile.analysisCount} analyze phrases, your Spanish is naturally ${profile.overallTone === 'casual' ? 'casual' : 'well-structured'}. Keep practicing to unlock deeper insights!`
              : "Start a conversation or record your voice to generate your personalized linguistic profile."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  loadingText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.md,
    marginTop: Theme.spacing.md,
  },
  heroSection: {
    marginVertical: Theme.spacing.lg,
    alignItems: 'center',
  },
  heroTitle: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
  },
  heroSubtitle: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.md,
    marginTop: Theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: Theme.spacing.xs,
  },
  statValue: {
    color: Theme.colors.primary,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.bold,
  },
  statLabel: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
  },
  metricSection: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sectionTitle: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.typography.sizes.md,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.md,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  metricLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: Theme.colors.textMuted,
    fontSize: 10,
  },
  metricValue: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: Theme.typography.weights.medium,
  },
  connectorSection: {
    marginBottom: Theme.spacing.lg,
  },
  connectorChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  connectorChip: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  connectorText: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: Theme.typography.weights.medium,
  },
  proTipBox: {
    marginTop: Theme.spacing.lg,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.accent,
    marginBottom: Theme.spacing.xl,
  },
  proTipTitle: {
    color: Theme.colors.accent,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: 4,
  },
  proTipText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.sizes.sm,
    lineHeight: 20,
  },
});
