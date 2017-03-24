<?php
// setting for staging AWS server
return [
    'settings' => [
        'displayErrorDetails' => true, // set to false in production

        // Renderer settings
        'renderer' => [
            'template_path' => __DIR__ . '/../templates/',
        ],

        // Renderer settings
        'email_renderer' => [
            'template_path' => __DIR__ . '/../templates/email-parser',
        ],

        // file viewer
        'file_viewer' => [
            'template_path' => __DIR__ . '/../templates/file-viewer',
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
            'APP_DOMAIN' => 'https://enterprisestaging.mintmesh.com/',

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

        // email parser
        'EMAIL_PARSER' => [
            // Angular Application domain
            'EMAIL_PARSER_DOMAIN' => 'https://enterprisestaging.mintmesh.com/email/',
        ]
        
    ],
];
