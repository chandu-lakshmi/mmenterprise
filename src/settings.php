<?php
// settings for production server
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

        //Client keys
        'client_id'         => "G7iLdQoeZy0Ef06C",
        'client_secret'     => "Dh0pMLSV6Y82EfDpGKlWN1AyzvWvbvz4",

        // Mode
        'mode'   => 'production',

        // Application settings
        'APP' => [
            // Application Name
            'NAME' => 'Mintmesh Enterprise',

            // Application Version
            'VERSION' => 'v1',

            //Api Prefix
            'PREFIX' => '/enterprise',

            // Angular Application domain
            'APP_DOMAIN' => 'http://localhost/mmenterprise_11/',

            // Application API domain
            'API_DOMAIN' => 'http://localhost/mintmesh_11/',

            //Client keys
            'CLIENT_ID'         => 'G7iLdQoeZy0Ef06C',
            'CLIENT_SECRET'     => 'Dh0pMLSV6Y82EfDpGKlWN1AyzvWvbvz4',
			
            //Grant Types
            'PASSWORD_GRANT'    => 'password',
			 //qquploader path
            'PATH'    => '/xampp/htdocs/mintmesh_10/',
            //Version
            'APP_VERSION' => '1.2' 
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
            'EMAIL_PARSER_DOMAIN' => 'http://202.63.105.85/mmenterprise/email-parser/',
        ]
        
    ],
];
