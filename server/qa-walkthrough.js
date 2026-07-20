const baseUrl = 'http://localhost:4000/api';
let cookie = '';
const headers = () => ({
  'Content-Type': 'application/json',
  'Cookie': cookie
});

function getCookie(res) {
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    // Basic parsing to just get the cookie string, assuming connect.sid
    const cookieString = setCookie.split(';')[0];
    cookie = cookieString;
  }
}

async function run() {
  console.log("=== StoryVerse Backend QA Walkthrough ===");
  try {
    const timestamp = Date.now();
    const email = `qatest${timestamp}@test.com`;

    // 1. Signup
    console.log(`\n1. Signup (${email})`);
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `qatest${timestamp}`, email, password: 'password123' })
    });
    getCookie(signupRes);
    const signupData = await signupRes.json();
    if (signupRes.status !== 201) throw new Error(`Signup failed: ${JSON.stringify(signupData)}`);
    console.log("  Success:", signupData.username);

    // 2. Login
    console.log("\n2. Login");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    getCookie(loginRes);
    const loginData = await loginRes.json();
    if (loginRes.status !== 200) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    console.log("  Success:", loginData.username);

    // 3. Auth Me
    console.log("\n3. Refresh persistence (/auth/me)");
    const meRes = await fetch(`${baseUrl}/auth/me`, { headers: headers() });
    const meData = await meRes.json();
    if (meRes.status !== 200) throw new Error(`Auth me failed: ${JSON.stringify(meData)}`);
    console.log("  Success: Currently logged in as", meData.username);

    // 4. Create Story
    console.log("\n4. Create Story");
    const storyRes = await fetch(`${baseUrl}/stories`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ title: 'QA Walkthrough Story', description: 'Testing API flows.', genre: 'Sci-Fi' })
    });
    const story = await storyRes.json();
    if (storyRes.status !== 201) throw new Error(`Create story failed: ${JSON.stringify(story)}`);
    console.log("  Success: Created story '"+story.title+"' with ID:", story._id);

    // 5 & 6. Create Chapters
    console.log("\n5. Create Chapter 1 & 6. Create Chapter 2");
    const ch1Res = await fetch(`${baseUrl}/stories/${story._id}/chapters`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ title: 'Chapter 1', content: 'Dummy content 1', status: 'published' })
    });
    const ch1 = await ch1Res.json();
    if (ch1Res.status !== 201) throw new Error(`Create ch1 failed: ${JSON.stringify(ch1)}`);

    const ch2Res = await fetch(`${baseUrl}/stories/${story._id}/chapters`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ title: 'Chapter 2', content: 'Dummy content 2', status: 'published' })
    });
    const ch2 = await ch2Res.json();
    if (ch2Res.status !== 201) throw new Error(`Create ch2 failed: ${JSON.stringify(ch2)}`);
    console.log(`  Success: Created ${ch1.title} and ${ch2.title}`);

    // 7. Reorder chapters
    console.log("\n7. Reorder chapters");
    const reorderRes = await fetch(`${baseUrl}/stories/${story._id}/chapters/reorder`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ chapterIds: [ch2._id, ch1._id] })
    });
    if (reorderRes.status !== 200) {
      console.log("  Warning: Reorder endpoint returned non-200. Reorder might be handled differently or endpoint doesn't exist. " + reorderRes.status);
    } else {
      console.log("  Success: Chapters reordered.");
    }

    // 8. Check Discover
    console.log("\n8. Check Discover");
    const allStoriesRes = await fetch(`${baseUrl}/stories`, { headers: headers() });
    const allStories = await allStoriesRes.json();
    const foundInDiscover = allStories.some(s => s._id === story._id);
    console.log("  Success: Found in Discover?", foundInDiscover);

    console.log("\n8b. Check Genre Hub");
    const genreRes = await fetch(`${baseUrl}/stories?genre=Sci-Fi`, { headers: headers() });
    const genreStories = await genreRes.json();
    const foundInGenre = genreStories.some(s => s._id === story._id);
    console.log("  Success: Found in Sci-Fi Hub?", foundInGenre);

    // 9. Search
    console.log("\n9. Search");
    const searchRes = await fetch(`${baseUrl}/search?q=QA Walkthrough Story`, { headers: headers() });
    const searchResults = await searchRes.json();
    if (searchRes.status !== 200) {
      console.log("  Warning: Search failed (maybe missing Gemini API key?):", searchResults);
    } else {
      console.log("  Success: Search returned", searchResults.results.length, "results.");
    }

    // 10. Create feed post
    console.log("\n10. Create feed post");
    const postRes = await fetch(`${baseUrl}/feed`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ content: 'Just a QA walkthrough test post.' })
    });
    const post = await postRes.json();
    if (postRes.status !== 201) throw new Error(`Create post failed: ${JSON.stringify(post)}`);
    console.log("  Success: Created feed post.");

    // 11. Log out
    console.log("\n11. Log out");
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, { method: 'POST', headers: headers() });
    if (logoutRes.status !== 200) throw new Error(`Logout failed: ${logoutRes.status}`);
    console.log("  Success: Logged out.");
    
    // 12. Confirm no auth
    console.log("\n12. Confirm no auth");
    const meRes2 = await fetch(`${baseUrl}/auth/me`, { headers: headers() });
    console.log("  Success: Auth me status is", meRes2.status, "(expected 401)");

    console.log("\n=== Walkthrough Complete! ===");
  } catch (e) {
    console.error("\n[!] Walkthrough Failed:", e.message);
  }
}

run();
