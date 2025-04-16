# GitHub Repository Analyzer

A Next.js static application to analyze public GitHub repositories with detailed statistics and visualizations.

## Features

### Core Functionality

- **GitHub URL Analysis**  
  Input a public repository URL to:
  - Display summary metadata (name, description, primary language)
  - View engagement metrics (stars, forks, watchers)
  - Show last update date

### Branch Insights

- List available branches
- Commit history per branch:
  - Commit messages
  - Author details
  - Timestamp
  - Direct commit links

### Data Visualizations

- Language distribution (pie chart)
- Commit activity (monthly histogram)
- Key metrics:
  - Total branches
  - Release count
  - Update frequency

### GitHub Integration

- OAuth authentication for:
  - Higher API rate limits
  - Private repository access
  - User session management

### Usage

Input GitHub URL
Example: https://github.com/vercel/next.js

Explore Dashboard

"Summary" tab for repository overview

"Branches" tab for commit history

"Analytics" tab for data visualizations

GitHub Login (optional)
Click "Connect GitHub" to:

Access private repositories

Increase API request limits
