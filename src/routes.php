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

//Login api
$app->post('/login', function ($request, $response, $args) use ($app) {

    $args = commonArgs($this->settings);

    //$_POST["client_id"] = $args['CLIENT_ID'];
    //$_POST["client_secret"] = $args['CLIENT_SECRET'];
   
    $curl = new Curl(array(
        'url'           => $args['API_DOMAIN'].$args['VERSION'].$args['PREFIX']."/login",
        'postData'      => $_POST
    ));
    
    echo json_encode($curl->loadCurl());
});

//Create api
$app->post('/create_user', function ($request, $response, $args) use ($app) {

    $args = commonArgs($this->settings);
    
    //$_POST["client_id"] = $args['CLIENT_ID'];
    //$_POST["client_secret"] = $args['CLIENT_SECRET'];

    $curl = new Curl(array(
        'url'           => $args['API_DOMAIN'].$args['VERSION'].$args['PREFIX']."/create_user",
        'postData'      => $_POST
    ));
    
    echo json_encode($curl->loadCurl());
 
});

// Register routes After Login
require __DIR__ . '/api_after_login.php';

//General Apis
require __DIR__ . '/api_general.php';

