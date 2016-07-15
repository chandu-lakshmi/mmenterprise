<?php
// DIC configuration

$container = $app->getContainer();

// view renderer
$container['renderer'] = function ($c) {
    $settings = $c->get('settings')['renderer'];
    return new Slim\Views\PhpRenderer($settings['template_path']);
};

// monolog
$container['logger'] = function ($c) {
    $settings = $c->get('settings')['logger'];
    $logger = new Monolog\Logger($settings['name']);
    $logger->pushProcessor(new Monolog\Processor\UidProcessor());
    $logger->pushHandler(new Monolog\Handler\StreamHandler($settings['path'], Monolog\Logger::DEBUG));
    return $logger;
};

// Defining the mintmesh login keystore service in container
// this can be accessable across app
$container['mintmeshLoginKeyStoreService'] = function ($c) {
    $_POST['client_id']     = $c->get('settings')['APP']['CLIENT_ID'];
    $_POST['client_secret'] = $c->get('settings')['APP']['CLIENT_SECRET'];    
};

// grant type service provider
$container['mintmeshLoginGrantTypeService'] = function ($c) {
    $_POST['grant_type']    = $c->get('settings')['APP']['PASSWORD_GRANT'];
};

// grant type access token
$container['mintmeshAccessToken'] = function ($c) {
    $_POST['access_token']    = isset($_SESSION['aToken'])?$_SESSION['aToken']:"";
};

// grant type company
$container['mintmeshCompanyId'] = function ($c) {
    $_POST['company_id']    = isset($_SESSION['company_id'])?$_SESSION['company_id']:"";
    $_POST['company_code']    = isset($_SESSION['company_code'])?$_SESSION['company_code']:"";
};
