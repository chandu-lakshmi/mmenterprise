<?php
require __DIR__ . '/vendor/autoload.php';

session_start();

// for setting up global configs
require __DIR__ . '/src/config.php';

// Instantiate the app
$settings = require __DIR__ . '/src/settings_local.php';
$app = new \Slim\App($settings);

// Set up dependencies
require __DIR__ . '/src/dependencies.php';

// Register middleware
require __DIR__ . '/src/middleware.php';

// Register routes
require __DIR__ . '/src/routes.php';

// Run app
$app->run();
