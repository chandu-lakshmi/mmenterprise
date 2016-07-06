<?php
// setting for staging AWS server
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
        'mode'   => 'staging',

        'APP' => [
            // Application Name
            'NAME' => 'Mintmesh Enterprise',

            // Application Version
            'VERSION' => '1',

            // Application API Version
            'API_VERSION' => 'v1',

            // Angular Application domain
            'APP_DOMAIN' => 'http://enterprisestaging.mintmesh.com/',

            // Application API domain
            'API_DOMAIN' => 'http://staging.mintmesh.com/'
        ],
        
    ],
];
