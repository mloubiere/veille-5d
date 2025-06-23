# Veille 5D - Design & Technology Watch

Veille 5D is a PWA for sharing UX/UI design and technology watch content, intended for designers.

## Features

- 📱 Progressive Web App (PWA) with offline support
- 🔍 Advanced search functionality with highlighting
- ❤️ Like system for articles
- 📊 Category filtering and date range filtering
- 🎨 Beautiful, responsive design
- 🔗 Rich content formatting with links and styling
- 📱 Push notifications via OneSignal

## Notion Integration

This application supports importing content from Notion databases. The content formatting (bold, italic, links, etc.) is preserved through a custom formatting system.

### Importing from Notion

1. **Export your Notion database** as JSON
2. **Transform the data** using the utilities in `src/utils/notionImporter.ts`
3. **Store in Supabase** - the content will be stored as JSON and formatted for display

### Content Formatting

The application handles two types of content:

1. **Notion Format**: Rich structured data from Notion exports (JSON format)
2. **Legacy Format**: Simple markdown-style text

Content is automatically detected and formatted appropriately using the utilities in `src/utils/notionFormatter.ts`.

### Supported Formatting

- **Bold text**: `**text**` or Notion bold formatting
- **Italic text**: `*text*` or Notion italic formatting
- **Links**: `[text](url)` or Notion link objects
- **Headings**: `#`, `##`, `###` or Notion heading blocks
- **Lists**: Notion bulleted and numbered lists
- **Code blocks**: Notion code blocks with syntax highlighting
- **Quotes**: Notion quote blocks

## Development

```bash
npm install
npm run dev
```

## Database Schema

The application uses Supabase with the following main tables:

- `articles`: Main content storage
- `article_likes`: Like tracking system

Content from Notion is stored in the `content` field as JSON and formatted for display using the custom formatting utilities.