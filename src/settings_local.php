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

        // Application settings
        'APP' => [
            // Application Name
            'NAME' => 'Mintmesh Enterprise',

            // Application Version
            'VERSION' => 'v1',

            //Api Prefix
            'PREFIX' => '/enterprise',

            // Angular Application domain
            'APP_DOMAIN' => 'http://192.168.33.10/dev_with_slim/',

            // Application API domain
            'API_DOMAIN' => 'http://192.168.33.10/mintmesh/',

            //Client keys
            'CLIENT_ID'         => 'G7iLdQoeZy0Ef06C',
            'CLIENT_SECRET'     => 'Dh0pMLSV6Y82EfDpGKlWN1AyzvWvbvz4',

            //Grant Types
            'PASSWORD_GRANT'    => 'password'
        ],

        // API settings
        'API' => [
            'login' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/login'
            ],
            'create_user' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/create_user'
            ],
            'get_industries' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/get_industries'
            ],
            'get_employment_types' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/get_employment_types'
            ],
            'get_experiences' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/get_experiences'
            ],
            'get_job_functions' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/get_job_functions'
            ],
            'update_company' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/update_company'
            ],
            'verify_email' => [
                'VERSION'  => 'v1',
                'ENDPOINT' => '/enterprise/verify_email'
            ],
        ],
        
    ],
];
