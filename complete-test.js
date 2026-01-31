// Complete test: Register → Login → Analyze
async function runTest() {
  console.log("=== COMPLETE TEST ===\n");

  try {
    // 1. Register
    console.log("1️⃣  Registering user...");
    const registerRes = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser" + Date.now(), password: "test123" }),
    });
    const user = await registerRes.json();
    console.log("✅ Registered:", user.username, "\n");

    // 2. Login
    console.log("2️⃣  Logging in...");
    const loginRes = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, password: "test123" }),
    });
    const loggedInUser = await loginRes.json();
    console.log("✅ Logged in as:", loggedInUser.username, "\n");

    // 3. Analyze News
    console.log("3️⃣  Testing fake news analysis...");
    const analyzeRes = await fetch("http://localhost:5000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Scientists discover water on Mars" }),
    });
    
    if (!analyzeRes.ok) {
      console.log("❌ Analysis failed! Status:", analyzeRes.status);
      const error = await analyzeRes.text();
      console.log("Error:", error);
      return;
    }

    const analysis = await analyzeRes.json();
    console.log("✅ Analysis successful!");
    console.log("   Label:", analysis.label);
    console.log("   Confidence:", analysis.confidence + "%");
    console.log("   Explanation:", analysis.explanation, "\n");

    // 4. Get History
    console.log("4️⃣  Fetching analysis history...");
    const historyRes = await fetch("http://localhost:5000/api/history", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const history = await historyRes.json();
    console.log("✅ History count:", history.length || 0);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

runTest();
