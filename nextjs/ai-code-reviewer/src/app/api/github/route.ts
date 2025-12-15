import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    // Parse GitHub URL to extract owner, repo, branch, and path
    let rawUrl = '';
    let fileName = 'file';

    // Handle: https://github.com/user/repo/blob/branch/path/file.ts
    const blobMatch = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
    if (blobMatch) {
      const [, owner, repo, branch, path] = blobMatch;
      rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
      fileName = path.split('/').pop() || 'file';
    }
    // Handle: https://github.com/user/repo (repo root - try common files)
    else if (url.match(/github\.com\/[^/]+\/[^/]+\/?$/)) {
      const repoMatch = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (repoMatch) {
        const [, owner, repo] = repoMatch;
        // Try to fetch package.json, index.js, or README
        const filesToTry = ['package.json', 'index.js', 'index.ts', 'main.py', 'README.md'];
        for (const file of filesToTry) {
          const testUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file}`;
          const testRes = await fetch(testUrl, { headers: { 'User-Agent': 'AI-Code-Reviewer' } });
          if (testRes.ok) {
            rawUrl = testUrl;
            fileName = file;
            break;
          }
          // Also try master branch
          const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${file}`;
          const masterRes = await fetch(masterUrl, { headers: { 'User-Agent': 'AI-Code-Reviewer' } });
          if (masterRes.ok) {
            rawUrl = masterUrl;
            fileName = file;
            break;
          }
        }
        if (!rawUrl) {
          return NextResponse.json({ 
            error: 'Could not find a code file in this repo. Please provide a direct file URL like:\nhttps://github.com/user/repo/blob/main/src/file.ts' 
          }, { status: 400 });
        }
      }
    }
    // Handle: https://github.com/user/repo/tree/branch/path (directory)
    else if (url.includes('/tree/')) {
      return NextResponse.json({ 
        error: 'This is a directory URL. Please provide a file URL instead.\n\nChange /tree/ to /blob/ and add a filename:\nhttps://github.com/user/repo/blob/main/src/file.ts' 
      }, { status: 400 });
    }
    else {
      return NextResponse.json({ 
        error: 'Invalid GitHub URL format.\n\nExpected format:\nhttps://github.com/user/repo/blob/main/path/file.ts' 
      }, { status: 400 });
    }

    // Fetch the file (no auth needed for public repos)
    const res = await fetch(rawUrl, {
      headers: { 'User-Agent': 'AI-Code-Reviewer' }
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ 
          error: 'File not found. The file may not exist or the repo might be private.\n\nFor private repos, this demo only supports public repositories.' 
        }, { status: 404 });
      }
      throw new Error(`GitHub returned ${res.status}`);
    }

    const content = await res.text();

    return NextResponse.json({ content, fileName });
  } catch (error) {
    console.error('GitHub fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch from GitHub. Make sure the repo is public and the URL is correct.' 
    }, { status: 500 });
  }
}
