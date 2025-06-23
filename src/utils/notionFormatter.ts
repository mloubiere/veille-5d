// Utility functions to format Notion content for web display
export interface NotionRichText {
  type: 'text';
  text: {
    content: string;
    link?: {
      url: string;
    };
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href?: string;
}

export interface NotionBlock {
  type: string;
  [key: string]: any;
}

/**
 * Converts Notion rich text array to HTML string
 */
export const formatNotionRichText = (richTextArray: NotionRichText[]): string => {
  if (!richTextArray || !Array.isArray(richTextArray)) {
    return '';
  }

  return richTextArray.map(textObj => {
    let content = textObj.plain_text || textObj.text?.content || '';
    
    // Apply formatting based on annotations
    if (textObj.annotations) {
      if (textObj.annotations.bold) {
        content = `<strong>${content}</strong>`;
      }
      if (textObj.annotations.italic) {
        content = `<em>${content}</em>`;
      }
      if (textObj.annotations.strikethrough) {
        content = `<del>${content}</del>`;
      }
      if (textObj.annotations.underline) {
        content = `<u>${content}</u>`;
      }
      if (textObj.annotations.code) {
        content = `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">${content}</code>`;
      }
    }

    // Handle links
    if (textObj.text?.link?.url || textObj.href) {
      const url = textObj.text?.link?.url || textObj.href;
      content = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#005953] hover:underline">${content}</a>`;
    }

    return content;
  }).join('');
};

/**
 * Converts Notion blocks to HTML content
 */
export const formatNotionBlocks = (blocks: NotionBlock[]): string => {
  if (!blocks || !Array.isArray(blocks)) {
    return '';
  }

  return blocks.map(block => {
    switch (block.type) {
      case 'paragraph':
        const paragraphContent = formatNotionRichText(block.paragraph?.rich_text || []);
        return paragraphContent ? `<p class="mb-4 leading-relaxed">${paragraphContent}</p>` : '';

      case 'heading_1':
        const h1Content = formatNotionRichText(block.heading_1?.rich_text || []);
        return h1Content ? `<h1 class="text-3xl font-bold mt-8 mb-4">${h1Content}</h1>` : '';

      case 'heading_2':
        const h2Content = formatNotionRichText(block.heading_2?.rich_text || []);
        return h2Content ? `<h2 class="text-2xl font-bold mt-6 mb-3">${h2Content}</h2>` : '';

      case 'heading_3':
        const h3Content = formatNotionRichText(block.heading_3?.rich_text || []);
        return h3Content ? `<h3 class="text-xl font-semibold mt-4 mb-2">${h3Content}</h3>` : '';

      case 'bulleted_list_item':
        const bulletContent = formatNotionRichText(block.bulleted_list_item?.rich_text || []);
        return bulletContent ? `<li class="mb-2">${bulletContent}</li>` : '';

      case 'numbered_list_item':
        const numberedContent = formatNotionRichText(block.numbered_list_item?.rich_text || []);
        return numberedContent ? `<li class="mb-2">${numberedContent}</li>` : '';

      case 'quote':
        const quoteContent = formatNotionRichText(block.quote?.rich_text || []);
        return quoteContent ? `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${quoteContent}</blockquote>` : '';

      case 'code':
        const codeContent = formatNotionRichText(block.code?.rich_text || []);
        const language = block.code?.language || 'text';
        return codeContent ? `<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${language}">${codeContent}</code></pre>` : '';

      case 'divider':
        return '<hr class="my-8 border-gray-300" />';

      default:
        // For unknown block types, try to extract rich_text if available
        const defaultContent = formatNotionRichText(block[block.type]?.rich_text || []);
        return defaultContent ? `<p class="mb-4 leading-relaxed">${defaultContent}</p>` : '';
    }
  }).filter(Boolean).join('\n');
};

/**
 * Processes raw Notion content and converts it to formatted HTML
 */
export const processNotionContent = (notionData: any): string => {
  // If the data is already a string (legacy format), return as is
  if (typeof notionData === 'string') {
    return notionData;
  }

  // If it's an array of blocks
  if (Array.isArray(notionData)) {
    return formatNotionBlocks(notionData);
  }

  // If it's a single block object
  if (notionData && typeof notionData === 'object' && notionData.type) {
    return formatNotionBlocks([notionData]);
  }

  // If it's rich text array
  if (notionData && Array.isArray(notionData) && notionData[0]?.type === 'text') {
    return formatNotionRichText(notionData);
  }

  // Fallback: convert to string
  return String(notionData || '');
};

/**
 * Wraps list items in appropriate list containers
 */
export const wrapListItems = (html: string): string => {
  // Wrap consecutive <li> elements in <ul> tags
  return html
    .replace(/(<li[^>]*>.*?<\/li>\s*)+/gs, (match) => {
      return `<ul class="list-disc list-inside mb-4 space-y-1">${match}</ul>`;
    });
};

/**
 * Complete formatting pipeline for Notion content
 */
export const formatNotionContentForDisplay = (notionData: any): string => {
  const processedContent = processNotionContent(notionData);
  const wrappedContent = wrapListItems(processedContent);
  return wrappedContent;
};