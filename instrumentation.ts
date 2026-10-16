export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { Agent, setGlobalDispatcher } = await import("undici");
      setGlobalDispatcher(
        new Agent({
          connect: {
            family: 4,
          },
        })
      );
    } catch (e) {
      console.warn("Could not set IPv4 global dispatcher:", e);
    }
  }
}
