<?php
// Set up Curl middleware
require DIR_PATH .'/src/Curl.php';

//Index page
$app->get('/', function ($request, $response, $args) {
   
    $args = commonArgs($this->settings);

    //Check Logged - If it is login it redirects to dashboard page
    if(empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']."dashboard");
    }
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Index page

//login controller page
$app->get('/login', function ($request, $response, $args) {
    
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

//email verification page
$app->get('/email-verify', function ($request, $response, $args) {

    // need to take a look later    
    $args = commonArgs($this->settings);

    $allGetVars = $request->getQueryParams();
    $args['token'] = $allGetVars['token'];
    
    //Check Logged - If it is login it redirects to dashboard page
    if(empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']."dashboard");
    }
    
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Forgot password
$app->get('/forgot_password', function ($request, $response, $args) {

    // need to take a look later    
    $args = commonArgs($this->settings);

    $apiEndpoint = getapiEndpoint($this->settings, 'forgot_password');
    
    $contactUpload     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    echo json_encode( $contactUpload->loadCurl() );
});

//email verification page
$app->get('/reset-password', function ($request, $response, $args) {

    // need to take a look later    
    $args = commonArgs($this->settings);

    //$args['token'] = $app->request()->get('token');
    //$allGetVars = $request->getQueryParams();
    //$args['resetcode'] = $allGetVars['resetcode'];
    
    //Check Logged - If it is login it redirects to dashboard page
    /*if(empty(authenticate())){
      return $response->withRedirect($args['APP_DOMAIN']."dashboard");
    }*/
    
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Change password
$app->get('/resetpassword', function ($request, $response, $args) {

    // dynamically Access Token
    $this->mintmeshAccessToken;

    // need to take a look later    
    $args = commonArgs($this->settings);

    $apiEndpoint = getapiEndpoint($this->settings, 'resetpassword');
    
    $contactUpload     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    echo json_encode( $contactUpload->loadCurl() );
});

// download sample csv
$app->get('/downloadcsv', function ($request, $response, $args) use ($app) {


    $file = __DIR__ .'/../public/downloads/sample_template.xlsx';

    if (file_exists($file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="'.basename($file).'"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        readfile($file);
        exit;
    } 
     
});

// Register routes After Login
require __DIR__ . '/api_after_login.php';

//General Apis
require __DIR__ . '/api_general.php';


