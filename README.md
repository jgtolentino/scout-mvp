# Scout Analytics MVP

> Retail intelligence dashboard for the Philippine market

A production-ready analytics dashboard built with React, TypeScript, and Supabase, featuring real-time insights, demographic analytics, and AI-powered recommendations.

## ✨ Features

- 📊 **Executive Dashboard** - Real-time KPIs and performance metrics
- 📈 **Transaction Trends** - Temporal and regional analysis  
- 🛍️ **Product Mix Analysis** - Category and brand performance
- 👥 **Consumer Insights** - Demographics and behavioral patterns
- 🤖 **AI-Powered Insights** - Azure OpenAI integration
- 🎯 **Advanced Filtering** - Multi-dimensional data filtering
- 📱 **Responsive Design** - Optimized for all devices

## 🚀 Quick Start

### 🏃‍♂️ Run the interactive demo (no database required)

```bash
git clone https://github.com/jgtolentino/scout-mvp.git
cd scout-mvp
npm install
cp .env.example .env
echo "VITE_SCOUT_DEMO=on" >> .env
npm run dev          # Opens http://localhost:5173 (all data in memory)
```

*No Supabase keys required. Includes 5,000 realistic FMCG transactions.*

### 🔧 Full production setup

```bash
git clone https://github.com/jgtolentino/scout-mvp.git
cd scout-mvp
npm install

# Setup database (one command)
export SUPABASE_DB_URL="postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
./fix_all.sh

# Start development
npm run dev
```

[📖 Full documentation](./docs/) | [🔧 Installation guide](./docs/quick-start.md)

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Charts**: Recharts with interactive visualizations
- **State**: Zustand with URL persistence
- **Database**: Supabase (PostgreSQL + RLS + Real-time)
- **AI**: Azure OpenAI for insights generation
- **Testing**: Vitest + Playwright + Testing Library

## Database Setup

### 1. Create a New Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Note your project URL and anon key

### 2. Run Database Migrations (Automated)

**Quick automated setup (recommended):**

```bash
# Set your database URL
export SUPABASE_DB_URL="postgres://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Run the automated fix
./fix_all.sh

# Verify everything worked
./verify_fix.sh
```

This automatically:
- ✅ Fixes function overloads
- ✅ Adds demographic columns
- ✅ Enables Row-Level Security
- ✅ Populates 5000 transactions with data

**Manual setup (alternative):**

If you prefer manual setup, see `MIGRATION_GUIDE.md` for SQL to run in Supabase SQL Editor.

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# For AI Insights (optional)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_azure_api_key
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Database Schema

### Core Tables

- **brands**: Product brand information
- **products**: Product catalog with categories and pricing
- **stores**: Store locations and details
- **customers**: Customer demographic information
- **transactions**: Transaction records
- **transaction_items**: Individual items within transactions

### Analytics Functions

- `get_dashboard_summary()`: Overall KPIs and metrics
- `get_location_distribution()`: Store and location performance
- `get_product_categories_summary()`: Category performance
- `get_brand_performance()`: Brand analysis
- `get_daily_trends()`: Daily revenue trends
- `get_hourly_trends()`: Hourly transaction patterns
- `get_age_distribution_simple()`: Customer age demographics
- `get_gender_distribution_simple()`: Customer gender demographics

## Features Overview

### Dashboard Pages

1. **Overview**: Executive summary with key metrics and AI insights
2. **Transaction Trends**: Time-based analysis and regional performance
3. **Product Mix**: Category and brand performance analysis
4. **Consumer Insights**: Customer demographics and behavior

### Filtering System

- Date range selection
- Location filtering (barangay)
- Category filtering
- Brand filtering
- Store filtering
- URL-based filter persistence

### Data Visualization

- Interactive charts with click-through navigation
- Responsive design for mobile and desktop
- Real-time data updates
- Export capabilities

## Sample Data

The database includes realistic sample data for the Philippine retail market:

- 10 major brands (Nestlé, Unilever, P&G, Coca-Cola, etc.)
- 40+ products across categories (Food, Beverages, Personal Care, Home Care)
- 4 stores in Makati barangays
- 1,000 customers with demographic data
- 5,000+ transactions with realistic patterns

## Performance Considerations

- Database indexes on frequently queried columns
- Efficient SQL functions with proper filtering
- Client-side caching with Zustand
- Lazy loading and pagination where appropriate
- Optimized chart rendering with Recharts

## Security

- Row Level Security (RLS) enabled on all tables
- Public read access for analytics (appropriate for dashboard use)
- Service role access for data management
- Environment variable protection for sensitive keys

## Deployment

The application can be deployed to any static hosting service:

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

Popular options:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details# Force redeploy Sun 15 Jun 2025 01:39:23 PST
