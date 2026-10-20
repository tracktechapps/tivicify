<?php
// Tivicify - Universal Cross-Platform TV & Movie Streaming App
// Redirects to production build or serves app
if (file_exists(__DIR__ . '/dist/index.html')) {
    header('Location: dist/');
    exit;
} else {
    echo "<h1>Tivicify Streaming App</h1><p>Please run <code>npm run build</code> to generate production assets.</p>";
}
