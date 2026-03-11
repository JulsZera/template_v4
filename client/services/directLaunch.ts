export async function directLaunchGame(apiGameUrl: string) {

  try {

    const response = await fetch(apiGameUrl);

    const result = await response.json();

    if (!result || result.rcode !== "00") {
      console.error("Direct launch failed", result);
      return null;
    }

    return result;

  } catch (err) {

    console.error("Direct launch error", err);
    return null;

  }
}