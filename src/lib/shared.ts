export const appName = 'Agents Honestly';
export const siteUrl = 'https://agentshonestly.com';
export const appTagline = 'A handbook for agentic systems in production.';
export const authorName = 'Henrique Breim';
export const authorUrl = 'https://www.linkedin.com/in/henrique-breim/';
export const docsRoute = '/book';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'breim',
  repo: 'agents-honestly',
  branch: 'main',
};

export const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

export const epubFile = 'agents-honestly.epub';

/** GitHub redirects `latest` to the newest release, so the site never learns which version
    is current. Renaming the file would break the link silently, which is why the build
    reads the name from here rather than repeating it. */
export const epubUrl = `${githubUrl}/releases/latest/download/${epubFile}`;

export const labsGitConfig = {
  user: 'breim',
  repo: 'atlas-from-agents-honestly',
  branch: 'main',
};

export const labsUrl = `https://github.com/${labsGitConfig.user}/${labsGitConfig.repo}`;

/** Giscus comment system backed by a dedicated discussions repository. The repo is separate
    from the application source so comments persist independently of forks and upstream changes.
    Generate the repoId and categoryId at https://giscus.app after enabling Discussions. */
export const discussionsConfig = {
  user: 'Bessiedelight',
  repo: 'agents-honestly',
  repoId: 'R_kgDOUs933Q',
  categoryId: 'DIC_kwDOUs933c4DGetr',
  category: 'Announcements',
};
