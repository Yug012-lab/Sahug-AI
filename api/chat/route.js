export async function POST(request) {
  try {
    const body = await request.json();

    // Support user-supplied API key from request header (set by the frontend)
    const userApiKey = request.headers.get("x-user-api-key");
    const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "No API key provided. Set ANTHROPIC_API_KEY in your environment or supply one in the app settings." },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!body.model || !Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json(
        { error: "Invalid request: 'model' and 'messages' are required." },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      // Forward Anthropic's error cleanly
      return Response.json(
        { error: data?.error?.message || `Anthropic API error (${response.status})` },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("Chat route error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
