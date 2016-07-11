<?php
require __DIR__ . '/vendor/autoload.php';

session_start();

DEFINE("DIR_PATH",__DIR__);

// for setting up global configs
require __DIR__ . '/src/config.php';

// Instantiate the app
$settings = require __DIR__ . "/src/settings".$environment.".php";
$app = new \Slim\App($settings);

//Functions
require __DIR__. '/src/functions.php';

// Set up dependencies
require __DIR__ . '/src/dependencies.php';

// Register middleware
require __DIR__ . '/src/middleware.php';

// Register routes
require __DIR__ . '/src/routes.php';


// Run app
$app->run();
