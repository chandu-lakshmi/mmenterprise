<?php
// Set up Curl middleware
require DIR_PATH .'/src/Curl.php';

//Index page
$app->get('/', function ($request, $response, $args) {
   
    $args = commonArgs($this->settings);

    //Check Logged - If it is login it redirects to dashboard page
    if(empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']."dash/dashboard");
    }
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//login controller page
$app->get('/login', function ($request, $response, $args) {
    
    $args = commonArgs($this->settings);

    //Check Logged - If it is login it redirects to dashboard page
    if(empty(authenticate())){
     return $response->withRedirect($args['APP_DOMAIN']."dash/dashboard");
    }
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//email verification page
$app->get('/email-verify', function ($request, $response, $args) {

    // need to take a look later    
    $args = commonArgs($this->settings);

    //$args['token'] = $app->request()->get('token');
    $allGetVars     = $request->getQueryParams();
    $args['token']  = $allGetVars['token'];
    
   // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Update Company
$app->post('/update_company', function ($request, $response, $args) use ($app) {

    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'update_company');

    $_POST['company_logo'] = $_FILES['company_logo'];
  
    $updateCompany     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    echo json_encode($updateCompany->loadFilesData());
});

//company profile page
$app->get('/company-profile', function ($request, $response, $args) {

    // need to take a look later    
    $args = commonArgs($this->settings);

    //Check Logged - If it is login it redirects to dashboard page
    if(empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']."dashboard");
    }
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Login api
$app->post('/signin', function ($request, $response, $args) use ($app) {

    // setting up the client_id, cleint_secret & grant_type 
    // dynamically to the post params
    $this->mintmeshLoginKeyStoreService;
    $this->mintmeshLoginGrantTypeService;
    
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'login');

    $curl = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
    ));
    
    echo json_encode($curl->loadCurl());
});

//Create api
$app->post('/create_user', function ($request, $response, $args) use ($app) {

    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'create_user');
    
    $curl = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
    ));
    
    echo json_encode($curl->loadCurl());
 
});

// Register routes After Login
require __DIR__ . '/api_after_login.php';

//General Apis
require __DIR__ . '/api_general.php';


