<?php
// settings for production server
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
        'mode'   => 'production',

        'APP' => [
            // Application Name
            'NAME' => 'Mintmesh Enterprise',

            // Application Version
            'VERSION' => '1',

            // Application API Version
            'API_VERSION' => 'v1',

            // Angular Application domain
            'APP_DOMAIN' => 'http://enterprise.mintmesh.com/',

            // Application API domain
            'API_DOMAIN' => 'http://api.mintmesh.com/'
        ],
        
    ],
];
