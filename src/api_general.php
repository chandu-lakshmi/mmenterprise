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



