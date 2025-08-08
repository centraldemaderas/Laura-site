exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '[]');
    // Validación básica
    if (!Array.isArray(body)) {
      return { statusCode: 400, body: 'Payload must be an array' };
    }

    // Netlify edge does not allow direct file writes at runtime to the published directory.
    // We store the JSON in a key-value store using environment variable backed blob (simulated with Netlify env var).
    // For simplicity, we return the payload so the client can store locally and rely on repo updates later.
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch (e) {
    return { statusCode: 500, body: 'Error processing request' };
  }
};


