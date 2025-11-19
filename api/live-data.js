export const config = {
  runtime: "edge",
};

export default async function handler() {
  try {
    const now = Date.now();

    // simple fast rotating demo values (never timeout)
    const rotate = (base, range) =>
      base + Math.floor((now / 1000) % range);

    return new Response(
      JSON.stringify({
        mcx: {
          gold: rotate(60000, 500),
          silver: rotate(700, 20),
          crude: rotate(6500, 50),
          natural_gas: rotate(200, 10),
          copper: rotate(720, 15),
          nickel: rotate(1300, 25),
        },
        indices: {
          nifty: rotate(20000, 120),
          banknifty: rotate(43000, 200),
          sensex: rotate(67000, 180),
        },
        updated: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500 }
    );
  }
}
