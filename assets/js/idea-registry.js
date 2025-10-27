async function fetchPageTree(pageId) {
    const secret = window.env?.NOTION_API_SECRET;
    if (!secret) {
        console.error('Notion API secret not found. Make sure config.js is loaded and NOTION_API_SECRET environment variable is set.');
        return null;
    }
    console.log('Using Notion API secret:', secret ? 'Found' : 'Not found');

    try {
        const resp = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
            headers: {
                'Notion-Version': '2022-06-28',
                'Authorization': `Bearer ${secret}`,
                'Content-Type': 'application/json'
            }
        });

        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }

        const data = await resp.json();
        console.log('Notion API response:', data);
        return data.results || [];
    } catch (error) {
        console.error('Error fetching from Notion API:', error);
        return [];
    }
}

function renderTree(tree, container) {
    for (const node of tree) {
        const { block, type, children, subpage } = node;

        let el = null;
        switch (type) {
            case 'paragraph': {
                el = document.createElement('p');
                const texts = block.paragraph.rich_text;
                el.innerHTML = texts.map(rt => rt.plain_text).join('');
                break;
            }
            case 'heading_1':
            case 'heading_2':
            case 'heading_3': {
                const level = type.slice(-1); // "1", "2", "3"
                el = document.createElement(`h${level}`);
                const texts = block[type].rich_text;
                el.innerHTML = texts.map(rt => rt.plain_text).join('');
                break;
            }
            case 'bulleted_list_item': {
                el = document.createElement('li');
                const texts = block.bulleted_list_item.rich_text;
                el.innerHTML = texts.map(rt => rt.plain_text).join('');
                break;
            }
            case 'numbered_list_item': {
                el = document.createElement('li');
                const texts = block.numbered_list_item.rich_text;
                el.innerHTML = texts.map(rt => rt.plain_text).join('');
                break;
            }
            case 'child_page': {
                el = document.createElement('div');
                el.classList.add('child-page');
                const title = block.child_page?.title || 'Subpage';
                const header = document.createElement('h4');
                header.textContent = `Subpage: ${title}`;
                el.appendChild(header);
                // render that subpage’s content
                if (subpage) {
                    renderTree(subpage, el);
                }
                break;
            }
            default: {
                // fallback: dump JSON for unknown block types
                el = document.createElement('pre');
                el.textContent = JSON.stringify(block, null, 2);
            }
        }

        if (el) {
            container.appendChild(el);
            // if this block has children (like nested), render them
            if (children && children.length > 0) {
                renderTree(children, el);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const pageId = '28651319eb4180049b3fdc7ef00068c2'; // or from query param
    const container = document.getElementById('idea-registry-content');

    if (!container) {
        console.error('Container element not found');
        return;
    }

    container.innerHTML = '<em>Loading ideas...</em>';

    const blocks = await fetchPageTree(pageId);
    if (!blocks || blocks.length === 0) {
        container.innerHTML = '<em>No content found or failed to load.</em>';
        return;
    }

    container.innerHTML = '';
    renderTree(blocks, container);
});
