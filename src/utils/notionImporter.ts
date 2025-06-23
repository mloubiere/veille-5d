// Utility for importing and transforming Notion data before storing in Supabase
import { formatNotionContentForDisplay } from './notionFormatter';

export interface NotionPage {
  id: string;
  properties: {
    [key: string]: any;
  };
  children?: any[];
  content?: any;
}

/**
 * Transforms a Notion page export to the format expected by Supabase
 */
export const transformNotionPageForSupabase = (notionPage: NotionPage) => {
  // Extract title from properties (adjust property names based on your Notion setup)
  const title = extractTextFromProperty(notionPage.properties.Title || notionPage.properties.Name);
  const category = extractTextFromProperty(notionPage.properties.Category || notionPage.properties.Tags);
  const imageUrl = extractImageFromProperty(notionPage.properties.Image || notionPage.properties.Cover);
  const link = extractUrlFromProperty(notionPage.properties.Link || notionPage.properties.URL);
  
  // Process content - this could be from children blocks or content property
  const rawContent = notionPage.children || notionPage.content;
  const formattedContent = rawContent ? JSON.stringify(rawContent) : '';

  return {
    id: notionPage.id,
    title: title || 'Untitled',
    content: formattedContent,
    category: category || 'General',
    image_url: imageUrl || '',
    link: link || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Extracts plain text from Notion property
 */
const extractTextFromProperty = (property: any): string => {
  if (!property) return '';
  
  if (property.type === 'title' && property.title) {
    return property.title.map((t: any) => t.plain_text).join('');
  }
  
  if (property.type === 'rich_text' && property.rich_text) {
    return property.rich_text.map((t: any) => t.plain_text).join('');
  }
  
  if (property.type === 'select' && property.select) {
    return property.select.name;
  }
  
  if (property.type === 'multi_select' && property.multi_select) {
    return property.multi_select.map((s: any) => s.name).join(', ');
  }
  
  return String(property);
};

/**
 * Extracts image URL from Notion property
 */
const extractImageFromProperty = (property: any): string => {
  if (!property) return '';
  
  if (property.type === 'files' && property.files && property.files.length > 0) {
    const file = property.files[0];
    return file.file?.url || file.external?.url || '';
  }
  
  if (property.type === 'url' && property.url) {
    return property.url;
  }
  
  return '';
};

/**
 * Extracts URL from Notion property
 */
const extractUrlFromProperty = (property: any): string => {
  if (!property) return '';
  
  if (property.type === 'url' && property.url) {
    return property.url;
  }
  
  if (property.type === 'rich_text' && property.rich_text) {
    // Look for links in rich text
    for (const text of property.rich_text) {
      if (text.text?.link?.url) {
        return text.text.link.url;
      }
    }
  }
  
  return '';
};

/**
 * Batch transform multiple Notion pages
 */
export const transformNotionPagesForSupabase = (notionPages: NotionPage[]) => {
  return notionPages.map(transformNotionPageForSupabase);
};