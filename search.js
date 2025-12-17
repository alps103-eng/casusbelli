document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const articles = document.querySelectorAll(".article-preview");

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Levenshtein distance (for typo tolerance)
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const dp = Array.from({ length: a.length + 1 }, () =>
      new Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return dp[a.length][b.length];
  }

  function matchesToken(token, textWords) {
    for (const word of textWords) {
      if (word.includes(token)) return true;

      const maxDist =
        token.length <= 4 ? 1 :
        token.length <= 7 ? 2 : 3;

      if (Math.abs(word.length - token.length) > maxDist) continue;

      if (levenshtein(token, word) <= maxDist) return true;
    }
    return false;
  }

  function runSearch() {
    const query = normalize(input.value);
    const tokens = query.split(" ").filter(Boolean);

    articles.forEach(article => {
      const text = normalize(article.innerText);
      const words = text.split(" ");

      const match =
        tokens.length === 0 ||
        tokens.every(token => matchesToken(token, words));

      article.style.display = match ? "" : "none";
    });
  }

  input.addEventListener("input", runSearch);
});
