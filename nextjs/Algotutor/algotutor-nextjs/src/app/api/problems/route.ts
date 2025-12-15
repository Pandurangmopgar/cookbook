import { NextRequest, NextResponse } from 'next/server';
import { PROBLEMS, getProblemById, getCategories } from '@/lib/problems';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const category = searchParams.get('category');

  // Get single problem
  if (id) {
    const problem = getProblemById(id);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    return NextResponse.json(problem);
  }

  // Filter by category
  if (category) {
    const filtered = PROBLEMS.filter(p => p.category === category);
    return NextResponse.json({ problems: filtered, categories: getCategories() });
  }

  // Return all problems
  return NextResponse.json({
    problems: PROBLEMS.map(p => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      category: p.category,
    })),
    categories: getCategories(),
  });
}
