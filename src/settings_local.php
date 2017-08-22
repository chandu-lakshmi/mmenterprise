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
            'APP_DOMAIN' => 'http://192.168.33.10/mmenterprise/',

            // Application API domain
            'API_DOMAIN' => 'http://192.168.33.10/mintmesh/',

            //Client keys
            'CLIENT_ID'         => 'G7iLdQoeZy0Ef06C',
            'CLIENT_SECRET'     => 'Dh0pMLSV6Y82EfDpGKlWN1AyzvWvbvz4',

            //Grant Types
            'PASSWORD_GRANT'    => 'password',

            //qquploader path
            'PATH'    => '/var/www/public/mintmesh/uploads/',
            'PREVIEW_PATH'  => 'http://192.168.33.10/mintmesh/uploads/',
            //Version
            'APP_VERSION' => '1.6' 
            
        ],

       // email parser
       'EMAIL_PARSER' => [
           // Angular Application domain
           'EMAIL_PARSER_DOMAIN' => 'http://192.168.33.10/mmenterprise/email/',
       ],
        'MAX_RESUME_FILE_UPLOAD_SIZE' => 5 * 1024 * 1024,
        'AI_PARSER' => [
            'BASE_URL' => 'http://54.68.58.181/resumematcher/',
            'USERNAME' => 'admin',
            'PASSWORD' => 'Aev54I0Av13bhCxM',
            'FIND_RESUMES' => 'find_resumes',
            'PARSE_JD'  => 'parse_jd'
        ],
        'S3_BASE_URL' => 'https://s3-us-west-2.amazonaws.com/mintmeshresumedev/',
        'ENABLE_HCM_TAB' => TRUE,
        'ENABLE_AI_TAB' => TRUE
    ],
];
