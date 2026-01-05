# Project Structure

```
MirrorLingo/
├── README.md                    # Main project documentation
├── DEMO_READY.md               # Quick demo instructions
├── package.json                # Root workspace configuration
├── jest.config.js              # Test configuration
├── .gitignore                  # Git ignore rules
│
├── frontend/                   # Next.js React application
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/             # Next.js pages
│   │   ├── hooks/             # React hooks
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json           # Frontend dependencies
│
├── backend/                    # AWS Lambda functions
│   ├── src/
│   │   ├── handlers/          # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── models/            # Data models
│   │   └── utils/             # Shared utilities
│   └── package.json           # Backend dependencies
│
├── infrastructure/             # AWS infrastructure
│   ├── template.yaml          # SAM template
│   └── scripts/               # Deployment scripts
│
├── tests/                     # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   ├── property/              # Property-based tests
│   └── setup/                 # Test configuration
│
├── .kiro/                     # Kiro CLI configuration
│   ├── steering/              # Project specifications
│   └── prompts/               # Custom prompts
│
└── docs/                      # Detailed documentation
    ├── HACKATHON_SUBMISSION.md
    ├── DEPLOYMENT.md
    ├── FEATURES.md
    └── ...
```

## Key Files

### Configuration
- `package.json` - Root workspace with unified scripts
- `jest.config.js` - Centralized test configuration
- `.gitignore` - Proper exclusion of build artifacts

### Frontend (Next.js + TypeScript)
- `frontend/src/pages/index.tsx` - Main application page
- `frontend/src/components/` - Reusable UI components
- `frontend/src/hooks/` - API integration hooks

### Backend (AWS Lambda + TypeScript)
- `backend/src/handlers/` - API endpoint handlers
- `backend/src/services/` - Core business logic
- `backend/src/models/` - Data models and validation

### Infrastructure
- `infrastructure/template.yaml` - AWS SAM template
- `infrastructure/scripts/` - Deployment automation

### Testing
- `tests/setup/aws-mocks.ts` - AWS service mocks
- `tests/unit/` - Component and function tests
- `tests/integration/` - API endpoint tests
- `tests/property/` - Algorithm validation tests
