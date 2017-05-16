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
            'CLIENT_ID'         => '89sloYaTPSMKhbtl',
            'CLIENT_SECRET'     => 'ssyZldw0tylSGPwy38FyFu90MeSIgbxC',

            //Grant Types
            'PASSWORD_GRANT'    => 'password',

            'PATH'    => '/var/www/html/mintmesh/',
            'PREVIEW_PATH'  => 'http://202.63.105.85/mintmesh/',
            
            //Version
            'APP_VERSION' => '1.1'    
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

        // email parser
        'EMAIL_PARSER' => [
            // Angular Application domain
            'EMAIL_PARSER_DOMAIN' => 'http://202.63.105.85/mmenterprise/email/',
        ]
        
    ],
];
