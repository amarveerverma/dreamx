import fs from 'fs';

function convertHtmlToJsx(htmlFile, jsxFile) {
  let html = fs.readFileSync(htmlFile, 'utf8');

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1];
  }

  // Remove HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove script tags and their contents
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  let jsx = html.replace(/class=/g, 'className=');
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  jsx = jsx.replace(/onclick=/g, 'onClick=');
  jsx = jsx.replace(/viewbox=/g, 'viewBox=');
  jsx = jsx.replace(/tabindex=/g, 'tabIndex=');
  jsx = jsx.replace(/maxlength=/g, 'maxLength=');
  
  // Replace rows="3" with rows={3}
  jsx = jsx.replace(/rows="(\d+)"/g, 'rows={$1}');
  
  // Replace colspan="2" with colSpan={2}
  jsx = jsx.replace(/colspan="(\d+)"/g, 'colSpan={$1}');
  jsx = jsx.replace(/rowspan="(\d+)"/g, 'rowSpan={$1}');
  
  // Strip out string onClick handlers which throw TS errors
  jsx = jsx.replace(/onClick="[^"]*"/g, 'onClick={() => {}}');

  jsx = jsx.replace(/style="([^"]*)"/g, (match, styleString) => {
    const styleObj = {};
    styleString.split(';').forEach(rule => {
      if (rule.trim() === '') return;
      const [key, value] = rule.split(':');
      if (key && value) {
        const camelKey = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        styleObj[camelKey] = value.trim();
      }
    });
    return `style={${JSON.stringify(styleObj)}}`;
  });

  jsx = jsx.replace(/<img([^>]+?)(?<!\/)>/g, '<img$1 />');
  jsx = jsx.replace(/<input([^>]+?)(?<!\/)>/g, '<input$1 />');
  jsx = jsx.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');
  jsx = jsx.replace(/<hr([^>]*?)(?<!\/)>/g, '<hr$1 />');

  const componentStr = `
import React from 'react';
import Link from 'next/link';

export default function Page() {
  return (
    <>
      ${jsx}
    </>
  );
}
`;

  fs.writeFileSync(jsxFile, componentStr);
  console.log(`Converted ${htmlFile} to ${jsxFile}`);
}

const args = process.argv.slice(2);
if (args.length === 2) {
  convertHtmlToJsx(args[0], args[1]);
}
