<?php
// Set up Curl middleware
require DIR_PATH .'/src/Curl.php';
require DIR_PATH .'/src/Sessions.php';

/*i
//Reload the url and update and session update
if(isset($_SESSION["access_token"]) && !empty($_SESSION["access_token"])) {
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($settings['settings'], 'get_user_details');
    $_POST['access_token'] = $_SESSION["access_token"];
    $curl = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
    ));
    $jsonResult = $curl->loadCurl();
    //update Session
    setSession($jsonResult);
}*/

$app->get('/saml', function ($request, $response, $args) {
   require_once('/var/simplesamlphp/lib/_autoload.php');   
   $saml = new SimpleSAML_Auth_Simple('default-sp');   
   $saml->requireAuth();
   $attributes  =  $saml->getAttributes();
   $emailid     =  !empty($attributes['emailId'][0])?$attributes['emailId'][0]:'';
   $emailid     =  empty($emailid)?$saml->getAuthData('saml:sp:NameID')['Value']:$emailid;
    if(!empty($emailid)){

        $this->mintmeshLoginKeyStoreService;
        // getting API endpoint from settings
        $apiEndpoint = getapiEndpoint($this->settings, 'special_grant_login');
        $_POST['emailId'] = $emailid;
        $curl = new Curl(array(
           'url'           => $apiEndpoint,
           'postData'      => $_POST
        ));
        $jsonResult = $curl->loadCurl();
        //Load Session
        setSession($jsonResult);
        if(empty(authenticate())){
          return $response->withRedirect($args['APP_DOMAIN']."dashboard");
        }
    } else {
        return $this->renderer->render($response, 'index.phtml', $args);
    }     
});

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

// saml login
$app->get('/company/{name}/{code}', function ($request, $response, $args) {
   $args = commonArgs($this->settings);
   $route = $request->getAttribute('route');
   $_SESSION['ccode'] = $route->getArgument('code');
   $args['company_int_details'] = companyIntegrationDetails($this->settings,$route->getArgument('code'));
   if(!empty($args['company_int_details']['data']) && $args['company_int_details']['data']['status'] == 1){
       return $response->withRedirect($args['APP_DOMAIN']."saml");
   }else{
        return $response->withRedirect($args['APP_DOMAIN']."login");
   }
});

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
    $jsonResult = $curl->loadCurl();
    //Load Session
    setSession($jsonResult);
//     $arrayList["sign"] = array(
//        "sign_in" => '1',
//    );
//    //Update Session
//    updateSession($arrayList);
    return checkJsonResult($jsonResult);
 
});

//Create api
$app->post('/create_user', function ($request, $response, $args) use ($app) {

    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'create_user');
    
    $curl = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
    ));
    $_SESSION['time_zone'] = $_POST['timeZone'];
    return checkJsonResult($curl->loadCurl());

});

//email verification page
$app->get('/email-verify', function ($request, $response, $args) {

    // Arguments  
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
$app->post('/forgot_password', function ($request, $response, $args) {

    // Arguments    
    $args = commonArgs($this->settings);

    $apiEndpoint = getapiEndpoint($this->settings, 'forgot_password');
    
    $forgotPaswword     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult($forgotPaswword->loadCurl());
});

//email verification page
$app->get('/reset_password', function ($request, $response, $args) {

    // Arguments    
    $args = commonArgs($this->settings);

    //$args['resetToken'] = $app->request()->get('resetToken');
    $allGetVars = $request->getQueryParams();
    if(!empty($allGetVars['resetcode'])){
    $args['resetcode'] = $allGetVars['resetcode'];
    }else{
    $args['setcode'] = $allGetVars['setcode'];
    }
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

//Change password
$app->post('/reset_password', function ($request, $response, $args) {

    // dynamically Access Token
    $this->mintmeshAccessToken;

    // need to take a look later    
    $args = commonArgs($this->settings);

    $apiEndpoint = getapiEndpoint($this->settings, 'reset_password');
    
    $restPassword     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult($restPassword->loadCurl());
});

//Set password
$app->post('/set_password', function ($request, $response, $args) {

    // dynamically Access Token
    $this->mintmeshAccessToken;

    // need to take a look later    
    $args = commonArgs($this->settings);

    $apiEndpoint = getapiEndpoint($this->settings, 'set_password');
    
    $restPassword     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    return checkJsonResult($restPassword->loadCurl());
});

// 404 page not found
$app->get('/404', function ($request, $response, $args) {
   
    $args = commonArgs($this->settings);
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
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

// preview image fancy box
$app->get('/uploads/{file-name}', function ($request, $response, $args) {
    
    $args = commonArgs($this->settings);
    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

// Register routes After Login
require __DIR__ . '/api_after_login.php';

//General Apis
require __DIR__ . '/api_general.php';


