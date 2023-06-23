import { parse } from 'marked';
import { JSDOM } from 'jsdom';

const githubUrl = 'https://github.com';

function formatList(items) {
  let s = items
    ?.map(i => i.replace(/ \(#\d+\)$/, '')) // remove inner links to MRs
    .map(i => `- ${i}`)
    .join('\n');

  if (s.length > 1024) {
    s = s.slice(0, 1020) + '...';
  }

  return s;
}

export default function ({
  md,
  name,
  version,
  owner,
  repo,
  path,
  color,
  thumbnail,
}) {
  const html = parse(md, { mangle: false, headerIds: false });

  const document = new JSDOM(html).window.document;

  const items = document
    .querySelector('h2 + ul')
    ?.textContent.trim()
    .split('\n');

  const subSections = [...document.querySelectorAll('h3')].map(section => {
    return {
      name: section.textContent,
      items: section.nextElementSibling.textContent
        .trim()
        .split('\n')
        .filter(Boolean),
    };
  });

  const url = [githubUrl, owner, repo, 'blob/master', path].join('/');
  const anchor = version.replaceAll('.', '');

  return {
    title: version,
    color: parseInt(`0x${color}`),
    url: `${url}#${anchor}`,
    author: {
      name,
      url: [githubUrl, owner, repo].join('/'),
    },
    description: formatList(items),
    fields: subSections.map(({ name, items }) => {
      return { name, value: formatList(items) };
    }),
    thumbnail: {
      url: thumbnail,
    },
  };
}
