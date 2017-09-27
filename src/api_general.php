<?php 

//Get Job Functions
$app->get('/get_job_functions',function ($request, $response, $args) use ($app) {
	
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'get_job_functions');

    $getJobFun 	= new Curl(array(
        'url'   => $apiEndpoint,
     ));
     echo checkJsonResult( $getJobFun->loadCurl() );
});

//Get Industries
$app->get('/get_industries',function ($request, $response, $args) use ($app) {
	// getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'get_industries');

    $getInd 	= new Curl(array(
        'url'   => $apiEndpoint,
     ));
     echo checkJsonResult( $getInd->loadCurl() );
});

//Get Employee Types
$app->get('/get_employment_types',function ($request, $response, $args) use ($app) {
	// getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'get_employment_types');

    $getEmpTypes 	= new Curl(array(
       'url'   => $apiEndpoint,
    ));
    echo checkJsonResult( $getEmpTypes->loadCurl() );
});

//Get Experience
$app->get('/get_experiences',function ($request, $response, $args) use ($app) {
	// getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'get_experiences');

    $getExp 	= new Curl(array(
       'url'   => $apiEndpoint,
    ));
    
    echo checkJsonResult( $getExp->loadCurl() );     
});

//verify emails
$app->post('/verify_email',function ($request, $response, $args) use ($app) {
    
    // setting up the client_id, cleint_secret & grant_type 
    // dynamically to the post params
    $this->mintmeshLoginKeyStoreService;
    
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'verify_email');
   
    $emaiVerify     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));

    $jsonResult = $emaiVerify->loadCurl();
    //Load Session
    setSession($jsonResult);

    return checkJsonResult($jsonResult);
 });
 
// URL Shortner (bittly)
$app->post('/url_shortner',function ($request, $response, $args) use ($app) {
    // getting API endpoint from settings
    $access_token = 'b65a3bf8c767c8931eeaa067da88c2e2356f192e';
    $url = 'https://api-ssl.bitly.com/v3/user/link_save?access_token=' . $access_token . '&longUrl=' . $_POST['url'];

    $getExp 	= new Curl(array(
       'url'   => $url,
    ));
    
    echo checkJsonResult( $getExp->loadCurl() );     
});

//get_assessment
$app->post('/get_assessment',function ($request, $response, $args) use ($app) {
    
    // getting API endpoint from settings
    $apiEndpoint = getapiEndpoint($this->settings, 'get_assessment');
    $jobList     = new Curl(array(
        'url'           => $apiEndpoint,
        'postData'      => $_POST
     ));
    return checkJsonResult( $jobList->loadCurl() );
});

