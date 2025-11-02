---
# the default layout is 'page'
icon: fas fa-info-circle
order: 4
title: About Me
---

<div id="github-readme-container">
	<h1>About</h1>
	<div id="readme-content">Loading GitHub profile...</div>
</div>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>
const readmeUrl = 'https://raw.githubusercontent.com/Alijanloo/Alijanloo/main/README.md';
fetch(readmeUrl)
	.then(response => response.text())
	.then(md => {
		document.getElementById('readme-content').innerHTML = marked.parse(md);
	})
	.catch(err => {
		document.getElementById('readme-content').textContent = 'Failed to load README.';
	});
</script>
