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
        'mode'   => 'review',

        // Application settings
        'APP' => [
            // Application Name
            'NAME' => 'Mintmesh Enterprise',

            // Application Version
            'VERSION' => 'v1',

            //Api Prefix
            'PREFIX' => '/enterprise',

            // Angular Application domain
            'APP_DOMAIN' => 'http://202.63.105.85/mmenterprise/',

            // Application API domain
            'API_DOMAIN' => 'http://202.63.105.85/mintmesh/',

            //Client keys
            'CLIENT_ID'         => 'dA3UFisQBLX23jHW',
            'CLIENT_SECRET'     => '3mjo0kDSgCbsdLG7ipnhWJxC1iY6RLcX',

            //Grant Types
            'PASSWORD_GRANT'    => 'password'
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
