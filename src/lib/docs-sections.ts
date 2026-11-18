// Doc sections - shared between getStaticPaths and the component

export const DOCS_SECTIONS = ['install', 'providers', 'automode', 'omnimode', 'teachmode', 'agents'] as const;

export type DocSection = typeof DOCS_SECTIONS[number];