async function run() {
  const res = await fetch("https://api.github.com/repos/ANIxxGUPTA/storyverse/deployments");
  const data = await res.json();
  if (Array.isArray(data)) {
    console.log(`Found ${data.length} deployments.`);
    data.slice(0, 5).forEach(d => {
      console.log(`\nEnv: ${d.environment}\nSHA: ${d.sha}\nDesc: ${d.description}\nCreator: ${d.creator?.login}`);
    });
  } else {
    console.log("No deployments or error:", data);
  }
}
run();
