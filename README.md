# Personal Blog

A beautiful, personal blog built with Next.js to track and share your experiences with movies, books, trips, and restaurants.

## Features

### 📱 **Sections**
- **🎬 Movies**: Track movies you've watched with ratings, favorite aspects, and tags
- **📚 Books**: Document books you've read with author info, key takeaways, and ratings
- **✈️ Trips**: Chronicle your travel adventures with destinations, dates, and highlights
- **🍽️ Restaurants**: Record dining experiences with cuisine types, favorite dishes, and ratings

### 🔧 **Core Functionality**
- **Admin Mode**: Toggle editing permissions - only you can add/edit/delete entries
- **Beautiful UI**: Modern, responsive design built with Tailwind CSS
- **Easy Management**: Simple forms to add new entries with validation
- **Tag System**: Organize entries with custom tags
- **Recent Updates**: See your latest additions on the home page

### 🗄️ **Data Storage**
- JSON-based storage for simplicity (easily upgradeable to a database)
- Automatic file creation and management
- CRUD operations through API routes

## Getting Started

### Prerequisites
- Node.js 18+ installed on your system

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. **Navigate**: Use the top navigation to explore different sections
2. **Admin Mode**: Click "Admin Mode" in the navigation to enable editing
3. **Add Entries**: Use the "Add [Type]" buttons to create new entries
4. **Edit/Delete**: Use the edit/delete buttons on each entry card
5. **View Recent**: Check the home page for your latest additions

## Project Structure

\`\`\`
src/
├── app/
│   ├── api/           # API routes for CRUD operations
│   ├── movies/        # Movies section page
│   ├── books/         # Books section page
│   ├── trips/         # Trips section page
│   ├── restaurants/   # Restaurants section page
│   ├── layout.js      # Root layout with navigation
│   └── page.js        # Home page
├── components/
│   ├── Navigation.js     # Main navigation component
│   ├── EntryCard.js      # Reusable entry display card
│   ├── AddEntryButton.js # Button to trigger add modal
│   └── AddEntryModal.js  # Form modal for adding entries
└── lib/
    └── data.js        # Data management utilities
\`\`\`

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with default settings
4. Your blog will be live!

### Alternative Deployment Options
- **Netlify**: Similar to Vercel, great for static sites
- **Railway**: Good for applications needing server features
- **DigitalOcean App Platform**: Scalable cloud deployment

## Customization

### Adding New Sections
1. Create a new page in `src/app/[section-name]/page.js`
2. Add API route in `src/app/api/[section-name]/route.js`
3. Update navigation in `src/components/Navigation.js`
4. Add form fields in `src/components/AddEntryModal.js`

### Styling Changes
- Modify `tailwind.config.js` for theme customization
- Update color schemes in component files
- Add custom CSS in `src/app/globals.css`

### Data Storage Upgrade
- Replace JSON files with a database (PostgreSQL, MongoDB, etc.)
- Update the `src/lib/data.js` file with database operations
- Add environment variables for database connection

## Technologies Used

- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **React**: Frontend library
- **Node.js**: JavaScript runtime

## Contributing

This is a personal project, but feel free to fork it and make it your own!

## License

This project is open source and available under the [MIT License](LICENSE).
