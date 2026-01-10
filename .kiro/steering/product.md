# Product Overview

## Product Purpose
MirrorLingo is a web application that learns a user's everyday English speaking style through voice recording or text input (their common phrases, cadence, and intents) and transforms it into correct, natural Spanish translations plus daily micro-practice through spaced repetition, drills, and quick coaching on recurring mistakes. Unlike generic language apps that teach everyone the same phrases, MirrorLingo creates a personalized Spanish learning experience based on how you actually speak.

## Target Users
**Primary Audience**: English-speaking adults learning Spanish who are busy with work and family responsibilities.

**User Needs**:
- Want Spanish practice that matches their real-life communication patterns
- Need efficient learning that fits into busy schedules
- Prefer relevant phrases for work, parenting, errands, and daily conversations
- Desire personalized feedback on their specific speaking habits and mistakes
- Want to sound natural in Spanish, not robotic or textbook-like

**User Personas**:
- Working professionals who need Spanish for client interactions
- Parents wanting to communicate with Spanish-speaking caregivers or community
- Adults handling daily errands in bilingual environments
- Busy learners who want targeted practice over broad curriculum

## Key Features
- **Voice & Text Input**: Record yourself speaking naturally or type daily phrases for analysis
- **Idiolect Analysis**: Captures and analyzes user's personal speaking patterns and common phrases
- **Speech-to-Text Processing**: AWS Transcribe converts voice recordings to analyzable text
- **Dual Translation System**: Provides both literal and natural Spanish translations with explanations
- **Intent Clustering**: Groups phrases by context (work, family, errands) for organized learning
- **Spaced Repetition Practice**: Adaptive scheduling based on user performance and retention
- **Real-Time Pronunciation Feedback**: Advanced pronunciation analysis with regional accent support
- **Regional Spanish Accents**: Choose from 5 Spanish accent variants (Spain, Mexico, Argentina, Colombia, Neutral)
- **Phoneme-Specific Training**: Targeted practice for difficult Spanish sounds (rr, ñ, ll, etc.)
- **Integrated Pronunciation Practice**: Pronunciation coaching within spaced repetition sessions
- **Mistake Coaching**: Identifies recurring errors and provides targeted micro-lessons
- **Audio Pronunciation**: Text-to-speech for Spanish phrases to aid pronunciation learning
- **Progress Tracking**: Visual feedback on learning progress and phrase mastery

## Business Objectives
- **User Engagement**: High daily active usage through personalized, relevant content
- **Learning Effectiveness**: Measurable improvement in Spanish retention and usage confidence
- **User Satisfaction**: Positive feedback on relevance and practicality of learned phrases
- **Scalability**: Efficient AWS serverless architecture supporting growth without infrastructure overhead
- **Hackathon Success**: Demonstrate innovative use of AI personalization in language learning

## User Journey
1. **Onboarding**: User signs up and chooses input method (voice recording or text input)
2. **Data Collection**: User records natural speech or inputs 5-10 common English phrases
3. **Analysis**: System analyzes speaking style, tone, and intent patterns from audio/text
4. **Spanish Generation**: AI creates personalized Spanish lessons with literal/natural translations
5. **Learning**: User reviews dual translations, explanations, and cultural context
6. **Style Matching**: Visual feedback shows how well Spanish preserves their personality
7. **Practice**: Daily spaced repetition sessions with personalized Spanish phrases
8. **Pronunciation Practice**: Optional pronunciation coaching with regional accent selection
9. **Feedback**: System tracks performance and adjusts difficulty/frequency
10. **Expansion**: User adds new phrases over time, building their personal Spanish vocabulary
11. **Mastery**: Graduated phrases become part of user's active Spanish vocabulary

## Success Criteria
- **Engagement**: Users complete daily practice sessions 5+ days per week
- **Retention**: 80%+ accuracy on phrases after 3 successful spaced repetition cycles
- **Relevance**: Users rate 90%+ of generated content as "useful for my daily life"
- **Progress**: Measurable improvement in Spanish confidence through self-assessment surveys
- **Technical**: <2 second response time for lesson generation, 99%+ uptime
- **Hackathon**: Clear demonstration of spec-driven development and innovative AI personalization

## Feature Implementation Guidance
**Minimal Viable Implementation**: Each feature should have a demo-functional version that demonstrates core value to users, with a clear upgrade path to production-ready implementation.

**Demo vs Production Modes**:
- **Demo Mode**: Enhanced mock APIs with realistic responses for hackathon demonstrations
- **Production Mode**: Full external service integration with real-time processing and scalability
- **Upgrade Path**: Clear documentation for converting demo implementations to production-ready versions

**Documentation Maintenance**: All feature implementations must include updates to relevant documentation (README, API docs, user guides) as part of the implementation tasks.
