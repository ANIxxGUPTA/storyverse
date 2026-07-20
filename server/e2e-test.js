const http = require('http');

async function runTests() {
  console.log("Starting E2E QA Test...");
  const baseUrl = "http://localhost:4000/api";
  let cookie = "";

  const request = (path, method = "GET", body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 4000,
        path: '/api' + path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const setCookie = res.headers['set-cookie'];
          if (setCookie) {
            cookie = setCookie[0].split(';')[0]; // simple cookie jar
          }
          let parsed;
          try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
          resolve({ status: res.statusCode, data: parsed });
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Signup
    const username = "qa_tester_" + Date.now();
    console.log(`[1] Signing up as ${username}...`);
    const signupRes = await request('/auth/signup', 'POST', { username, email: `${username}@test.com`, password: 'password123' });
    if (signupRes.status !== 201) throw new Error("Signup failed: " + JSON.stringify(signupRes.data));
    console.log("    ✅ Signup successful");

    // 2. Login
    console.log(`[2] Logging in...`);
    const loginRes = await request('/auth/login', 'POST', { email: `${username}@test.com`, password: 'password123' });
    if (loginRes.status !== 200) throw new Error("Login failed: " + JSON.stringify(loginRes.data));
    console.log("    ✅ Login successful");

    // 3. Refresh persistence (me)
    console.log(`[3] Checking session persistence...`);
    const meRes = await request('/auth/me', 'GET');
    if (meRes.status !== 200 || meRes.data._id !== loginRes.data._id) throw new Error("Session persistence failed");
    console.log("    ✅ Session persists via cookie");

    // 4. Create Story
    console.log(`[4] Creating story...`);
    const storyRes = await request('/stories', 'POST', { title: "QA Auto Story", description: "Automated test story", genre: "Sci-Fi", tags: ["qa", "test"] });
    if (storyRes.status !== 201) throw new Error("Story creation failed");
    const storyId = storyRes.data._id;
    console.log("    ✅ Story created with ID:", storyId);

    // 5. Create Chapters
    console.log(`[5] Creating chapters...`);
    const ch1 = await request(`/stories/${storyId}/chapters`, 'POST', { title: "Chapter 1", content: "Ch 1 content", status: "published" });
    const ch2 = await request(`/stories/${storyId}/chapters`, 'POST', { title: "Chapter 2", content: "Ch 2 content", status: "published" });
    if (ch1.status !== 201 || ch2.status !== 201) throw new Error("Chapter creation failed");
    console.log("    ✅ Chapters created successfully");

    // 6. Discover Page (Home)
    console.log(`[6] Fetching discover (home) stories...`);
    const homeRes = await request('/stories', 'GET');
    if (homeRes.status !== 200) throw new Error("Home fetch failed");
    const foundHome = homeRes.data.find(s => s._id === storyId);
    if (!foundHome) throw new Error("New story not found on home page");
    console.log("    ✅ Story appears on discover page");

    // 7. Genre Hub
    console.log(`[7] Fetching Sci-Fi genre hub...`);
    const genreRes = await request('/stories?genre=Sci-Fi', 'GET');
    const foundGenre = genreRes.data.find(s => s._id === storyId);
    if (!foundGenre) throw new Error("New story not found in genre hub");
    console.log("    ✅ Story appears in Sci-Fi genre hub");

    // 8. Reorder chapters
    console.log(`[8] Reordering chapters...`);
    // swap ch2 and ch1
    const reorderRes = await request(`/stories/${storyId}/chapters/reorder`, 'PUT', { chapterIds: [ch2.data._id, ch1.data._id] });
    if (reorderRes.status !== 200) throw new Error("Chapter reorder failed: " + JSON.stringify(reorderRes.data));
    
    // fetch story details to verify order
    const detailRes = await request(`/stories/${storyId}`, 'GET');
    if (detailRes.data.chapters[0]._id !== ch2.data._id) throw new Error("Chapter reorder persistence failed");
    console.log("    ✅ Chapters reordered successfully");

    // 9. Search (Semantic Search will fail locally, but fallback standard search)
    console.log(`[9] Standard Search...`);
    const searchRes = await request('/stories?search=QA%20Auto', 'GET');
    const foundSearch = searchRes.data.find(s => s._id === storyId);
    if (!foundSearch) throw new Error("Standard search failed");
    console.log("    ✅ Story found via standard search");

    // 10. Feed Post
    console.log(`[10] Creating feed post in Sci-Fi hub...`);
    const feedRes = await request('/feed', 'POST', { content: "Hello from QA Script!", communityGenre: "Sci-Fi" });
    if (feedRes.status !== 201) throw new Error("Feed post failed: " + JSON.stringify(feedRes.data));
    console.log("    ✅ Feed post created");

    // 11. Logout
    console.log(`[11] Logging out...`);
    const logoutRes = await request('/auth/logout', 'POST');
    if (logoutRes.status !== 200) throw new Error("Logout failed");
    console.log("    ✅ Logout successful");

    // 12. Guard Dashboard
    console.log(`[12] Verifying session is dead...`);
    const failMeRes = await request('/auth/me', 'GET');
    if (failMeRes.status !== 401) throw new Error("Session is still active after logout!");
    console.log("    ✅ Dashboard /auth/me correctly returns 401 Unauthorized");

    console.log("\n🚀 ALL TESTS PASSED SUCCESSFULLY! The platform is rock solid.");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
  }
}

runTests();
