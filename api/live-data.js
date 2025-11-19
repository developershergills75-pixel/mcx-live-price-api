export const config = {
  runtime: "edge"
};

export default async function handler() {
  try {
    // Fetch USDINR
    const fx = await fetch("https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd/inr.json");
    const fxJson = await fx.json();
    const usdinr = fxJson?.inr || 83;

    // International Gold/Silver
    const metalRes = await fetch("https://api.metals.live/v1/spot");
    const metalJson = await metalRes.json();

    const goldUsd = metalJson[0]?.gold;
    const silverUsd = metalJson[1]?.silver;

    // Approx MCX formulas
    const goldM = goldUsd ? Math.round(goldUsd * usdinr * 0.1) : null;
    const silverM = silverUsd ? Math.round(silverUsd * usdinr * 0.03) : null;

    return new Response(JSON.stringify({
      status: "success",
      updated: new Date().toISOString(),
      mcx: {
        gold: goldM,
        silver: silverM
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
