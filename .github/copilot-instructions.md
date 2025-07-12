<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Personal Blog Project Instructions

This is a Next.js personal blog application with the following key features:

## Project Structure
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Data Storage**: JSON files in `/data` directory
- **Sections**: Movies, Books, Trips, Restaurants

## Key Components
- `EntryCard`: Displays individual entries with edit/delete functionality
- `AddEntryModal`: Form modal for adding new entries
- `Navigation`: Main navigation with admin mode toggle

## Data Management
- All data is stored in JSON files (`movies.json`, `books.json`, `trips.json`, `restaurants.json`)
- API routes handle CRUD operations for each section
- The `data.js` library provides helper functions for reading/writing data

## Admin Features
- Admin mode toggle in navigation
- Add/Edit/Delete functionality for entries
- Form validation and error handling

## Styling Guidelines
- Use Tailwind CSS classes
- Maintain consistent color scheme (blue primary, gray neutrals)
- Responsive design with mobile-first approach
- Use hover effects and transitions for interactive elements

## Code Patterns
- Use 'use client' directive for interactive components
- Implement proper error handling in API routes
- Use Next.js App Router conventions
- Follow React best practices for state management
