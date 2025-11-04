const BASE_URL = "https://eventretrieval.oj.io.vn/api/v2";

const DEFAULT_FPS = 25;

function frameToMilliseconds(frameIdx) {
  return Math.round((Number(frameIdx) / DEFAULT_FPS) * 1000);
}

function getVideoId(videoName) {
  return videoName.toUpperCase();
}

export async function getSessionId(username, password) {
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Login failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function getEvaluationId(sessionId) {
  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  try {
    const url = new URL(`${BASE_URL}/client/evaluation/list`);
    url.searchParams.append("session", sessionId);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to get evaluation ID: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data[0] : [];

  } catch (error) {
    console.error("Get evaluation ID error:", error);
    throw error;
  }
}

export function prepareKISBody(frame) {
  if (!frame || !frame.video_name || frame.frame_idx === undefined) {
    throw new Error("Frame data is required for KIS task");
  }

  const videoId = getVideoId(frame.video_name);
  const timeMs = frameToMilliseconds(frame.frame_idx);

  const answer = {
    mediaItemName: videoId,
    start: timeMs,
    end: timeMs,
  };

  return {
    answerSets: [
      {
        answers: [answer],
      },
    ],
  };
}

export function prepareQABody(frame) {
  if (!frame || !frame.video_name || frame.frame_idx === undefined) {
    throw new Error("Frame data is required for QA task");
  }

  const videoId = getVideoId(frame.video_name);
  const timeMs = frameToMilliseconds(frame.frame_idx);
  const answer = frame.answer || "";

  const text = `QA-${answer.trim()}-${videoId}-${timeMs}`;

  return {
    answerSets: [
      {
        answers: [{ text: text }],
      },
    ],
  };
}

export function prepareTRAKEBody(videoEntry) {
  if (!videoEntry || !videoEntry.video_name || !videoEntry.frames || videoEntry.frames.length === 0) {
    throw new Error("Video entry data with frames is required for TRAKE task");
  }

  const videoId = getVideoId(videoEntry.video_name);
  
  const frameIds = videoEntry.frames
    .sort((a, b) => a - b)
    .map((idx) => String(idx))
    .join(",");

  const text = `TR-${videoId}-${frameIds}`;

  return {
    answerSets: [
      {
        answers: [{ text: text }],
      },
    ],
  };
}


function handleAPISubmit(evaluationId, sessionId, taskType, submittedData) {
  if (!evaluationId || !sessionId || !taskType || !submittedData) {
    throw new Error("Evaluation ID, Session ID, Task Type, and Submitted Data are required");
  }
    let body = null;
    if (taskType === "kis") {
      body = prepareKISBody(submittedData);
    } else if (taskType === "qa") {
      body = prepareQABody(submittedData);
    } else if (taskType === "trake") {
      body = prepareTRAKEBody(submittedData);
    }
    else {
      throw new Error("Invalid task type");
    }   

    return submitAPI(evaluationId, sessionId, body);
}

export async function submitAPI(evaluationId, sessionId, body) {
  if (!evaluationId || !sessionId) {
    throw new Error("Evaluation ID and Session ID are required");
  }

  if (!body || !body.answerSets || body.answerSets.length === 0) {
    throw new Error("Submission body is required and must contain answerSets");
  }

  try {
    const url = new URL(`${BASE_URL}/submit/${evaluationId}`);
    url.searchParams.append("session", sessionId);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let parsed;
    try {
      parsed = await response.json();
    } catch (_) {
      parsed = null;
    }

    if (!response.ok) {
      const message = (parsed && (parsed.detail || parsed.message)) || `Submission failed: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data: parsed,
    };

  } catch (error) {
    console.error("Submit API error:", error);
    throw error;
  }
}
