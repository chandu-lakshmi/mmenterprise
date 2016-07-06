<?php
// setting for development environment
return [
    'settings' => [
        'displayErrorDetails' => true, // set to false in production

        // Renderer settings
        'renderer' => [
            'template_path' => __DIR__ . '/../templates/',
        ],

        // Monolog settings
        'logger' => [
            'name' => 'slim-app',
            'path' => __DIR__ . '/../logs/app.log',
        ],

        // Mode
        'mode'   => 'development',

        'APP' => [
            // Application Name
            'NAME' => 'Mintmesh Enterprise',

            // Application Version
            'VERSION' => '1',

            // Angular Application domain
            'APP_DOMAIN' => 'http://localhost/dev_with_slim/',

            // Application API domain
            'API_DOMAIN' => 'http://my.local/mintmesh'
        ],
        
    ],
];
