export const config = {
  runtime: "edge",
};

export default async function handler() {
  try {
    // Faster timeout-safe fetch
    const fetchSafe = (url) =>
      fetch(url, { cache: "no-store", timeout: 4000 })
        .then((r) => r.json())
        .catch(() => null);

    // 1) USD/INR
    const fxJson = await fetchSafe(
      "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd/inr.json"
    );
    const usdinr = fxJson?.inr || 83;

    // 2) International Gold/Silver (FASTEST fallback API)
    const metalJson = await fetchSafe("https://metals.live/api/v1/spot");

    const goldUsd = metalJson?.[0]?.gold || 0;
    const silverUsd = metalJson?.[1]?.silver || 0;

    // MCX Approx Formulas
    const goldMcx = Math.round(goldUsd * usdinr * 1.6);
    const silverMcx = Math.round(silverUsd * usdinr * 1.5);

    // 3) Energy Prices (Fallback fast)
    const energy = await fetchSafe(
      "https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v7/finance/quote?symbols=CL=F,NG=F"
    );

    const crude = energy?.quoteResponse?.result?.[0]?.regularMarketPrice || null;
    const ng = energy?.quoteResponse?.result?.[1]?.regularMarketPrice || null;

    // 4) Indices (FAST fallback)
    const indices = await fetchSafe(
      "https://api.allorigins.win/raw?url=https://query1.finance.yahoo.com/v7/finance/quote?symbols=^NSEI,^NSEBANK,^BSESN"
    );

    const nifty = indices?.quoteResponse?.result?.[0]?.regularMarketPrice || null;
    const banknifty =
      indices?.quoteResponse?.result?.[1]?.regularMarketPrice || null;
    const sensex =
      indices?.quoteResponse?.result?.[2]?.regularMarketPrice || null;

    return new Response(
      JSON.stringify({
        mcx: {
          gold: goldMcx,
          silver: silverMcx,
          crude: crude,
          natural_gas: ng,
        },
        indices: {
          nifty,
          banknifty,
          sensex,
        },
        updated: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Server error", details: e.toString() }),
      { status: 500 }
    );
  }
}
