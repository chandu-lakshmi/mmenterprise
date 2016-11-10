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

        // Application settings
        'APP' => [
            // Application Name
            'NAME' => 'Mintmesh Enterprise',

            // Application Version
            'VERSION' => 'v1',

            //Api Prefix
            'PREFIX' => '/enterprise',

            // Angular Application domain
            'APP_DOMAIN' => 'http://enterprisestaging.mintmesh.com/',

            // Application API domain
            'API_DOMAIN' => 'https://staging.mintmesh.com/',

            //Client keys
            'CLIENT_ID'         => 'Db9ugKqHf0AZwboX',
            'CLIENT_SECRET'     => '5nw3q1qyr2wpzY9UMXiJvJHT4ZR77t4x',

            //Grant Types
            'PASSWORD_GRANT'    => 'password',

            // for file uploading
            'PATH'    => '/var/www/html/mintmesh/',

            
            //Version
            'APP_VERSION' => '1.1'    
        ],

        // API settings
        'API' => [
            'login' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/login'
            ]

        ],
        
    ],
];
