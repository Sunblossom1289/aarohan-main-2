export async function fetchLatestArticles(limit = 3) {
  try {
    // 1. Fetch the index
    const indexRes = await fetch('/articles/index.json');
    if (!indexRes.ok) return [];
    const fileList = await indexRes.json();

    // 2. Fetch all article details in parallel
    const articles = await Promise.all(
      fileList.map(async (fileName) => {
        const res = await fetch(`/articles/${fileName}`);
        if (!res.ok) return null;
        return await res.json();
      })
    );

    // 3. Filter valid ones, sort by date (Newest First), and slice
    const validArticles = articles.filter(Boolean);
    const sorted = validArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return sorted.slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch articles", error);
    return [];
  }
}
