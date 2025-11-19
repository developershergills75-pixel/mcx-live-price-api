export const config = {
  runtime: "edge",
};

export default async function handler() {
  try {
    // 1) USD to INR
    const fx = await fetch(
      "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd/inr.json"
    );
    const fxJson = await fx.json();
    const usdinr = fxJson?.inr || 83;

    // 2) International metals from metals.live
    const metalRes = await fetch("https://api.metals.live/v1/spot");
    const metalJson = await metalRes.json();

    const goldUsd = metalJson[0]?.gold;
    const silverUsd = metalJson[1]?.silver;

    const goldInr = goldUsd * usdinr;
    const silverInr = silverUsd * usdinr;

    // 3) MCX approximation
    const mcxGold = Math.round(goldInr / 10);
    const mcxSilver = Math.round(silverInr * 1.5);

    return new Response(
      JSON.stringify(
        {
          mcx: {
            gold: mcxGold,
            silver: mcxSilver
          },
          updated: new Date().toISOString(),
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
