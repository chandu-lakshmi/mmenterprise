<?php
// setting for development environment
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
            'APP_DOMAIN' => 'http://localhost/mmenterprise_11/',

            // Application API domain
            'API_DOMAIN' => 'http://localhost/mintmesh_11/',

            //Client keys
            'CLIENT_ID'         => 'G7iLdQoeZy0Ef06C',
            'CLIENT_SECRET'     => 'Dh0pMLSV6Y82EfDpGKlWN1AyzvWvbvz4',

            //Grant Types
            'PASSWORD_GRANT'    => 'password',

            //qquploader path
            'PATH'    => '/var/www/public/mintmesh_11/',
            'PREVIEW_PATH'  => 'http://192.168.33.10/mintmesh_10/',
            //Version
            'APP_VERSION' => '1.5' 
            
        ],

       // email parser
       'EMAIL_PARSER' => [
           // Angular Application domain
           'EMAIL_PARSER_DOMAIN' => 'http://localhost/mmenterprise_11/email-parser/',
       ]
    
    ],
];
