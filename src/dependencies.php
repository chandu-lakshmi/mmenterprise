<?php
// DIC configuration

$container = $app->getContainer();

// view renderer
$container['renderer'] = function ($c) {
    $settings = $c->get('settings')['renderer'];
    return new Slim\Views\PhpRenderer($settings['template_path']);
};

// email parser view renderer
$container['email_renderer'] = function ($c) {
    $settings = $c->get('settings')['email_renderer'];
    return new Slim\Views\PhpRenderer($settings['template_path']);
};

// file view renderer
$container['file_viewer'] = function ($c) {
    $settings = $c->get('settings')['file_viewer'];
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
    $_POST['access_token']    = isset($_SESSION['access_token'])?$_SESSION['access_token']:"";
};

// grant type company id
$container['mintmeshCompanyId'] = function ($c) {
    $_POST['company_id'] = isset($_SESSION['company']['company_id'])?$_SESSION['company']['company_id']:"";
    $_POST['company_code'] = isset($_SESSION['company']['company_code'])?$_SESSION['company']['company_code']:"";
 
};

//Company Details
$container['mintmeshCompanyDetails'] = function ($c) {
    $_POST['company_name'] = isset($_SESSION['company']['company_name'])?$_SESSION['company']['company_name']:"";
    $_POST['company_logo'] = isset($_SESSION['company']['company_logo'])?$_SESSION['company']['company_logo']:"";
};

//Company Details
$container['CampaignDetails'] = function ($c) {
    $_POST['camp_ref'] = isset($_SESSION['CampaignDetails']['camp_ref'])?$_SESSION['CampaignDetails']['camp_ref']:"";
    $_POST['campaign_id'] = isset($_SESSION['CampaignDetails']['campaign_id'])?$_SESSION['CampaignDetails']['campaign_id']:"";
    $_POST['reference_id'] = isset($_SESSION['CampaignDetails']['reference_id'])?$_SESSION['CampaignDetails']['reference_id']:"";
};


